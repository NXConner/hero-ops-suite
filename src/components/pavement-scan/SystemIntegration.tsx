// @ts-nocheck
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Network,
  Share,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Database,
  Map,
  Calendar,
  DollarSign,
  Brain,
  Truck,
  Cloud,
  ArrowRight,
  Workflow,
  RefreshCw,
} from "lucide-react";
import { DefectData, ScanData } from "@/pages/PavementScanPro";

interface SystemIntegrationProps {
  scanData: ScanData | null;
  defects: DefectData[];
}

interface IntegrationModule {
  id: string;
  name: string;
  description: string;
  status: "connected" | "syncing" | "error" | "disabled";
  icon: any;
  dataTypes: string[];
  lastSync?: Date;
  enabled: boolean;
}

interface DataDistribution {
  module: string;
  dataType: string;
  records: number;
  status: "pending" | "syncing" | "completed" | "failed";
  timestamp: Date;
}

const SystemIntegration: React.FC<SystemIntegrationProps> = ({ scanData, defects }) => {
  const [integrationModules, setIntegrationModules] = useState<IntegrationModule[]>([
    {
      id: "overwatch",
      name: "OverWatch Map",
      description: "Real-time visualization of defect locations with color-coded severity markers",
      status: "connected",
      icon: Map,
      dataTypes: ["Defect Locations", "Severity Levels", "GPS Coordinates"],
      lastSync: new Date(Date.now() - 30000),
      enabled: true,
    },
    {
      id: "project-management",
      name: "Project Management",
      description: "Automatic creation of repair tasks and work orders based on detected defects",
      status: "connected",
      icon: Calendar,
      dataTypes: ["Work Orders", "Task Priorities", "Resource Requirements"],
      lastSync: new Date(Date.now() - 60000),
      enabled: true,
    },
    {
      id: "accounting",
      name: "Accounting Module",
      description: "Integration with cost estimation for repair work and budget planning",
      status: "syncing",
      icon: DollarSign,
      dataTypes: ["Cost Estimates", "Material Quantities", "Labor Hours"],
      lastSync: new Date(Date.now() - 120000),
      enabled: true,
    },
    {
      id: "ai-expert",
      name: "AI Expert System",
      description:
        "Enrichment of knowledge base with real-world defect data for improved recommendations",
      status: "connected",
      icon: Brain,
      dataTypes: ["Defect Patterns", "ML Training Data", "Prediction Models"],
      lastSync: new Date(Date.now() - 45000),
      enabled: true,
    },
    {
      id: "predictive-maintenance",
      name: "Predictive Maintenance",
      description: "Input for analyzing defect progression and predicting future maintenance needs",
      status: "connected",
      icon: Clock,
      dataTypes: ["Progression Rates", "Maintenance Schedules", "Condition Forecasts"],
      lastSync: new Date(Date.now() - 90000),
      enabled: true,
    },
    {
      id: "scheduling",
      name: "AI-Driven Scheduling",
      description: "Input for dynamic scheduling of repair crews and resource allocation",
      status: "connected",
      icon: Truck,
      dataTypes: ["Crew Assignments", "Equipment Needs", "Timeline Optimization"],
      lastSync: new Date(Date.now() - 75000),
      enabled: true,
    },
    {
      id: "asset-sync",
      name: "AssetSync Hub",
      description: "Automatic upload of 3D models and reports for digital asset management",
      status: "syncing",
      icon: Cloud,
      dataTypes: ["3D Models", "Reports", "Metadata", "Version Control"],
      lastSync: new Date(Date.now() - 180000),
      enabled: true,
    },
  ]);

  const [dataDistributions, setDataDistributions] = useState<DataDistribution[]>([]);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInProgress, setSyncInProgress] = useState(false);

  // Simulate data distribution when scan data changes
  useEffect(() => {
    if (scanData && defects.length > 0) {
      simulateDataDistribution();
    }
  }, [scanData, defects]);

  const simulateDataDistribution = () => {
    const distributions: DataDistribution[] = [];

    integrationModules.forEach((module) => {
      if (module.enabled) {
        module.dataTypes.forEach((dataType) => {
          distributions.push({
            module: module.name,
            dataType,
            records: Math.floor(Math.random() * defects.length) + 1,
            status: "pending",
            timestamp: new Date(),
          });
        });
      }
    });

    setDataDistributions(distributions);

    // Simulate progressive sync
    distributions.forEach((dist, index) => {
      setTimeout(() => {
        setDataDistributions((prev) =>
          prev.map((d) =>
            d.module === dist.module && d.dataType === dist.dataType
              ? { ...d, status: "syncing" }
              : d,
          ),
        );

        setTimeout(
          () => {
            setDataDistributions((prev) =>
              prev.map((d) =>
                d.module === dist.module && d.dataType === dist.dataType
                  ? { ...d, status: "completed" }
                  : d,
              ),
            );
          },
          1000 + Math.random() * 2000,
        );
      }, index * 500);
    });
  };

  const handleModuleToggle = (moduleId: string, enabled: boolean) => {
    setIntegrationModules((prev) =>
      prev.map((module) =>
        module.id === moduleId
          ? { ...module, enabled, status: enabled ? "connected" : "disabled" }
          : module,
      ),
    );
  };

  const handleManualSync = () => {
    setSyncInProgress(true);

    // Simulate sync process
    setTimeout(() => {
      setIntegrationModules((prev) =>
        prev.map((module) =>
          module.enabled ? { ...module, status: "syncing", lastSync: new Date() } : module,
        ),
      );

      setTimeout(() => {
        setIntegrationModules((prev) =>
          prev.map((module) => (module.enabled ? { ...module, status: "connected" } : module)),
        );
        setSyncInProgress(false);
        if (scanData && defects.length > 0) {
          simulateDataDistribution();
        }
      }, 3000);
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-600 bg-green-100";
      case "syncing":
        return "text-blue-600 bg-blue-100";
      case "error":
        return "text-red-600 bg-red-100";
      case "disabled":
        return "text-gray-600 bg-gray-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "completed":
        return "text-green-600 bg-green-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return CheckCircle;
      case "syncing":
        return RefreshCw;
      case "error":
        return AlertCircle;
      case "disabled":
        return AlertCircle;
      case "pending":
        return Clock;
      case "completed":
        return CheckCircle;
      case "failed":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const connectedModules = integrationModules.filter(
    (m) => m.enabled && m.status === "connected",
  ).length;
  const totalModules = integrationModules.length;

  return (
    <div className="space-y-6">
      {/* Integration Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                System Integration Status
              </CardTitle>
              <CardDescription>
                Real-time data distribution across the Blacktop Blackout ecosystem
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Connected Modules</p>
                <p className="text-2xl font-bold text-green-600">
                  {connectedModules}/{totalModules}
                </p>
              </div>
              <Button onClick={handleManualSync} disabled={syncInProgress} variant="outline">
                {syncInProgress ? (
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Sync All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Database className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">Data Points</p>
                <p className="text-sm text-muted-foreground">
                  {defects.length} defects • {scanData?.images.length || 0} images
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Zap className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium">Auto Sync</p>
                <div className="flex items-center gap-2">
                  <Switch checked={autoSync} onCheckedChange={setAutoSync} size="sm" />
                  <span className="text-sm text-muted-foreground">
                    {autoSync ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Workflow className="h-8 w-8 text-purple-500" />
              <div>
                <p className="font-medium">Integration Health</p>
                <Progress value={(connectedModules / totalModules) * 100} className="w-full mt-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Modules */}
      <Tabs defaultValue="modules" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="modules">Integration Modules</TabsTrigger>
          <TabsTrigger value="data-flow">Data Flow</TabsTrigger>
          <TabsTrigger value="history">Sync History</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrationModules.map((module) => {
              const IconComponent = module.icon;
              const StatusIcon = getStatusIcon(module.status);

              return (
                <Card key={module.id} className={module.enabled ? "" : "opacity-60"}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-6 w-6 text-primary" />
                        <div>
                          <CardTitle className="text-base">{module.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {module.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Switch
                        checked={module.enabled}
                        onCheckedChange={(enabled) => handleModuleToggle(module.id, enabled)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(module.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {module.status.charAt(0).toUpperCase() + module.status.slice(1)}
                        </Badge>
                        {module.lastSync && (
                          <span className="text-xs text-muted-foreground">
                            Last sync: {module.lastSync.toLocaleTimeString()}
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">Data Types:</p>
                        <div className="flex flex-wrap gap-1">
                          {module.dataTypes.map((dataType) => (
                            <Badge key={dataType} variant="outline" className="text-xs">
                              {dataType}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="data-flow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Data Distribution</CardTitle>
              <CardDescription>
                Live view of how scan data flows to integrated modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dataDistributions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active data distributions</p>
                  <p className="text-sm">Start a scan to see real-time data flow</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dataDistributions.map((dist, index) => {
                    const StatusIcon = getStatusIcon(dist.status);

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <StatusIcon
                            className={`h-4 w-4 ${dist.status === "syncing" ? "animate-spin" : ""}`}
                          />
                          <div>
                            <p className="font-medium text-sm">{dist.module}</p>
                            <p className="text-xs text-muted-foreground">{dist.dataType}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {dist.records} records
                          </Badge>
                          <Badge className={getStatusColor(dist.status)}>{dist.status}</Badge>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Synchronization History</CardTitle>
              <CardDescription>
                Recent sync activities and system integration events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {integrationModules
                  .filter((m) => m.enabled && m.lastSync)
                  .sort((a, b) => (b.lastSync?.getTime() || 0) - (a.lastSync?.getTime() || 0))
                  .map((module, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <module.icon className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{module.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Synchronized {module.dataTypes.length} data types
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge className={getStatusColor(module.status)}>{module.status}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {module.lastSync?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integration Alerts */}
      {!autoSync && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Auto-sync is disabled. Manual synchronization required to distribute data across
            modules.
          </AlertDescription>
        </Alert>
      )}

      {integrationModules.some((m) => m.status === "error") && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some integration modules have connection errors. Check module status and retry
            synchronization.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SystemIntegration;
