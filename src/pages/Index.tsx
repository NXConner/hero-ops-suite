import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeatureGrid from "@/components/FeatureGrid";
import StatsSection from "@/components/StatsSection";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeatureGrid />
      <StatsSection />
      <CTASection />
    </div>
  );
};

export default Index;
