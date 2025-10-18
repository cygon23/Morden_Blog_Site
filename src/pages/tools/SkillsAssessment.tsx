import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Brain,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase, authService } from "@/lib/supabase";

interface Question {
  id: string;
  question: string;
  options: string[];
  category: string;
  difficulty: string;
}

interface AssessmentResult {
  score: number;
  level: string;
  correctAnswers: number;
  totalQuestions: number;
  feedback: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
    summary: string;
  };
}

export default function SkillsAssessment() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState(1800);
  const [startTime, setStartTime] = useState<number>(0);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<AssessmentResult | null>(null);

  const categories = [
    {
      id: "technical",
      name: "Technical Skills",
      description: "Programming, software development, and technical knowledge",
      duration: "30 minutes",
      questions: 20,
    },
    {
      id: "leadership",
      name: "Leadership & Management",
      description: "Team management, communication, and leadership abilities",
      duration: "25 minutes",
      questions: 15,
    },
    {
      id: "analytics",
      name: "Data & Analytics",
      description: "Data analysis, statistics, and analytical thinking",
      duration: "25 minutes",
      questions: 15,
    },
    {
      id: "communication",
      name: "Communication",
      description: "Written and verbal communication, presentation skills",
      duration: "20 minutes",
      questions: 15,
    },
  ];

  useEffect(() => {
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let timer: any;
    if (assessmentStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            completeAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [assessmentStarted]);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (category: string) => {
    try {
      const { data, error } = await supabase
        .from("assessment_questions")
        .select("id, question, options, category, difficulty")
        .eq("category", category)
        .limit(20);

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("No questions available for this category");
      }

      // Shuffle questions for variety
      const shuffled = data.sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      return shuffled;
    } catch (error: any) {
      toast({
        title: "Error Loading Questions",
        description: error.message || "Failed to load assessment questions",
        variant: "destructive",
      });
      return [];
    }
  };

  const startAssessment = async (category: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to take the assessment",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setSelectedCategory(category);
    setLoading(true);

    const loadedQuestions = await fetchQuestions(category);

    if (loadedQuestions.length === 0) {
      setLoading(false);
      return;
    }

    setAssessmentStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
    setStartTime(Date.now());

    const categoryInfo = categories.find((c) => c.id === category);
    const duration = categoryInfo ? parseInt(categoryInfo.duration) * 60 : 1800;
    setTimeLeft(duration);
    setLoading(false);
  };

  const handleAnswer = (answerIndex: number) => {
    setAnswers({ ...answers, [currentQuestion]: answerIndex });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeAssessment();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const completeAssessment = async () => {
    setSubmitting(true);

    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);

      // Prepare answers for submission
      const answersArray = questions.map((q, index) => ({
        questionId: q.id,
        userAnswer: answers[index] ?? -1,
      }));

      // Call edge function
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assess-skills`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            category: selectedCategory,
            answers: answersArray,
            timeTaken,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Assessment failed");
      }

      setResults(result.data);
      setAssessmentComplete(true);
      setAssessmentStarted(false);

      toast({
        title: "Assessment Complete!",
        description: `You scored ${result.data.score}% - ${result.data.level} Level`,
      });
    } catch (error: any) {
      console.error("Assessment submission error:", error);
      toast({
        title: "Submission Failed",
        description:
          error.message || "Failed to submit assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  // Not authenticated
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
              Please sign in to take the skills assessment
            </p>
            <Button onClick={() => navigate("/auth")} className='w-full'>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Assessment in progress
  if (assessmentStarted && !submitting) {
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const answeredCount = Object.keys(answers).length;

    return (
      <div className='min-h-screen bg-gradient-to-br from-background to-muted/20'>
        <div className='container-custom py-8'>
          {/* Header */}
          <div className='flex items-center justify-between mb-8'>
            <div className='flex items-center gap-4'>
              <Button
                variant='ghost'
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to exit? Your progress will be lost."
                    )
                  ) {
                    setAssessmentStarted(false);
                    setAnswers({});
                  }
                }}
                className='flex items-center gap-2'>
                <ArrowLeft className='w-4 h-4' />
                Exit Assessment
              </Button>
              <div>
                <h1 className='text-2xl font-heading font-bold'>
                  Skills Assessment
                </h1>
                <p className='text-muted-foreground capitalize'>
                  {selectedCategory}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Clock className='w-4 h-4' />
                <span
                  className={timeLeft < 300 ? "text-red-500 font-bold" : ""}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <Badge variant='outline'>
                {answeredCount}/{questions.length} answered
              </Badge>
            </div>
          </div>

          {/* Progress */}
          <div className='max-w-4xl mx-auto mb-8'>
            <Progress value={progress} className='h-2' />
            <p className='text-sm text-muted-foreground mt-2 text-center'>
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>

          {/* Question */}
          <div className='max-w-4xl mx-auto'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between mb-2'>
                  <Badge variant='secondary' className='capitalize'>
                    {currentQ?.difficulty || "intermediate"}
                  </Badge>
                  {answers[currentQuestion] !== undefined && (
                    <Badge variant='outline' className='text-green-600'>
                      <CheckCircle className='w-3 h-3 mr-1' />
                      Answered
                    </Badge>
                  )}
                </div>
                <CardTitle className='text-xl'>{currentQ?.question}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <RadioGroup
                  value={
                    answers[currentQuestion] !== undefined
                      ? answers[currentQuestion].toString()
                      : undefined
                  }
                  onValueChange={(value) => handleAnswer(parseInt(value))}>
                  {currentQ?.options?.map((option: string, index: number) => (
                    <div key={index} className='flex items-center space-x-2'>
                      <RadioGroupItem
                        value={index.toString()}
                        id={`option-${currentQuestion}-${index}`}
                        checked={answers[currentQuestion] === index}
                      />
                      <Label
                        htmlFor={`option-${currentQuestion}-${index}`}
                        className='cursor-pointer flex-1 p-4 rounded-lg hover:bg-muted/50 border border-transparent hover:border-primary/20 transition-all'>
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className='flex justify-between pt-4'>
                  <Button
                    variant='outline'
                    onClick={previousQuestion}
                    disabled={currentQuestion === 0}>
                    Previous
                  </Button>
                  <Button
                    onClick={nextQuestion}
                    disabled={answers[currentQuestion] === undefined}>
                    {currentQuestion === questions.length - 1
                      ? "Complete Assessment"
                      : "Next Question"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Question Navigator */}
            <Card className='mt-4'>
              <CardContent className='p-4'>
                <p className='text-sm font-medium mb-3'>Question Navigator</p>
                <div className='grid grid-cols-10 gap-2'>
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`
                        w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium
                        transition-all
                        ${
                          currentQuestion === index
                            ? "bg-primary text-primary-foreground"
                            : answers[index] !== undefined
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100"
                            : "bg-muted hover:bg-muted/70"
                        }
                      `}>
                      {index + 1}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Submitting state
  if (submitting) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center'>
        <Card className='max-w-md w-full'>
          <CardContent className='p-8 text-center'>
            <Loader2 className='w-16 h-16 animate-spin text-primary mx-auto mb-4' />
            <h2 className='text-2xl font-heading font-bold mb-2'>
              Analyzing Your Results
            </h2>
            <p className='text-muted-foreground'>
              AI is generating personalized feedback...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results page
  if (assessmentComplete && results) {
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
                Assessment Results
              </h1>
              <p className='text-muted-foreground capitalize'>
                {selectedCategory} Skills
              </p>
            </div>

            <div className='w-24'></div>
          </div>

          <div className='max-w-4xl mx-auto space-y-6'>
            {/* Score */}
            <Card className='hero-gradient text-white border-0'>
              <CardContent className='p-8 text-center'>
                <Award className='w-16 h-16 mx-auto mb-4' />
                <h2 className='text-3xl font-heading font-bold mb-2'>
                  Your Score
                </h2>
                <div className='text-6xl font-bold mb-4'>{results.score}%</div>
                <Badge
                  variant='secondary'
                  className='text-lg px-4 py-2 bg-white text-primary'>
                  {results.level} Level
                </Badge>
                <p className='text-white/90 mt-4'>
                  {results.correctAnswers} out of {results.totalQuestions}{" "}
                  questions correct
                </p>
              </CardContent>
            </Card>

            {/* AI Summary */}
            {results.feedback?.summary && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Brain className='w-5 h-5 text-primary' />
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground leading-relaxed'>
                    {results.feedback.summary}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Analysis */}
            <div className='grid md:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-green-600'>
                    <CheckCircle className='w-5 h-5' />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {results.feedback?.strengths?.map((strength, index) => (
                    <div key={index} className='flex items-start gap-3'>
                      <div className='w-2 h-2 rounded-full bg-green-500 mt-2'></div>
                      <p className='text-sm'>{strength}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-orange-600'>
                    <XCircle className='w-5 h-5' />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {results.feedback?.improvements?.map((improvement, index) => (
                    <div key={index} className='flex items-start gap-3'>
                      <div className='w-2 h-2 rounded-full bg-orange-500 mt-2'></div>
                      <p className='text-sm'>{improvement}</p>
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
              <CardContent className='space-y-3'>
                {results.feedback?.recommendations?.map(
                  (recommendation, index) => (
                    <div key={index} className='flex items-start gap-3'>
                      <div className='w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5'>
                        <span className='text-primary text-xs font-bold'>
                          {index + 1}
                        </span>
                      </div>
                      <p className='text-sm'>{recommendation}</p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>

            <div className='flex justify-center gap-4'>
              <Button
                onClick={() => {
                  setAssessmentComplete(false);
                  setResults(null);
                  setSelectedCategory("");
                }}>
                Take Another Assessment
              </Button>
              <Button variant='outline' onClick={() => navigate("/tools")}>
                Back to Tools
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Category selection (default view)
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
              Skills <span className='text-gradient'>Assessment</span>
            </h1>
            <p className='text-muted-foreground'>
              AI-powered skills evaluation with personalized feedback
            </p>
          </div>

          <div className='w-24'></div>
        </div>

        <div className='max-w-4xl mx-auto'>
          {/* Categories */}
          <div className='grid md:grid-cols-2 gap-6'>
            {categories.map((category) => (
              <Card
                key={category.id}
                className='group hover:shadow-lg transition-all'>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <Brain className='w-12 h-12 primary-gradient rounded-lg p-2 text-primary-foreground' />
                    <div className='text-right text-sm text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <Clock className='w-3 h-3' />
                        {category.duration}
                      </div>
                      <div>{category.questions} questions</div>
                    </div>
                  </div>
                  <CardTitle className='mt-4'>{category.name}</CardTitle>
                  <p className='text-muted-foreground text-sm'>
                    {category.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <Button
                    className='w-full'
                    onClick={() => startAssessment(category.id)}>
                    Start Assessment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Card */}
          <Card className='mt-8'>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid md:grid-cols-3 gap-6'>
                <div className='text-center'>
                  <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3'>
                    <span className='text-primary font-bold'>1</span>
                  </div>
                  <h3 className='font-semibold mb-2'>Choose Category</h3>
                  <p className='text-sm text-muted-foreground'>
                    Select the skill area you want to evaluate from our curated
                    categories
                  </p>
                </div>

                <div className='text-center'>
                  <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3'>
                    <span className='text-primary font-bold'>2</span>
                  </div>
                  <h3 className='font-semibold mb-2'>Answer Questions</h3>
                  <p className='text-sm text-muted-foreground'>
                    Complete multiple-choice questions covering various
                    difficulty levels
                  </p>
                </div>

                <div className='text-center'>
                  <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3'>
                    <span className='text-primary font-bold'>3</span>
                  </div>
                  <h3 className='font-semibold mb-2'>Get AI Feedback</h3>
                  <p className='text-sm text-muted-foreground'>
                    Receive personalized insights and recommendations powered by
                    AI
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
