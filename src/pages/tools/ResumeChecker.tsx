import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Star,
  Download,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  supabase,
  resumeService,
  authService,
  type ResumeAnalysis,
  type AnalysisSection,
} from "@/lib/supabase";

interface AnalysisResult {
  overall_score: number;
  strengths: string[];
  improvements: string[];
  sections?: AnalysisSection[];
  detailed_feedback?: {
    format: string;
    content: string;
    keywords: string;
    experience: string;
    skills: string;
  };
}

export default function ResumeChecker() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(
    null
  );
  const [recentAnalyses, setRecentAnalyses] = useState<ResumeAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadRecentAnalyses(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        await loadRecentAnalyses(currentUser.id);
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentAnalyses = async (userId: string) => {
    try {
      const analyses = await resumeService.getUserAnalyses(userId, 5);
      setRecentAnalyses(analyses);
    } catch (error: any) {
      console.error("Load analyses error:", error);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to analyze your resume",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or Word document",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setUploading(true);

    try {
      const fileName = await resumeService.uploadResume(user.id, file);

      const analysisData = await resumeService.createAnalysis({
        user_id: user.id,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_url: fileName,
      });

      setCurrentAnalysisId(analysisData.id);

      toast({
        title: "File Uploaded",
        description: `${file.name} is ready for analysis`,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description:
          error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!currentAnalysisId) return;

    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await resumeService.analyzeResume(currentAnalysisId);

      if (result.success && result.data) {
        setAnalysisResult(result.data);

        toast({
          title: "Analysis Complete",
          description: "Your resume has been analyzed successfully",
        });

        if (user) {
          await loadRecentAnalyses(user.id);
        }
      } else {
        throw new Error(result.error || "Analysis failed");
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description:
          error.message || "Failed to analyze resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteAnalysis = async (analysisId: string, fileUrl: string) => {
    if (!confirm("Are you sure you want to delete this analysis?")) return;

    try {
      await resumeService.deleteAnalysis(analysisId, fileUrl);

      toast({
        title: "Deleted",
        description: "Analysis deleted successfully",
      });

      if (user) {
        await loadRecentAnalyses(user.id);
      }

      if (currentAnalysisId === analysisId) {
        setCurrentAnalysisId(null);
        setUploadedFile(null);
        setAnalysisResult(null);
      }
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete analysis",
        variant: "destructive",
      });
    }
  };

  const loadPreviousAnalysis = async (analysisId: string) => {
    try {
      const { analysis, sections } = await resumeService.getAnalysisById(
        analysisId
      );

      if (analysis.analysis_data) {
        setAnalysisResult({
          overall_score: analysis.overall_score || 0,
          strengths: analysis.analysis_data.strengths || [],
          improvements: analysis.analysis_data.improvements || [],
          sections: sections,
          detailed_feedback: analysis.analysis_data.detailed_feedback,
        });
        setCurrentAnalysisId(analysisId);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load analysis",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!user) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4'>
        <Card className='max-w-md w-full'>
          <CardContent className='p-8 text-center'>
            <AlertCircle className='w-16 h-16 text-primary mx-auto mb-4' />
            <h2 className='text-2xl font-heading font-bold mb-2'>
              Authentication Required
            </h2>
            <p className='text-muted-foreground mb-6'>
              Please sign in to use the Resume Checker
            </p>
            <Button onClick={() => navigate("/auth")} className='w-full'>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const templates = [
    { id: 1, name: "Modern Professional", industry: "Technology" },
    { id: 2, name: "Executive Classic", industry: "Business" },
    { id: 3, name: "Creative Designer", industry: "Design" },
    { id: 4, name: "Academic Research", industry: "Education" },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-background to-muted/20'>
      <div className='container-custom py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <Button
            variant='ghost'
            onClick={() => navigate("/tools")}
            className='flex items-center gap-2'>
            <ArrowLeft className='w-4 h-4' />
            Back to Tools
          </Button>

          <div className='text-center'>
            <h1 className='text-3xl font-heading font-bold'>
              Resume <span className='text-gradient'>Checker</span>
            </h1>
            <p className='text-muted-foreground'>
              AI-powered resume analysis and optimization
            </p>
          </div>

          <div className='w-24'></div>
        </div>

        <div className='max-w-6xl mx-auto'>
          <Tabs defaultValue='upload' className='w-full'>
            <TabsList className='grid w-full grid-cols-3 mb-8'>
              <TabsTrigger value='upload'>Upload & Analyze</TabsTrigger>
              <TabsTrigger value='results' disabled={!analysisResult}>
                Results
              </TabsTrigger>
              <TabsTrigger value='templates'>Templates</TabsTrigger>
            </TabsList>

            <TabsContent value='upload' className='space-y-6'>
              {/* Upload Section */}
              <Card className='hero-gradient text-white border-0'>
                <CardHeader className='text-center'>
                  <CardTitle className='text-2xl'>Upload Your Resume</CardTitle>
                  <p className='text-white/80'>
                    Get instant AI-powered feedback on your resume
                  </p>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-white/50 transition-colors'>
                    <input
                      type='file'
                      accept='.pdf,.doc,.docx'
                      onChange={handleFileUpload}
                      className='hidden'
                      id='resume-upload'
                      disabled={uploading || analyzing}
                    />
                    <label htmlFor='resume-upload' className='cursor-pointer'>
                      {uploading ? (
                        <Loader2 className='w-12 h-12 mx-auto mb-4 animate-spin' />
                      ) : (
                        <Upload className='w-12 h-12 mx-auto mb-4 text-white/80' />
                      )}
                      <p className='text-lg font-medium mb-2'>
                        {uploadedFile
                          ? uploadedFile.name
                          : "Click to upload your resume"}
                      </p>
                      <p className='text-white/70 text-sm'>
                        Supports PDF, DOC, and DOCX files up to 10MB
                      </p>
                    </label>
                  </div>

                  {uploadedFile && !analyzing && (
                    <div className='bg-white/10 rounded-lg p-4 flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <FileText className='w-6 h-6' />
                        <div>
                          <p className='font-medium'>{uploadedFile.name}</p>
                          <p className='text-sm text-white/70'>
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        variant='secondary'
                        className='bg-white text-primary hover:bg-white/90'>
                        Analyze Resume
                      </Button>
                    </div>
                  )}

                  {analyzing && (
                    <div className='bg-white/10 rounded-lg p-6'>
                      <div className='flex items-center gap-3 mb-4'>
                        <Loader2 className='w-6 h-6 animate-spin' />
                        <span className='font-medium'>
                          Analyzing your resume...
                        </span>
                      </div>
                      <Progress value={75} className='mb-2' />
                      <p className='text-sm text-white/70'>
                        This usually takes 30-60 seconds
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Features */}
              <div className='grid md:grid-cols-3 gap-6'>
                <Card>
                  <CardContent className='p-6 text-center'>
                    <CheckCircle className='w-12 h-12 text-green-500 mx-auto mb-4' />
                    <h3 className='font-heading font-semibold mb-2'>
                      ATS Optimization
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Ensure your resume passes Applicant Tracking Systems
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className='p-6 text-center'>
                    <Star className='w-12 h-12 text-yellow-500 mx-auto mb-4' />
                    <h3 className='font-heading font-semibold mb-2'>
                      Industry Standards
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Benchmarked against current industry best practices
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className='p-6 text-center'>
                    <AlertCircle className='w-12 h-12 text-blue-500 mx-auto mb-4' />
                    <h3 className='font-heading font-semibold mb-2'>
                      Actionable Feedback
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Get specific suggestions to improve your resume
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value='results' className='space-y-6'>
              {analysisResult && (
                <>
                  {/* Overall Score */}
                  <Card className='hero-gradient text-white border-0'>
                    <CardContent className='p-8 text-center'>
                      <h2 className='text-3xl font-heading font-bold mb-4'>
                        Resume Score
                      </h2>
                      <div className='text-6xl font-bold mb-4'>
                        {analysisResult.overall_score}/100
                      </div>
                      <p className='text-white/80 text-lg'>
                        {analysisResult.overall_score >= 80
                          ? "Excellent!"
                          : analysisResult.overall_score >= 60
                          ? "Good"
                          : "Needs Improvement"}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Detailed Analysis */}
                  <div className='grid md:grid-cols-2 gap-6'>
                    {/* Strengths */}
                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-green-600'>
                          <CheckCircle className='w-5 h-5' />
                          Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-3'>
                        {analysisResult.strengths?.map((strength, index) => (
                          <div key={index} className='flex items-start gap-3'>
                            <div className='w-2 h-2 rounded-full bg-green-500 mt-2'></div>
                            <p className='text-sm'>{strength}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Improvements */}
                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-orange-600'>
                          <AlertCircle className='w-5 h-5' />
                          Areas for Improvement
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-3'>
                        {analysisResult.improvements?.map(
                          (improvement, index) => (
                            <div key={index} className='flex items-start gap-3'>
                              <div className='w-2 h-2 rounded-full bg-orange-500 mt-2'></div>
                              <p className='text-sm'>{improvement}</p>
                            </div>
                          )
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Section Breakdown */}
                  {analysisResult.sections &&
                    analysisResult.sections.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Section Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                          {analysisResult.sections.map((section, index) => (
                            <div key={index} className='space-y-2'>
                              <div className='flex items-center justify-between'>
                                <h4 className='font-medium'>
                                  {section.section_name}
                                </h4>
                                <Badge
                                  variant={
                                    section.score >= 80
                                      ? "default"
                                      : section.score >= 60
                                      ? "secondary"
                                      : "destructive"
                                  }>
                                  {section.score}/100
                                </Badge>
                              </div>
                              <Progress value={section.score} className='h-2' />
                              <p className='text-sm text-muted-foreground'>
                                {section.feedback}
                              </p>
                              {section.suggestions &&
                                Array.isArray(section.suggestions) &&
                                section.suggestions.length > 0 && (
                                  <div className='pl-4 border-l-2 border-muted mt-2'>
                                    {section.suggestions.map(
                                      (suggestion, idx) => (
                                        <p
                                          key={idx}
                                          className='text-xs text-muted-foreground mb-1'>
                                          • {suggestion}
                                        </p>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                  {/* Detailed Feedback */}
                  {analysisResult.detailed_feedback && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Detailed Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent className='grid md:grid-cols-2 gap-4'>
                        <div className='p-4 bg-blue-50 dark:bg-blue-950 rounded-lg'>
                          <h4 className='font-semibold mb-2'>Format</h4>
                          <p className='text-sm'>
                            {analysisResult.detailed_feedback.format}
                          </p>
                        </div>
                        <div className='p-4 bg-purple-50 dark:bg-purple-950 rounded-lg'>
                          <h4 className='font-semibold mb-2'>Content</h4>
                          <p className='text-sm'>
                            {analysisResult.detailed_feedback.content}
                          </p>
                        </div>
                        <div className='p-4 bg-green-50 dark:bg-green-950 rounded-lg'>
                          <h4 className='font-semibold mb-2'>Keywords</h4>
                          <p className='text-sm'>
                            {analysisResult.detailed_feedback.keywords}
                          </p>
                        </div>
                        <div className='p-4 bg-orange-50 dark:bg-orange-950 rounded-lg'>
                          <h4 className='font-semibold mb-2'>Experience</h4>
                          <p className='text-sm'>
                            {analysisResult.detailed_feedback.experience}
                          </p>
                        </div>
                        <div className='p-4 bg-pink-50 dark:bg-pink-950 rounded-lg md:col-span-2'>
                          <h4 className='font-semibold mb-2'>Skills</h4>
                          <p className='text-sm'>
                            {analysisResult.detailed_feedback.skills}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value='templates' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Professional Resume Templates</CardTitle>
                  <p className='text-muted-foreground'>
                    Download industry-standard templates to create your perfect
                    resume
                  </p>
                </CardHeader>
                <CardContent>
                  <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
                    {templates.map((template) => (
                      <Card
                        key={template.id}
                        className='group hover:shadow-lg transition-all'>
                        <CardContent className='p-4'>
                          <div className='aspect-[3/4] bg-muted rounded-lg mb-4 flex items-center justify-center'>
                            <FileText className='w-12 h-12 text-muted-foreground' />
                          </div>
                          <h4 className='font-medium mb-1'>{template.name}</h4>
                          <p className='text-sm text-muted-foreground mb-4'>
                            {template.industry}
                          </p>
                          <Button
                            variant='outline'
                            size='sm'
                            className='w-full'>
                            <Download className='w-4 h-4 mr-2' />
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

          {/* Recent Analyses */}
          {recentAnalyses.length > 0 && (
            <Card className='mt-8'>
              <CardHeader>
                <CardTitle>Recent Analyses</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {recentAnalyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className='flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors'>
                    <div className='flex items-center gap-3 flex-1 min-w-0'>
                      <FileText className='w-5 h-5 text-muted-foreground flex-shrink-0' />
                      <div className='min-w-0 flex-1'>
                        <p className='font-medium text-sm truncate'>
                          {analysis.file_name}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {new Date(analysis.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {analysis.status === "completed" &&
                        analysis.overall_score && (
                          <>
                            <Button
                              size='sm'
                              variant='secondary'
                              onClick={() => loadPreviousAnalysis(analysis.id)}>
                              {analysis.overall_score}/100
                            </Button>
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() =>
                                handleDeleteAnalysis(
                                  analysis.id,
                                  analysis.file_url
                                )
                              }>
                              <Trash2 className='w-4 h-4' />
                            </Button>
                          </>
                        )}
                      {analysis.status === "processing" && (
                        <Badge>Processing...</Badge>
                      )}
                      {analysis.status === "failed" && (
                        <Badge variant='destructive'>Failed</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
