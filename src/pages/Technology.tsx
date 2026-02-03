import Header from "@/components/Header";
import Technology from "@/components/Technology";
import Footer from "@/components/Footer";

const TechnologyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <Technology />
      </main>
      <Footer />
    </div>
  );
};

export default TechnologyPage;
