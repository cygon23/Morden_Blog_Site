import { useState, useEffect } from "react";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  AlertCircle,
  History,
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
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function SalaryCalculator() {
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("Remote");
  const [experience, setExperience] = useState([3]);
  const [education, setEducation] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [skills, setSkills] = useState("");
  const [results, setResults] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);
  const [previousCalculations, setPreviousCalculations] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAllIndustries, setShowAllIndustries] = useState(false);

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
    loadPreviousCalculations();
  }, []);

  const loadPreviousCalculations = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("salary_calculations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setPreviousCalculations(data || []);
    } catch (error) {
      console.error("Error loading previous calculations:", error);
    }
  };

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
        setCalculating(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-salary`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobTitle,
            location,
            yearsExperience: experience[0],
            education,
            industry,
            companySize,
            skills,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to calculate salary");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Calculation failed");
      }

      const calcData = result.data;

      setResults({
        median: calcData.median_salary,
        range: calcData.salary_range,
        percentiles: calcData.percentiles,
        factors: calcData.factors,
        trends: calcData.trends,
        insights: calcData.ai_insights,
        usedFallback: result.usedFallback,
      });

      await loadPreviousCalculations();

      toast({
        title: "Calculation Complete!",
        description: result.usedFallback
          ? "Your salary estimate is ready (using backup system)"
          : "Your AI-powered salary estimate is ready",
      });
    } catch (error: any) {
      console.error("Calculation error:", error);
      toast({
        title: "Calculation Failed",
        description:
          error.message || "Failed to calculate salary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  const loadPreviousCalculation = (calc: any) => {
    setResults({
      median: calc.median_salary,
      range: calc.salary_range,
      percentiles: calc.percentiles,
      factors: calc.factors,
      trends: calc.trends,
      insights: calc.ai_insights,
      usedFallback: calc.used_fallback,
    });
    setShowHistory(false);
  };

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
              Salary <span className='text-gradient'>Calculator</span>
            </h1>
            <p className='text-muted-foreground'>AI-powered salary insights</p>
          </div>

          {previousCalculations.length > 0 && (
            <Button
              variant='outline'
              onClick={() => setShowHistory(!showHistory)}
              className='flex items-center gap-2'>
              <History className='w-4 h-4' />
              {showHistory ? "Hide" : "History"}
            </Button>
          )}
        </div>

        <Alert className='max-w-4xl mx-auto mb-6 border-amber-500 bg-amber-50'>
          <AlertCircle className='h-4 w-4 text-amber-600' />
          <AlertDescription className='text-amber-800'>
            <strong>AI-Powered Estimates:</strong> Salary data is generated by
            AI based on market trends and industry standards. We're working on
            integrating real-time market data for more accurate results. Use
            these estimates as a general guide.
          </AlertDescription>
        </Alert>

        {showHistory && previousCalculations.length > 0 && (
          <Card className='max-w-4xl mx-auto mb-6'>
            <CardHeader>
              <CardTitle>Previous Calculations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {previousCalculations.map((calc) => (
                  <div
                    key={calc.id}
                    className='flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer'
                    onClick={() => loadPreviousCalculation(calc)}>
                    <div>
                      <p className='font-medium'>{calc.job_title}</p>
                      <p className='text-sm text-muted-foreground'>
                        {calc.location} • {calc.years_experience} years exp •{" "}
                        {new Date(calc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant='outline'>
                      ${calc.median_salary.toLocaleString()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className='max-w-6xl mx-auto'>
          <div className='grid lg:grid-cols-2 gap-8'>
            <Card className='h-fit'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <DollarSign className='w-5 h-5' />
                  Salary Calculation
                </CardTitle>
                <p className='text-muted-foreground'>
                  Enter your details to get AI-powered salary insights
                </p>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-2'>
                  <Label htmlFor='job-title'>Job Title *</Label>
                  <Input
                    id='job-title'
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder='e.g., Software Engineer, Product Manager'
                  />
                  <p className='text-xs text-muted-foreground'>
                    Enter any job title
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='location'>Location *</Label>
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

                <div className='space-y-2'>
                  <Label>Years of Experience: {experience[0]} years</Label>
                  <Slider
                    value={experience}
                    onValueChange={setExperience}
                    max={20}
                    min={0}
                    step={1}
                    className='w-full'
                  />
                </div>

                <div className='grid md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='education'>Education Level</Label>
                    <Select value={education} onValueChange={setEducation}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select education' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='High School'>High School</SelectItem>
                        <SelectItem value="Bachelor's">
                          Bachelor's Degree
                        </SelectItem>
                        <SelectItem value='Masters'>Master's Degree</SelectItem>
                        <SelectItem value='PhD'>PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='industry'>Industry *</Label>
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
                            + Show {industryOptions.length - 8} more industries
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='company-size'>Company Size</Label>
                  <Select value={companySize} onValueChange={setCompanySize}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select company size' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Startup'>Startup (1-50)</SelectItem>
                      <SelectItem value='Small'>Small (51-200)</SelectItem>
                      <SelectItem value='Medium'>Medium (201-1000)</SelectItem>
                      <SelectItem value='Large'>Large (1000+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='skills'>Key Skills (optional)</Label>
                  <Input
                    id='skills'
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder='e.g., React, Python, Project Management'
                  />
                </div>

                <Button
                  onClick={handleCalculate}
                  className='w-full hero-gradient'
                  disabled={calculating}>
                  {calculating ? (
                    <>
                      <span className='animate-pulse'>
                        Calculating with AI...
                      </span>
                    </>
                  ) : (
                    "Calculate Salary"
                  )}
                </Button>

                <p className='text-xs text-center text-muted-foreground'>
                  💡 AI generates estimates based on market trends
                </p>
              </CardContent>
            </Card>

            <div className='space-y-6'>
              {results ? (
                <>
                  <Card className='hero-gradient text-white border-0'>
                    <CardContent className='p-8 text-center'>
                      {results.usedFallback && (
                        <Badge variant='secondary' className='mb-3'>
                          Backup Estimate
                        </Badge>
                      )}
                      <h3 className='text-xl font-semibold mb-4'>
                        Estimated Salary Range
                      </h3>
                      <div className='text-4xl font-bold mb-2'>
                        ${results.median.toLocaleString()}
                      </div>
                      <p className='text-white/80 mb-4'>Median Salary</p>
                      <div className='text-lg'>
                        ${results.range.min.toLocaleString()} - $
                        {results.range.max.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Salary Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='grid grid-cols-3 gap-4 text-center'>
                        <div>
                          <div className='text-2xl font-bold text-blue-600'>
                            ${results.percentiles.p25.toLocaleString()}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            25th Percentile
                          </div>
                        </div>
                        <div>
                          <div className='text-2xl font-bold text-green-600'>
                            ${results.percentiles.p50.toLocaleString()}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            50th Percentile
                          </div>
                        </div>
                        <div>
                          <div className='text-2xl font-bold text-purple-600'>
                            ${results.percentiles.p75.toLocaleString()}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            75th Percentile
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Salary Factors</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      {results.factors.map((factor: any, index: number) => (
                        <div
                          key={index}
                          className='flex items-center justify-between'>
                          <div>
                            <div className='font-medium'>{factor.name}</div>
                            <div className='text-sm text-muted-foreground'>
                              {factor.value}
                            </div>
                          </div>
                          <div className='font-semibold text-green-600'>
                            {factor.impact}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <TrendingUp className='w-5 h-5' />
                        Market Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='grid grid-cols-3 gap-4'>
                      <div className='text-center'>
                        <div className='text-xl font-bold text-green-600'>
                          {results.trends.growth}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          Annual Growth
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-xl font-bold text-blue-600'>
                          {results.trends.demand}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          Job Demand
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-xl font-bold text-purple-600'>
                          {results.trends.outlook}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          Future Outlook
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {results.insights && (
                    <Card className='border-blue-200 bg-blue-50/50'>
                      <CardHeader>
                        <CardTitle className='text-blue-900'>
                          AI Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className='text-sm text-blue-800'>
                          {results.insights}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className='flex justify-center gap-4'>
                    <Button
                      onClick={() => {
                        setResults(null);
                        setJobTitle("");
                        setLocation("Remote");
                        setExperience([3]);
                        setEducation("");
                        setIndustry("");
                        setCompanySize("");
                        setSkills("");
                        setShowAllIndustries(false);
                      }}>
                      Calculate Another Salary
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => navigate("/tools")}>
                      Back to Tools
                    </Button>
                  </div>
                </>
              ) : (
                <Card className='h-96 flex items-center justify-center'>
                  <CardContent className='text-center'>
                    <DollarSign className='w-16 h-16 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-xl font-semibold mb-2'>
                      Ready to Calculate
                    </h3>
                    <p className='text-muted-foreground mb-4'>
                      Fill in your details on the left to get your AI-powered
                      salary estimate
                    </p>
                    <Alert className='border-amber-500 bg-amber-50 text-left'>
                      <AlertCircle className='h-4 w-4 text-amber-600' />
                      <AlertDescription className='text-amber-800 text-sm'>
                        Results are AI-generated estimates based on market
                        trends. Actual salaries may vary.
                      </AlertDescription>
                    </Alert>
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
