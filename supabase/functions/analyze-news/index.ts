import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

interface Source {
  title: string;
  url: string;
  snippet: string;
}

// Use Gemini with tool_call to perform a web search, then analyze
async function callGeminiWithSearch(apiKey: string, userInput: string, today: string) {
  // Step 1: Ask the model to formulate search queries using tool calling
  const searchToolDef = {
    type: "function" as const,
    function: {
      name: "web_search",
      description: "Search the web for current information to fact-check a claim. Call this for each distinct claim that needs verification.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search query to verify the claim" },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  };

  const systemPrompt = `Today's real date is ${today}. You are an expert fact-checker.
You MUST use the web_search tool to verify any claims before making a verdict. Search for the key factual claims in the text.
Do NOT rely on training data alone — always search first.`;

  // First call: let model decide what to search
  const firstRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Fact-check this:\n"${userInput}"` },
      ],
      tools: [searchToolDef],
      tool_choice: { type: "function", function: { name: "web_search" } },
    }),
  });

  if (!firstRes.ok) {
    const errText = await firstRes.text();
    console.error("Gemini tool call error:", firstRes.status, errText);
    if (firstRes.status === 429) return { error: "Rate limit exceeded. Please try again later." };
    if (firstRes.status === 402) return { error: "AI service quota exceeded. Please try again later." };
    return { error: "Failed to analyze content" };
  }

  const firstData = await firstRes.json();
  const firstChoice = firstData.choices?.[0];

  // Extract search queries from tool calls
  const toolCalls = firstChoice?.message?.tool_calls ?? [];
  const searchQueries: string[] = [];
  for (const tc of toolCalls) {
    try {
      const args = typeof tc.function.arguments === "string"
        ? JSON.parse(tc.function.arguments)
        : tc.function.arguments;
      if (args.query) searchQueries.push(args.query);
    } catch { /* skip bad parse */ }
  }

  if (searchQueries.length === 0) {
    // Model didn't use tool — add a default search
    searchQueries.push(userInput.slice(0, 200));
  }

  console.log("Search queries:", searchQueries);

  // Step 2: Execute real web searches via Google Custom Search (free) or Gemini grounding
  const allSources: Source[] = [];
  const allSnippets: string[] = [];

  for (const query of searchQueries.slice(0, 3)) {
    const results = await performWebSearch(query);
    for (const r of results) {
      if (!allSources.some(s => s.url === r.url)) {
        allSources.push(r);
        allSnippets.push(`- ${r.title}: ${r.snippet} (${r.url})`);
      }
    }
  }

  const topSources = allSources.slice(0, 8);
  const evidenceText = allSnippets.slice(0, 8).join("\n");

  console.log(`Found ${topSources.length} sources from web search`);

  // Step 3: Final analysis with search results as context
  const analysisSystem = `Today's real date is ${today}. You are an expert fact-checker.
You have been given LIVE web search results below. Base your verdict ONLY on this evidence and the user's claim.
If the evidence is insufficient or contradictory, verdict MUST be "uncertain".

Respond with valid JSON exactly in this format (no markdown, no code fences):
{
  "verdict": "real" | "fake" | "uncertain",
  "confidence": <number 0-100>,
  "explanation": "<clear explanation grounded in the search evidence>",
  "redFlags": ["<flag1>", "<flag2>"]
}`;

  const analysisUser = `Claim to fact-check:\n"${userInput}"\n\nLive web search evidence:\n${evidenceText || "No results found — mark as uncertain."}`;

  const analysisRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: analysisSystem },
        { role: "user", content: analysisUser },
      ],
    }),
  });

  if (!analysisRes.ok) {
    const errText = await analysisRes.text();
    console.error("Analysis call error:", analysisRes.status, errText);
    return { error: "Failed to analyze content" };
  }

  const analysisData = await analysisRes.json();
  const content = analysisData.choices?.[0]?.message?.content;

  if (!content) return { error: "Invalid AI response" };

  return { content, sources: topSources };
}

// Perform web search using Gemini grounding as primary method
async function performWebSearch(query: string): Promise<Source[]> {
  // Try SerpAPI first if available
  const SERPAPI_KEY = Deno.env.get("SERPAPI_KEY");
  if (SERPAPI_KEY) {
    try {
      const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&num=5`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const results = (data.organic_results || []).slice(0, 5);
        return results.map((r: any) => ({
          title: r.title || "Untitled",
          url: r.link || "",
          snippet: r.snippet || "",
        }));
      }
      await res.text(); // consume body
    } catch (e) {
      console.error("SerpAPI error:", e);
    }
  }

  // Fallback: use Gemini to search and summarize (with grounding)
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return [];

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a web search assistant. Return exactly 5 search results as JSON array." },
          { role: "user", content: `Search for: "${query}"\n\nReturn JSON array: [{"title":"...","url":"...","snippet":"..."}]` },
        ],
        tools: [{ googleSearch: {} }],
      }),
    });

    if (!res.ok) {
      await res.text();
      return [];
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Try to extract grounding metadata sources
    const choice = data.choices?.[0];
    const meta = choice?.message?.grounding_metadata
      ?? choice?.message?.groundingMetadata
      ?? data?.grounding_metadata
      ?? data?.groundingMetadata;

    if (meta?.grounding_chunks || meta?.groundingChunks) {
      const chunks = meta.grounding_chunks ?? meta.groundingChunks ?? [];
      const sources: Source[] = [];
      for (const chunk of chunks) {
        const web = chunk.web ?? chunk;
        if (web?.uri || web?.url) {
          sources.push({
            title: web.title ?? "Source",
            url: web.uri ?? web.url,
            snippet: web.snippet ?? "",
          });
        }
      }
      if (sources.length > 0) return sources.slice(0, 5);
    }

    // Try parsing content as JSON array
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 5).map((r: any) => ({
            title: r.title || "Source",
            url: r.url || r.link || "",
            snippet: r.snippet || r.description || "",
          }));
        }
      }
    } catch { /* ignore */ }

    return [];
  } catch (e) {
    console.error("Gemini search fallback error:", e);
    return [];
  }
}

// Main handler
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Please provide text to analyze" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI service is not configured");

    const userInput = text.trim();
    const today = getTodayString();
    console.log(`Analyzing (${today}):`, userInput.substring(0, 120));

    const result = await callGeminiWithSearch(LOVABLE_API_KEY, userInput, today);

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse the JSON response
    let analysis: any;
    try {
      const cleaned = result.content!.replace(/```(?:json)?\s*/g, "").replace(/```/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch {
      console.error("JSON parse failed for:", result.content);
      analysis = {
        verdict: "uncertain",
        confidence: 50,
        explanation: "Unable to fully parse analysis. Please try again.",
        redFlags: [],
      };
    }

    const response = {
      verdict: ["real", "fake", "uncertain"].includes(analysis.verdict) ? analysis.verdict : "uncertain",
      confidence: typeof analysis.confidence === "number"
        ? Math.min(100, Math.max(0, Math.round(analysis.confidence)))
        : 50,
      explanation: typeof analysis.explanation === "string" ? analysis.explanation : "Analysis complete.",
      redFlags: Array.isArray(analysis.redFlags)
        ? analysis.redFlags.filter((f: unknown) => typeof f === "string")
        : [],
      sources: result.sources ?? [],
    };

    console.log(`Result: ${response.verdict} (${response.confidence}%) with ${response.sources.length} sources`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-news:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to analyze content" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
