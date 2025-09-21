import { useState } from "react";
import { ArrowLeft, Mic, MicOff, Play, Pause, RotateCcw, Clock, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface InterviewSession {
  id: string;
  role: string;
  type: string;
  duration: number;
  date: string;
  score: number;
  feedback: string[];
}

interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: string;
}

export default function InterviewPrep() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [interviewType, setInterviewType] = useState("");
  const [duration, setDuration] = useState([30]);
  const [difficulty, setDifficulty] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes per question
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [history, setHistory] = useState<InterviewSession[]>([
    {
      id: "1",
      role: "Software Engineer",
      type: "Technical",
      duration: 45,
      date: "2024-01-15",
      score: 85,
      feedback: ["Strong technical knowledge", "Good problem-solving approach"]
    },
    {
      id: "2", 
      role: "Product Manager",
      type: "Behavioral",
      duration: 30,
      date: "2024-01-10",
      score: 78,
      feedback: ["Clear communication", "Could improve on leadership examples"]
    }
  ]);

  const interviewTypes = [
    { value: "technical", label: "Technical Interview", description: "Coding and system design questions" },
    { value: "behavioral", label: "Behavioral Interview", description: "Situational and soft skills questions" },
    { value: "case-study", label: "Case Study", description: "Business problems and analytical thinking" },
    { value: "panel", label: "Panel Interview", description: "Multiple interviewers, mixed questions" }
  ];

  const mockQuestions: Question[] = [
    {
      id: 1,
      question: "Tell me about yourself and why you're interested in this role.",
      category: "Introduction",
      difficulty: "Easy"
    },
    {
      id: 2,
      question: "Describe a challenging project you worked on and how you overcame obstacles.",
      category: "Behavioral",
      difficulty: "Medium"
    },
    {
      id: 3,
      question: "How would you design a scalable system for a messaging application?",
      category: "Technical",
      difficulty: "Hard"
    }
  ];

  const startInterview = () => {
    if (!role || !interviewType) {
      toast({
        title: "Missing Information",
        description: "Please select a role and interview type",
        variant: "destructive",
      });
      return;
    }

    setQuestions(mockQuestions);
    setSessionStarted(true);
    setCurrentQuestion(0);
    setTimeLeft(duration[0] * 60); // Convert minutes to seconds
    
    toast({
      title: "Interview Started",
      description: "Good luck! Take your time to think before answering.",
    });

    // Start timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          completeSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    const mockScore = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
    const mockFeedback = [
      "Clear and confident communication",
      "Good technical understanding",
      "Could improve on specific examples",
      "Strong problem-solving approach"
    ];

    setScore(mockScore);
    setFeedback(mockFeedback);
    setSessionComplete(true);
    setSessionStarted(false);

    // Add to history
    const newSession: InterviewSession = {
      id: Date.now().toString(),
      role,
      type: interviewType,
      duration: duration[0],
      date: new Date().toISOString().split('T')[0],
      score: mockScore,
      feedback: mockFeedback
    };
    setHistory([newSession, ...history]);

    toast({
      title: "Interview Complete",
      description: `Your score: ${mockScore}/100`,
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (sessionStarted) {
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container-custom py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setSessionStarted(false)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                End Session
              </Button>
              <div>
                <h1 className="text-2xl font-heading font-bold">Interview in Progress</h1>
                <p className="text-muted-foreground">{role} - {interviewType}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
              <Badge variant="outline">
                Question {currentQuestion + 1} of {questions.length}
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
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{currentQ?.category}</Badge>
                  <Badge variant={currentQ?.difficulty === "Hard" ? "destructive" : 
                                currentQ?.difficulty === "Medium" ? "default" : "secondary"}>
                    {currentQ?.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-xl mt-4">{currentQ?.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Voice Interface */}
                <div className="text-center py-8">
                  <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center transition-all ${
                    isRecording ? 'bg-red-500 animate-pulse' : 'bg-primary'
                  }`}>
                    {isRecording ? (
                      <MicOff className="w-12 h-12 text-white" />
                    ) : (
                      <Mic className="w-12 h-12 text-white" />
                    )}
                  </div>
                  <Button
                    onClick={() => setIsRecording(!isRecording)}
                    variant={isRecording ? "destructive" : "default"}
                    size="lg"
                  >
                    {isRecording ? "Stop Recording" : "Start Recording"}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    {isRecording ? "AI is listening to your response..." : "Click to start your response"}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                  >
                    Previous Question
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restart Question
                    </Button>
                    <Button onClick={nextQuestion}>
                      {currentQuestion === questions.length - 1 ? "Complete Interview" : "Next Question"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
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
              <h1 className="text-3xl font-heading font-bold">Interview Results</h1>
              <p className="text-muted-foreground">{role} - {interviewType}</p>
            </div>
            
            <div className="w-24"></div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Score */}
            <Card className="hero-gradient text-white border-0">
              <CardContent className="p-8 text-center">
                <Star className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-3xl font-heading font-bold mb-2">Your Score</h2>
                <div className="text-6xl font-bold mb-4">{score}/100</div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {score >= 85 ? "Excellent" : score >= 70 ? "Good" : "Needs Improvement"}
                </Badge>
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>AI Feedback & Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {feedback.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <p>{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-center gap-4">
              <Button onClick={() => {
                setSessionComplete(false);
                setScore(0);
                setFeedback([]);
              }}>
                Practice Again
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
              Interview <span className="text-gradient">Preparation</span>
            </h1>
            <p className="text-muted-foreground">Practice with AI-powered mock interviews</p>
          </div>
          
          <div className="w-24"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="practice" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="practice">Start Practice</TabsTrigger>
              <TabsTrigger value="history">Interview History</TabsTrigger>
            </TabsList>

            <TabsContent value="practice" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Setup Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Interview Setup
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Configure your mock interview session
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="role">Target Role *</Label>
                      <Input
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g., Software Engineer, Product Manager"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interview-type">Interview Type *</Label>
                      <Select value={interviewType} onValueChange={setInterviewType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interview type" />
                        </SelectTrigger>
                        <SelectContent>
                          {interviewTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-sm text-muted-foreground">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Duration: {duration[0]} minutes</Label>
                      <Slider
                        value={duration}
                        onValueChange={setDuration}
                        max={60}
                        min={15}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={startInterview} 
                      className="w-full hero-gradient"
                    >
                      Start Mock Interview
                    </Button>
                  </CardContent>
                </Card>

                {/* Features */}
                <div className="space-y-6">
                  <Card className="hero-gradient text-white border-0">
                    <CardContent className="p-8">
                      <Mic className="w-12 h-12 mb-4" />
                      <h3 className="text-xl font-semibold mb-4">
                        AI Voice Interview
                      </h3>
                      <p className="text-white/80 mb-6">
                        Practice with our advanced AI that conducts realistic voice interviews 
                        and provides instant feedback on your performance.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-white/60"></div>
                          <span className="text-sm">Real-time voice analysis</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-white/60"></div>
                          <span className="text-sm">Personalized question generation</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-white/60"></div>
                          <span className="text-sm">Detailed performance scoring</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Interview Tips</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-bold">1</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">Prepare Your Environment</h4>
                          <p className="text-sm text-muted-foreground">
                            Find a quiet space and test your microphone before starting
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 text-sm font-bold">2</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">Think Before Speaking</h4>
                          <p className="text-sm text-muted-foreground">
                            Take a moment to structure your thoughts before responding
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 text-sm font-bold">3</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">Use Specific Examples</h4>
                          <p className="text-sm text-muted-foreground">
                            Support your answers with concrete examples from your experience
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Interview History</CardTitle>
                  <p className="text-muted-foreground">
                    Track your progress and review past performances
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {history.map((session) => (
                      <Card key={session.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{session.role}</h4>
                            <p className="text-sm text-muted-foreground">
                              {session.type} • {session.duration} minutes • {session.date}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              {session.score}%
                            </div>
                            <Badge variant={session.score >= 85 ? "default" : 
                                          session.score >= 70 ? "secondary" : "destructive"}>
                              {session.score >= 85 ? "Excellent" : 
                               session.score >= 70 ? "Good" : "Needs Work"}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-1">Key Feedback:</p>
                          <div className="flex flex-wrap gap-1">
                            {session.feedback.slice(0, 2).map((item, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
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