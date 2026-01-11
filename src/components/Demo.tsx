import { useState } from "react";
import { Search, Loader2, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  verdict: "real" | "fake" | "uncertain";
  confidence: number;
  explanation: string;
  redFlags: string[];
}

const Demo = () => {
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const sampleTexts = [
    "Scientists discover new planet made entirely of diamonds orbiting nearby star",
    "Local community raises funds for new children's hospital wing",
    "BREAKING: Government announces mandatory microchip implants for all citizens by 2025",
  ];

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-news', {
        body: { text: inputText.trim() }
      });

      if (error) {
        console.error('Analysis error:', error);
        toast({
          title: "Analysis Failed",
          description: error.message || "Failed to analyze content. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data.error) {
        toast({
          title: "Analysis Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setResult(data as AnalysisResult);
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getVerdictStyles = () => {
    if (!result) return {};
    
    switch (result.verdict) {
      case "real":
        return {
          icon: CheckCircle2,
          color: "text-success",
          bg: "bg-success/10",
          border: "border-success/30",
          label: "Likely Authentic",
        };
      case "fake":
        return {
          icon: XCircle,
          color: "text-destructive",
          bg: "bg-destructive/10",
          border: "border-destructive/30",
          label: "Likely Misinformation",
        };
      default:
        return {
          icon: AlertTriangle,
          color: "text-warning",
          bg: "bg-warning/10",
          border: "border-warning/30",
          label: "Uncertain",
        };
    }
  };

  const verdictStyles = getVerdictStyles();

  return (
    <section id="demo" className="section-padding relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-radial-glow opacity-30" />
      
      <div className="container-narrow relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Search className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Try It Now</span>
          </div>
          
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Analyze Any{" "}
            <span className="gradient-text">News Content</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Paste a news headline, article excerpt, or URL below to get instant AI-powered credibility analysis.
          </p>
        </div>

        {/* Demo Interface */}
        <div className="glass-card p-6 md:p-8 glow-effect">
          {/* Input Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Enter news text or URL
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste a news headline, article text, or URL here..."
              className="w-full h-32 px-4 py-3 bg-secondary/50 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
            />
          </div>

          {/* Sample Texts */}
          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-2">Try a sample:</p>
            <div className="flex flex-wrap gap-2">
              {sampleTexts.map((text, index) => (
                <button
                  key={index}
                  onClick={() => setInputText(text)}
                  className="text-xs px-3 py-1.5 bg-secondary/80 hover:bg-secondary rounded-full border border-border/50 transition-colors truncate max-w-[200px]"
                >
                  {text.slice(0, 40)}...
                </button>
              ))}
            </div>
          </div>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={!inputText.trim() || isAnalyzing}
            variant="hero"
            size="lg"
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                Check Credibility
              </>
            )}
          </Button>

          {/* Results */}
          {result && (
            <div className={`mt-8 p-6 rounded-xl ${verdictStyles.bg} border ${verdictStyles.border} animate-scale-in`}>
              {/* Verdict Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl ${verdictStyles.bg} flex items-center justify-center`}>
                  {verdictStyles.icon && (
                    <verdictStyles.icon className={`h-8 w-8 ${verdictStyles.color}`} />
                  )}
                </div>
                <div>
                  <div className={`text-2xl font-display font-bold ${verdictStyles.color}`}>
                    {verdictStyles.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Confidence: {result.confidence}%
                  </div>
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="mb-6">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      result.verdict === "real" ? "bg-success" : "bg-destructive"
                    }`}
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>

              {/* Explanation */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Analysis</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.explanation}
                </p>
              </div>

              {/* Red Flags */}
              {result.redFlags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium">Red Flags Detected</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.redFlags.map((flag, index) => (
                      <span
                        key={index}
                        className="text-xs px-3 py-1.5 bg-warning/10 text-warning rounded-full border border-warning/30"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Powered by AI. Results are for informational purposes only and should not replace professional fact-checking.
        </p>
      </div>
    </section>
  );
};

export default Demo;
