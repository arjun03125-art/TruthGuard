import { Database, Wrench, FlaskConical, Rocket, CheckCircle2 } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const steps = [
  {
    icon: Database,
    title: "Dataset Collection & Cleaning",
    description: "Curated datasets from verified fact-checkers, labeled news articles, and known misinformation sources. Rigorous preprocessing ensures data quality.",
    details: ["500K+ labeled articles", "Multi-source verification", "Bias detection & removal"],
  },
  {
    icon: Wrench,
    title: "Feature Extraction & Vectorization",
    description: "Advanced NLP techniques extract semantic features, sentiment patterns, and structural indicators from text content.",
    details: ["TF-IDF vectorization", "Word embeddings", "Syntactic analysis"],
  },
  {
    icon: FlaskConical,
    title: "Model Training & Validation",
    description: "Ensemble of transformer models trained with cross-validation, optimizing for precision and recall balance.",
    details: ["98.5% accuracy achieved", "K-fold validation", "Hyperparameter tuning"],
  },
  {
    icon: Rocket,
    title: "Web Integration & Deployment",
    description: "Optimized inference pipeline deployed on scalable cloud infrastructure with real-time API access.",
    details: ["<100ms response time", "Auto-scaling enabled", "99.9% uptime SLA"],
  },
];

const BuildProcess = () => {
  return (
    <section className="section-padding relative bg-secondary/20">
      <div className="container-wide relative z-10">
        {/* Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Wrench className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">Engineering Transparency</span>
          </div>
          
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            How We{" "}
            <span className="gradient-text">Built It</span>
          </h2>
          
          <p className="text-lg text-muted-foreground">
            From raw data to production-ready AI—a transparent look at our development process.
          </p>
        </ScrollReveal>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
          
          <div className="space-y-12 lg:space-y-24">
            {steps.map((step, index) => (
              <ScrollReveal 
                key={index}
                delay={index * 0.15}
                direction={index % 2 === 0 ? "left" : "right"}
              >
                <div 
                  className={`relative lg:grid lg:grid-cols-2 lg:gap-12 ${
                    index % 2 === 0 ? "" : "lg:direction-rtl"
                  }`}
                >
                  {/* Timeline Dot */}
                  <div className="hidden lg:flex absolute left-1/2 top-8 -translate-x-1/2 w-12 h-12 rounded-full bg-primary/20 border-4 border-background items-center justify-center z-10">
                    <div className="w-4 h-4 rounded-full bg-primary" />
                  </div>
                  
                  {/* Content Card */}
                  <div className={`glass-card p-8 hover-lift ${index % 2 === 0 ? "lg:text-right" : "lg:col-start-2"}`}>
                    <div className={`flex items-start gap-4 ${index % 2 === 0 ? "lg:flex-row-reverse" : ""}`}>
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <step.icon className="h-7 w-7 text-primary" />
                      </div>
                      
                      <div className={index % 2 === 0 ? "lg:text-right" : ""}>
                        <div className="text-sm text-muted-foreground font-medium mb-1">
                          Step {index + 1}
                        </div>
                        <h3 className="font-display text-xl font-bold mb-3">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                          {step.description}
                        </p>
                        
                        <div className={`flex flex-wrap gap-2 ${index % 2 === 0 ? "lg:justify-end" : ""}`}>
                          {step.details.map((detail, detailIndex) => (
                            <span
                              key={detailIndex}
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-secondary rounded-full"
                            >
                              <CheckCircle2 className="h-3 w-3 text-success" />
                              {detail}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Spacer for alternating layout */}
                  <div className="hidden lg:block" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuildProcess;
