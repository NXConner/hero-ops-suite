const StatsSection = () => {
  const stats = [
    {
      number: "99.9%",
      label: "System Uptime",
      description: "Reliable 24/7 operations",
    },
    {
      number: "1M+",
      label: "Operations Managed",
      description: "Successfully coordinated missions",
    },
    {
      number: "256-bit",
      label: "Encryption Standard",
      description: "Military-grade security",
    },
    {
      number: "<500ms",
      label: "Response Time",
      description: "Lightning-fast alerts",
    },
  ];

  return (
    <section id="stats" className="py-24 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Proven{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Performance
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trusted by elite units worldwide for mission-critical operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-8 rounded-lg bg-card/30 backdrop-blur-sm border border-border/30"
            >
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-foreground mb-2">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
