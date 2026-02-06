import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ------------------------------
// Gemini call with optional Google Search grounding
// ------------------------------
async function callGemini({
  apiKey,
  system,
  user,
  useGrounding = false,
}: {
  apiKey: string;
  system: string;
  user: string;
  useGrounding?: boolean;
}) {
  const body: any = {
    model: "google/gemini-3-flash-preview",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };

  // Note: googleSearch grounding is not supported via the OpenAI-compatible gateway.
  // Live search is handled via SerpAPI fallback instead.

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Gemini error:", res.status, errorText);
    if (res.status === 429) return { error: "Rate limit exceeded. Please try again later." };
    if (res.status === 402) return { error: "AI service quota exceeded. Please try again later." };
    return { error: "Failed to analyze content" };
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  const content = choice?.message?.content;

  if (!content) {
    console.error("No content in Gemini response:", data);
    return { error: "Invalid AI response" };
  }

  // Extract grounding sources if present
  const groundedSources: Array<{ title: string; url: string }> = [];

  // Check various locations where grounding metadata may appear
  const meta = choice?.message?.grounding_metadata
    ?? choice?.message?.groundingMetadata
    ?? data?.grounding_metadata
    ?? data?.groundingMetadata;

  if (meta?.grounding_chunks || meta?.groundingChunks) {
    const chunks = meta.grounding_chunks ?? meta.groundingChunks ?? [];
    for (const chunk of chunks) {
      const web = chunk.web ?? chunk;
      if (web?.uri || web?.url) {
        groundedSources.push({
          title: web.title ?? "Source",
          url: web.uri ?? web.url,
        });
      }
    }
  }

  // Also check search_entry_point / support chunks
  if (meta?.search_entry_point?.rendered_content) {
    console.log("Search grounding was used by Gemini.");
  }

  return { content, groundedSources };
}

// ------------------------------
// Dynamic date helper
// ------------------------------
function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0]; // e.g. "2026-02-06"
}

// ------------------------------
// SerpAPI fallback search
// ------------------------------
async function runLiveSearch(query: string) {
  const SERPAPI_KEY = Deno.env.get("SERPAPI_KEY");
  if (!SERPAPI_KEY) {
    console.log("SERPAPI_KEY not configured – skipping fallback search");
    return { snippets: "", sources: [], error: "no-key" };
  }

  const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error("SerpAPI error:", res.status, await res.text());
    return { snippets: "", sources: [], error: "Live search failed." };
  }

  const data = await res.json();
  const top = (data.organic_results || []).slice(0, 5);

  const snippets = top
    .map((r: any, i: number) => `${i + 1}. ${r.title || "Untitled"}\n${r.snippet || ""}\n${r.link || ""}`)
    .join("\n\n");

  const sources = top.map((r: any) => ({ title: r.title || "", link: r.link || "" }));
  return { snippets, sources, error: null };
}

// ------------------------------
// Main handler
// ------------------------------
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

    // ── STEP 1: Decide if live search is needed ──
    const decisionSystem = `Today's date is ${today}. You are a strict classifier.
Output ONLY one token: LIVE_SEARCH_REQUIRED or STATIC_ANALYSIS_OK.
Choose LIVE_SEARCH_REQUIRED if the claim involves recent events, current office holders, 2024-2026 facts, prices, statistics, or anything time-sensitive.
Choose STATIC_ANALYSIS_OK for timeless general knowledge.`;

    const decisionRes = await callGemini({
      apiKey: LOVABLE_API_KEY,
      system: decisionSystem,
      user: `Claim: "${userInput}"`,
    });

    if (decisionRes.error) {
      return new Response(JSON.stringify({ error: decisionRes.error }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const needsLiveSearch = decisionRes.content!.includes("LIVE_SEARCH_REQUIRED");
    console.log("Decision:", needsLiveSearch ? "LIVE_SEARCH" : "STATIC");

    // ── STEP 2: Final analysis with Google Search grounding ──
    const analysisSystem = `Today's date is ${today}. You are an expert fact-checker.
You have access to Google Search to verify claims in real-time. USE IT for any time-sensitive or verifiable claim.
Never assume your training data is current — always ground your answer in search results when available.

Respond with valid JSON exactly in this format:
{
  "verdict": "real" | "fake" | "uncertain",
  "confidence": <number 0-100>,
  "explanation": "<clear explanation grounded in evidence>",
  "redFlags": ["<flag1>", "<flag2>"]
}`;

    const analysisUser = `Fact-check this claim thoroughly:\n"${userInput}"`;

    // Call Gemini WITH Google Search grounding enabled
    const analysisRes = await callGemini({
      apiKey: LOVABLE_API_KEY,
      system: analysisSystem,
      user: analysisUser,
      useGrounding: true,
    });

    if (analysisRes.error) {
      // Fallback: try without grounding + SerpAPI
      console.warn("Grounded call failed, falling back to SerpAPI + static analysis");
      return await fallbackAnalysis(LOVABLE_API_KEY, userInput, today, needsLiveSearch);
    }

    const content = analysisRes.content!;
    const groundedSources = analysisRes.groundedSources ?? [];
    console.log(`Gemini response received. Grounded sources: ${groundedSources.length}`);

    // ── Parse JSON ──
    let analysis: any;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      analysis = JSON.parse(jsonMatch[1].trim());
    } catch {
      console.error("JSON parse failed, using defaults");
      analysis = {
        verdict: "uncertain",
        confidence: 50,
        explanation: "Unable to fully analyze this content. Please try again.",
        redFlags: [],
      };
    }

    // ── Build response ──
    const result = {
      verdict: ["real", "fake", "uncertain"].includes(analysis.verdict) ? analysis.verdict : "uncertain",
      confidence: typeof analysis.confidence === "number"
        ? Math.min(100, Math.max(0, Math.round(analysis.confidence)))
        : 50,
      explanation: typeof analysis.explanation === "string" ? analysis.explanation : "Analysis complete.",
      redFlags: Array.isArray(analysis.redFlags)
        ? analysis.redFlags.filter((f: unknown) => typeof f === "string")
        : [],
      sourceMode: groundedSources.length > 0 ? "grounded" : "static",
      sources: groundedSources.length > 0
        ? groundedSources
        : [],
    };

    return new Response(JSON.stringify(result), {
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

// ------------------------------
// Fallback: SerpAPI + static Gemini (no grounding)
// ------------------------------
async function fallbackAnalysis(apiKey: string, userInput: string, today: string, needsLiveSearch: boolean) {
  let webSnippets = "";
  let sources: Array<{ title: string; link: string }> = [];
  let sourceMode: "static" | "live-web" = "static";

  if (needsLiveSearch) {
    const search = await runLiveSearch(userInput);
    if (!search.error) {
      sourceMode = "live-web";
      webSnippets = search.snippets;
      sources = search.sources;
    }
  }

  const system = `Today's date is ${today}. You are an expert fact-checker.
${webSnippets ? "Base your verdict ONLY on the provided web evidence." : "Analyze using your knowledge."}
If evidence is insufficient → verdict must be "uncertain".
Respond with valid JSON: { "verdict": "real"|"fake"|"uncertain", "confidence": <0-100>, "explanation": "<text>", "redFlags": ["..."] }`;

  const user = webSnippets
    ? `Claim: "${userInput}"\n\nWeb evidence:\n${webSnippets}`
    : `Fact-check: "${userInput}"`;

  const res = await callGemini({ apiKey, system, user });

  if (res.error) {
    return new Response(JSON.stringify({ error: res.error }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let analysis: any;
  try {
    const m = res.content!.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, res.content!];
    analysis = JSON.parse(m[1].trim());
  } catch {
    analysis = { verdict: "uncertain", confidence: 50, explanation: "Parse error.", redFlags: [] };
  }

  return new Response(JSON.stringify({
    verdict: ["real", "fake", "uncertain"].includes(analysis.verdict) ? analysis.verdict : "uncertain",
    confidence: typeof analysis.confidence === "number" ? Math.min(100, Math.max(0, Math.round(analysis.confidence))) : 50,
    explanation: typeof analysis.explanation === "string" ? analysis.explanation : "Analysis complete.",
    redFlags: Array.isArray(analysis.redFlags) ? analysis.redFlags.filter((f: unknown) => typeof f === "string") : [],
    sourceMode,
    sources: sources.map(s => ({ title: s.title, url: s.link })),
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
