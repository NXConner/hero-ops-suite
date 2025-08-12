import { Shield, Radar, Users, Lock, Activity, Globe } from "lucide-react";

const FeatureGrid = () => {
  const features = [
    {
      icon: Shield,
      title: "Advanced Security",
      description: "Military-grade encryption and multi-layer security protocols to protect sensitive operations."
    },
    {
      icon: Radar,
      title: "Real-Time Intelligence",
      description: "Continuous monitoring and threat detection with AI-powered analysis and instant alerts."
    },
    {
      icon: Users,
      title: "Team Coordination",
      description: "Seamless communication and task assignment across multiple operational units."
    },
    {
      icon: Lock,
      title: "Secure Communications",
      description: "End-to-end encrypted messaging and file sharing for classified information."
    },
    {
      icon: Activity,
      title: "Performance Analytics",
      description: "Comprehensive reporting and analytics to optimize operational efficiency."
    },
    {
      icon: Globe,
      title: "Global Operations",
      description: "Worldwide deployment capabilities with multi-timezone coordination support."
    }
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Mission-Critical{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Capabilities
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive operational tools designed for the most demanding tactical environments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
            >
              <div className="mb-6">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 w-fit group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;