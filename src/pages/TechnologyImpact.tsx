import Header from "@/components/Header";
import Technology from "@/components/Technology";
import Impact from "@/components/Impact";
import Footer from "@/components/Footer";

const TechnologyImpact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <Technology />
        <Impact />
      </main>
      <Footer />
    </div>
  );
};

export default TechnologyImpact;
