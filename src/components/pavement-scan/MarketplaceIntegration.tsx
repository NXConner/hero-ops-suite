import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Download,
  Star,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Zap,
  Cpu,
  Camera,
  Brain,
  Database,
  Wifi,
  Lock,
} from "lucide-react";

interface ModulePackage {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: "ai-enhancement" | "hardware-integration" | "export-plugin" | "analysis-tool";
  rating: number;
  downloads: number;
  price: number; // 0 for free
  verified: boolean;
  icon: any;
  features: string[];
  requirements: string[];
  status: "available" | "installed" | "updating" | "incompatible";
}

const MarketplaceIntegration: React.FC = () => {
  const [availableModules, setAvailableModules] = useState<ModulePackage[]>([
    {
      id: "thermal-imaging-pro",
      name: "Thermal Imaging Pro",
      description:
        "Advanced thermal infrared analysis for subsurface defect detection using FLIR ONE Pro integration",
      version: "2.1.0",
      author: "ThermalTech Solutions",
      category: "hardware-integration",
      rating: 4.8,
      downloads: 1247,
      price: 299.99,
      verified: true,
      icon: Camera,
      features: [
        "FLIR ONE Pro SDK",
        "Subsurface Analysis",
        "Thermal Mapping",
        "Real-time Processing",
      ],
      requirements: ["FLIR ONE Pro", "iOS 14+/Android 10+", "PavementScan Pro v1.2+"],
      status: "available",
    },
    {
      id: "ai-enhanced-detection",
      name: "AI Enhanced Detection",
      description:
        "Machine learning models trained on 50,000+ pavement images for improved defect recognition accuracy",
      version: "1.5.2",
      author: "DeepPave AI",
      category: "ai-enhancement",
      rating: 4.9,
      downloads: 2156,
      price: 0,
      verified: true,
      icon: Brain,
      features: [
        "95%+ Accuracy",
        "Custom Model Training",
        "Edge Computing",
        "Real-time Classification",
      ],
      requirements: ["Minimum 6GB RAM", "Neural Processing Unit recommended"],
      status: "installed",
    },
    {
      id: "lidar-integration",
      name: "LiDAR Pro Scanner",
      description:
        "Professional-grade LiDAR integration for millimeter-accurate 3D reconstruction and measurement",
      version: "3.0.1",
      author: "ScanTech Industries",
      category: "hardware-integration",
      rating: 4.7,
      downloads: 892,
      price: 499.99,
      verified: true,
      icon: Zap,
      features: ["Millimeter Accuracy", "Real-time Meshing", "Cloud Processing", "CAD Export"],
      requirements: ["iPhone 12 Pro+/iPad Pro with LiDAR", "Internet Connection"],
      status: "available",
    },
    {
      id: "gis-export-suite",
      name: "GIS Export Suite",
      description:
        "Comprehensive export tools for ArcGIS, QGIS, and other professional GIS platforms",
      version: "2.3.0",
      author: "GeoSpatial Solutions",
      category: "export-plugin",
      rating: 4.6,
      downloads: 1634,
      price: 149.99,
      verified: true,
      icon: Database,
      features: ["ArcGIS Integration", "Shapefile Export", "KML/KMZ Support", "Coordinate Systems"],
      requirements: ["Cloud Storage Account", "GIS Software License"],
      status: "available",
    },
    {
      id: "predictive-analytics",
      name: "Predictive Analytics Engine",
      description: "AI-powered deterioration modeling and maintenance scheduling optimization",
      version: "1.2.3",
      author: "PredictivePave Inc",
      category: "analysis-tool",
      rating: 4.4,
      downloads: 567,
      price: 199.99,
      verified: false,
      icon: Cpu,
      features: [
        "Deterioration Modeling",
        "Maintenance Scheduling",
        "Cost Optimization",
        "Weather Integration",
      ],
      requirements: ["Historical Data", "Weather API Access", "Cloud Processing"],
      status: "available",
    },
    {
      id: "iot-sensor-bridge",
      name: "IoT Sensor Bridge",
      description: "Connect external IoT sensors for environmental monitoring and data correlation",
      version: "1.0.8",
      author: "IoT Solutions Ltd",
      category: "hardware-integration",
      rating: 4.2,
      downloads: 234,
      price: 79.99,
      verified: true,
      icon: Wifi,
      features: ["Bluetooth LE", "WiFi Sensors", "Environmental Monitoring", "Data Correlation"],
      requirements: ["Bluetooth 5.0+", "Compatible IoT Sensors"],
      status: "incompatible",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [installProgress, setInstallProgress] = useState<Record<string, number>>({});
  const [showOnlyInstalled, setShowOnlyInstalled] = useState(false);

  const filteredModules = availableModules.filter((module) => {
    const matchesSearch =
      searchTerm === "" ||
      module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "all" || module.category === selectedCategory;
    const matchesInstalled = !showOnlyInstalled || module.status === "installed";

    return matchesSearch && matchesCategory && matchesInstalled;
  });

  const handleInstall = async (moduleId: string) => {
    setInstallProgress((prev) => ({ ...prev, [moduleId]: 0 }));

    // Update module status
    setAvailableModules((prev) =>
      prev.map((module) => (module.id === moduleId ? { ...module, status: "updating" } : module)),
    );

    // Simulate installation progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setInstallProgress((prev) => ({ ...prev, [moduleId]: i }));
    }

    // Complete installation
    setAvailableModules((prev) =>
      prev.map((module) => (module.id === moduleId ? { ...module, status: "installed" } : module)),
    );

    setInstallProgress((prev) => {
      const { [moduleId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleUninstall = (moduleId: string) => {
    setAvailableModules((prev) =>
      prev.map((module) => (module.id === moduleId ? { ...module, status: "available" } : module)),
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ai-enhancement":
        return Brain;
      case "hardware-integration":
        return Camera;
      case "export-plugin":
        return Database;
      case "analysis-tool":
        return Cpu;
      default:
        return Package;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ai-enhancement":
        return "bg-purple-100 text-purple-800";
      case "hardware-integration":
        return "bg-blue-100 text-blue-800";
      case "export-plugin":
        return "bg-green-100 text-green-800";
      case "analysis-tool":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "installed":
        return "bg-green-100 text-green-800";
      case "updating":
        return "bg-blue-100 text-blue-800";
      case "available":
        return "bg-gray-100 text-gray-800";
      case "incompatible":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const installedCount = availableModules.filter((m) => m.status === "installed").length;
  const availableCount = availableModules.filter((m) => m.status === "available").length;

  return (
    <div className="space-y-6">
      {/* Marketplace Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Module Marketplace
              </CardTitle>
              <CardDescription>
                Extend PavementScan Pro with advanced modules and integrations
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Installed Modules</p>
                <p className="text-2xl font-bold text-green-600">{installedCount}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-blue-600">{availableCount}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Brain className="h-8 w-8 text-purple-500" />
              <div>
                <p className="font-medium">AI Enhancements</p>
                <p className="text-sm text-muted-foreground">2 modules</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Camera className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">Hardware Integration</p>
                <p className="text-sm text-muted-foreground">3 modules</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Database className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium">Export Plugins</p>
                <p className="text-sm text-muted-foreground">1 module</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Cpu className="h-8 w-8 text-orange-500" />
              <div>
                <p className="font-medium">Analysis Tools</p>
                <p className="text-sm text-muted-foreground">1 module</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Categories</option>
              <option value="ai-enhancement">AI Enhancement</option>
              <option value="hardware-integration">Hardware Integration</option>
              <option value="export-plugin">Export Plugins</option>
              <option value="analysis-tool">Analysis Tools</option>
            </select>

            <Button
              variant={showOnlyInstalled ? "default" : "outline"}
              onClick={() => setShowOnlyInstalled(!showOnlyInstalled)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Installed Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => {
          const IconComponent = module.icon;
          const CategoryIcon = getCategoryIcon(module.category);
          const isInstalling = module.id in installProgress;

          return (
            <Card key={module.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-base">{module.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        v{module.version} by {module.author}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {module.verified && <Shield className="h-4 w-4 text-green-500" />}
                    <Badge className={getStatusColor(module.status)}>
                      {module.status === "updating" && isInstalling ? (
                        <Clock className="h-3 w-3 mr-1 animate-spin" />
                      ) : module.status === "installed" ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : module.status === "incompatible" ? (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      ) : null}
                      {module.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{module.description}</p>

                <div className="flex items-center justify-between text-sm">
                  <Badge className={getCategoryColor(module.category)}>
                    <CategoryIcon className="h-3 w-3 mr-1" />
                    {module.category.replace("-", " ")}
                  </Badge>

                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{module.rating}</span>
                    <span className="text-muted-foreground">({module.downloads})</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium mb-1">Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {module.features.slice(0, 2).map((feature, idx) => (
                      <Badge key={`feature-${idx}`} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {module.features.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{module.features.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>

                {isInstalling && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Installing...</span>
                      <span>{installProgress[module.id]}%</span>
                    </div>
                    <Progress value={installProgress[module.id]} className="w-full" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div>
                    {module.price > 0 ? (
                      <p className="font-bold text-lg">${module.price}</p>
                    ) : (
                      <p className="font-bold text-lg text-green-600">Free</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {module.status === "available" && (
                      <Button
                        onClick={() => handleInstall(module.id)}
                        disabled={isInstalling}
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {module.price > 0 ? "Purchase" : "Install"}
                      </Button>
                    )}

                    {module.status === "installed" && (
                      <Button
                        variant="outline"
                        onClick={() => handleUninstall(module.id)}
                        size="sm"
                      >
                        Uninstall
                      </Button>
                    )}

                    {module.status === "incompatible" && (
                      <Button variant="outline" disabled size="sm">
                        <Lock className="h-4 w-4 mr-1" />
                        Incompatible
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No modules found</p>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Only install modules from verified developers. All modules are sandboxed and cannot access
          system data without explicit permission.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default MarketplaceIntegration;
