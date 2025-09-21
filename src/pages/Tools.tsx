import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calculator, FileText, BarChart3, Brain, Award, Star } from "lucide-react";

const careerTools = [
  {
    id: 1,
    title: "Resume Checker",
    description: "Get instant feedback on your resume with AI-powered analysis",
    icon: FileText,
    category: "Resume",
    rating: 4.8,
    users: "50k+",
    status: "free"
  },
  {
    id: 2,
    title: "Salary Calculator",
    description: "Compare salaries across different roles, companies, and locations",
    icon: Calculator,
    category: "Salary",
    rating: 4.6,
    users: "35k+",
    status: "free"
  },
  {
    id: 3,
    title: "Skills Assessment",
    description: "Evaluate your technical and soft skills with comprehensive tests",
    icon: Brain,
    category: "Skills",
    rating: 4.7,
    users: "25k+",
    status: "premium"
  },
  {
    id: 4,
    title: "Career Path Analyzer",
    description: "Discover optimal career trajectories based on your background",
    icon: BarChart3,
    category: "Career Planning",
    rating: 4.5,
    users: "20k+",
    status: "free"
  },
  {
    id: 5,
    title: "Interview Prep",
    description: "Practice with AI-powered mock interviews for your target role",
    icon: Award,
    category: "Interview",
    rating: 4.9,
    users: "40k+",
    status: "premium"
  }
];

export default function Tools() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container-custom py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Career <span className="text-gradient">Tools</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Accelerate your career with our suite of powerful tools designed to help you succeed
          </p>
        </div>

        {/* Featured Tool */}
        <div className="mb-12">
          <Card className="hero-gradient text-white border-0 overflow-hidden">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-heading">Resume Checker Pro</CardTitle>
              <CardDescription className="text-white/80 text-lg">
                Get detailed feedback on your resume with our AI-powered analysis tool
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button size="lg" variant="secondary" className="mb-4">
                Try It Free
              </Button>
              <div className="flex justify-center space-x-6 text-sm">
                <div>
                  <div className="font-semibold">98%</div>
                  <div className="text-white/80">Accuracy Rate</div>
                </div>
                <div>
                  <div className="font-semibold">50k+</div>
                  <div className="text-white/80">Resumes Analyzed</div>
                </div>
                <div>
                  <div className="font-semibold">4.8★</div>
                  <div className="text-white/80">User Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {careerTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card key={tool.id} className="group hover:shadow-lg transition-all duration-300 hover-lift">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 primary-gradient rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex items-center space-x-2">
                      {tool.status === "premium" && (
                        <Badge variant="secondary" className="text-xs">Pro</Badge>
                      )}
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{tool.rating}</span>
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-heading">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline">{tool.category}</Badge>
                    <span className="text-sm text-muted-foreground">{tool.users} users</span>
                  </div>
                  <Button 
                    className="w-full" 
                    variant={tool.status === "premium" ? "default" : "outline"}
                    onClick={() => {
                      const toolRoutes: { [key: string]: string } = {
                        'Resume Checker': '/tools/resume-checker',
                        'Salary Calculator': '/tools/salary-calculator', 
                        'Skills Assessment': '/tools/skills-assessment',
                        'Career Path Analyzer': '/tools/career-path',
                        'Interview Prep': '/tools/interview-prep'
                      };
                      const route = toolRoutes[tool.title];
                      if (route) {
                        window.location.href = route;
                      }
                    }}
                  >
                    {tool.status === "premium" ? "Start Free Trial" : "Use Tool"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-heading">Ready to Level Up Your Career?</CardTitle>
              <CardDescription className="text-lg">
                Join thousands of professionals who have accelerated their careers with our tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-center space-x-8 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-2xl text-primary">150k+</div>
                    <div className="text-muted-foreground">Happy Users</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-2xl text-primary">95%</div>
                    <div className="text-muted-foreground">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-2xl text-primary">4.8★</div>
                    <div className="text-muted-foreground">Average Rating</div>
                  </div>
                </div>
                <Button size="lg" className="hero-gradient">
                  Get Started Today
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}