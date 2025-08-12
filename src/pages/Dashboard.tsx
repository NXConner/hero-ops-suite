import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Sidebar from "@/components/Sidebar";
import {
  Shield,
  Activity,
  Users,
  AlertTriangle,
  MapPin,
  Radio,
  Clock,
  TrendingUp,
  Target,
  Satellite,
  Lock,
  Zap,
} from "lucide-react";

const Dashboard = () => {
  const [activeAlerts, setActiveAlerts] = useState(3);
  const [operationalStatus, setOperationalStatus] = useState("OPERATIONAL");

  const quickStats = [
    {
      title: "Active Operations",
      value: "12",
      change: "+2 from last hour",
      icon: Activity,
      color: "text-green-500",
    },
    {
      title: "Team Members",
      value: "847",
      change: "23 on active duty",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Threat Level",
      value: "ELEVATED",
      change: "Updated 5 min ago",
      icon: AlertTriangle,
      color: "text-yellow-500",
    },
    {
      title: "System Status",
      value: "99.9%",
      change: "All systems nominal",
      icon: Shield,
      color: "text-green-500",
    },
  ];

  const recentOperations = [
    {
      id: "OP-2024-001",
      name: "Northern Reconnaissance",
      status: "In Progress",
      priority: "High",
      progress: 75,
      team: "Alpha Team",
      location: "Sector 7-N",
    },
    {
      id: "OP-2024-002",
      name: "Supply Route Security",
      status: "Planning",
      priority: "Medium",
      progress: 25,
      team: "Bravo Team",
      location: "Route Delta",
    },
    {
      id: "OP-2024-003",
      name: "Communications Sweep",
      status: "Complete",
      priority: "Low",
      progress: 100,
      team: "Charlie Team",
      location: "Base Perimeter",
    },
  ];

  const systemMetrics = [
    { name: "Network Security", value: 98, status: "Optimal" },
    { name: "Satellite Uplink", value: 95, status: "Good" },
    { name: "Communication Array", value: 92, status: "Good" },
    { name: "Tactical Systems", value: 99, status: "Optimal" },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Operations Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Real-time tactical operations monitoring and control
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant={operationalStatus === "OPERATIONAL" ? "default" : "destructive"}>
                  <Shield className="w-3 h-3 mr-1" />
                  {operationalStatus}
                </Badge>
                <Badge variant="secondary">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date().toLocaleTimeString()}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
              <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
              <TabsTrigger value="systems">Systems</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Operations */}
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Active Operations
                    </CardTitle>
                    <CardDescription>Current operational status and progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentOperations.slice(0, 2).map((op) => (
                        <div
                          key={op.id}
                          className="p-4 rounded-lg bg-secondary/20 border border-border/30"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold">{op.name}</div>
                            <Badge
                              variant={
                                op.priority === "High"
                                  ? "destructive"
                                  : op.priority === "Medium"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {op.priority}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {op.id} • {op.team} • {op.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={op.progress} className="flex-1" />
                            <span className="text-sm font-medium">{op.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Satellite className="h-5 w-5 text-primary" />
                      System Status
                    </CardTitle>
                    <CardDescription>Critical system metrics and performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {systemMetrics.map((metric, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{metric.name}</div>
                            <div className="text-sm text-muted-foreground">{metric.status}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24">
                              <Progress value={metric.value} />
                            </div>
                            <span className="text-sm font-medium w-8">{metric.value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Frequently used operational commands</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/mission-planning">
                      <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                        <MapPin className="h-5 w-5" />
                        New Mission
                      </Button>
                    </Link>
                    <Link to="/communications">
                      <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                        <Radio className="h-5 w-5" />
                        Communications
                      </Button>
                    </Link>
                    <Link to="/intel-reports">
                      <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                        <AlertTriangle className="h-5 w-5" />
                        Intel Reports
                      </Button>
                    </Link>
                    <Link to="/team-management">
                      <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                        <Lock className="h-5 w-5" />
                        Team Management
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="operations">
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle>All Operations</CardTitle>
                  <CardDescription>Complete list of current and recent operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOperations.map((op) => (
                      <div
                        key={op.id}
                        className="p-4 rounded-lg bg-secondary/10 border border-border/30 hover:bg-secondary/20 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="font-semibold text-lg">{op.name}</div>
                            <Badge
                              variant={
                                op.status === "Complete"
                                  ? "default"
                                  : op.status === "In Progress"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {op.status}
                            </Badge>
                          </div>
                          <Badge
                            variant={
                              op.priority === "High"
                                ? "destructive"
                                : op.priority === "Medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {op.priority}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                          <div>ID: {op.id}</div>
                          <div>Team: {op.team}</div>
                          <div>Location: {op.location}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={op.progress} className="flex-1" />
                          <span className="text-sm font-medium">{op.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="intelligence">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle>Threat Assessment</CardTitle>
                    <CardDescription>Current threat analysis and intelligence</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold">ELEVATED THREAT</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Increased activity detected in Sector 12. Recommend enhanced surveillance.
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold">INTEL UPDATE</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          New satellite imagery available for operational planning.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle>Communication Intercepts</CardTitle>
                    <CardDescription>Recent signals intelligence</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-secondary/10 border border-border/30">
                        <div className="font-medium text-sm">Frequency 145.250 MHz</div>
                        <div className="text-xs text-muted-foreground">
                          Encrypted transmission - analyzing
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/10 border border-border/30">
                        <div className="font-medium text-sm">Frequency 88.750 MHz</div>
                        <div className="text-xs text-muted-foreground">
                          Clear communication - logged
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="systems">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle>Network Status</CardTitle>
                    <CardDescription>Communication and data networks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "Primary Network", status: "Online", latency: "12ms" },
                        { name: "Backup Network", status: "Standby", latency: "15ms" },
                        { name: "Satellite Link", status: "Online", latency: "245ms" },
                        { name: "Mesh Network", status: "Online", latency: "8ms" },
                      ].map((network, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-border/30"
                        >
                          <div>
                            <div className="font-medium">{network.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Latency: {network.latency}
                            </div>
                          </div>
                          <Badge variant={network.status === "Online" ? "default" : "secondary"}>
                            {network.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle>Security Status</CardTitle>
                    <CardDescription>System security and access control</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Firewall Status</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Intrusion Detection</span>
                        <Badge variant="default">Monitoring</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Encryption Level</span>
                        <Badge variant="default">AES-256</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Access Control</span>
                        <Badge variant="default">Enforced</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
