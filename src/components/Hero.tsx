import { ArrowRight, Play, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-radial-glow" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      
      {/* Floating Elements */}
      <div className="absolute top-1/3 left-[15%] animate-float opacity-20">
        <div className="w-20 h-20 rounded-2xl bg-primary/30 backdrop-blur-sm border border-primary/20" />
      </div>
      <div className="absolute top-1/2 right-[10%] animate-float opacity-20" style={{ animationDelay: "2s" }}>
        <div className="w-16 h-16 rounded-full bg-accent/30 backdrop-blur-sm border border-accent/20" />
      </div>
      <div className="absolute bottom-1/3 left-[20%] animate-float opacity-20" style={{ animationDelay: "4s" }}>
        <div className="w-12 h-12 rounded-xl bg-primary/20 backdrop-blur-sm border border-primary/10" />
      </div>

      {/* Content */}
      <div className="container-wide relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 border border-border/50 backdrop-blur-sm mb-8 animate-fade-up">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              AI-Powered Truth Verification
            </span>
          </div>

          {/* Headline */}
          <h1 
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            AI That Separates{" "}
            <span className="gradient-text">Truth</span>
            <br />
            From Misinformation
          </h1>

          {/* Subheadline */}
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            Analyze news credibility instantly using advanced AI models. 
            Get real-time verification with confidence scores and detailed explanations.
          </p>

          {/* CTAs */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <a href="#demo">
              <Button variant="hero" size="xl" className="group">
                <Shield className="h-5 w-5" />
                Analyze News
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
            <a href="#how-it-works">
              <Button variant="heroOutline" size="xl" className="group">
                <Play className="h-4 w-4" />
                How It Works
              </Button>
            </a>
          </div>

          {/* Trust Indicators */}
          <div 
            className="mt-16 pt-8 border-t border-border/30 animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            <p className="text-sm text-muted-foreground mb-4">Trusted by researchers worldwide</p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
              <div className="text-sm font-semibold">98.5% Accuracy</div>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <div className="text-sm font-semibold">500K+ Analyses</div>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <div className="text-sm font-semibold">Real-time Results</div>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <div className="text-sm font-semibold">50+ Languages</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
