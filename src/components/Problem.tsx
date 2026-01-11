import { AlertTriangle, TrendingUp, Users, Globe } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import StaggerChildren from "./StaggerChildren";

const stats = [
  {
    icon: TrendingUp,
    value: "70%",
    label: "Faster viral spread",
    description: "Fake news spreads 70% faster than verified information on social platforms",
  },
  {
    icon: Users,
    value: "86%",
    label: "People deceived",
    description: "Studies show 86% of internet users have been fooled by fake news at least once",
  },
  {
    icon: Globe,
    value: "$78B",
    label: "Economic impact",
    description: "Annual global economic damage caused by misinformation and fake news",
  },
];

const Problem = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-destructive/5 to-background" />
      
      <div className="container-wide relative z-10">
        {/* Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 mb-6">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">The Growing Threat</span>
          </div>
          
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Misinformation Is a{" "}
            <span className="text-destructive">Global Crisis</span>
          </h2>
          
          <p className="text-lg text-muted-foreground">
            Fake news spreads rapidly through social platforms, causing societal, political, 
            and health consequences. Traditional fact-checking can't keep pace—until now.
          </p>
        </ScrollReveal>

        {/* Stats Grid */}
        <StaggerChildren className="grid md:grid-cols-3 gap-8" staggerDelay={0.15}>
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="glass-card p-8 hover-lift group"
            >
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6 group-hover:bg-destructive/20 transition-colors">
                <stat.icon className="h-7 w-7 text-destructive" />
              </div>
              
              <div className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
                {stat.value}
              </div>
              
              <div className="text-lg font-semibold text-foreground mb-2">
                {stat.label}
              </div>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </StaggerChildren>

        {/* Additional Context */}
        <ScrollReveal delay={0.3} className="mt-16">
          <div className="glass-card p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
                  The Lack of Fast, Reliable Verification
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Traditional fact-checking takes hours or days. By then, false information 
                  has already reached millions. Social media algorithms amplify sensational 
                  content, making verification even more critical—and more urgent than ever.
                </p>
              </div>
              
              <StaggerChildren className="grid grid-cols-2 gap-4" staggerDelay={0.1}>
                {[
                  { label: "Daily fake articles", value: "1M+" },
                  { label: "Avg. spread time", value: "<6 hrs" },
                  { label: "Manual check time", value: "48+ hrs" },
                  { label: "AI verification", value: "<3 sec" },
                ].map((item, index) => (
                  <div key={index} className="bg-secondary/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-display font-bold text-primary">{item.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                  </div>
                ))}
              </StaggerChildren>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Problem;
