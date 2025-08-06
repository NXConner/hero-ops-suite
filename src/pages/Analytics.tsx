import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  Target, 
  Users, 
  Clock, 
  Shield, 
  Activity,
  ArrowLeft,
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("missions");

  // Sample data for charts
  const missionData = [
    { month: 'Jan', successful: 24, failed: 2, pending: 3 },
    { month: 'Feb', successful: 28, failed: 1, pending: 4 },
    { month: 'Mar', successful: 32, failed: 3, pending: 2 },
    { month: 'Apr', successful: 29, failed: 1, pending: 5 },
    { month: 'May', successful: 35, failed: 2, pending: 3 },
    { month: 'Jun', successful: 38, failed: 1, pending: 4 }
  ];

  const teamPerformanceData = [
    { team: 'Alpha', missions: 45, successRate: 95, efficiency: 92 },
    { team: 'Bravo', missions: 38, successRate: 92, efficiency: 88 },
    { team: 'Charlie', missions: 42, successRate: 98, efficiency: 95 },
    { team: 'Delta', missions: 33, successRate: 89, efficiency: 85 }
  ];

  const threatLevelData = [
    { name: 'Low', value: 45, color: '#22c55e' },
    { name: 'Medium', value: 35, color: '#f59e0b' },
    { name: 'High', value: 15, color: '#ef4444' },
    { name: 'Critical', value: 5, color: '#991b1b' }
  ];

  const operationalEfficiencyData = [
    { day: 'Mon', efficiency: 85, alerts: 3, response: 12 },
    { day: 'Tue', efficiency: 92, alerts: 1, response: 8 },
    { day: 'Wed', efficiency: 88, alerts: 4, response: 15 },
    { day: 'Thu', efficiency: 95, alerts: 2, response: 9 },
    { day: 'Fri', efficiency: 90, alerts: 3, response: 11 },
    { day: 'Sat', efficiency: 87, alerts: 5, response: 18 },
    { day: 'Sun', efficiency: 82, alerts: 2, response: 14 }
  ];

  const resourceUtilizationData = [
    { resource: 'Personnel', allocated: 85, available: 15 },
    { resource: 'Vehicles', allocated: 70, available: 30 },
    { resource: 'Equipment', allocated: 92, available: 8 },
    { resource: 'Facilities', allocated: 65, available: 35 }
  ];

  const kpiData = [
    {
      title: "Mission Success Rate",
      value: "94.8%",
      change: "+2.3%",
      trend: "up",
      target: "95%",
      icon: Target
    },
    {
      title: "Average Response Time",
      value: "8.4 min",
      change: "-1.2 min",
      trend: "down",
      target: "10 min",
      icon: Clock
    },
    {
      title: "Team Efficiency",
      value: "91.2%",
      change: "+3.1%",
      trend: "up",
      target: "90%",
      icon: Users
    },
    {
      title: "System Uptime",
      value: "99.97%",
      change: "+0.02%",
      trend: "up",
      target: "99.95%",
      icon: Shield
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Performance Analytics
                </h1>
                <p className="text-muted-foreground mt-1">
                  Operational metrics and performance insights
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiData.map((kpi, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {kpi.change} from last period
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Target: {kpi.target}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="missions">Missions</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="threats">Threats</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Operational Efficiency Trend */}
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5 text-primary" />
                    Operational Efficiency
                  </CardTitle>
                  <CardDescription>Weekly efficiency and response metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={operationalEfficiencyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="efficiency" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Resource Utilization */}
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Resource Utilization
                  </CardTitle>
                  <CardDescription>Current allocation vs availability</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={resourceUtilizationData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="resource" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="allocated" fill="#3b82f6" />
                      <Bar dataKey="available" fill="#e5e7eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="missions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mission Success Trends */}
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Mission Success Trends
                  </CardTitle>
                  <CardDescription>Monthly mission outcomes over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={missionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="successful" fill="#22c55e" name="Successful" />
                      <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                      <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Mission Type Distribution */}
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Mission Statistics
                  </CardTitle>
                  <CardDescription>Detailed mission performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-4 rounded-lg bg-secondary/10 border border-border/30">
                        <div className="text-2xl font-bold text-green-500">127</div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary/10 border border-border/30">
                        <div className="text-2xl font-bold text-blue-500">15</div>
                        <div className="text-sm text-muted-foreground">Active</div>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary/10 border border-border/30">
                        <div className="text-2xl font-bold text-yellow-500">8</div>
                        <div className="text-sm text-muted-foreground">Pending</div>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary/10 border border-border/30">
                        <div className="text-2xl font-bold text-red-500">3</div>
                        <div className="text-sm text-muted-foreground">Failed</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Average Duration</span>
                        <span className="font-medium">6.2 hours</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Success Rate</span>
                        <span className="font-medium text-green-500">94.8%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Average Team Size</span>
                        <span className="font-medium">6.8 members</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Team Performance Comparison
                </CardTitle>
                <CardDescription>Success rates and efficiency metrics by team</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={teamPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="team" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="missions" fill="#3b82f6" name="Missions" />
                    <Bar dataKey="successRate" fill="#22c55e" name="Success Rate %" />
                    <Bar dataKey="efficiency" fill="#f59e0b" name="Efficiency %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle>Equipment Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Combat Gear", operational: 95, maintenance: 3, offline: 2 },
                      { name: "Vehicles", operational: 87, maintenance: 8, offline: 5 },
                      { name: "Communications", operational: 98, maintenance: 2, offline: 0 },
                      { name: "Medical Equipment", operational: 92, maintenance: 6, offline: 2 }
                    ].map((equipment, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{equipment.name}</span>
                          <span className="text-sm text-muted-foreground">{equipment.operational}% operational</span>
                        </div>
                        <Progress value={equipment.operational} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle>Personnel Readiness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { status: "Combat Ready", count: 156, percentage: 78 },
                      { status: "Training", count: 32, percentage: 16 },
                      { status: "On Leave", count: 8, percentage: 4 },
                      { status: "Medical", count: 4, percentage: 2 }
                    ].map((status, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{status.status}</div>
                          <div className="text-sm text-muted-foreground">{status.count} personnel</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{status.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle>Supply Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { item: "Ammunition", level: 85, status: "Good" },
                      { item: "Medical Supplies", level: 92, status: "Excellent" },
                      { item: "Rations", level: 67, status: "Adequate" },
                      { item: "Fuel", level: 45, status: "Low" }
                    ].map((supply, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{supply.item}</span>
                          <Badge variant={supply.level > 80 ? "default" : supply.level > 50 ? "secondary" : "destructive"}>
                            {supply.status}
                          </Badge>
                        </div>
                        <Progress value={supply.level} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="threats" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    Threat Level Distribution
                  </CardTitle>
                  <CardDescription>Current threat assessment breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={threatLevelData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {threatLevelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    Recent Threats
                  </CardTitle>
                  <CardDescription>Latest threat assessments and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { 
                        time: "2 hours ago", 
                        threat: "Elevated activity in Sector 12", 
                        level: "Medium",
                        response: "Surveillance increased"
                      },
                      { 
                        time: "6 hours ago", 
                        threat: "Communication intercept detected", 
                        level: "High",
                        response: "Analysis in progress"
                      },
                      { 
                        time: "1 day ago", 
                        threat: "Unusual vehicle movement", 
                        level: "Low",
                        response: "Monitored and cleared"
                      },
                      { 
                        time: "2 days ago", 
                        threat: "Perimeter breach attempt", 
                        level: "Critical",
                        response: "Security enhanced"
                      }
                    ].map((threat, index) => (
                      <div key={index} className="p-3 rounded-lg bg-secondary/10 border border-border/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{threat.threat}</span>
                          <Badge variant={
                            threat.level === "Critical" ? "destructive" :
                            threat.level === "High" ? "destructive" :
                            threat.level === "Medium" ? "default" : "secondary"
                          }>
                            {threat.level}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>{threat.time}</div>
                          <div>Response: {threat.response}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;