import { Globe, Smartphone, Share2, ChevronRight, Target, Users, TrendingUp } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import StaggerChildren from "./StaggerChildren";

const impactStats = [
  { icon: Target, value: "98.5%", label: "Accuracy Rate" },
];

const roadmapItems = [
  {
    icon: Globe,
    title: "Multi-language Support",
    description: "Expanding analysis capabilities to 50+ languages for global misinformation detection.",
    status: "In Progress",
  },
  {
    icon: Smartphone,
    title: "Browser Extensions",
    description: "One-click verification directly in your browser while reading any news article.",
    status: "Coming Soon",
  },
  {
    icon: Share2,
    title: "Social Media Monitoring",
    description: "Real-time scanning of viral posts across major platforms to catch misinformation early.",
    status: "Planned",
  },
];

const Impact = () => {
  return (
    <section id="impact" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container-wide relative z-10">
        {/* Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-6">
            <Globe className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-success">Making a Difference</span>
          </div>
          
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Impact &{" "}
            <span className="gradient-text">Vision</span>
          </h2>
          
          <p className="text-lg text-muted-foreground">
            Reducing misinformation at scale while encouraging responsible content consumption 
            across communities worldwide.
          </p>
        </ScrollReveal>

        {/* Impact Stats */}
         <StaggerChildren className="grid md:grid-cols-3 gap-6 mb-16 justify-items-center" staggerDelay={0.12}>
          {impactStats.map((stat, index) => (
            <div
                key={index}
                 className="glass-card p-8 text-center hover-lift md:col-span-3 max-w-sm"
                  >

              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="text-4xl font-display font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </StaggerChildren>

        {/* Vision Statement */}
        <ScrollReveal delay={0.2}>
          <div className="glass-card p-8 md:p-12 mb-16 text-center glow-effect">
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Our Mission
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We believe in a world where truth prevails. By making AI-powered verification accessible 
              to everyone, we're building the foundation for a more informed society—one fact-check at a time.
            </p>
          </div>
        </ScrollReveal>

        {/* Roadmap */}
        <ScrollReveal delay={0.1}>
          <h3 className="font-display text-2xl font-bold text-center mb-8">
            What's Next
          </h3>
        </ScrollReveal>
          
        <StaggerChildren className="grid md:grid-cols-3 gap-6" staggerDelay={0.15}>
          {roadmapItems.map((item, index) => (
            <div key={index} className="glass-card p-6 hover-lift group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  item.status === "In Progress" 
                    ? "bg-success/10 text-success" 
                    : item.status === "Coming Soon"
                    ? "bg-warning/10 text-warning"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {item.status}
                </span>
              </div>
              
              <h4 className="font-display text-lg font-semibold mb-2">
                {item.title}
              </h4>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
              
              <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
};

export default Impact;
