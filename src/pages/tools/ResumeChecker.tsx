import { useState } from "react";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Star, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface AnalysisResult {
  score: number;
  strengths: string[];
  improvements: string[];
  sections: {
    name: string;
    score: number;
    feedback: string;
  }[];
}

export default function ResumeChecker() {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedTypes.includes(file.type)) {
        setUploadedFile(file);
        toast({
          title: "File Uploaded",
          description: `${file.name} is ready for analysis`,
        });
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or Word document",
          variant: "destructive",
        });
      }
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    
    setAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockResult: AnalysisResult = {
        score: 78,
        strengths: [
          "Strong professional summary",
          "Quantified achievements",
          "Relevant technical skills",
          "Clean formatting and layout"
        ],
        improvements: [
          "Add more industry-specific keywords",
          "Include volunteer or project experience",
          "Optimize section order for impact",
          "Add professional certifications"
        ],
        sections: [
          { name: "Format & Design", score: 85, feedback: "Clean and professional layout with good use of whitespace" },
          { name: "Content Quality", score: 75, feedback: "Good content but could use more quantified achievements" },
          { name: "Keywords", score: 70, feedback: "Missing some industry-specific keywords for ATS optimization" },
          { name: "Experience", score: 80, feedback: "Well-structured experience section with clear progression" },
          { name: "Skills", score: 85, feedback: "Comprehensive skills list relevant to target role" }
        ]
      };
      
      setAnalysisResult(mockResult);
      setAnalyzing(false);
      
      toast({
        title: "Analysis Complete",
        description: "Your resume has been analyzed successfully",
      });
    }, 3000);
  };

  const templates = [
    { id: 1, name: "Modern Professional", industry: "Technology", preview: "/api/placeholder/300/400" },
    { id: 2, name: "Executive Classic", industry: "Business", preview: "/api/placeholder/300/400" },
    { id: 3, name: "Creative Designer", industry: "Design", preview: "/api/placeholder/300/400" },
    { id: 4, name: "Academic Research", industry: "Education", preview: "/api/placeholder/300/400" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/tools')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-heading font-bold">
              Resume <span className="text-gradient">Checker</span>
            </h1>
            <p className="text-muted-foreground">AI-powered resume analysis and optimization</p>
          </div>
          
          <div className="w-24"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
              <TabsTrigger value="results" disabled={!analysisResult}>Results</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              {/* Upload Section */}
              <Card className="hero-gradient text-white border-0">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Upload Your Resume</CardTitle>
                  <p className="text-white/80">Get instant AI-powered feedback on your resume</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-white/50 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-white/80" />
                      <p className="text-lg font-medium mb-2">
                        {uploadedFile ? uploadedFile.name : "Click to upload your resume"}
                      </p>
                      <p className="text-white/70 text-sm">
                        Supports PDF, DOC, and DOCX files up to 10MB
                      </p>
                    </label>
                  </div>

                  {uploadedFile && (
                    <div className="bg-white/10 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6" />
                        <div>
                          <p className="font-medium">{uploadedFile.name}</p>
                          <p className="text-sm text-white/70">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        variant="secondary"
                        className="bg-white text-primary hover:bg-white/90"
                      >
                        {analyzing ? "Analyzing..." : "Analyze Resume"}
                      </Button>
                    </div>
                  )}

                  {analyzing && (
                    <div className="bg-white/10 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-medium">Analyzing your resume...</span>
                      </div>
                      <Progress value={75} className="mb-2" />
                      <p className="text-sm text-white/70">This usually takes 30-60 seconds</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-heading font-semibold mb-2">ATS Optimization</h3>
                    <p className="text-sm text-muted-foreground">
                      Ensure your resume passes Applicant Tracking Systems
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="font-heading font-semibold mb-2">Industry Standards</h3>
                    <p className="text-sm text-muted-foreground">
                      Benchmarked against current industry best practices
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="font-heading font-semibold mb-2">Actionable Feedback</h3>
                    <p className="text-sm text-muted-foreground">
                      Get specific suggestions to improve your resume
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              {analysisResult && (
                <>
                  {/* Overall Score */}
                  <Card className="hero-gradient text-white border-0">
                    <CardContent className="p-8 text-center">
                      <h2 className="text-3xl font-heading font-bold mb-4">Resume Score</h2>
                      <div className="text-6xl font-bold mb-4">{analysisResult.score}/100</div>
                      <p className="text-white/80 text-lg">
                        {analysisResult.score >= 80 ? "Excellent!" : 
                         analysisResult.score >= 60 ? "Good" : "Needs Improvement"}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Detailed Analysis */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {analysisResult.strengths.map((strength, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                            <p className="text-sm">{strength}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Improvements */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-600">
                          <AlertCircle className="w-5 h-5" />
                          Areas for Improvement
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {analysisResult.improvements.map((improvement, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                            <p className="text-sm">{improvement}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Section Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Section Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {analysisResult.sections.map((section, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{section.name}</h4>
                            <Badge variant={section.score >= 80 ? "default" : section.score >= 60 ? "secondary" : "destructive"}>
                              {section.score}/100
                            </Badge>
                          </div>
                          <Progress value={section.score} className="h-2" />
                          <p className="text-sm text-muted-foreground">{section.feedback}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Resume Templates</CardTitle>
                  <p className="text-muted-foreground">
                    Download industry-standard templates to create your perfect resume
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {templates.map((template) => (
                      <Card key={template.id} className="group hover:shadow-lg transition-all">
                        <CardContent className="p-4">
                          <div className="aspect-[3/4] bg-muted rounded-lg mb-4 flex items-center justify-center">
                            <FileText className="w-12 h-12 text-muted-foreground" />
                          </div>
                          <h4 className="font-medium mb-1">{template.name}</h4>
                          <p className="text-sm text-muted-foreground mb-4">{template.industry}</p>
                          <Button variant="outline" size="sm" className="w-full">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </CardContent>
                      </Card>
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
}