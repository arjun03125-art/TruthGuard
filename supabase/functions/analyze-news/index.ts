import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ------------------------------
// Gemini / Lovable Gateway helper
// ------------------------------
async function callGemini({
  apiKey,
  system,
  user,
}: {
  apiKey: string;
  system: string;
  user: string;
}) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Gemini error:", res.status, errorText);

    if (res.status === 429) {
      return { error: "Rate limit exceeded. Please try again later." };
    }
    if (res.status === 402) {
      return { error: "AI service quota exceeded. Please try again later." };
    }

    return { error: "Failed to analyze content" };
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    console.error("No content in Gemini response:", data);
    return { error: "Invalid AI response" };
  }

  return { content };
}

// ------------------------------
// Search helper (SerpAPI)
// ------------------------------
async function runLiveSearch(query: string) {
  const SERPAPI_KEY = Deno.env.get("SERPAPI_KEY");
  if (!SERPAPI_KEY) {
    console.error("SERPAPI_KEY is not configured");
    return {
      snippets: "",
      sources: [],
      error: "Live search is not configured (missing SERPAPI_KEY).",
    };
  }

  const url =
    `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    const t = await res.text();
    console.error("SerpAPI error:", res.status, t);
    return { snippets: "", sources: [], error: "Live search failed." };
  }

  const data = await res.json();

  const organic = data.organic_results || [];
  const top = organic.slice(0, 5);

  const snippets = top
    .map((r: any, i: number) => {
      const title = r.title || "Untitled";
      const link = r.link || "";
      const snippet = r.snippet || "";
      return `${i + 1}. ${title}\n${snippet}\n${link}`;
    })
    .join("\n\n");

  const sources = top.map((r: any) => ({
    title: r.title || "",
    link: r.link || "",
  }));

  return { snippets, sources, error: null };
}

// ------------------------------
// Main
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
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service is not configured");
    }

    const userInput = text.trim();
    console.log("User input:", userInput.substring(0, 120));

    // ==========================================================
    // STEP 1: Decision prompt (LIVE_SEARCH_REQUIRED or STATIC_OK)
    // ==========================================================
    const decisionSystem = `You are a strict classifier for a fact-checking system.

Task:
Decide whether the user's claim requires LIVE WEB SEARCH to verify.

Rules:
- Output ONLY ONE of these two tokens:
  1) LIVE_SEARCH_REQUIRED
  2) STATIC_ANALYSIS_OK

Choose LIVE_SEARCH_REQUIRED if the claim depends on:
- recent events, breaking news, elections, resignations
- dates, time-sensitive facts, current office holders
- current prices, statistics, reports, or new announcements
- anything that could change after 2024

Choose STATIC_ANALYSIS_OK if the claim is:
- general knowledge, science, history, definitions
- not time-dependent
- can be verified without needing latest updates`;

    const decisionUser = `User claim:\n"${userInput}"`;

    const decisionRes = await callGemini({
      apiKey: LOVABLE_API_KEY,
      system: decisionSystem,
      user: decisionUser,
    });

    if (decisionRes.error) {
      return new Response(JSON.stringify({ error: decisionRes.error }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const decisionRaw = decisionRes.content.trim();
    console.log("Decision output:", decisionRaw);

    const needsLiveSearch = decisionRaw.includes("LIVE_SEARCH_REQUIRED");

    // ==========================================================
    // STEP 2: If live search needed → fetch web snippets
    // ==========================================================
    let webSnippets = "";
    let sources: Array<{ title: string; link: string }> = [];
    let sourceMode: "static" | "live-web" = "static";

    if (needsLiveSearch) {
      sourceMode = "live-web";
      const search = await runLiveSearch(userInput);

      if (search.error) {
        console.warn("Search error:", search.error);
        // still continue with static model if search fails
        sourceMode = "static";
      } else {
        webSnippets = search.snippets;
        sources = search.sources;
      }
    }

    // ==========================================================
    // STEP 3: Final analysis prompt
    // ==========================================================
    const analysisSystem = `You are an expert fact-checker and misinformation analyst.

Your job:
Analyze the user's news content and return a credibility verdict.

If live web evidence is provided, you MUST ground your verdict only on it.
If evidence is missing or conflicting, return UNCERTAIN.

You MUST respond with valid JSON exactly in this format:
{
  "verdict": "real" | "fake" | "uncertain",
  "confidence": <number 0-100>,
  "explanation": "<clear explanation>",
  "redFlags": ["<flag1>", "<flag2>"]
}`;

    const analysisUser = needsLiveSearch && webSnippets
      ? `User claim:\n"${userInput}"\n\nLive web evidence (top results):\n${webSnippets}\n\nRules:\n1) Base verdict ONLY on evidence above.\n2) If evidence is insufficient/conflicting → UNCERTAIN.\n3) Never guess.\n4) Keep explanation clear.`
      : `Analyze this news content for credibility:\n\n"${userInput}"`;

    const analysisRes = await callGemini({
      apiKey: LOVABLE_API_KEY,
      system: analysisSystem,
      user: analysisUser,
    });

    if (analysisRes.error) {
      return new Response(JSON.stringify({ error: analysisRes.error }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const content = analysisRes.content;
    console.log("Gemini final response:", content);

    // ==========================================================
    // Parse JSON safely
    // ==========================================================
    let analysis: any;

    try {
      const jsonMatch =
        content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1].trim();
      analysis = JSON.parse(jsonStr);
    } catch (err) {
      console.error("Failed to parse Gemini JSON:", err);
      analysis = {
        verdict: "uncertain",
        confidence: 50,
        explanation: "Unable to fully analyze this content. Please try again.",
        redFlags: [],
      };
    }

    // ==========================================================
    // Sanitize output
    // ==========================================================
    const result = {
      verdict: ["real", "fake", "uncertain"].includes(analysis.verdict)
        ? analysis.verdict
        : "uncertain",
      confidence:
        typeof analysis.confidence === "number"
          ? Math.min(100, Math.max(0, Math.round(analysis.confidence)))
          : 50,
      explanation:
        typeof analysis.explanation === "string"
          ? analysis.explanation
          : "Analysis complete.",
      redFlags: Array.isArray(analysis.redFlags)
        ? analysis.redFlags.filter((f: unknown) => typeof f === "string")
        : [],

      // ✅ Extra (optional) fields (won’t break Demo.tsx)
      sourceMode,
      sources,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-news function:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to analyze content",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
