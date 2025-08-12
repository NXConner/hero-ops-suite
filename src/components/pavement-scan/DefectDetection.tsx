import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Ruler, 
  MapPin, 
  Edit3, 
  Trash2, 
  Eye, 
  Download,
  Filter,
  Search,
  TrendingUp,
  BarChart3,
  Calendar
} from "lucide-react";
import { DefectData } from '@/pages/PavementScanPro';

interface DefectDetectionProps {
  defects: DefectData[];
  onDefectUpdate: (defects: DefectData[]) => void;
}

const DefectDetection: React.FC<DefectDetectionProps> = ({ defects, onDefectUpdate }) => {
  const [selectedDefect, setSelectedDefect] = useState<DefectData | null>(null);
  const [editingDefect, setEditingDefect] = useState<DefectData | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const defectTypeLabels = {
    crack: 'Crack',
    pothole: 'Pothole',
    alligator: 'Alligator Cracking',
    water_pooling: 'Water Pooling',
    gatoring: 'Gatoring',
    broken_area: 'Broken Area',
    weak_area: 'Weak Area',
    subsurface: 'Subsurface Defect'
  };

  const severityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  const defectTypeColors = {
    crack: 'bg-red-100 text-red-800',
    pothole: 'bg-red-200 text-red-900',
    alligator: 'bg-orange-100 text-orange-800',
    water_pooling: 'bg-blue-100 text-blue-800',
    gatoring: 'bg-yellow-100 text-yellow-800',
    broken_area: 'bg-purple-100 text-purple-800',
    weak_area: 'bg-gray-100 text-gray-800',
    subsurface: 'bg-indigo-100 text-indigo-800'
  };

  // Filter and search defects
  const filteredDefects = useMemo(() => {
    return defects.filter(defect => {
      const typeMatch = filterType === 'all' || defect.type === filterType;
      const severityMatch = filterSeverity === 'all' || defect.severity === filterSeverity;
      const searchMatch = searchTerm === '' || 
        defect.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        defectTypeLabels[defect.type].toLowerCase().includes(searchTerm.toLowerCase());
      
      return typeMatch && severityMatch && searchMatch;
    });
  }, [defects, filterType, filterSeverity, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalArea = defects.reduce((sum, defect) => sum + (defect.measurements.area || 0), 0);
    const totalLength = defects.reduce((sum, defect) => sum + (defect.measurements.length || 0), 0);
    
    const severityCount = {
      critical: defects.filter(d => d.severity === 'critical').length,
      high: defects.filter(d => d.severity === 'high').length,
      medium: defects.filter(d => d.severity === 'medium').length,
      low: defects.filter(d => d.severity === 'low').length
    };

    const typeCount = Object.keys(defectTypeLabels).reduce((acc, type) => {
      acc[type] = defects.filter(d => d.type === type).length;
      return acc;
    }, {} as Record<string, number>);

    const avgConfidence = defects.length > 0 
      ? defects.reduce((sum, d) => sum + d.confidence, 0) / defects.length 
      : 0;

    return {
      total: defects.length,
      totalArea,
      totalLength,
      severityCount,
      typeCount,
      avgConfidence
    };
  }, [defects]);

  const handleEditDefect = (defect: DefectData) => {
    setEditingDefect({ ...defect });
  };

  const handleSaveDefect = () => {
    if (!editingDefect) return;
    
    const updatedDefects = defects.map(d => 
      d.id === editingDefect.id ? editingDefect : d
    );
    onDefectUpdate(updatedDefects);
    setEditingDefect(null);
  };

  const handleDeleteDefect = (defectId: string) => {
    const updatedDefects = defects.filter(d => d.id !== defectId);
    onDefectUpdate(updatedDefects);
    if (selectedDefect?.id === defectId) {
      setSelectedDefect(null);
    }
  };

  const formatMeasurement = (value: number | undefined, unit: string) => {
    return value ? `${value.toFixed(2)} ${unit}` : 'N/A';
  };

  const getRepairPriority = (defect: DefectData): string => {
    const priorityScore = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    }[defect.severity];

    const typeMultiplier = {
      pothole: 1.5,
      broken_area: 1.4,
      alligator: 1.3,
      crack: 1.2,
      gatoring: 1.1,
      water_pooling: 1.0,
      weak_area: 0.9,
      subsurface: 0.8
    }[defect.type];

    const score = priorityScore * typeMultiplier;

    if (score >= 5) return 'Immediate';
    if (score >= 3) return 'Within 7 days';
    if (score >= 2) return 'Within 30 days';
    return 'Next maintenance cycle';
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Defects</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Area</p>
                <p className="text-2xl font-bold">{formatMeasurement(stats.totalArea, 'sq ft')}</p>
              </div>
              <Ruler className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">{stats.severityCount.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">{(stats.avgConfidence * 100).toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search defects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="type-filter">Defect Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(defectTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="severity-filter">Severity</Label>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-1" />
                Export List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Defect List</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Defects Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detected Defects ({filteredDefects.length})</CardTitle>
              <CardDescription>
                Click on a defect to view details and edit properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredDefects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No defects found matching your criteria.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Measurements</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDefects.map((defect) => (
                      <TableRow 
                        key={defect.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedDefect(defect)}
                      >
                        <TableCell className="font-medium">
                          {defect.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge className={defectTypeColors[defect.type]}>
                            {defectTypeLabels[defect.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={severityColors[defect.severity]}>
                            {defect.severity.charAt(0).toUpperCase() + defect.severity.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {defect.measurements.area && (
                              <div>Area: {formatMeasurement(defect.measurements.area, 'sq ft')}</div>
                            )}
                            {defect.measurements.length && (
                              <div>Length: {formatMeasurement(defect.measurements.length, 'ft')}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={defect.confidence * 100} className="w-16" />
                            <span className="text-sm">{(defect.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{getRepairPriority(defect)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditDefect(defect);
                              }}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDefect(defect.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {/* Statistical Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Defect Distribution by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.typeCount).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{defectTypeLabels[type as keyof typeof defectTypeLabels]}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(count / stats.total) * 100} className="w-20" />
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Severity Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.severityCount).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{severity}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(count / stats.total) * 100} className="w-20" />
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {/* Repair Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Repair Recommendations</CardTitle>
              <CardDescription>
                AI-generated recommendations based on detected defects and industry standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.severityCount.critical > 0 && (
                  <div className="border-l-4 border-red-500 bg-red-50 p-4">
                    <h4 className="font-semibold text-red-800">Immediate Action Required</h4>
                    <p className="text-red-700">
                      {stats.severityCount.critical} critical defects detected. These require immediate attention 
                      to prevent safety hazards and further deterioration.
                    </p>
                  </div>
                )}

                {stats.typeCount.pothole > 0 && (
                  <div className="border-l-4 border-orange-500 bg-orange-50 p-4">
                    <h4 className="font-semibold text-orange-800">Pothole Repair</h4>
                    <p className="text-orange-700">
                      {stats.typeCount.pothole} potholes detected. Recommend cold-patch repair for temporary 
                      solution and hot-mix asphalt for permanent repair.
                    </p>
                  </div>
                )}

                {stats.typeCount.crack > 0 && (
                  <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4">
                    <h4 className="font-semibold text-yellow-800">Crack Sealing</h4>
                    <p className="text-yellow-700">
                      {stats.typeCount.crack} cracks detected. Apply crack sealant to prevent water infiltration 
                      and further deterioration.
                    </p>
                  </div>
                )}

                {stats.typeCount.water_pooling > 0 && (
                  <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
                    <h4 className="font-semibold text-blue-800">Drainage Issues</h4>
                    <p className="text-blue-700">
                      {stats.typeCount.water_pooling} areas with water pooling detected. Improve drainage 
                      and consider surface leveling to prevent standing water.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Defect Details Modal */}
      {selectedDefect && (
        <Card className="fixed inset-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-background p-6 shadow-lg">
            <CardHeader>
              <CardTitle>Defect Details</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-4"
                onClick={() => setSelectedDefect(null)}
              >
                ×
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>ID</Label>
                <p className="text-sm text-muted-foreground">{selectedDefect.id}</p>
              </div>
              <div>
                <Label>Type</Label>
                <Badge className={defectTypeColors[selectedDefect.type]}>
                  {defectTypeLabels[selectedDefect.type]}
                </Badge>
              </div>
              <div>
                <Label>Severity</Label>
                <Badge className={severityColors[selectedDefect.severity]}>
                  {selectedDefect.severity.charAt(0).toUpperCase() + selectedDefect.severity.slice(1)}
                </Badge>
              </div>
              <div>
                <Label>Measurements</Label>
                <div className="text-sm space-y-1">
                  {selectedDefect.measurements.area && (
                    <p>Area: {formatMeasurement(selectedDefect.measurements.area, 'sq ft')}</p>
                  )}
                  {selectedDefect.measurements.length && (
                    <p>Length: {formatMeasurement(selectedDefect.measurements.length, 'ft')}</p>
                  )}
                  {selectedDefect.measurements.width && (
                    <p>Width: {formatMeasurement(selectedDefect.measurements.width, 'ft')}</p>
                  )}
                  {selectedDefect.measurements.depth && (
                    <p>Depth: {formatMeasurement(selectedDefect.measurements.depth, 'in')}</p>
                  )}
                </div>
              </div>
              <div>
                <Label>Confidence</Label>
                <div className="flex items-center gap-2">
                  <Progress value={selectedDefect.confidence * 100} className="flex-1" />
                  <span className="text-sm">{(selectedDefect.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
              <div>
                <Label>Repair Priority</Label>
                <p className="text-sm font-medium">{getRepairPriority(selectedDefect)}</p>
              </div>
              <div>
                <Label>Detected</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedDefect.timestamp.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </div>
        </Card>
      )}

      {/* Edit Defect Modal */}
      {editingDefect && (
        <Card className="fixed inset-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-background p-6 shadow-lg">
            <CardHeader>
              <CardTitle>Edit Defect</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-4"
                onClick={() => setEditingDefect(null)}
              >
                ×
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={editingDefect.type}
                  onValueChange={(value) => setEditingDefect({
                    ...editingDefect,
                    type: value as DefectData['type']
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(defectTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-severity">Severity</Label>
                <Select
                  value={editingDefect.severity}
                  onValueChange={(value) => setEditingDefect({
                    ...editingDefect,
                    severity: value as DefectData['severity']
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-length">Length (ft)</Label>
                  <Input
                    id="edit-length"
                    type="number"
                    step="0.1"
                    value={editingDefect.measurements.length || ''}
                    onChange={(e) => setEditingDefect({
                      ...editingDefect,
                      measurements: {
                        ...editingDefect.measurements,
                        length: parseFloat(e.target.value) || undefined
                      }
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-width">Width (ft)</Label>
                  <Input
                    id="edit-width"
                    type="number"
                    step="0.1"
                    value={editingDefect.measurements.width || ''}
                    onChange={(e) => setEditingDefect({
                      ...editingDefect,
                      measurements: {
                        ...editingDefect.measurements,
                        width: parseFloat(e.target.value) || undefined
                      }
                    })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveDefect} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingDefect(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DefectDetection;