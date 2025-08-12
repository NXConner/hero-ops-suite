import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Eye, 
  AlertTriangle,
  TrendingUp,
  MapPin,
  Calendar,
  Clock,
  User,
  Shield,
  Target,
  Camera,
  Satellite,
  Radio,
  ArrowLeft,
  Plus,
  Star,
  Archive,
  Flag
} from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Sidebar from "@/components/Sidebar";

const IntelReports = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  const reports = [
    {
      id: "RPT-2024-001",
      title: "Sector 12 Threat Assessment",
      category: "Threat Analysis",
      classification: "Secret",
      priority: "High",
      status: "Active",
      date: "2024-01-19",
      author: "Intelligence Officer Martinez",
      summary: "Elevated activity detected in Sector 12 with potential hostile reconnaissance operations.",
      confidence: 85,
      sources: 3,
      keywords: ["Sector 12", "Reconnaissance", "Hostile Activity"]
    },
    {
      id: "RPT-2024-002",
      title: "Communication Intercept Analysis",
      category: "SIGINT",
      classification: "Top Secret",
      priority: "Critical",
      status: "Analyzing",
      date: "2024-01-19",
      author: "Analyst Thompson",
      summary: "Intercepted communications suggest coordinated movement in northern regions.",
      confidence: 92,
      sources: 5,
      keywords: ["SIGINT", "Communications", "Northern Sector"]
    },
    {
      id: "RPT-2024-003",
      title: "Satellite Imagery Report",
      category: "GEOINT",
      classification: "Confidential",
      priority: "Medium",
      status: "Complete",
      date: "2024-01-18",
      author: "Analyst Chen",
      summary: "Recent satellite imagery shows new infrastructure development in target areas.",
      confidence: 78,
      sources: 2,
      keywords: ["Satellite", "Infrastructure", "Development"]
    },
    {
      id: "RPT-2024-004",
      title: "Field Agent Report - Operation Falcon",
      category: "HUMINT",
      classification: "Secret",
      priority: "Medium",
      status: "Complete",
      date: "2024-01-17",
      author: "Field Agent Rodriguez",
      summary: "Local contacts report unusual supply convoy movements near checkpoint Delta.",
      confidence: 71,
      sources: 4,
      keywords: ["Field Report", "Supply Convoy", "Checkpoint Delta"]
    }
  ];

  const threatLevels = [
    { region: "Sector 12", level: "High", change: "+15%", incidents: 8 },
    { region: "Northern Zone", level: "Elevated", change: "+8%", incidents: 5 },
    { region: "Eastern Border", level: "Medium", change: "-2%", incidents: 3 },
    { region: "Southern Perimeter", level: "Low", change: "-12%", incidents: 1 }
  ];

  const intelSources = [
    { type: "HUMINT", active: 12, reliability: 92, reports: 45 },
    { type: "SIGINT", active: 8, reliability: 88, reports: 67 },
    { type: "GEOINT", active: 6, reliability: 95, reports: 23 },
    { type: "OSINT", active: 15, reliability: 76, reports: 89 }
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || report.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
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
                    Intelligence Reports
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Threat assessment and intelligence analysis center
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="default" className="bg-blue-500">
                  <Eye className="w-3 h-3 mr-1" />
                  Active Surveillance
                </Badge>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Report
                </Button>
                <Button className="bg-gradient-to-r from-primary to-accent">
                  <Download className="w-4 h-4 mr-2" />
                  Export Intel
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <Tabs defaultValue="reports" className="space-y-6">
            <TabsList className="grid w-full lg:w-auto lg:grid-cols-5">
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="threats">Threat Analysis</TabsTrigger>
              <TabsTrigger value="sources">Intel Sources</TabsTrigger>
              <TabsTrigger value="surveillance">Surveillance</TabsTrigger>
              <TabsTrigger value="archive">Archive</TabsTrigger>
            </TabsList>

            <TabsContent value="reports" className="space-y-6">
              {/* Search and Filters */}
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle>Intelligence Database</CardTitle>
                  <CardDescription>Search and filter classified intelligence reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search reports, keywords, or classifications..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Threat Analysis">Threat Analysis</SelectItem>
                        <SelectItem value="SIGINT">SIGINT</SelectItem>
                        <SelectItem value="GEOINT">GEOINT</SelectItem>
                        <SelectItem value="HUMINT">HUMINT</SelectItem>
                        <SelectItem value="OSINT">OSINT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Reports Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredReports.map((report) => (
                  <Card key={report.id} className="bg-card/50 backdrop-blur-sm border border-border/50 hover:shadow-glow transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={report.classification === "Top Secret" ? "destructive" : report.classification === "Secret" ? "default" : "secondary"}>
                            {report.classification}
                          </Badge>
                          <Badge variant={report.priority === "Critical" ? "destructive" : report.priority === "High" ? "default" : "secondary"}>
                            {report.priority}
                          </Badge>
                        </div>
                        <Badge variant={report.status === "Active" ? "default" : report.status === "Analyzing" ? "secondary" : "outline"}>
                          {report.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription>{report.category} • {report.id}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">{report.summary}</p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span>Confidence Level:</span>
                          <div className="flex items-center gap-2">
                            <Progress value={report.confidence} className="w-20 h-2" />
                            <span className="font-medium">{report.confidence}%</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Author: </span>
                            <span className="font-medium">{report.author}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Sources: </span>
                            <span className="font-medium">{report.sources}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date: </span>
                            <span className="font-medium">{report.date}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Keywords: </span>
                            <span className="font-medium">{report.keywords.length}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {report.keywords.map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>

                        <Separator />

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-4 w-4 mr-1" />
                            View Full Report
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Star className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="threats" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Threat Level Map */}
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Regional Threat Assessment
                    </CardTitle>
                    <CardDescription>Current threat levels by operational sector</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {threatLevels.map((threat, index) => (
                        <div key={index} className="p-4 rounded-lg bg-secondary/10 border border-border/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{threat.region}</div>
                            <Badge variant={
                              threat.level === "High" ? "destructive" :
                              threat.level === "Elevated" ? "default" :
                              threat.level === "Medium" ? "secondary" : "outline"
                            }>
                              {threat.level}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Incidents: {threat.incidents}</span>
                            <span className={threat.change.startsWith('+') ? 'text-red-500' : 'text-green-500'}>
                              {threat.change} from last week
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Threat Trends */}
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Threat Trend Analysis
                    </CardTitle>
                    <CardDescription>Intelligence summary and forecasting</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="font-semibold text-red-500">CRITICAL ALERT</span>
                        </div>
                        <p className="text-sm">Coordinated activity patterns suggest potential large-scale operation planning.</p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Flag className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold text-yellow-500">TREND ANALYSIS</span>
                        </div>
                        <p className="text-sm">Increased communication intercepts in northern sectors over past 72 hours.</p>
                      </div>

                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold text-blue-500">INTELLIGENCE UPDATE</span>
                        </div>
                        <p className="text-sm">New satellite imagery confirms infrastructure changes in Sector 12.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-500">24</div>
                          <div className="text-sm text-muted-foreground">Active Threats</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-500">187</div>
                          <div className="text-sm text-muted-foreground">Monitoring Points</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sources" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {intelSources.map((source, index) => (
                  <Card key={index} className="bg-card/50 backdrop-blur-sm border border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">{source.type}</CardTitle>
                      <CardDescription>
                        {source.type === "HUMINT" ? "Human Intelligence" :
                         source.type === "SIGINT" ? "Signals Intelligence" :
                         source.type === "GEOINT" ? "Geospatial Intelligence" :
                         "Open Source Intelligence"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Active Sources:</span>
                          <span className="font-medium">{source.active}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Reliability:</span>
                          <span className="font-medium">{source.reliability}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Reports Filed:</span>
                          <span className="font-medium">{source.reports}</span>
                        </div>
                        <Progress value={source.reliability} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle>Source Management</CardTitle>
                  <CardDescription>Active intelligence collection assets and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { id: "SRC-001", type: "HUMINT", location: "Sector 12", status: "Active", lastContact: "2 hours ago", reliability: 95 },
                      { id: "SRC-007", type: "SIGINT", location: "Northern Zone", status: "Monitoring", lastContact: "15 min ago", reliability: 88 },
                      { id: "SRC-012", type: "GEOINT", location: "Satellite Coverage", status: "Active", lastContact: "30 min ago", reliability: 98 },
                      { id: "SRC-023", type: "OSINT", location: "Multiple", status: "Collecting", lastContact: "5 min ago", reliability: 76 }
                    ].map((source, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-secondary/10 border border-border/30">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-medium">{source.id}</div>
                            <div className="text-sm text-muted-foreground">{source.type} • {source.location}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm">Last Contact: {source.lastContact}</div>
                            <div className="text-sm text-muted-foreground">Reliability: {source.reliability}%</div>
                          </div>
                          <Badge variant={source.status === "Active" ? "default" : "secondary"}>
                            {source.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="surveillance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Surveillance */}
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5 text-primary" />
                      Active Surveillance
                    </CardTitle>
                    <CardDescription>Live monitoring operations and status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { target: "Checkpoint Delta", type: "Visual", status: "Active", duration: "4h 23m", operator: "Agent Smith" },
                        { target: "Supply Route 7", type: "Drone", status: "Active", duration: "2h 15m", operator: "Operator Jones" },
                        { target: "Communications Hub", type: "Electronic", status: "Monitoring", duration: "12h 45m", operator: "Tech Specialist Davis" }
                      ].map((surveillance, index) => (
                        <div key={index} className="p-3 rounded-lg bg-secondary/10 border border-border/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{surveillance.target}</div>
                            <Badge variant={surveillance.status === "Active" ? "default" : "secondary"}>
                              {surveillance.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>{surveillance.type} surveillance • {surveillance.duration}</div>
                            <div>Operator: {surveillance.operator}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Satellite Coverage */}
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Satellite className="h-5 w-5 text-primary" />
                      Satellite Coverage
                    </CardTitle>
                    <CardDescription>Orbital asset status and coverage windows</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { satellite: "RECON-7", coverage: "Northern Sectors", nextPass: "14:30 UTC", resolution: "0.5m", status: "Operational" },
                        { satellite: "INTEL-3", coverage: "Eastern Border", nextPass: "16:45 UTC", resolution: "0.3m", status: "Operational" },
                        { satellite: "SURVEY-12", coverage: "Global", nextPass: "22:15 UTC", resolution: "1.0m", status: "Maintenance" }
                      ].map((satellite, index) => (
                        <div key={index} className="p-3 rounded-lg bg-secondary/10 border border-border/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{satellite.satellite}</div>
                            <Badge variant={satellite.status === "Operational" ? "default" : "secondary"}>
                              {satellite.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>Coverage: {satellite.coverage}</div>
                            <div>Next Pass: {satellite.nextPass} • Resolution: {satellite.resolution}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="archive" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="h-5 w-5 text-primary" />
                    Intelligence Archive
                  </CardTitle>
                  <CardDescription>Historical reports and declassified intelligence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { id: "RPT-2023-847", title: "Operation Nightwatch - Final Report", date: "2023-12-15", classification: "Declassified", category: "Operation Summary" },
                      { id: "RPT-2023-832", title: "Eastern Border Assessment Q4", date: "2023-12-01", classification: "Confidential", category: "Threat Analysis" },
                      { id: "RPT-2023-798", title: "Communication Protocol Analysis", date: "2023-11-20", classification: "Secret", category: "SIGINT" },
                      { id: "RPT-2023-756", title: "Regional Infrastructure Survey", date: "2023-11-05", classification: "Declassified", category: "GEOINT" }
                    ].map((archived, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-secondary/10 border border-border/30">
                        <div>
                          <div className="font-medium">{archived.title}</div>
                          <div className="text-sm text-muted-foreground">{archived.id} • {archived.category} • {archived.date}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={archived.classification === "Declassified" ? "outline" : "default"}>
                            {archived.classification}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default IntelReports;