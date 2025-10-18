import { useState, useEffect } from "react";
import {
  ArrowLeft,
  TrendingUp,
  MapPin,
  Target,
  GraduationCap,
  CheckCircle,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface PathStep {
  title: string;
  timeframe: string;
  requirements: string[];
  skills: string[];
  salary: string;
  completed: boolean;
}

interface CareerPathResult {
  id: string;
  currentRole: string;
  targetRole: string;
  timeline: string;
  steps: PathStep[];
  recommendations: string[];
}

export default function CareerPath() {
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState("");
  const [experience, setExperience] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("Remote");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<CareerPathResult | null>(null);
  const [previousAnalyses, setPreviousAnalyses] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAllIndustries, setShowAllIndustries] = useState(false);

  const skillOptions = [
    "JavaScript",
    "Python",
    "React",
    "Node.js",
    "Data Analysis",
    "Project Management",
    "Leadership",
    "Communication",
    "Marketing",
    "Sales",
    "Design",
    "Machine Learning",
  ];

  const interestOptions = [
    "Technology",
    "Management",
    "Data Science",
    "Product Development",
    "Marketing",
    "Sales",
    "Consulting",
    "Entrepreneurship",
    "Education",
    "Research",
  ];

  const industryOptions = [
    "Artificial Intelligence & Machine Learning",
    "Cybersecurity",
    "Cloud Computing & DevOps",
    "Data Science & Analytics",
    "Blockchain & Web3",
    "E-commerce & Digital Marketing",
    "Renewable Energy & Sustainability",
    "Biotechnology & Life Sciences",
    "Fintech (Financial Technology)",
    "EdTech (Educational Technology)",
    "HealthTech & Telemedicine",
    "Gaming & Esports",
    "Content Creation & Social Media",
    "SaaS & Enterprise Software",
    "Remote Work Technology",
    "IoT (Internet of Things)",
    "Robotics & Automation",
    "Electric Vehicles & Mobility",
    "Technology (General)",
    "Finance & Banking",
    "Healthcare",
    "Education",
    "Retail & Consumer Goods",
  ];

  const visibleIndustries = showAllIndustries
    ? industryOptions
    : industryOptions.slice(0, 8);

  useEffect(() => {
    loadPreviousAnalyses();
  }, []);

  const loadPreviousAnalyses = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("career_path_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setPreviousAnalyses(data || []);
    } catch (error) {
      console.error("Error loading previous analyses:", error);
    }
  };

  const handleSkillChange = (skill: string, checked: boolean) => {
    if (checked) {
      setSkills([...skills, skill]);
    } else {
      setSkills(skills.filter((s) => s !== skill));
    }
  };

  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked) {
      setInterests([...interests, interest]);
    } else {
      setInterests(interests.filter((i) => i !== interest));
    }
  };

  const handleAnalyze = async () => {
    if (!currentRole || !targetRole) {
      toast({
        title: "Missing Information",
        description: "Please fill in your current role and target role",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use this feature",
          variant: "destructive",
        });
        setAnalyzing(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-career-path`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentRole,
            yearsExperience: experience,
            targetRole,
            industry,
            location,
            currentSkills: skills,
            careerInterests: interests,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze career path");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Analysis failed");
      }

      const analysisData = result.data;

      setResults({
        id: analysisData.id,
        currentRole: analysisData.role,
        targetRole: analysisData.target_role,
        timeline: analysisData.estimated_timeline,
        steps: analysisData.career_steps,
        recommendations: analysisData.recommendations,
      });

      await loadPreviousAnalyses();

      toast({
        title: "Analysis Complete!",
        description: result.usedFallback
          ? "Your career path is ready (using backup system)"
          : "Your personalized AI-powered career path is ready",
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description:
          error.message || "Failed to analyze career path. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleStepCompletion = async (stepIndex: number) => {
    if (!results) return;

    const updatedSteps = [...results.steps];
    updatedSteps[stepIndex].completed = !updatedSteps[stepIndex].completed;

    try {
      const { error } = await supabase
        .from("career_path_analyses")
        .update({
          career_steps: updatedSteps,
          updated_at: new Date().toISOString(),
        })
        .eq("id", results.id);

      if (error) throw error;

      setResults({ ...results, steps: updatedSteps });

      toast({
        title: updatedSteps[stepIndex].completed
          ? "Step Completed!"
          : "Step Uncompleted",
        description: `"${updatedSteps[stepIndex].title}" updated`,
      });
    } catch (error) {
      console.error("Error updating step:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update step completion status",
        variant: "destructive",
      });
    }
  };

  const loadPreviousAnalysis = (analysis: any) => {
    setResults({
      id: analysis.id,
      currentRole: analysis.role,
      targetRole: analysis.target_role,
      timeline: analysis.estimated_timeline,
      steps: analysis.career_steps,
      recommendations: analysis.recommendations,
    });
    setShowHistory(false);
  };

  const completedSteps = results
    ? results.steps.filter((s) => s.completed).length
    : 0;
  const progressPercentage = results
    ? (completedSteps / results.steps.length) * 100
    : 0;

  return (
    <div className='min-h-screen bg-gradient-to-br from-background to-muted/20'>
      <div className='container-custom py-8'>
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
              Career <span className='text-gradient'>Path Analyzer</span>
            </h1>
            <p className='text-muted-foreground'>AI-powered career roadmap</p>
          </div>

          {previousAnalyses.length > 0 && (
            <Button
              variant='outline'
              onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? "Hide" : "View"} History
            </Button>
          )}
        </div>

        {showHistory && previousAnalyses.length > 0 && (
          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Previous Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {previousAnalyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className='flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer'
                    onClick={() => loadPreviousAnalysis(analysis)}>
                    <div>
                      <p className='font-medium'>
                        {analysis.role} → {analysis.target_role}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge>{analysis.estimated_timeline}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className='max-w-6xl mx-auto'>
          {!results ? (
            <div className='grid lg:grid-cols-2 gap-8'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Target className='w-5 h-5' />
                    Career Information
                  </CardTitle>
                  <p className='text-muted-foreground'>
                    Tell us about your current situation and career goals
                  </p>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='current-role'>Current Role *</Label>
                      <Input
                        id='current-role'
                        value={currentRole}
                        onChange={(e) => setCurrentRole(e.target.value)}
                        placeholder='e.g., Junior Developer'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='experience'>Years of Experience</Label>
                      <Select value={experience} onValueChange={setExperience}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select experience' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='0-1'>0-1 years</SelectItem>
                          <SelectItem value='2-3'>2-3 years</SelectItem>
                          <SelectItem value='4-5'>4-5 years</SelectItem>
                          <SelectItem value='6-10'>6-10 years</SelectItem>
                          <SelectItem value='10+'>10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='target-role'>Target Role *</Label>
                    <Input
                      id='target-role'
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder='e.g., Senior Software Engineer'
                    />
                  </div>

                  <div className='grid md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='industry'>Industry</Label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select industry' />
                        </SelectTrigger>
                        <SelectContent className='max-h-[300px]'>
                          {visibleIndustries.map((ind) => (
                            <SelectItem key={ind} value={ind}>
                              {ind}
                            </SelectItem>
                          ))}
                          {!showAllIndustries && industryOptions.length > 8 && (
                            <div
                              className='px-2 py-1.5 text-sm text-primary font-medium cursor-pointer hover:bg-accent'
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowAllIndustries(true);
                              }}>
                              + Show {industryOptions.length - 8} more
                              industries
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='location'>Preferred Location</Label>
                      <Input
                        id='location'
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder='Remote (recommended)'
                      />
                      <p className='text-xs text-amber-600 flex items-start gap-1'>
                        <span className='mt-0.5'>⚠️</span>
                        <span>
                          Location not verified. AI provides approximate salary
                          estimates based on general market data.
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <Label>Current Skills</Label>
                    <div className='grid grid-cols-2 gap-2'>
                      {skillOptions.map((skill) => (
                        <div
                          key={skill}
                          className='flex items-center space-x-2'>
                          <Checkbox
                            id={`skill-${skill}`}
                            checked={skills.includes(skill)}
                            onCheckedChange={(checked) =>
                              handleSkillChange(skill, checked as boolean)
                            }
                          />
                          <Label htmlFor={`skill-${skill}`} className='text-sm'>
                            {skill}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <Label>Career Interests</Label>
                    <div className='grid grid-cols-2 gap-2'>
                      {interestOptions.map((interest) => (
                        <div
                          key={interest}
                          className='flex items-center space-x-2'>
                          <Checkbox
                            id={`interest-${interest}`}
                            checked={interests.includes(interest)}
                            onCheckedChange={(checked) =>
                              handleInterestChange(interest, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={`interest-${interest}`}
                            className='text-sm'>
                            {interest}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleAnalyze}
                    className='w-full hero-gradient'
                    disabled={analyzing}>
                    {analyzing
                      ? "Analyzing Career Path..."
                      : "Analyze Career Path"}
                  </Button>
                </CardContent>
              </Card>

              <div className='space-y-6'>
                <Card className='hero-gradient text-white border-0'>
                  <CardContent className='p-8'>
                    <TrendingUp className='w-12 h-12 mb-4' />
                    <h3 className='text-xl font-semibold mb-4'>
                      AI-Powered Career Analysis
                    </h3>
                    <p className='text-white/80 mb-6'>
                      Our advanced AI analyzes thousands of career trajectories
                      to provide you with a personalized roadmap to your dream
                      role.
                    </p>
                    <div className='space-y-3'>
                      <div className='flex items-center gap-3'>
                        <div className='w-2 h-2 rounded-full bg-white/60'></div>
                        <span className='text-sm'>
                          Personalized step-by-step plan
                        </span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <div className='w-2 h-2 rounded-full bg-white/60'></div>
                        <span className='text-sm'>
                          Skills and timeline recommendations
                        </span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <div className='w-2 h-2 rounded-full bg-white/60'></div>
                        <span className='text-sm'>
                          Salary progression insights
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Why Use Career Path Analyzer?</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='flex items-start gap-3'>
                      <MapPin className='w-5 h-5 text-blue-500 mt-1' />
                      <div>
                        <h4 className='font-semibold'>Clear Direction</h4>
                        <p className='text-sm text-muted-foreground'>
                          Get a clear roadmap instead of guessing your next
                          steps
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3'>
                      <GraduationCap className='w-5 h-5 text-green-500 mt-1' />
                      <div>
                        <h4 className='font-semibold'>Skill Optimization</h4>
                        <p className='text-sm text-muted-foreground'>
                          Focus on the right skills that matter for your target
                          role
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3'>
                      <Target className='w-5 h-5 text-purple-500 mt-1' />
                      <div>
                        <h4 className='font-semibold'>Market Insights</h4>
                        <p className='text-sm text-muted-foreground'>
                          Understand market demand and salary expectations
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className='space-y-6'>
              <Card className='hero-gradient text-white border-0'>
                <CardContent className='p-8'>
                  <div className='text-center mb-6'>
                    <h2 className='text-2xl font-heading font-bold mb-2'>
                      Your Career Path: {results.currentRole} →{" "}
                      {results.targetRole}
                    </h2>
                    <p className='text-white/80 text-lg mb-4'>
                      Estimated Timeline: {results.timeline}
                    </p>
                    <Badge variant='secondary' className='text-lg px-4 py-2'>
                      {results.steps.length} Key Steps
                    </Badge>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span>Overall Progress</span>
                      <span>
                        {completedSteps} of {results.steps.length} completed
                      </span>
                    </div>
                    <Progress
                      value={progressPercentage}
                      className='h-3 bg-white/20'
                    />
                  </div>
                </CardContent>
              </Card>

              <div className='space-y-6'>
                {results.steps.map((step, index) => (
                  <Card
                    key={index}
                    className={`overflow-hidden transition-all ${
                      step.completed ? "border-green-500 bg-green-50/50" : ""
                    }`}>
                    <CardHeader>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <button
                            onClick={() => toggleStepCompletion(index)}
                            className='hover:scale-110 transition-transform'>
                            {step.completed ? (
                              <CheckCircle className='w-8 h-8 text-green-500' />
                            ) : (
                              <Circle className='w-8 h-8 text-muted-foreground' />
                            )}
                          </button>
                          <div>
                            <CardTitle
                              className={
                                step.completed
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }>
                              {step.title}
                            </CardTitle>
                            <p className='text-muted-foreground'>
                              {step.timeframe}
                            </p>
                          </div>
                        </div>
                        <Badge variant='outline' className='text-sm'>
                          {step.salary}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='grid md:grid-cols-2 gap-4'>
                        <div>
                          <h4 className='font-semibold mb-2'>Requirements</h4>
                          <ul className='space-y-1'>
                            {step.requirements.map((req, reqIndex) => (
                              <li
                                key={reqIndex}
                                className='flex items-start gap-2 text-sm'>
                                <div className='w-1.5 h-1.5 rounded-full bg-blue-500 mt-2'></div>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className='font-semibold mb-2'>Key Skills</h4>
                          <div className='flex flex-wrap gap-2'>
                            {step.skills.map((skill, skillIndex) => (
                              <Badge
                                key={skillIndex}
                                variant='secondary'
                                className='text-xs'>
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Personalized Recommendations</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {results.recommendations.map((recommendation, index) => (
                    <div key={index} className='flex items-start gap-3'>
                      <div className='w-2 h-2 rounded-full bg-green-500 mt-2'></div>
                      <p className='text-sm'>{recommendation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className='flex justify-center gap-4'>
                <Button
                  onClick={() => {
                    setResults(null);
                    setCurrentRole("");
                    setTargetRole("");
                    setSkills([]);
                    setInterests([]);
                    setExperience("");
                    setIndustry("");
                    setLocation("Remote");
                    setShowAllIndustries(false);
                  }}>
                  Analyze Another Path
                </Button>
                <Button variant='outline' onClick={() => navigate("/tools")}>
                  Back to Tools
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
