import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Eye } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            OverWatch Ops System
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Advanced tactical operations management with real-time monitoring, 
            threat assessment, and mission coordination capabilities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:shadow-glow transition-all duration-300">
                Launch System
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
              View Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <Eye className="h-8 w-8 text-accent mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Real-Time Monitoring</h3>
              <p className="text-sm text-muted-foreground">24/7 surveillance and threat detection</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <Zap className="h-8 w-8 text-accent mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Rapid Response</h3>
              <p className="text-sm text-muted-foreground">Instant alerts and coordinated actions</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <Shield className="h-8 w-8 text-accent mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Secure Operations</h3>
              <p className="text-sm text-muted-foreground">Military-grade encryption and protocols</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;