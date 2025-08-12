import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
              <Shield className="h-16 w-16 text-primary" />
            </div>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Deploy{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              OverWatch Ops?
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Join elite operational units worldwide. Secure your tactical advantage 
            with the most advanced operations management system available.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link to="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:shadow-glow transition-all duration-300 text-lg px-8 py-6">
                Start Mission Planning
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <Link to="/analytics">
              <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10 text-lg px-8 py-6">
                View Analytics
              </Button>
            </Link>
            <Link to="/pavement-estimator">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Open Estimator
              </Button>
            </Link>
          </div>

          <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Get Started in 3 Steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <div className="text-2xl font-bold text-primary mb-2">01</div>
                <div className="text-sm font-medium mb-1">Initialize System</div>
                <div className="text-xs text-muted-foreground">Deploy secure infrastructure</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-2">02</div>
                <div className="text-sm font-medium mb-1">Configure Operations</div>
                <div className="text-xs text-muted-foreground">Set up team protocols</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-2">03</div>
                <div className="text-sm font-medium mb-1">Launch Mission</div>
                <div className="text-xs text-muted-foreground">Begin tactical operations</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;