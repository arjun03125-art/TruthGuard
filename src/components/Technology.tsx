import { Brain, Database, Layers, Cpu, Network, Workflow } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import StaggerChildren from "./StaggerChildren";

const techStack = [
  {
    icon: Brain,
    title: "Natural Language Processing",
    description: "Advanced NLP models analyze semantic meaning, context, and linguistic patterns in text.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Layers,
    title: "Pattern Recognition",
    description: "Deep learning identifies structural patterns common in misleading or fabricated content.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Database,
    title: "Verified Datasets",
    description: "Models trained on millions of verified articles from fact-checkers and trusted sources.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Cpu,
    title: "Real-time Inference",
    description: "Optimized inference pipeline delivers results in milliseconds, not minutes.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
];

const pipelineSteps = [
  { step: "01", label: "Input Processing", desc: "Text extraction & normalization" },
  { step: "02", label: "Feature Extraction", desc: "Semantic & syntactic analysis" },
  { step: "03", label: "Model Inference", desc: "Multi-model ensemble prediction" },
  { step: "04", label: "Result Generation", desc: "Confidence scoring & explanation" },
];

const Technology = () => {
  return (
    <section id="technology" className="section-padding relative bg-secondary/30">
      <div className="container-wide relative z-10">
        {/* Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Cpu className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">Under The Hood</span>
          </div>
          
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Powered by{" "}
            <span className="gradient-text">Advanced AI</span>
          </h2>
          
          <p className="text-lg text-muted-foreground">
            State-of-the-art machine learning models analyze text at multiple levels, 
            from individual word choice to overall narrative structure.
          </p>
        </ScrollReveal>

        {/* Tech Stack Grid */}
        <StaggerChildren className="grid md:grid-cols-2 gap-6 mb-16" staggerDelay={0.12}>
          {techStack.map((tech, index) => (
            <div 
              key={index}
              className="glass-card p-8 hover-lift flex gap-6"
            >
              <div className={`w-14 h-14 rounded-2xl ${tech.bgColor} flex items-center justify-center flex-shrink-0`}>
                <tech.icon className={`h-7 w-7 ${tech.color}`} />
              </div>
              
              <div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  {tech.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {tech.description}
                </p>
              </div>
            </div>
          ))}
        </StaggerChildren>

        {/* Pipeline Visualization */}
        <ScrollReveal delay={0.2}>
          <div className="glass-card p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <Workflow className="h-6 w-6 text-primary" />
              <h3 className="font-display text-2xl font-bold">Analysis Pipeline</h3>
            </div>
            
            <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.1}>
              {pipelineSteps.map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-secondary rounded-xl p-6 h-full">
                    <div className="text-4xl font-display font-bold text-primary/30 mb-3">
                      {item.step}
                    </div>
                    <h4 className="font-semibold mb-1">{item.label}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  
                  {index < pipelineSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <div className="w-4 h-4 rotate-45 border-t-2 border-r-2 border-primary/50" />
                    </div>
                  )}
                </div>
              ))}
            </StaggerChildren>
            
            {/* Architecture Diagram */}
            <div className="mt-10 pt-8 border-t border-border/50">
              <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <Network className="h-4 w-4" />
                <span>Model Architecture: Transformer-based ensemble with attention mechanisms</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Technology;
