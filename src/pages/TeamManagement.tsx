import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  User, 
  Shield, 
  Star, 
  Clock, 
  Mail, 
  Phone, 
  MapPin,
  Award,
  Activity,
  Target,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  MessageSquare,
  Settings,
  Calendar,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";

const TeamManagement = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

  const teams = [
    {
      id: "alpha",
      name: "Alpha Team",
      leader: "Sarah Connor",
      status: "Available",
      members: 8,
      specialty: "Assault Operations",
      lastMission: "2024-01-15",
      successRate: 95
    },
    {
      id: "bravo",
      name: "Bravo Team",
      leader: "John Smith",
      status: "On Mission",
      members: 6,
      specialty: "Reconnaissance",
      lastMission: "2024-01-18",
      successRate: 92
    },
    {
      id: "charlie",
      name: "Charlie Team",
      leader: "Maria Rodriguez",
      status: "Available",
      members: 7,
      specialty: "Support Operations",
      lastMission: "2024-01-12",
      successRate: 98
    },
    {
      id: "delta",
      name: "Delta Team",
      leader: "Alex Johnson",
      status: "Training",
      members: 5,
      specialty: "Sniper Operations",
      lastMission: "2024-01-10",
      successRate: 89
    }
  ];

  const personnel = [
    {
      id: 1,
      name: "Sarah Connor",
      rank: "Captain",
      team: "Alpha Team",
      role: "Team Leader",
      status: "Active",
      specialties: ["Leadership", "Tactical Planning", "Combat"],
      experience: 12,
      missions: 127,
      avatar: "/avatars/sarah.jpg",
      skills: {
        combat: 95,
        leadership: 98,
        technical: 85,
        medical: 70
      },
      contact: {
        email: "s.connor@ops.military",
        phone: "+1-555-0101",
        location: "Base Alpha"
      }
    },
    {
      id: 2,
      name: "John Smith",
      rank: "Lieutenant",
      team: "Bravo Team",
      role: "Team Leader",
      status: "On Mission",
      specialties: ["Reconnaissance", "Electronics", "Navigation"],
      experience: 8,
      missions: 89,
      avatar: "/avatars/john.jpg",
      skills: {
        combat: 88,
        leadership: 90,
        technical: 95,
        medical: 75
      },
      contact: {
        email: "j.smith@ops.military",
        phone: "+1-555-0102",
        location: "Field Operations"
      }
    },
    {
      id: 3,
      name: "Maria Rodriguez",
      rank: "Sergeant",
      team: "Charlie Team",
      role: "Medic",
      status: "Active",
      specialties: ["Medical", "Chemical Defense", "Logistics"],
      experience: 6,
      missions: 67,
      avatar: "/avatars/maria.jpg",
      skills: {
        combat: 75,
        leadership: 85,
        technical: 80,
        medical: 98
      },
      contact: {
        email: "m.rodriguez@ops.military",
        phone: "+1-555-0103",
        location: "Medical Bay"
      }
    },
    {
      id: 4,
      name: "Alex Johnson",
      rank: "Staff Sergeant",
      team: "Delta Team",
      role: "Sniper",
      status: "Training",
      specialties: ["Marksmanship", "Surveillance", "Stealth"],
      experience: 10,
      missions: 156,
      avatar: "/avatars/alex.jpg",
      skills: {
        combat: 98,
        leadership: 82,
        technical: 88,
        medical: 65
      },
      contact: {
        email: "a.johnson@ops.military",
        phone: "+1-555-0104",
        location: "Training Facility"
      }
    }
  ];

  const filteredPersonnel = personnel.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || member.status.toLowerCase() === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

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
                  Team Management
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage personnel, assignments, and team coordination
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Personnel
              </Button>
              <Button className="bg-gradient-to-r from-primary to-accent">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Training
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList className="grid w-full lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="personnel">Personnel</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-6">
            {/* Team Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teams.map((team) => (
                <Card key={team.id} className="bg-card/50 backdrop-blur-sm border border-border/50 hover:shadow-glow transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <Badge variant={team.status === "Available" ? "default" : team.status === "On Mission" ? "destructive" : "secondary"}>
                        {team.status}
                      </Badge>
                    </div>
                    <CardDescription>{team.specialty}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Leader:</span>
                        <span className="font-medium">{team.leader}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Members:</span>
                        <span className="font-medium">{team.members}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Success Rate:</span>
                        <span className="font-medium text-green-500">{team.successRate}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Last Mission:</span>
                        <span className="font-medium">{team.lastMission}</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        <Users className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="personnel" className="space-y-6">
            {/* Personnel Filters */}
            <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle>Personnel Directory</CardTitle>
                <CardDescription>Search and filter team members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search personnel..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on mission">On Mission</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Personnel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPersonnel.map((member) => (
                <Card key={member.id} className="bg-card/50 backdrop-blur-sm border border-border/50 hover:shadow-glow transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{member.name}</CardTitle>
                          <Badge variant={member.status === "Active" ? "default" : member.status === "On Mission" ? "destructive" : "secondary"}>
                            {member.status}
                          </Badge>
                        </div>
                        <CardDescription>{member.rank} • {member.role}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Team:</span>
                        <span className="font-medium">{member.team}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Experience:</span>
                        <span className="font-medium">{member.experience} years</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Missions:</span>
                        <span className="font-medium">{member.missions}</span>
                      </div>
                      
                      {/* Skills */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Skills</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <div className="flex justify-between">
                              <span>Combat</span>
                              <span>{member.skills.combat}%</span>
                            </div>
                            <Progress value={member.skills.combat} className="h-1" />
                          </div>
                          <div>
                            <div className="flex justify-between">
                              <span>Leadership</span>
                              <span>{member.skills.leadership}%</span>
                            </div>
                            <Progress value={member.skills.leadership} className="h-1" />
                          </div>
                          <div>
                            <div className="flex justify-between">
                              <span>Technical</span>
                              <span>{member.skills.technical}%</span>
                            </div>
                            <Progress value={member.skills.technical} className="h-1" />
                          </div>
                          <div>
                            <div className="flex justify-between">
                              <span>Medical</span>
                              <span>{member.skills.medical}%</span>
                            </div>
                            <Progress value={member.skills.medical} className="h-1" />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <FileText className="h-4 w-4 mr-1" />
                          Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Current Assignments
                </CardTitle>
                <CardDescription>Active missions and task assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      mission: "Northern Reconnaissance",
                      team: "Bravo Team",
                      lead: "John Smith",
                      status: "In Progress",
                      progress: 75,
                      deadline: "2024-01-20"
                    },
                    {
                      mission: "Equipment Maintenance",
                      team: "Charlie Team",
                      lead: "Maria Rodriguez",
                      status: "Planning",
                      progress: 25,
                      deadline: "2024-01-22"
                    },
                    {
                      mission: "Training Exercise",
                      team: "Delta Team",
                      lead: "Alex Johnson",
                      status: "Scheduled",
                      progress: 0,
                      deadline: "2024-01-25"
                    }
                  ].map((assignment, index) => (
                    <div key={index} className="p-4 rounded-lg bg-secondary/10 border border-border/30">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-semibold">{assignment.mission}</div>
                          <div className="text-sm text-muted-foreground">{assignment.team} • Lead: {assignment.lead}</div>
                        </div>
                        <Badge variant={assignment.status === "In Progress" ? "default" : assignment.status === "Planning" ? "secondary" : "outline"}>
                          {assignment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{assignment.progress}%</span>
                          </div>
                          <Progress value={assignment.progress} />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Due: {assignment.deadline}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Training Programs
                  </CardTitle>
                  <CardDescription>Available training and certification programs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Advanced Combat Training", duration: "2 weeks", participants: 12, next: "2024-02-01" },
                      { name: "Medical Certification", duration: "1 week", participants: 8, next: "2024-02-05" },
                      { name: "Technical Systems", duration: "3 days", participants: 15, next: "2024-02-10" },
                      { name: "Leadership Development", duration: "1 week", participants: 6, next: "2024-02-15" }
                    ].map((program, index) => (
                      <div key={index} className="p-3 rounded-lg bg-secondary/10 border border-border/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{program.name}</div>
                          <Button size="sm" variant="outline">Enroll</Button>
                        </div>
                        <div className="text-sm text-muted-foreground grid grid-cols-3 gap-2">
                          <span>Duration: {program.duration}</span>
                          <span>Enrolled: {program.participants}</span>
                          <span>Next: {program.next}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Training Schedule
                  </CardTitle>
                  <CardDescription>Upcoming training sessions and evaluations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { time: "08:00", event: "Morning PT - Alpha Team", instructor: "SGT Wilson" },
                      { time: "10:30", event: "Weapons Training", instructor: "CPT Anderson" },
                      { time: "14:00", event: "Tactical Simulation", instructor: "LT Brown" },
                      { time: "16:00", event: "Medical Training", instructor: "Dr. Martinez" }
                    ].map((session, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10 border border-border/30">
                        <div className="text-sm font-medium text-primary">{session.time}</div>
                        <div className="flex-1">
                          <div className="font-medium">{session.event}</div>
                          <div className="text-sm text-muted-foreground">Instructor: {session.instructor}</div>
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

export default TeamManagement;