import { useState } from "react";
import { ArrowLeft, TrendingUp, MapPin, Target, Users, Briefcase, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface PathStep {
  title: string;
  timeframe: string;
  requirements: string[];
  skills: string[];
  salary: string;
  completed?: boolean;
}

interface CareerPathResult {
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
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<CareerPathResult | null>(null);

  const skillOptions = [
    "JavaScript", "Python", "React", "Node.js", "Data Analysis", "Project Management",
    "Leadership", "Communication", "Marketing", "Sales", "Design", "Machine Learning"
  ];

  const interestOptions = [
    "Technology", "Management", "Data Science", "Product Development", "Marketing",
    "Sales", "Consulting", "Entrepreneurship", "Education", "Research"
  ];

  const handleSkillChange = (skill: string, checked: boolean) => {
    if (checked) {
      setSkills([...skills, skill]);
    } else {
      setSkills(skills.filter(s => s !== skill));
    }
  };

  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked) {
      setInterests([...interests, interest]);
    } else {
      setInterests(interests.filter(i => i !== interest));
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

    // Simulate AI analysis
    setTimeout(() => {
      const mockResult: CareerPathResult = {
        currentRole: currentRole,
        targetRole: targetRole,
        timeline: "18-24 months",
        steps: [
          {
            title: "Skill Development Phase",
            timeframe: "0-6 months",
            requirements: [
              "Complete advanced JavaScript course",
              "Build 2-3 React projects",
              "Learn TypeScript"
            ],
            skills: ["Advanced JavaScript", "React", "TypeScript", "Git"],
            salary: "$65,000 - $75,000"
          },
          {
            title: "Mid-Level Transition",
            timeframe: "6-12 months",
            requirements: [
              "Gain leadership experience",
              "Mentor junior developers",
              "Lead a project team"
            ],
            skills: ["Team Leadership", "Project Management", "Code Review"],
            salary: "$75,000 - $90,000"
          },
          {
            title: "Senior Role Achievement",
            timeframe: "12-18 months",
            requirements: [
              "Complete senior-level certification",
              "Demonstrate architecture skills",
              "Build cross-functional relationships"
            ],
            skills: ["System Architecture", "Strategic Planning", "Cross-team Collaboration"],
            salary: "$90,000 - $120,000"
          }
        ],
        recommendations: [
          "Focus on developing leadership skills alongside technical expertise",
          "Seek mentorship from current senior developers",
          "Contribute to open-source projects to build portfolio",
          "Network with professionals in your target role",
          "Consider pursuing relevant certifications"
        ]
      };

      setResults(mockResult);
      setAnalyzing(false);
      
      toast({
        title: "Analysis Complete",
        description: "Your personalized career path is ready",
      });
    }, 3000);
  };

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
              Career <span className="text-gradient">Path Analyzer</span>
            </h1>
            <p className="text-muted-foreground">Discover your optimal career trajectory</p>
          </div>
          
          <div className="w-24"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          {!results ? (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Career Information
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Tell us about your current situation and career goals
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-role">Current Role *</Label>
                      <Input
                        id="current-role"
                        value={currentRole}
                        onChange={(e) => setCurrentRole(e.target.value)}
                        placeholder="e.g., Junior Developer"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Select value={experience} onValueChange={setExperience}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-1">0-1 years</SelectItem>
                          <SelectItem value="2-3">2-3 years</SelectItem>
                          <SelectItem value="4-5">4-5 years</SelectItem>
                          <SelectItem value="6-10">6-10 years</SelectItem>
                          <SelectItem value="10+">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target-role">Target Role *</Label>
                    <Input
                      id="target-role"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Preferred Location</Label>
                      <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Remote">Remote</SelectItem>
                          <SelectItem value="New York">New York</SelectItem>
                          <SelectItem value="San Francisco">San Francisco</SelectItem>
                          <SelectItem value="Chicago">Chicago</SelectItem>
                          <SelectItem value="Austin">Austin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Current Skills</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {skillOptions.map((skill) => (
                        <div key={skill} className="flex items-center space-x-2">
                          <Checkbox
                            id={`skill-${skill}`}
                            checked={skills.includes(skill)}
                            onCheckedChange={(checked) => 
                              handleSkillChange(skill, checked as boolean)
                            }
                          />
                          <Label htmlFor={`skill-${skill}`} className="text-sm">
                            {skill}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Career Interests</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {interestOptions.map((interest) => (
                        <div key={interest} className="flex items-center space-x-2">
                          <Checkbox
                            id={`interest-${interest}`}
                            checked={interests.includes(interest)}
                            onCheckedChange={(checked) => 
                              handleInterestChange(interest, checked as boolean)
                            }
                          />
                          <Label htmlFor={`interest-${interest}`} className="text-sm">
                            {interest}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={handleAnalyze} 
                    className="w-full hero-gradient"
                    disabled={analyzing}
                  >
                    {analyzing ? "Analyzing Career Path..." : "Analyze Career Path"}
                  </Button>
                </CardContent>
              </Card>

              {/* Info Section */}
              <div className="space-y-6">
                <Card className="hero-gradient text-white border-0">
                  <CardContent className="p-8">
                    <TrendingUp className="w-12 h-12 mb-4" />
                    <h3 className="text-xl font-semibold mb-4">
                      AI-Powered Career Analysis
                    </h3>
                    <p className="text-white/80 mb-6">
                      Our advanced AI analyzes thousands of career trajectories to provide 
                      you with a personalized roadmap to your dream role.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-white/60"></div>
                        <span className="text-sm">Personalized step-by-step plan</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-white/60"></div>
                        <span className="text-sm">Skills and timeline recommendations</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-white/60"></div>
                        <span className="text-sm">Salary progression insights</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Why Use Career Path Analyzer?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">Clear Direction</h4>
                        <p className="text-sm text-muted-foreground">
                          Get a clear roadmap instead of guessing your next steps
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <GraduationCap className="w-5 h-5 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">Skill Optimization</h4>
                        <p className="text-sm text-muted-foreground">
                          Focus on the right skills that matter for your target role
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-purple-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">Market Insights</h4>
                        <p className="text-sm text-muted-foreground">
                          Understand market demand and salary expectations
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Results Header */}
              <Card className="hero-gradient text-white border-0">
                <CardContent className="p-8 text-center">
                  <h2 className="text-2xl font-heading font-bold mb-4">
                    Your Career Path: {results.currentRole} → {results.targetRole}
                  </h2>
                  <p className="text-white/80 text-lg mb-2">
                    Estimated Timeline: {results.timeline}
                  </p>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {results.steps.length} Key Steps
                  </Badge>
                </CardContent>
              </Card>

              {/* Career Steps */}
              <div className="space-y-6">
                {results.steps.map((step, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <CardTitle>{step.title}</CardTitle>
                            <p className="text-muted-foreground">{step.timeframe}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-sm">
                          {step.salary}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Requirements</h4>
                          <ul className="space-y-1">
                            {step.requirements.map((req, reqIndex) => (
                              <li key={reqIndex} className="flex items-start gap-2 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Key Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {step.skills.map((skill, skillIndex) => (
                              <Badge key={skillIndex} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <Progress value={step.completed ? 100 : 0} className="h-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Personalized Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {results.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex justify-center gap-4">
                <Button onClick={() => {
                  setResults(null);
                  setCurrentRole("");
                  setTargetRole("");
                }}>
                  Analyze Another Path
                </Button>
                <Button variant="outline" onClick={() => navigate('/tools')}>
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