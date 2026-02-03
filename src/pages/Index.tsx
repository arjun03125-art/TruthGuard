import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import Demo from "@/components/Demo";
import BuildProcess from "@/components/BuildProcess";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Demo />
        <BuildProcess />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
