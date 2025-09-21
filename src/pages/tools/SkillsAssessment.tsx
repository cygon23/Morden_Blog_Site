import { useState } from "react";
import { ArrowLeft, Brain, Clock, CheckCircle, XCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  category: string;
}

interface AssessmentResult {
  score: number;
  category: string;
  level: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

export default function SkillsAssessment() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [results, setResults] = useState<AssessmentResult | null>(null);

  const categories = [
    {
      id: "technical",
      name: "Technical Skills",
      description: "Programming, software development, and technical knowledge",
      duration: "30 minutes",
      questions: 25
    },
    {
      id: "leadership",
      name: "Leadership & Management",
      description: "Team management, communication, and leadership abilities",
      duration: "25 minutes",
      questions: 20
    },
    {
      id: "analytics",
      name: "Data & Analytics",
      description: "Data analysis, statistics, and analytical thinking",
      duration: "35 minutes",
      questions: 30
    },
    {
      id: "communication",
      name: "Communication",
      description: "Written and verbal communication, presentation skills",
      duration: "20 minutes",
      questions: 15
    }
  ];

  const mockQuestions: Question[] = [
    {
      id: 1,
      question: "What is the primary purpose of version control systems like Git?",
      options: [
        "To compress files",
        "To track changes in code over time",
        "To compile code",
        "To debug applications"
      ],
      correct: 1,
      category: "technical"
    },
    {
      id: 2,
      question: "Which of the following is NOT a principle of agile development?",
      options: [
        "Individuals and interactions over processes and tools",
        "Working software over comprehensive documentation",
        "Following a plan over responding to change",
        "Customer collaboration over contract negotiation"
      ],
      correct: 2,
      category: "technical"
    },
    {
      id: 3,
      question: "What is the most effective way to handle team conflicts?",
      options: [
        "Ignore the conflict and hope it resolves itself",
        "Address the conflict directly with all parties involved",
        "Take sides with the person you know better",
        "Escalate immediately to upper management"
      ],
      correct: 1,
      category: "leadership"
    }
  ];

  const startAssessment = (category: string) => {
    setSelectedCategory(category);
    setAssessmentStarted(true);
    setCurrentQuestion(0);
    setAnswers([]);
    
    // Start timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          completeAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeAssessment();
    }
  };

  const completeAssessment = () => {
    // Calculate results
    const correctAnswers = answers.filter((answer, index) => 
      answer === mockQuestions[index]?.correct
    ).length;
    
    const score = Math.round((correctAnswers / mockQuestions.length) * 100);
    
    const mockResults: AssessmentResult = {
      score,
      category: selectedCategory,
      level: score >= 80 ? "Expert" : score >= 60 ? "Intermediate" : "Beginner",
      strengths: [
        "Problem-solving abilities",
        "Attention to detail",
        "Technical knowledge"
      ],
      improvements: [
        "Advanced concepts understanding",
        "Best practices implementation",
        "Industry standards knowledge"
      ],
      recommendations: [
        "Complete advanced certification courses",
        "Practice with real-world projects",
        "Join professional communities"
      ]
    };

    setResults(mockResults);
    setAssessmentComplete(true);
    setAssessmentStarted(false);
    
    toast({
      title: "Assessment Complete",
      description: `You scored ${score}% on the ${selectedCategory} assessment`,
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (assessmentStarted) {
    const currentQ = mockQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container-custom py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setAssessmentStarted(false)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Exit Assessment
              </Button>
              <div>
                <h1 className="text-2xl font-heading font-bold">Skills Assessment</h1>
                <p className="text-muted-foreground">{selectedCategory}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
              <Badge variant="outline">
                Question {currentQuestion + 1} of {mockQuestions.length}
              </Badge>
            </div>
          </div>

          {/* Progress */}
          <div className="max-w-4xl mx-auto mb-8">
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{currentQ?.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={answers[currentQuestion]?.toString()}
                  onValueChange={(value) => handleAnswer(parseInt(value))}
                >
                  {currentQ?.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1 p-3 rounded-lg hover:bg-muted/50">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </Button>
                  <Button 
                    onClick={nextQuestion}
                    disabled={answers[currentQuestion] === undefined}
                  >
                    {currentQuestion === mockQuestions.length - 1 ? "Complete Assessment" : "Next Question"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (assessmentComplete && results) {
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
              <h1 className="text-3xl font-heading font-bold">Assessment Results</h1>
              <p className="text-muted-foreground">{results.category} Skills</p>
            </div>
            
            <div className="w-24"></div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Score */}
            <Card className="hero-gradient text-white border-0">
              <CardContent className="p-8 text-center">
                <Award className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-3xl font-heading font-bold mb-2">Your Score</h2>
                <div className="text-6xl font-bold mb-4">{results.score}%</div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {results.level} Level
                </Badge>
              </CardContent>
            </Card>

            {/* Analysis */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {results.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <p>{strength}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <XCircle className="w-5 h-5" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {results.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <p>{improvement}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <p>{recommendation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-center gap-4">
              <Button onClick={() => {
                setAssessmentComplete(false);
                setResults(null);
              }}>
                Take Another Assessment
              </Button>
              <Button variant="outline" onClick={() => navigate('/tools')}>
                Back to Tools
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              Skills <span className="text-gradient">Assessment</span>
            </h1>
            <p className="text-muted-foreground">Evaluate your professional skills and get personalized feedback</p>
          </div>
          
          <div className="w-24"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Categories */}
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="group hover:shadow-lg transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Brain className="w-12 h-12 primary-gradient rounded-lg p-2 text-primary-foreground" />
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{category.duration}</div>
                      <div>{category.questions} questions</div>
                    </div>
                  </div>
                  <CardTitle>{category.name}</CardTitle>
                  <p className="text-muted-foreground">{category.description}</p>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => startAssessment(category.id)}
                  >
                    Start Assessment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Card */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Choose Assessment</h3>
                  <p className="text-sm text-muted-foreground">
                    Select the skill area you want to evaluate
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Complete Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    Answer multiple-choice questions within the time limit
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Get Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive detailed feedback and improvement recommendations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}