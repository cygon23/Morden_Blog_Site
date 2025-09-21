import { useState } from "react";
import { ArrowLeft, DollarSign, TrendingUp, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export default function SalaryCalculator() {
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState([3]);
  const [education, setEducation] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [skills, setSkills] = useState("");
  const [results, setResults] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);

  const handleCalculate = async () => {
    if (!jobTitle || !location || !industry) {
      toast({
        title: "Missing Information",
        description: "Please fill in job title, location, and industry",
        variant: "destructive",
      });
      return;
    }

    setCalculating(true);

    // Simulate API call
    setTimeout(() => {
      const baseRanges = {
        "Software Engineer": { min: 70000, max: 150000 },
        "Product Manager": { min: 80000, max: 180000 },
        "Data Scientist": { min: 75000, max: 160000 },
        "UX Designer": { min: 60000, max: 130000 },
        "Marketing Manager": { min: 55000, max: 120000 },
        "Sales Manager": { min: 50000, max: 140000 },
      };

      const base = baseRanges[jobTitle as keyof typeof baseRanges] || { min: 45000, max: 100000 };
      const experienceMultiplier = 1 + (experience[0] * 0.05);
      const locationMultipliers: any = {
        "New York": 1.3,
        "San Francisco": 1.4,
        "Los Angeles": 1.2,
        "Chicago": 1.1,
        "Austin": 1.1,
        "Remote": 1.0,
      };

      const multiplier = (locationMultipliers[location] || 1.0) * experienceMultiplier;
      
      const mockResults = {
        median: Math.round((base.min + base.max) / 2 * multiplier),
        range: {
          min: Math.round(base.min * multiplier),
          max: Math.round(base.max * multiplier)
        },
        percentiles: {
          p25: Math.round(base.min * multiplier * 1.1),
          p50: Math.round((base.min + base.max) / 2 * multiplier),
          p75: Math.round(base.max * multiplier * 0.9)
        },
        factors: [
          { name: "Experience Level", impact: "+15%", value: `${experience[0]} years` },
          { name: "Location", impact: location === "San Francisco" ? "+40%" : "+10%", value: location },
          { name: "Industry", impact: "+8%", value: industry },
          { name: "Education", impact: education === "Masters" ? "+12%" : "+5%", value: education || "Bachelor's" }
        ],
        trends: {
          growth: "+5.2%",
          demand: "High",
          outlook: "Growing"
        }
      };

      setResults(mockResults);
      setCalculating(false);
      
      toast({
        title: "Calculation Complete",
        description: "Your salary estimate is ready",
      });
    }, 2000);
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
              Salary <span className="text-gradient">Calculator</span>
            </h1>
            <p className="text-muted-foreground">Get accurate salary estimates for your role</p>
          </div>
          
          <div className="w-24"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Salary Calculation
                </CardTitle>
                <p className="text-muted-foreground">
                  Enter your details to get personalized salary insights
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job-title">Job Title *</Label>
                    <Select value={jobTitle} onValueChange={setJobTitle}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                        <SelectItem value="Product Manager">Product Manager</SelectItem>
                        <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                        <SelectItem value="UX Designer">UX Designer</SelectItem>
                        <SelectItem value="Marketing Manager">Marketing Manager</SelectItem>
                        <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New York">New York, NY</SelectItem>
                        <SelectItem value="San Francisco">San Francisco, CA</SelectItem>
                        <SelectItem value="Los Angeles">Los Angeles, CA</SelectItem>
                        <SelectItem value="Chicago">Chicago, IL</SelectItem>
                        <SelectItem value="Austin">Austin, TX</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Years of Experience: {experience[0]} years</Label>
                  <Slider
                    value={experience}
                    onValueChange={setExperience}
                    max={20}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="education">Education Level</Label>
                    <Select value={education} onValueChange={setEducation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select education" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High School">High School</SelectItem>
                        <SelectItem value="Bachelor's">Bachelor's Degree</SelectItem>
                        <SelectItem value="Masters">Master's Degree</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
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
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-size">Company Size</Label>
                  <Select value={companySize} onValueChange={setCompanySize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Startup">Startup (1-50)</SelectItem>
                      <SelectItem value="Small">Small (51-200)</SelectItem>
                      <SelectItem value="Medium">Medium (201-1000)</SelectItem>
                      <SelectItem value="Large">Large (1000+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Key Skills (optional)</Label>
                  <Input
                    id="skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g., React, Python, Project Management"
                  />
                </div>

                <Button 
                  onClick={handleCalculate} 
                  className="w-full hero-gradient"
                  disabled={calculating}
                >
                  {calculating ? "Calculating..." : "Calculate Salary"}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-6">
              {results ? (
                <>
                  <Card className="hero-gradient text-white border-0">
                    <CardContent className="p-8 text-center">
                      <h3 className="text-xl font-semibold mb-4">Estimated Salary Range</h3>
                      <div className="text-4xl font-bold mb-2">
                        ${results.median.toLocaleString()}
                      </div>
                      <p className="text-white/80 mb-4">Median Salary</p>
                      <div className="text-lg">
                        ${results.range.min.toLocaleString()} - ${results.range.max.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Salary Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            ${results.percentiles.p25.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">25th Percentile</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            ${results.percentiles.p50.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">50th Percentile</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            ${results.percentiles.p75.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">75th Percentile</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Salary Factors</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {results.factors.map((factor: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{factor.name}</div>
                            <div className="text-sm text-muted-foreground">{factor.value}</div>
                          </div>
                          <div className="font-semibold text-green-600">{factor.impact}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Market Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">{results.trends.growth}</div>
                        <div className="text-sm text-muted-foreground">Annual Growth</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{results.trends.demand}</div>
                        <div className="text-sm text-muted-foreground">Job Demand</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-600">{results.trends.outlook}</div>
                        <div className="text-sm text-muted-foreground">Future Outlook</div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="h-96 flex items-center justify-center">
                  <CardContent className="text-center">
                    <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Ready to Calculate</h3>
                    <p className="text-muted-foreground">
                      Fill in your details on the left to get your personalized salary estimate
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}