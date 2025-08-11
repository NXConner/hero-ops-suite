import { useEffect, useState } from "react";

const OdooSuite = () => {
  const [height, setHeight] = useState<number>(window.innerHeight - 64);

  useEffect(() => {
    const onResize = () => setHeight(window.innerHeight - 64);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="p-4">
      <div className="mb-2 text-sm text-muted-foreground">
        Embedded suite is served from /odoo/ inside this deployment.
      </div>
      <iframe
        title="Odoo Suite"
        src="/odoo/"
        style={{ width: '100%', height }}
        className="rounded-md border border-border bg-background"
      />
    </div>
  );
};

export default OdooSuite;