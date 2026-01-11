import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Please provide text to analyze' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('AI service is not configured');
    }

    console.log('Analyzing news content:', text.substring(0, 100) + '...');

    const systemPrompt = `You are an expert fact-checker and misinformation analyst. Your task is to analyze news content and determine its credibility.

For each piece of content, you must:
1. Assess whether the content is likely REAL (authentic/factual), FAKE (misinformation/false), or UNCERTAIN (cannot determine)
2. Provide a confidence score from 0-100
3. Explain your reasoning clearly
4. Identify specific red flags or credibility indicators

Consider these factors:
- Language patterns (sensationalism, emotional manipulation, clickbait)
- Verifiability of claims
- Source credibility indicators
- Logical consistency
- Common misinformation patterns

You MUST respond with valid JSON in exactly this format:
{
  "verdict": "real" | "fake" | "uncertain",
  "confidence": <number 0-100>,
  "explanation": "<clear explanation of your analysis>",
  "redFlags": ["<flag1>", "<flag2>"] // empty array if no red flags
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this news content for credibility:\n\n"${text}"` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(
          JSON.stringify({ error: 'AI service quota exceeded. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to analyze content');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in AI response:', data);
      throw new Error('Invalid AI response');
    }

    console.log('AI response:', content);

    // Parse the JSON response from AI
    let analysis;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1].trim();
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError, content);
      // Fallback to a structured response
      analysis = {
        verdict: 'uncertain',
        confidence: 50,
        explanation: 'Unable to fully analyze this content. Please try again.',
        redFlags: []
      };
    }

    // Validate and sanitize the response
    const result = {
      verdict: ['real', 'fake', 'uncertain'].includes(analysis.verdict) ? analysis.verdict : 'uncertain',
      confidence: typeof analysis.confidence === 'number' ? Math.min(100, Math.max(0, Math.round(analysis.confidence))) : 50,
      explanation: typeof analysis.explanation === 'string' ? analysis.explanation : 'Analysis complete.',
      redFlags: Array.isArray(analysis.redFlags) ? analysis.redFlags.filter((f: unknown) => typeof f === 'string') : []
    };

    console.log('Returning analysis result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-news function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to analyze content' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
