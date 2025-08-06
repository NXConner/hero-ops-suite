import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Download, 
  Share, 
  Mail,
  Printer,
  Eye,
  Settings,
  MapPin,
  Calendar,
  User,
  Building,
  Camera,
  Ruler,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { DefectData, ScanData } from '@/pages/PavementScanPro';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReportGenerationProps {
  scanData: ScanData | null;
  defects: DefectData[];
}

interface ReportConfig {
  title: string;
  projectName: string;
  clientName: string;
  inspectorName: string;
  location: string;
  includeExecutiveSummary: boolean;
  includeDefectDetails: boolean;
  include3DModel: boolean;
  includeRecommendations: boolean;
  includePhotos: boolean;
  includeMeasurements: boolean;
  reportType: 'summary' | 'detailed' | 'technical';
  format: 'pdf' | 'word' | 'html';
}

const ReportGeneration: React.FC<ReportGenerationProps> = ({ scanData, defects }) => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    title: 'Pavement Condition Assessment Report',
    projectName: '',
    clientName: '',
    inspectorName: '',
    location: '',
    includeExecutiveSummary: true,
    includeDefectDetails: true,
    include3DModel: true,
    includeRecommendations: true,
    includePhotos: true,
    includeMeasurements: true,
    reportType: 'detailed',
    format: 'pdf'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const reportPreviewRef = useRef<HTMLDivElement>(null);

  const handleConfigChange = (key: keyof ReportConfig, value: any) => {
    setReportConfig(prev => ({ ...prev, [key]: value }));
  };

  const generateExecutiveSummary = () => {
    const totalDefects = defects.length;
    const criticalDefects = defects.filter(d => d.severity === 'critical').length;
    const highDefects = defects.filter(d => d.severity === 'high').length;
    
    let condition = 'Good';
    if (criticalDefects > 0) condition = 'Poor';
    else if (highDefects > 2) condition = 'Fair';
    
    return `
      This pavement condition assessment was conducted on ${scanData?.timestamp.toLocaleDateString()} 
      using advanced AI-powered scanning technology. The scanned area covers ${scanData?.area.toFixed(1)} 
      square feet with a perimeter of ${scanData?.perimeter.toFixed(1)} feet.
      
      Overall Condition: ${condition}
      
      Key Findings:
      • Total defects identified: ${totalDefects}
      • Critical issues requiring immediate attention: ${criticalDefects}
      • High priority repairs needed: ${highDefects}
      • Average defect detection confidence: ${((defects.reduce((sum, d) => sum + d.confidence, 0) / defects.length) * 100).toFixed(1)}%
      
      ${criticalDefects > 0 ? 'Immediate action is recommended for critical defects to prevent safety hazards and further deterioration.' : 'No critical defects were identified during this assessment.'}
    `;
  };

  const generateRecommendations = () => {
    const defectTypes = [...new Set(defects.map(d => d.type))];
    const recommendations = [];

    if (defectTypes.includes('pothole')) {
      recommendations.push('• Pothole Repair: Use cold-patch asphalt for temporary repairs and hot-mix asphalt for permanent solutions.');
    }
    if (defectTypes.includes('crack')) {
      recommendations.push('• Crack Sealing: Apply rubberized crack sealant to prevent water infiltration.');
    }
    if (defectTypes.includes('alligator')) {
      recommendations.push('• Alligator Cracking: Remove and replace affected areas with new asphalt overlay.');
    }
    if (defectTypes.includes('water_pooling')) {
      recommendations.push('• Drainage Improvement: Install additional drainage or resurface to correct grade issues.');
    }
    if (defectTypes.includes('gatoring')) {
      recommendations.push('• Surface Treatment: Apply microsurfacing or thin overlay to address gatoring.');
    }

    recommendations.push('• Regular Monitoring: Schedule annual inspections to track defect progression.');
    recommendations.push('• Preventive Maintenance: Implement seal coating every 3-5 years to extend pavement life.');

    return recommendations.join('\n');
  };

  const generateReport = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate report generation progress
      const steps = [
        'Analyzing scan data...',
        'Processing defect information...',
        'Generating 3D model images...',
        'Creating executive summary...',
        'Compiling recommendations...',
        'Formatting document...',
        'Finalizing report...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setGenerationProgress((i + 1) / steps.length * 100);
      }

      if (reportConfig.format === 'pdf') {
        await generatePDFReport();
      } else if (reportConfig.format === 'html') {
        generateHTMLReport();
      } else {
        // Mock Word document generation
        console.log('Generating Word document...');
      }

    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const generatePDFReport = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    let currentY = 20;

    // Title Page
    pdf.setFontSize(24);
    pdf.text(reportConfig.title, pageWidth / 2, currentY, { align: 'center' });
    currentY += 20;

    pdf.setFontSize(16);
    pdf.text(`Project: ${reportConfig.projectName}`, 20, currentY);
    currentY += 10;
    pdf.text(`Client: ${reportConfig.clientName}`, 20, currentY);
    currentY += 10;
    pdf.text(`Inspector: ${reportConfig.inspectorName}`, 20, currentY);
    currentY += 10;
    pdf.text(`Location: ${reportConfig.location}`, 20, currentY);
    currentY += 10;
    pdf.text(`Date: ${scanData?.timestamp.toLocaleDateString()}`, 20, currentY);
    currentY += 30;

    // Executive Summary
    if (reportConfig.includeExecutiveSummary) {
      pdf.setFontSize(18);
      pdf.text('Executive Summary', 20, currentY);
      currentY += 15;

      pdf.setFontSize(12);
      const summary = generateExecutiveSummary();
      const summaryLines = pdf.splitTextToSize(summary, pageWidth - 40);
      pdf.text(summaryLines, 20, currentY);
      currentY += summaryLines.length * 5 + 20;
    }

    // Add new page if needed
    if (currentY > pageHeight - 50) {
      pdf.addPage();
      currentY = 20;
    }

    // Measurements
    if (reportConfig.includeMeasurements) {
      pdf.setFontSize(18);
      pdf.text('Site Measurements', 20, currentY);
      currentY += 15;

      pdf.setFontSize(12);
      pdf.text(`Total Area: ${scanData?.area.toFixed(1)} sq ft`, 20, currentY);
      currentY += 8;
      pdf.text(`Perimeter: ${scanData?.perimeter.toFixed(1)} ft`, 20, currentY);
      currentY += 8;
      pdf.text(`Defects Detected: ${defects.length}`, 20, currentY);
      currentY += 20;
    }

    // Defect Details
    if (reportConfig.includeDefectDetails && defects.length > 0) {
      if (currentY > pageHeight - 100) {
        pdf.addPage();
        currentY = 20;
      }

      pdf.setFontSize(18);
      pdf.text('Defect Analysis', 20, currentY);
      currentY += 15;

      defects.forEach((defect, index) => {
        if (currentY > pageHeight - 30) {
          pdf.addPage();
          currentY = 20;
        }

        pdf.setFontSize(14);
        pdf.text(`${index + 1}. ${defect.type.toUpperCase()}`, 20, currentY);
        currentY += 8;

        pdf.setFontSize(10);
        pdf.text(`Severity: ${defect.severity}`, 25, currentY);
        currentY += 5;
        pdf.text(`Confidence: ${(defect.confidence * 100).toFixed(1)}%`, 25, currentY);
        currentY += 5;
        if (defect.measurements.area) {
          pdf.text(`Area: ${defect.measurements.area.toFixed(2)} sq ft`, 25, currentY);
          currentY += 5;
        }
        if (defect.measurements.length) {
          pdf.text(`Length: ${defect.measurements.length.toFixed(2)} ft`, 25, currentY);
          currentY += 5;
        }
        currentY += 5;
      });
    }

    // Recommendations
    if (reportConfig.includeRecommendations) {
      if (currentY > pageHeight - 80) {
        pdf.addPage();
        currentY = 20;
      }

      pdf.setFontSize(18);
      pdf.text('Recommendations', 20, currentY);
      currentY += 15;

      pdf.setFontSize(12);
      const recommendations = generateRecommendations();
      const recLines = pdf.splitTextToSize(recommendations, pageWidth - 40);
      pdf.text(recLines, 20, currentY);
    }

    // Save PDF
    pdf.save(`${reportConfig.projectName || 'Pavement-Report'}-${Date.now()}.pdf`);
  };

  const generateHTMLReport = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportConfig.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .section { margin-bottom: 30px; }
          .defect-table { width: 100%; border-collapse: collapse; }
          .defect-table th, .defect-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .defect-table th { background-color: #f2f2f2; }
          .severity-critical { color: #dc2626; font-weight: bold; }
          .severity-high { color: #ea580c; font-weight: bold; }
          .severity-medium { color: #ca8a04; font-weight: bold; }
          .severity-low { color: #16a34a; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${reportConfig.title}</h1>
          <p><strong>Project:</strong> ${reportConfig.projectName}</p>
          <p><strong>Client:</strong> ${reportConfig.clientName}</p>
          <p><strong>Inspector:</strong> ${reportConfig.inspectorName}</p>
          <p><strong>Location:</strong> ${reportConfig.location}</p>
          <p><strong>Date:</strong> ${scanData?.timestamp.toLocaleDateString()}</p>
        </div>

        ${reportConfig.includeExecutiveSummary ? `
          <div class="section">
            <h2>Executive Summary</h2>
            <p>${generateExecutiveSummary().replace(/\n/g, '<br>')}</p>
          </div>
        ` : ''}

        ${reportConfig.includeMeasurements ? `
          <div class="section">
            <h2>Site Measurements</h2>
            <ul>
              <li>Total Area: ${scanData?.area.toFixed(1)} sq ft</li>
              <li>Perimeter: ${scanData?.perimeter.toFixed(1)} ft</li>
              <li>Defects Detected: ${defects.length}</li>
            </ul>
          </div>
        ` : ''}

        ${reportConfig.includeDefectDetails && defects.length > 0 ? `
          <div class="section">
            <h2>Defect Analysis</h2>
            <table class="defect-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Measurements</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                ${defects.map(defect => `
                  <tr>
                    <td>${defect.type.replace('_', ' ').toUpperCase()}</td>
                    <td class="severity-${defect.severity}">${defect.severity.toUpperCase()}</td>
                    <td>
                      ${defect.measurements.area ? `Area: ${defect.measurements.area.toFixed(2)} sq ft<br>` : ''}
                      ${defect.measurements.length ? `Length: ${defect.measurements.length.toFixed(2)} ft<br>` : ''}
                      ${defect.measurements.width ? `Width: ${defect.measurements.width.toFixed(2)} ft` : ''}
                    </td>
                    <td>${(defect.confidence * 100).toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        ${reportConfig.includeRecommendations ? `
          <div class="section">
            <h2>Recommendations</h2>
            <pre>${generateRecommendations()}</pre>
          </div>
        ` : ''}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportConfig.projectName || 'Pavement-Report'}-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Configuration
          </CardTitle>
          <CardDescription>
            Configure the content and format of your pavement assessment report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="format">Format</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Report Title</Label>
                  <Input
                    id="title"
                    value={reportConfig.title}
                    onChange={(e) => handleConfigChange('title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={reportConfig.projectName}
                    onChange={(e) => handleConfigChange('projectName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="client-name">Client Name</Label>
                  <Input
                    id="client-name"
                    value={reportConfig.clientName}
                    onChange={(e) => handleConfigChange('clientName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="inspector-name">Inspector Name</Label>
                  <Input
                    id="inspector-name"
                    value={reportConfig.inspectorName}
                    onChange={(e) => handleConfigChange('inspectorName', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Textarea
                  id="location"
                  value={reportConfig.location}
                  onChange={(e) => handleConfigChange('location', e.target.value)}
                  placeholder="Enter the site address or description..."
                />
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="executive-summary"
                    checked={reportConfig.includeExecutiveSummary}
                    onCheckedChange={(checked) => handleConfigChange('includeExecutiveSummary', checked)}
                  />
                  <Label htmlFor="executive-summary">Executive Summary</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="defect-details"
                    checked={reportConfig.includeDefectDetails}
                    onCheckedChange={(checked) => handleConfigChange('includeDefectDetails', checked)}
                  />
                  <Label htmlFor="defect-details">Defect Details</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="3d-model"
                    checked={reportConfig.include3DModel}
                    onCheckedChange={(checked) => handleConfigChange('include3DModel', checked)}
                  />
                  <Label htmlFor="3d-model">3D Model Images</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recommendations"
                    checked={reportConfig.includeRecommendations}
                    onCheckedChange={(checked) => handleConfigChange('includeRecommendations', checked)}
                  />
                  <Label htmlFor="recommendations">Recommendations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="photos"
                    checked={reportConfig.includePhotos}
                    onCheckedChange={(checked) => handleConfigChange('includePhotos', checked)}
                  />
                  <Label htmlFor="photos">Photos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="measurements"
                    checked={reportConfig.includeMeasurements}
                    onCheckedChange={(checked) => handleConfigChange('includeMeasurements', checked)}
                  />
                  <Label htmlFor="measurements">Measurements</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="format" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select
                    value={reportConfig.reportType}
                    onValueChange={(value) => handleConfigChange('reportType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary Report</SelectItem>
                      <SelectItem value="detailed">Detailed Assessment</SelectItem>
                      <SelectItem value="technical">Technical Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="format">Output Format</Label>
                  <Select
                    value={reportConfig.format}
                    onValueChange={(value) => handleConfigChange('format', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="html">HTML Report</SelectItem>
                      <SelectItem value="word">Word Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Generation Progress */}
      {isGenerating && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 animate-pulse" />
                <span className="font-medium">Generating Report...</span>
              </div>
              <Progress value={generationProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {generationProgress < 100 ? 'Processing scan data and generating content...' : 'Report generation complete!'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>
            Create a comprehensive pavement assessment report based on your scan data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={generateReport}
              disabled={isGenerating || !scanData}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-1" />
              Generate Report
            </Button>
            <Button variant="outline" disabled={!scanData}>
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button variant="outline" disabled={!scanData}>
              <Mail className="h-4 w-4 mr-1" />
              Email Report
            </Button>
            <Button variant="outline" disabled={!scanData}>
              <Share className="h-4 w-4 mr-1" />
              Share Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Report Summary</CardTitle>
          <CardDescription>
            Overview of what will be included in your generated report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Building className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">Project Info</p>
                <p className="text-sm text-muted-foreground">
                  {reportConfig.projectName || 'Unnamed Project'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Ruler className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium">Measurements</p>
                <p className="text-sm text-muted-foreground">
                  {scanData?.area.toFixed(1) || '0'} sq ft area
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="font-medium">Defects</p>
                <p className="text-sm text-muted-foreground">
                  {defects.length} issues detected
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Report Sections:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {reportConfig.includeExecutiveSummary && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Executive Summary</span>
                </div>
              )}
              {reportConfig.includeDefectDetails && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Defect Analysis</span>
                </div>
              )}
              {reportConfig.include3DModel && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>3D Model Views</span>
                </div>
              )}
              {reportConfig.includeRecommendations && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Repair Recommendations</span>
                </div>
              )}
              {reportConfig.includePhotos && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Site Photography</span>
                </div>
              )}
              {reportConfig.includeMeasurements && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Measurements & Data</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportGeneration;