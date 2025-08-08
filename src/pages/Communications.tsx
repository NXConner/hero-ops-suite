import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Sidebar from "@/components/Sidebar";
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Video, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Radio,
  Satellite,
  ArrowLeft,
  Plus,
  Search,
  Settings,
  Users,
  Shield,
  Lock,
  AlertTriangle,
  Clock,
  Signal,
  MoreVertical,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";

const Communications = () => {
  const [selectedChannel, setSelectedChannel] = useState("alpha-command");
  const [messageText, setMessageText] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const channels = [
    {
      id: "alpha-command",
      name: "Alpha Command",
      type: "Secure",
      participants: 8,
      status: "Active",
      priority: "High",
      lastMessage: "Mission briefing complete",
      timestamp: "2 min ago",
      unread: 0
    },
    {
      id: "bravo-recon",
      name: "Bravo Reconnaissance",
      type: "Encrypted",
      participants: 6,
      status: "Active",
      priority: "Medium",
      lastMessage: "Sector 7 clear, proceeding to waypoint",
      timestamp: "5 min ago",
      unread: 2
    },
    {
      id: "charlie-support",
      name: "Charlie Support",
      type: "Standard",
      participants: 7,
      status: "Standby",
      priority: "Low",
      lastMessage: "Equipment check complete",
      timestamp: "15 min ago",
      unread: 0
    },
    {
      id: "emergency",
      name: "Emergency Channel",
      type: "Priority",
      participants: 25,
      status: "Monitoring",
      priority: "Critical",
      lastMessage: "All clear - no active threats",
      timestamp: "1 hour ago",
      unread: 1
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "Commander Johnson",
      avatar: "/avatars/johnson.jpg",
      message: "Alpha Team, proceed to checkpoint Charlie and maintain radio silence until further notice.",
      timestamp: "14:32",
      type: "command",
      encrypted: true,
      status: "delivered"
    },
    {
      id: 2,
      sender: "Sergeant Wilson",
      avatar: "/avatars/wilson.jpg",
      message: "Roger that, Command. Alpha Team moving to checkpoint Charlie. ETA 15 minutes.",
      timestamp: "14:35",
      type: "response",
      encrypted: true,
      status: "read"
    },
    {
      id: 3,
      sender: "Lieutenant Davis",
      avatar: "/avatars/davis.jpg",
      message: "Requesting permission to deploy drone surveillance for perimeter check.",
      timestamp: "14:38",
      type: "request",
      encrypted: true,
      status: "delivered"
    },
    {
      id: 4,
      sender: "You",
      avatar: "/avatars/user.jpg",
      message: "Permission granted. Deploy drone and report findings.",
      timestamp: "14:40",
      type: "command",
      encrypted: true,
      status: "delivered"
    }
  ];

  const emergencyContacts = [
    { name: "HQ Command", number: "+1-555-COMMAND", status: "Online" },
    { name: "Medical Emergency", number: "+1-555-MEDIC", status: "Online" },
    { name: "Security Alert", number: "+1-555-SECURE", status: "Online" },
    { name: "Extraction Team", number: "+1-555-EXTRACT", status: "Standby" }
  ];

  const sendMessage = () => {
    if (messageText.trim()) {
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

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
                    Communications Center
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Secure tactical communications and coordination
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="default" className="bg-green-500">
                  <Radio className="w-3 h-3 mr-1" />
                  All Systems Online
                </Badge>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Channel
                </Button>
                <Button className="bg-gradient-to-r from-primary to-accent">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Emergency Broadcast
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <Tabs defaultValue="messages" className="space-y-6">
            <TabsList className="grid w-full lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
              <TabsTrigger value="logs">Communication Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-300px)]">
                {/* Channel List */}
                <Card className="lg:col-span-1 bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Active Channels</CardTitle>
                      <Button variant="ghost" size="icon">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3">
                    {channels.map((channel) => (
                      <div
                        key={channel.id}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedChannel === channel.id
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-secondary/50"
                        }`}
                        onClick={() => setSelectedChannel(channel.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">{channel.name}</div>
                          {channel.unread > 0 && (
                            <Badge variant="destructive" className="text-xs h-5">
                              {channel.unread}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {channel.lastMessage}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Lock className="h-3 w-3 text-primary" />
                            <span className="text-xs">{channel.type}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {channel.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Message Area */}
                <Card className="lg:col-span-3 bg-card/50 backdrop-blur-sm border border-border/50 flex flex-col">
                  <CardHeader className="border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <CardTitle className="text-lg">Alpha Command</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Lock className="h-3 w-3 text-green-500" />
                            Encrypted Channel • 8 participants
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.sender === "You" ? "flex-row-reverse" : ""}`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.avatar} alt={message.sender} />
                          <AvatarFallback>{message.sender.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className={`flex-1 ${message.sender === "You" ? "text-right" : ""}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{message.sender}</span>
                            <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                            {message.encrypted && <Lock className="h-3 w-3 text-green-500" />}
                            {message.status === "delivered" && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
                            {message.status === "read" && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                          </div>
                          <div className={`p-3 rounded-lg max-w-xs ${
                            message.sender === "You"
                              ? "bg-primary text-primary-foreground ml-auto"
                              : "bg-secondary/50"
                          }`}>
                            <p className="text-sm">{message.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>

                  {/* Message Input */}
                  <div className="p-4 border-t border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          placeholder="Type secure message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className={isRecording ? "bg-red-500" : ""}
                          onClick={() => setIsRecording(!isRecording)}
                        >
                          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button onClick={sendMessage} disabled={!messageText.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="channels" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channels.map((channel) => (
                  <Card key={channel.id} className="bg-card/50 backdrop-blur-sm border border-border/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{channel.name}</CardTitle>
                        <Badge variant={channel.status === "Active" ? "default" : "secondary"}>
                          {channel.status}
                        </Badge>
                      </div>
                      <CardDescription>{channel.type} Channel</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Participants:</span>
                          <span className="font-medium">{channel.participants}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Priority:</span>
                          <Badge variant={
                            channel.priority === "Critical" ? "destructive" :
                            channel.priority === "High" ? "destructive" :
                            channel.priority === "Medium" ? "default" : "secondary"
                          }>
                            {channel.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Last Activity:</span>
                          <span className="font-medium">{channel.timestamp}</span>
                        </div>
                        <Separator />
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Users className="h-4 w-4 mr-1" />
                            Join
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="emergency" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Emergency Contacts */}
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Emergency Contacts
                    </CardTitle>
                    <CardDescription>Quick access to critical communication channels</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {emergencyContacts.map((contact, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-border/30">
                        <div>
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-sm text-muted-foreground">{contact.number}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={contact.status === "Online" ? "default" : "secondary"}>
                            {contact.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Emergency Broadcast */}
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Radio className="h-5 w-5 text-primary" />
                      Emergency Broadcast
                    </CardTitle>
                    <CardDescription>Send priority alerts to all units</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="alert-type">Alert Type</Label>
                      <Select defaultValue="general">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Alert</SelectItem>
                          <SelectItem value="evacuation">Evacuation Order</SelectItem>
                          <SelectItem value="lockdown">Security Lockdown</SelectItem>
                          <SelectItem value="medical">Medical Emergency</SelectItem>
                          <SelectItem value="threat">Threat Assessment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority Level</Label>
                      <Select defaultValue="high">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message"
                        placeholder="Enter emergency message..."
                        rows={4}
                      />
                    </div>
                    <Button className="w-full bg-red-500 hover:bg-red-600">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Send Emergency Broadcast
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Signal className="h-5 w-5 text-primary" />
                    Communication Logs
                  </CardTitle>
                  <CardDescription>Historical communication records and audit trail</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        timestamp: "2024-01-19 14:45:32",
                        channel: "Alpha Command",
                        type: "Message",
                        sender: "Commander Johnson",
                        action: "Sent encrypted message",
                        status: "Success"
                      },
                      {
                        timestamp: "2024-01-19 14:40:15",
                        channel: "Emergency",
                        type: "Broadcast",
                        sender: "System",
                        action: "Emergency alert sent to all units",
                        status: "Success"
                      },
                      {
                        timestamp: "2024-01-19 14:35:22",
                        channel: "Bravo Reconnaissance",
                        type: "Voice",
                        sender: "Lieutenant Davis",
                        action: "Voice message recorded",
                        status: "Success"
                      },
                      {
                        timestamp: "2024-01-19 14:30:08",
                        channel: "Charlie Support",
                        type: "File",
                        sender: "Sergeant Wilson",
                        action: "Document shared",
                        status: "Success"
                      }
                    ].map((log, index) => (
                      <div key={index} className="p-4 rounded-lg bg-secondary/10 border border-border/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{log.timestamp}</span>
                          </div>
                          <Badge variant={log.status === "Success" ? "default" : "destructive"}>
                            {log.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Channel: </span>
                            <span className="font-medium">{log.channel}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Type: </span>
                            <span className="font-medium">{log.type}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Sender: </span>
                            <span className="font-medium">{log.sender}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Action: </span>
                            <span className="font-medium">{log.action}</span>
                          </div>
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

export default Communications;