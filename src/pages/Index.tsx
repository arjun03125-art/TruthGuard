import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import Technology from "@/components/Technology";
import Demo from "@/components/Demo";
import BuildProcess from "@/components/BuildProcess";
import Impact from "@/components/Impact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Technology />
        <Demo />
        <BuildProcess />
        <Impact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
