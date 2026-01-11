import { Shield, Gauge, Search, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import StaggerChildren from "./StaggerChildren";

const features = [
  {
    icon: Search,
    title: "Instant Analysis",
    description: "Analyze any news article, text snippet, or URL in seconds with our advanced AI engine.",
  },
  {
    icon: Gauge,
    title: "Credibility Score",
    description: "Get a detailed confidence score from 0-100% indicating the likelihood of authenticity.",
  },
  {
    icon: AlertCircle,
    title: "Misleading Highlights",
    description: "AI identifies and highlights specific phrases that indicate potential misinformation.",
  },
  {
    icon: CheckCircle2,
    title: "Real vs Fake Verdict",
    description: "Clear, actionable classification with detailed reasoning for the determination.",
  },
  {
    icon: Shield,
    title: "Source Verification",
    description: "Cross-reference claims against verified databases and trusted news sources.",
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Continuously updated models ensure accuracy against the latest misinformation tactics.",
  },
];

const Solution = () => {
  return (
    <section id="how-it-works" className="section-padding relative">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial-glow opacity-50" />
      
      <div className="container-wide relative z-10">
        {/* Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">The Solution</span>
          </div>
          
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            AI-Powered{" "}
            <span className="gradient-text">Fake News Detection</span>
          </h2>
          
          <p className="text-lg text-muted-foreground">
            Our advanced AI analyzes news content in real-time, providing instant verification 
            with transparent reasoning and confidence scores you can trust.
          </p>
        </ScrollReveal>

        {/* Features Grid */}
        <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass-card p-6 hover-lift group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              
              <h3 className="font-display text-xl font-semibold mb-3">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </StaggerChildren>

        {/* Output Preview */}
        <ScrollReveal delay={0.2} className="mt-16">
          <div className="glass-card p-8 md:p-12 glow-effect">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl font-bold mb-2">What You Get</h3>
              <p className="text-muted-foreground">Comprehensive analysis in one glance</p>
            </div>
            
            <StaggerChildren className="grid md:grid-cols-3 gap-8" staggerDelay={0.15}>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
                <h4 className="font-semibold mb-2">Clear Verdict</h4>
                <p className="text-sm text-muted-foreground">
                  Real or Fake classification with reasoning
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-display font-bold text-primary">94%</span>
                </div>
                <h4 className="font-semibold mb-2">Confidence Score</h4>
                <p className="text-sm text-muted-foreground">
                  Precise percentage indicating reliability
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-warning/20 flex items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-warning" />
                </div>
                <h4 className="font-semibold mb-2">Red Flags</h4>
                <p className="text-sm text-muted-foreground">
                  Highlighted misleading phrases & patterns
                </p>
              </div>
            </StaggerChildren>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Solution;
