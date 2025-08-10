import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Sidebar from "@/components/Sidebar";
import NavigationEditor from "@/components/settings/NavigationEditor";
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Monitor, 
  Database,
  Lock,
  ArrowLeft,
  Save,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Key,
  Globe,
  Smartphone,
  Image as ImageIcon,
  Waves as WavesIcon,
  ListTree
} from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAdvancedTheme } from "@/contexts/AdvancedThemeContext";

const Settings = () => {
  const [activeAlerts, setActiveAlerts] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const userProfile = {
    name: "Commander Johnson",
    email: "commander.johnson@ops.military",
    rank: "Colonel",
    clearanceLevel: "Top Secret",
    unit: "Special Operations Command",
    avatar: "/avatars/commander.jpg"
  };

  const {
    globalWallpaperOverride,
    isGlobalWallpaperEnabled,
    setGlobalWallpaperOverride,
    setIsGlobalWallpaperEnabled
  , wallpaperProfiles, saveWallpaperProfile, applyWallpaperProfile, deleteWallpaperProfile } = useAdvancedTheme();

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
                    System Settings
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Configure system preferences and security settings
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Default
                </Button>
                <Button className="bg-gradient-to-r from-primary to-accent">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full lg:w-auto lg:grid-cols-8">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="display">Display</TabsTrigger>
              <TabsTrigger value="wallpapers">Wallpapers</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="navigation">Navigation</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Information */}
                <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Profile Information
                    </CardTitle>
                    <CardDescription>Update your personal information and credentials</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                        <AvatarFallback>{userProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Change Photo
                        </Button>
                        <div className="text-sm text-muted-foreground">
                          JPG, PNG up to 5MB
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full-name">Full Name</Label>
                        <Input id="full-name" defaultValue={userProfile.name} />
                      </div>
                      <div>
                        <Label htmlFor="rank">Military Rank</Label>
                        <Input id="rank" defaultValue={userProfile.rank} />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue={userProfile.email} />
                      </div>
                      <div>
                        <Label htmlFor="unit">Unit/Division</Label>
                        <Input id="unit" defaultValue={userProfile.unit} />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio / Notes</Label>
                      <Textarea 
                        id="bio" 
                        placeholder="Additional information..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Security Clearance */}
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Security Clearance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{userProfile.clearanceLevel}</div>
                      <div className="text-sm text-muted-foreground">Current Level</div>
                    </div>
                    
                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Access Level</span>
                        <Badge variant="default">Level 5</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Valid Until</span>
                        <span className="text-sm font-medium">Dec 31, 2024</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Last Review</span>
                        <span className="text-sm font-medium">Jan 15, 2024</span>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full">
                      Request Review
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Password & Authentication */}
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-primary" />
                      Password & Authentication
                    </CardTitle>
                    <CardDescription>Manage your login credentials and authentication methods</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">Two-Factor Authentication</div>
                        <div className="text-sm text-muted-foreground">
                          Add an extra layer of security
                        </div>
                      </div>
                      <Switch 
                        checked={twoFactorAuth} 
                        onCheckedChange={setTwoFactorAuth}
                      />
                    </div>

                    <Button className="w-full">Update Password</Button>
                  </CardContent>
                </Card>

                {/* Session Management */}
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-primary" />
                      Active Sessions
                    </CardTitle>
                    <CardDescription>Manage your active login sessions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        device: "Windows PC - Operations Center",
                        location: "Base Alpha",
                        lastActive: "Active now",
                        current: true
                      },
                      {
                        device: "iPad - Mobile Command",
                        location: "Field Operations",
                        lastActive: "2 hours ago",
                        current: false
                      },
                      {
                        device: "Android Phone",
                        location: "Unknown Location",
                        lastActive: "1 day ago",
                        current: false
                      }
                    ].map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-border/30">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {session.device}
                            {session.current && <Badge variant="default" className="text-xs">Current</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {session.location} • {session.lastActive}
                          </div>
                        </div>
                        {!session.current && (
                          <Button variant="outline" size="sm">
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Configure how you receive alerts and updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">Critical Alerts</div>
                        <div className="text-sm text-muted-foreground">
                          Immediate notifications for critical system events
                        </div>
                      </div>
                      <Switch 
                        checked={activeAlerts} 
                        onCheckedChange={setActiveAlerts}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">Email Notifications</div>
                        <div className="text-sm text-muted-foreground">
                          Receive updates via email
                        </div>
                      </div>
                      <Switch 
                        checked={emailNotifications} 
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">Push Notifications</div>
                        <div className="text-sm text-muted-foreground">
                          Browser and mobile push notifications
                        </div>
                      </div>
                      <Switch 
                        checked={pushNotifications} 
                        onCheckedChange={setPushNotifications}
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="notification-frequency">Notification Frequency</Label>
                        <Select defaultValue="immediate">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="hourly">Hourly Digest</SelectItem>
                            <SelectItem value="daily">Daily Summary</SelectItem>
                            <SelectItem value="weekly">Weekly Report</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="quiet-hours">Quiet Hours</Label>
                        <Select defaultValue="22:00-06:00">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="22:00-06:00">22:00 - 06:00</SelectItem>
                            <SelectItem value="23:00-07:00">23:00 - 07:00</SelectItem>
                            <SelectItem value="00:00-08:00">00:00 - 08:00</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Configuration */}
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <SettingsIcon className="h-5 w-5 text-primary" />
                      System Configuration
                    </CardTitle>
                    <CardDescription>Core system settings and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="timezone">Time Zone</Label>
                      <Select defaultValue="utc">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                          <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                          <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                          <SelectItem value="gmt">GMT (Greenwich Mean Time)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="date-format">Date Format</Label>
                      <Select defaultValue="mdy">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                          <SelectItem value="iso">ISO 8601</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">Auto-save Changes</div>
                        <div className="text-sm text-muted-foreground">
                          Automatically save configuration changes
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Settings */}
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-primary" />
                      Performance Settings
                    </CardTitle>
                    <CardDescription>Optimize system performance and resource usage</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="refresh-rate">Dashboard Refresh Rate</Label>
                      <Select defaultValue="30">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 seconds</SelectItem>
                          <SelectItem value="15">15 seconds</SelectItem>
                          <SelectItem value="30">30 seconds</SelectItem>
                          <SelectItem value="60">1 minute</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="cache-duration">Cache Duration</Label>
                      <Select defaultValue="60">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="240">4 hours</SelectItem>
                          <SelectItem value="1440">24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="text-sm font-medium">System Resources</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>CPU Usage</span>
                          <span>24%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Memory Usage</span>
                          <span>8.2 GB / 16 GB</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Storage</span>
                          <span>245 GB / 500 GB</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="display" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-primary" />
                    Display Settings
                  </CardTitle>
                  <CardDescription>Customize the appearance and layout of the interface</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Theme</Label>
                        <div className="flex items-center space-x-4 mt-2">
                          <ThemeToggle />
                          <span className="text-sm text-muted-foreground">
                            System will automatically switch between light and dark modes
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="font-size">Font Size</Label>
                        <Select defaultValue="medium">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                            <SelectItem value="xlarge">Extra Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="density">Interface Density</Label>
                        <Select defaultValue="comfortable">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="compact">Compact</SelectItem>
                            <SelectItem value="comfortable">Comfortable</SelectItem>
                            <SelectItem value="spacious">Spacious</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium">Show Animations</div>
                          <div className="text-sm text-muted-foreground">
                            Enable interface animations and transitions
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium">High Contrast Mode</div>
                          <div className="text-sm text-muted-foreground">
                            Increase contrast for better visibility
                          </div>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium">Reduce Motion</div>
                          <div className="text-sm text-muted-foreground">
                            Minimize animations for accessibility
                          </div>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="text-sm font-medium">HUD Effects</div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      <Button variant="outline" onClick={() => (window as any).owEffects?.set({ minimal: true })}>Minimal Mode</Button>
                      <Button variant="outline" onClick={() => (window as any).owEffects?.set({ minimal: false })}>Full Mode</Button>
                      <Button variant="outline" onClick={() => (window as any).owEffects?.set({ scanlines: true })}>Scanlines On</Button>
                      <Button variant="outline" onClick={() => (window as any).owEffects?.set({ scanlines: false })}>Scanlines Off</Button>
                      <Button variant="outline" onClick={() => (window as any).owEffects?.set({ refreshBarH: true })}>Refresh H</Button>
                      <Button variant="outline" onClick={() => (window as any).owEffects?.set({ refreshBarV: true })}>Refresh V</Button>
                      <Button variant="outline" onClick={() => (window as any).owEffects?.set({ radarSweep: true })}>Radar</Button>
                      <Button variant="outline" onClick={() => (window as any).owEffects?.set({ uvVignette: true })}>UV Vignette</Button>
                      <Button variant="outline" onClick={() => (window as any).owEffects?.set({ ticker: true })}>Ticker</Button>
                      <Button variant="outline" onClick={() => (window as any).owEffects?.set({ vignette: true })}>Vignette</Button>
                      <Button variant="outline" onClick={() => (window as any).owEffects?.set({ glitch: true })}>Glitch</Button>
                      <Button variant="outline" onClick={() => (window as any).owEffects?.reset?.()}>Reset</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wallpapers" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Wallpapers
                  </CardTitle>
                  <CardDescription>Use any wallpaper with any theme. Configure a global override.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">Use Global Wallpaper</div>
                      <div className="text-sm text-muted-foreground">Overrides the active theme wallpaper
                      </div>
                    </div>
                    <Switch
                      checked={isGlobalWallpaperEnabled}
                      onCheckedChange={(enabled) => setIsGlobalWallpaperEnabled(enabled)}
                    />
                  </div>

                  <Separator />

                  {/* Profiles */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Profiles</div>
                      <div className="flex items-center gap-2">
                        <Input placeholder="Profile name" id="wp-profile-name" className="w-48" />
                        <Button size="sm" onClick={() => {
                          const name = (document.getElementById('wp-profile-name') as HTMLInputElement)?.value?.trim();
                          if (!name) return;
                          // @ts-ignore
                          saveWallpaperProfile(name);
                        }}>Save Profile</Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {wallpaperProfiles?.map((p) => (
                        <div key={p.name} className="flex items-center gap-2 border rounded px-2 py-1">
                          <span className="text-sm">{p.name}</span>
                          <Button size="sm" variant="outline" onClick={() => applyWallpaperProfile(p.name)}>Apply</Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteWallpaperProfile(p.name)}>Delete</Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label>Wallpaper Type</Label>
                      <Select
                        value={globalWallpaperOverride?.type || 'color'}
                        onValueChange={(type: any) => {
                          const next = { ...(globalWallpaperOverride || { type: 'color' }), type } as any;
                          setGlobalWallpaperOverride(next);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="color">Color</SelectItem>
                          <SelectItem value="gradient">Gradient</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>

                      {(globalWallpaperOverride?.type === 'image' || globalWallpaperOverride?.type === 'video') && (
                        <div className="space-y-2">
                          <Label>Source URL</Label>
                          <Input
                            placeholder="/hero-bg.jpg or https://..."
                            value={globalWallpaperOverride?.source || ''}
                            onChange={(e) => setGlobalWallpaperOverride({ ...(globalWallpaperOverride || { type: 'image' }), source: e.target.value })}
                          />
                        </div>
                      )}

                      {globalWallpaperOverride?.type === 'color' && (
                        <div className="space-y-2">
                          <Label>Tint (hsla string)</Label>
                          <Input
                            placeholder="hsl(215 20% 8% / 0.8)"
                            value={''}
                            onChange={() => {}}
                          />
                          <p className="text-xs text-muted-foreground">Advanced color editor available in Theme Customizer.</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Label>Overlay</Label>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Enable Overlay</span>
                        <Switch
                          checked={!!globalWallpaperOverride?.overlay}
                          onCheckedChange={(enabled) => {
                            if (!globalWallpaperOverride) return;
                            const next = { ...globalWallpaperOverride } as any;
                            next.overlay = enabled ? (next.overlay || { color: { h: 0, s: 0, l: 0, a: 0.3 }, opacity: 0.3, blendMode: 'multiply' }) : undefined;
                            setGlobalWallpaperOverride(next);
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Blend Mode</Label>
                          <Select
                            value={globalWallpaperOverride?.overlay?.blendMode || 'multiply'}
                            onValueChange={(blendMode) => globalWallpaperOverride && setGlobalWallpaperOverride({ ...globalWallpaperOverride, overlay: { ...(globalWallpaperOverride.overlay as any), blendMode } })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiply">multiply</SelectItem>
                              <SelectItem value="overlay">overlay</SelectItem>
                              <SelectItem value="screen">screen</SelectItem>
                              <SelectItem value="soft-light">soft-light</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Opacity</Label>
                          <Input
                            type="number"
                            min={0}
                            max={1}
                            step={0.05}
                            value={globalWallpaperOverride?.overlay?.opacity ?? 0.3}
                            onChange={(e) => globalWallpaperOverride && setGlobalWallpaperOverride({ ...globalWallpaperOverride, overlay: { ...(globalWallpaperOverride.overlay as any), opacity: parseFloat(e.target.value) } })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audio" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <WavesIcon className="h-5 w-5 text-primary" />
                    Audio & UI Sounds
                  </CardTitle>
                  <CardDescription>Control UI sounds. Test basic cues.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">Mute All</div>
                      <div className="text-sm text-muted-foreground">Disable all UI audio cues</div>
                    </div>
                    <Switch onCheckedChange={(m) => (window as any).owSounds?.setMuted(m)} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-2">
                      <Label>Volume</Label>
                      <input type="range" min={0} max={1} step={0.05} defaultValue={0.5} onChange={(e) => (window as any).owSounds?.setVolume?.(parseFloat(e.target.value))} className="w-full" />
                    </div>
                    <div>
                      <Label>Preset</Label>
                      <Select defaultValue="none" onValueChange={(v: any) => (window as any).owSounds?.setPreset?.(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="isac">ISAC</SelectItem>
                          <SelectItem value="disavowed">Disavowed</SelectItem>
                          <SelectItem value="darkzone">Darkzone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <Button variant="outline" onClick={() => (window as any).owSounds?.ui.hover?.()}>Hover</Button>
                    <Button variant="outline" onClick={() => (window as any).owSounds?.ui.select?.()}>Select</Button>
                    <Button variant="outline" onClick={() => (window as any).owSounds?.ui.confirm?.()}>Confirm</Button>
                    <Button variant="outline" onClick={() => (window as any).owSounds?.ui.error?.()}>Error</Button>
                    <Button variant="outline" onClick={() => (window as any).owSounds?.scanner.ping?.()}>Scan Ping</Button>
                    <Button variant="outline" onClick={() => (window as any).owSounds?.rogue.engaged?.()}>Rogue</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="navigation" className="space-y-6">
              <NavigationEditor />
            </TabsContent>

            <TabsContent value="backup" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Backup Configuration */}
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      Backup Configuration
                    </CardTitle>
                    <CardDescription>Manage data backup and recovery settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">Automatic Backup</div>
                        <div className="text-sm text-muted-foreground">
                          Enable scheduled data backups
                        </div>
                      </div>
                      <Switch 
                        checked={autoBackup} 
                        onCheckedChange={setAutoBackup}
                      />
                    </div>

                    <div>
                      <Label htmlFor="backup-frequency">Backup Frequency</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Every Hour</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="retention">Retention Period</Label>
                      <Select defaultValue="90">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">6 months</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Button className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Create Backup Now
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Restore from Backup
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Backup History */}
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardHeader>
                    <CardTitle>Recent Backups</CardTitle>
                    <CardDescription>View and manage backup history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { date: "Today, 3:00 AM", size: "2.4 GB", status: "Complete", type: "Automatic" },
                        { date: "Yesterday, 3:00 AM", size: "2.3 GB", status: "Complete", type: "Automatic" },
                        { date: "Jan 17, 3:00 AM", size: "2.2 GB", status: "Complete", type: "Automatic" },
                        { date: "Jan 16, 2:15 PM", size: "2.1 GB", status: "Complete", type: "Manual" }
                      ].map((backup, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-border/30">
                          <div>
                            <div className="font-medium">{backup.date}</div>
                            <div className="text-sm text-muted-foreground">
                              {backup.size} • {backup.type}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={backup.status === "Complete" ? "default" : "destructive"}>
                              {backup.status}
                            </Badge>
                            <Button variant="outline" size="sm">
                              Restore
                            </Button>
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
    </div>
  );
};

export default Settings;