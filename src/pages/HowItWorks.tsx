import Header from "@/components/Header";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import Footer from "@/components/Footer";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <Problem />
        <Solution />
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
