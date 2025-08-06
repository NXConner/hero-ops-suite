import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Map, 
  MapPin, 
  Users, 
  Target, 
  Clock, 
  Shield, 
  Truck, 
  Radio, 
  Eye,
  Plus,
  Save,
  ArrowLeft,
  Navigation,
  Crosshair,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const MissionPlanning = () => {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [missionType, setMissionType] = useState("");
  const [priority, setPriority] = useState("");
  const [objectives, setObjectives] = useState([""]);

  const teams = [
    { id: "alpha", name: "Alpha Team", status: "Available", members: 8, specialty: "Assault" },
    { id: "bravo", name: "Bravo Team", status: "On Mission", members: 6, specialty: "Reconnaissance" },
    { id: "charlie", name: "Charlie Team", status: "Available", members: 7, specialty: "Support" },
    { id: "delta", name: "Delta Team", status: "Standby", members: 5, specialty: "Sniper" }
  ];

  const resources = [
    { type: "Transport", items: ["Humvee x3", "Transport Truck x2", "ATV x4"] },
    { type: "Equipment", items: ["Comm Radios x12", "Night Vision x8", "Body Armor x10"] },
    { type: "Weapons", items: ["Assault Rifles x10", "Sniper Rifles x2", "Explosives Kit x1"] },
    { type: "Support", items: ["Medic Kit x3", "Rations (72h) x4", "GPS Units x6"] }
  ];

  const mapMarkers = [
    { id: 1, type: "objective", x: 45, y: 30, label: "Primary Target", status: "pending" },
    { id: 2, type: "waypoint", x: 25, y: 50, label: "Rally Point Alpha", status: "active" },
    { id: 3, type: "hazard", x: 65, y: 40, label: "Known Threat", status: "warning" },
    { id: 4, type: "friendly", x: 15, y: 70, label: "Base Camp", status: "secure" }
  ];

  const addObjective = () => {
    setObjectives([...objectives, ""]);
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setObjectives(newObjectives);
  };

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
                  Mission Planning
                </h1>
                <p className="text-muted-foreground mt-1">
                  Create and coordinate tactical operations
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button className="bg-gradient-to-r from-primary to-accent">
                <CheckCircle className="w-4 h-4 mr-2" />
                Deploy Mission
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mission Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Mission Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mission-name">Mission Name</Label>
                  <Input id="mission-name" placeholder="Enter mission name" />
                </div>
                
                <div>
                  <Label htmlFor="mission-type">Mission Type</Label>
                  <Select value={missionType} onValueChange={setMissionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mission type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reconnaissance">Reconnaissance</SelectItem>
                      <SelectItem value="assault">Assault</SelectItem>
                      <SelectItem value="escort">Escort</SelectItem>
                      <SelectItem value="surveillance">Surveillance</SelectItem>
                      <SelectItem value="extraction">Extraction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="mission-desc">Mission Description</Label>
                  <Textarea 
                    id="mission-desc" 
                    placeholder="Enter detailed mission description..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Mission Objectives</Label>
                  <div className="space-y-2">
                    {objectives.map((objective, index) => (
                      <Input
                        key={index}
                        value={objective}
                        onChange={(e) => updateObjective(index, e.target.value)}
                        placeholder={`Objective ${index + 1}`}
                      />
                    ))}
                    <Button variant="outline" size="sm" onClick={addObjective} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Objective
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Assignment */}
            <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Team Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedTeam === team.id
                          ? "border-primary bg-primary/10"
                          : "border-border/30 hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedTeam(team.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{team.name}</div>
                        <Badge variant={team.status === "Available" ? "default" : team.status === "On Mission" ? "destructive" : "secondary"}>
                          {team.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {team.members} members • {team.specialty}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tactical Map */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-primary" />
                  Tactical Map
                </CardTitle>
                <CardDescription>
                  Place waypoints, objectives, and plan routes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-96 bg-secondary/20 rounded-lg border border-border/30 overflow-hidden">
                  {/* Map Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-yellow-900/20 to-brown-900/20" />
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-0 opacity-20">
                    {[...Array(10)].map((_, i) => (
                      <div key={`v-${i}`} className="absolute h-full border-l border-border" style={{ left: `${i * 10}%` }} />
                    ))}
                    {[...Array(8)].map((_, i) => (
                      <div key={`h-${i}`} className="absolute w-full border-t border-border" style={{ top: `${i * 12.5}%` }} />
                    ))}
                  </div>

                  {/* Map Markers */}
                  {mapMarkers.map((marker) => (
                    <div
                      key={marker.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                      style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                    >
                      <div className={`p-2 rounded-full border-2 ${
                        marker.type === "objective" ? "bg-red-500/20 border-red-500" :
                        marker.type === "waypoint" ? "bg-blue-500/20 border-blue-500" :
                        marker.type === "hazard" ? "bg-yellow-500/20 border-yellow-500" :
                        "bg-green-500/20 border-green-500"
                      }`}>
                        {marker.type === "objective" && <Target className="h-4 w-4 text-red-500" />}
                        {marker.type === "waypoint" && <MapPin className="h-4 w-4 text-blue-500" />}
                        {marker.type === "hazard" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                        {marker.type === "friendly" && <Shield className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-background/90 border border-border/50 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {marker.label}
                      </div>
                    </div>
                  ))}

                  {/* Map Controls */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Button size="sm" variant="outline" className="bg-background/80">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-background/80">
                      <Navigation className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-background/80">
                      <Crosshair className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Map Legend */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded border-2 border-red-500 bg-red-500/20">
                      <Target className="h-3 w-3 text-red-500" />
                    </div>
                    <span className="text-sm">Objectives</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded border-2 border-blue-500 bg-blue-500/20">
                      <MapPin className="h-3 w-3 text-blue-500" />
                    </div>
                    <span className="text-sm">Waypoints</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded border-2 border-yellow-500 bg-yellow-500/20">
                      <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    </div>
                    <span className="text-sm">Threats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded border-2 border-green-500 bg-green-500/20">
                      <Shield className="h-3 w-3 text-green-500" />
                    </div>
                    <span className="text-sm">Friendly</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource Allocation */}
            <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Resource Allocation
                </CardTitle>
                <CardDescription>
                  Assign equipment and supplies for the mission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="transport" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="transport">Transport</TabsTrigger>
                    <TabsTrigger value="equipment">Equipment</TabsTrigger>
                    <TabsTrigger value="weapons">Weapons</TabsTrigger>
                    <TabsTrigger value="support">Support</TabsTrigger>
                  </TabsList>

                  {resources.map((category) => (
                    <TabsContent key={category.type.toLowerCase()} value={category.type.toLowerCase()}>
                      <div className="space-y-3">
                        {category.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-border/30">
                            <span className="font-medium">{item}</span>
                            <div className="flex items-center gap-2">
                              <Input className="w-16 h-8" placeholder="0" type="number" min="0" />
                              <Button size="sm" variant="outline">Add</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mission Timeline */}
        <Card className="mt-8 bg-card/50 backdrop-blur-sm border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Mission Timeline
            </CardTitle>
            <CardDescription>
              Schedule mission phases and checkpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="start-time">Mission Start</Label>
                <Input id="start-time" type="datetime-local" />
              </div>
              <div>
                <Label htmlFor="duration">Estimated Duration</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2h">2 Hours</SelectItem>
                    <SelectItem value="4h">4 Hours</SelectItem>
                    <SelectItem value="8h">8 Hours</SelectItem>
                    <SelectItem value="12h">12 Hours</SelectItem>
                    <SelectItem value="24h">24 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="checkpoint">Next Checkpoint</Label>
                <Input id="checkpoint" placeholder="Enter checkpoint time" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MissionPlanning;