import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Star,
  MessageSquare,
  AlertCircle,
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: string;
}

interface Answer {
  questionIndex: number;
  transcript: string;
  score: number;
  feedback: string;
  strengths?: string[];
  improvements?: string[];
}

export default function InterviewPrep() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [interviewType, setInterviewType] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState([5]);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [sessionId, setSessionId] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [analyzingAnswer, setAnalyzingAnswer] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const [overallFeedback, setOverallFeedback] = useState<string[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const interviewTypes = [
    {
      value: "technical",
      label: "Technical Interview",
      description: "Coding and system design",
    },
    {
      value: "behavioral",
      label: "Behavioral Interview",
      description: "Situational questions",
    },
    {
      value: "case-study",
      label: "Case Study",
      description: "Business problems",
    },
    {
      value: "panel",
      label: "Panel Interview",
      description: "Mixed questions",
    },
  ];

  useEffect(() => {
    loadHistory();
    initSpeechRecognition();
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      window.speechSynthesis.cancel();
    };
  }, []);


const initSpeechRecognition = () => {
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false; 
    recognitionRef.current.interimResults = false; 
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.maxAlternatives = 1;
    
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("Captured speech:", transcript);
      setTranscript((prev) => prev + transcript + " ");
      
      // Auto-restart for continuous listening
      if (isRecordingRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }, 100);
      }
    };
    
    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      
      if (event.error === "not-allowed") {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access",
          variant: "destructive",
        });
        setIsRecording(false);
        isRecordingRef.current = false;
        return;
      }
      
      // For other errors, just restart
      if (isRecordingRef.current && event.error !== "aborted") {
        setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }, 300);
      }
    };
    
    recognitionRef.current.onend = () => {
      // Restart if still recording
      if (isRecordingRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }, 100);
      }
    };
  }
};
  const loadHistory = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("interview_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const speakText = async (text: string) => {
    if (!autoSpeak) return;
    window.speechSynthesis.cancel();
    try {
      const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
      if (ELEVENLABS_API_KEY) {
        const response = await fetch(
          "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
          {
            method: "POST",
            headers: {
              Accept: "audio/mpeg",
              "Content-Type": "application/json",
              "xi-api-key": ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
              text: text,
              model_id: "eleven_monolingual_v1",
              voice_settings: { stability: 0.5, similarity_boost: 0.5 },
            }),
          }
        );
        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          setIsSpeaking(true);
          audio.onended = () => setIsSpeaking(false);
          await audio.play();
          return;
        }
      }
    } catch (error) {
      console.log("ElevenLabs unavailable, using Web Speech API");
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const startInterview = async () => {
    if (!role || !interviewType) {
      toast({
        title: "Missing Information",
        description: "Please select a role and interview type",
        variant: "destructive",
      });
      return;
    }
    setLoadingQuestions(true);
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
        setLoadingQuestions(false);
        return;
      }
      const response = await fetch(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/functions/v1/conduct-interview?action=generate-questions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
            interviewType,
            difficulty,
            numberOfQuestions: numberOfQuestions[0],
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to generate questions");
      const result = await response.json();
      if (!result.success)
        throw new Error(result.error || "Failed to start interview");
      setSessionId(result.sessionId);
      setQuestions(result.questions);
      setSessionStarted(true);
      setCurrentQuestion(0);
      setAnswers([]);
      setTranscript("");
      toast({
        title: "Interview Started!",
        description: "Good luck! Speak clearly and take your time.",
      });
      setTimeout(() => {
        speakText(result.questions[0].question);
      }, 1000);
    } catch (error: any) {
      console.error("Start interview error:", error);
      toast({
        title: "Failed to Start Interview",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingQuestions(false);
    }
  };

const startRecording = () => {
  if (!recognitionRef.current) {
    toast({
      title: "Voice Not Supported",
      description: "Your browser doesn't support voice recognition",
      variant: "destructive",
    });
    return;
  }
  window.speechSynthesis.cancel();
  setTranscript("");

  try {
    recognitionRef.current.stop();
  } catch (e) {}

  setTimeout(() => {
    setIsRecording(true);
    isRecordingRef.current = true; 
    try {
      recognitionRef.current.start();
      console.log("Recording started successfully");
    } catch (error) {
      console.error("Failed to start recording:", error);
      setIsRecording(false);
      isRecordingRef.current = false; 
    }
  }, 100);
};

  const stopRecording = () => {
     isRecordingRef.current = false; 
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {}
    }
    setIsRecording(false);
  };

  const submitAnswer = async () => {
    if (!transcript || transcript.trim().length < 10) {
      toast({
        title: "Answer Too Short",
        description: "Please provide a more detailed answer",
        variant: "destructive",
      });
      return;
    }
    setAnalyzingAnswer(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/functions/v1/conduct-interview?action=analyze-answer`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            questionIndex: currentQuestion,
            question: questions[currentQuestion].question,
            transcript: transcript.trim(),
          }),
        }
      );
      const result = await response.json();
      if (!result.success)
        throw new Error(result.error || "Failed to analyze answer");
      const newAnswer: Answer = {
        questionIndex: currentQuestion,
        transcript: transcript.trim(),
        score: result.analysis.score,
        feedback: result.analysis.feedback,
        strengths: result.analysis.strengths,
        improvements: result.analysis.improvements,
      };
      setAnswers([...answers, newAnswer]);
      toast({
        title: "Answer Analyzed",
        description: `Score: ${result.analysis.score}/100`,
      });
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTranscript("");
        setTimeout(() => {
          speakText(questions[currentQuestion + 1].question);
        }, 1000);
      } else {
        completeInterview();
      }
    } catch (error: any) {
      console.error("Submit answer error:", error);
      toast({
        title: "Failed to Analyze Answer",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAnalyzingAnswer(false);
    }
  };

  const completeInterview = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/functions/v1/conduct-interview?action=complete-session`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        }
      );
      const result = await response.json();
      if (result.success) {
        setOverallScore(result.overallScore);
        setOverallFeedback(result.feedback);
        setStrengths(result.strengths);
        setImprovements(result.improvements);
        setSessionComplete(true);
        setSessionStarted(false);
        await loadHistory();
        toast({
          title: "Interview Complete!",
          description: `Final Score: ${result.overallScore}/100`,
        });
      }
    } catch (error) {
      console.error("Complete interview error:", error);
    }
  };

  const skipQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTranscript("");
      setTimeout(() => {
        speakText(questions[currentQuestion + 1].question);
      }, 500);
    } else {
      completeInterview();
    }
  };

  if (sessionStarted) {
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    return (
      <div className='min-h-screen bg-gradient-to-br from-background to-muted/20'>
        <div className='container-custom py-8'>
          <div className='flex items-center justify-between mb-8'>
            <div className='flex items-center gap-4'>
              <Button
                variant='ghost'
                onClick={() => {
                  if (confirm("Are you sure you want to end this session?")) {
                    stopRecording();
                    setSessionStarted(false);
                  }
                }}
                className='flex items-center gap-2'>
                <ArrowLeft className='w-4 h-4' />
                End Session
              </Button>
              <div>
                <h1 className='text-2xl font-heading font-bold'>
                  Interview in Progress
                </h1>
                <p className='text-muted-foreground'>
                  {role} - {interviewType}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setAutoSpeak(!autoSpeak)}>
                {autoSpeak ? (
                  <Volume2 className='w-4 h-4' />
                ) : (
                  <VolumeX className='w-4 h-4' />
                )}
              </Button>
              <Badge variant='outline'>
                Question {currentQuestion + 1} of {questions.length}
              </Badge>
            </div>
          </div>
          <div className='max-w-4xl mx-auto mb-8'>
            <Progress value={progress} className='h-2' />
          </div>
          <div className='max-w-4xl mx-auto'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <Badge variant='secondary'>{currentQ?.category}</Badge>
                  <Badge
                    variant={
                      currentQ?.difficulty === "hard"
                        ? "destructive"
                        : currentQ?.difficulty === "medium"
                        ? "default"
                        : "secondary"
                    }>
                    {currentQ?.difficulty}
                  </Badge>
                </div>
                <CardTitle className='text-xl mt-4'>
                  {currentQ?.question}
                </CardTitle>
                {isSpeaking && (
                  <Badge variant='outline' className='mt-2'>
                    <Volume2 className='w-3 h-3 mr-1 animate-pulse' />
                    AI is speaking...
                  </Badge>
                )}
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='text-center py-8'>
                  <div
                    className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center transition-all ${
                      isRecording ? "bg-red-500 animate-pulse" : "bg-primary"
                    }`}>
                    {isRecording ? (
                      <MicOff className='w-12 h-12 text-white' />
                    ) : (
                      <Mic className='w-12 h-12 text-white' />
                    )}
                  </div>
                  <div className='flex justify-center gap-3 mb-4'>
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "default"}
                      size='lg'
                      disabled={analyzingAnswer}>
                      {isRecording ? "Stop Recording" : "Start Recording"}
                    </Button>
                    {!isRecording && (
                      <Button
                        onClick={() => speakText(currentQ.question)}
                        variant='outline'
                        size='lg'
                        disabled={isSpeaking}>
                        <Volume2 className='w-4 h-4 mr-2' />
                        Repeat Question
                      </Button>
                    )}
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    {isRecording
                      ? "Listening... speak your answer"
                      : "Click to start recording your response"}
                  </p>
                </div>
                {transcript && (
                  <Card className='bg-muted/50'>
                    <CardContent className='p-4'>
                      <p className='text-sm font-medium mb-2'>Your Response:</p>
                      <p className='text-sm'>{transcript}</p>
                      <p className='text-xs text-muted-foreground mt-2'>
                        {transcript.trim().length} characters
                      </p>
                    </CardContent>
                  </Card>
                )}
                <Card className='bg-amber-50 border-amber-200'>
                  <CardContent className='p-4'>
                    <p className='text-sm font-medium mb-2'>
                      Voice not working? Type your answer:
                    </p>
                    <textarea
                      className='w-full p-3 border rounded-md min-h-[100px] text-sm'
                      placeholder='Type your answer here...'
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                    />
                  </CardContent>
                </Card>
                <div className='flex justify-between'>
                  <Button
                    variant='outline'
                    onClick={skipQuestion}
                    disabled={analyzingAnswer}>
                    Skip Question
                  </Button>
                  <Button
                    onClick={submitAnswer}
                    disabled={
                      !transcript ||
                      transcript.trim().length < 10 ||
                      analyzingAnswer
                    }>
                    {analyzingAnswer
                      ? "Analyzing..."
                      : currentQuestion === questions.length - 1
                      ? "Complete Interview"
                      : "Next Question"}
                  </Button>
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
                Interview Results
              </h1>
              <p className='text-muted-foreground'>
                {role} - {interviewType}
              </p>
            </div>
            <div className='w-24'></div>
          </div>
          <div className='max-w-4xl mx-auto space-y-6'>
            <Card className='hero-gradient text-white border-0'>
              <CardContent className='p-8 text-center'>
                <Star className='w-16 h-16 mx-auto mb-4' />
                <h2 className='text-3xl font-heading font-bold mb-2'>
                  Your Score
                </h2>
                <div className='text-6xl font-bold mb-4'>
                  {overallScore}/100
                </div>
                <Badge variant='secondary' className='text-lg px-4 py-2'>
                  {overallScore >= 85
                    ? "Excellent"
                    : overallScore >= 70
                    ? "Good"
                    : overallScore >= 50
                    ? "Fair"
                    : "Needs Improvement"}
                </Badge>
              </CardContent>
            </Card>
            {overallFeedback.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Overall Feedback</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {overallFeedback.map((item, index) => (
                    <div key={index} className='flex items-start gap-3'>
                      <div className='w-2 h-2 rounded-full bg-blue-500 mt-2'></div>
                      <p>{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {strengths.length > 0 && (
              <Card className='border-green-200 bg-green-50/50'>
                <CardHeader>
                  <CardTitle className='text-green-900'>
                    Your Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  {strengths.map((item, index) => (
                    <div key={index} className='flex items-center gap-2'>
                      <Badge
                        variant='outline'
                        className='bg-green-100 text-green-800'>
                        ✓
                      </Badge>
                      <p className='text-sm text-green-800'>{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {improvements.length > 0 && (
              <Card className='border-amber-200 bg-amber-50/50'>
                <CardHeader>
                  <CardTitle className='text-amber-900'>
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  {improvements.map((item, index) => (
                    <div key={index} className='flex items-center gap-2'>
                      <Badge
                        variant='outline'
                        className='bg-amber-100 text-amber-800'>
                        →
                      </Badge>
                      <p className='text-sm text-amber-800'>{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            <div className='flex justify-center gap-4'>
              <Button
                onClick={() => {
                  setSessionComplete(false);
                  setOverallScore(0);
                  setOverallFeedback([]);
                  setStrengths([]);
                  setImprovements([]);
                  setRole("");
                  setInterviewType("");
                }}>
                Practice Again
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
              Interview <span className='text-gradient'>Preparation</span>
            </h1>
            <p className='text-muted-foreground'>
              AI-powered mock interviews with voice
            </p>
          </div>
          <div className='w-24'></div>
        </div>
        <Alert className='max-w-4xl mx-auto mb-6 border-blue-500 bg-blue-50'>
          <AlertCircle className='h-4 w-4 text-blue-600' />
          <AlertDescription className='text-blue-800'>
            <strong>Voice Interview:</strong> This tool uses your microphone for
            voice recognition and AI-powered speech for questions. Make sure
            you're in a quiet environment and allow microphone access when
            prompted.
          </AlertDescription>
        </Alert>
        <div className='max-w-6xl mx-auto'>
          <Tabs defaultValue='practice' className='w-full'>
            <TabsList className='grid w-full grid-cols-2 mb-8'>
              <TabsTrigger value='practice'>Start Practice</TabsTrigger>
              <TabsTrigger value='history'>Interview History</TabsTrigger>
            </TabsList>
            <TabsContent value='practice' className='space-y-6'>
              <div className='grid lg:grid-cols-2 gap-8'>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <MessageSquare className='w-5 h-5' />
                      Interview Setup
                    </CardTitle>
                    <p className='text-muted-foreground'>
                      Configure your AI-powered mock interview
                    </p>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    <div className='space-y-2'>
                      <Label htmlFor='role'>Target Role *</Label>
                      <Input
                        id='role'
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder='e.g., Software Engineer, Product Manager'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='interview-type'>Interview Type *</Label>
                      <Select
                        value={interviewType}
                        onValueChange={setInterviewType}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select interview type' />
                        </SelectTrigger>
                        <SelectContent>
                          {interviewTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className='font-medium'>{type.label}</div>
                                <div className='text-xs text-muted-foreground'>
                                  {type.description}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2'>
                      <Label>Number of Questions: {numberOfQuestions[0]}</Label>
                      <Slider
                        value={numberOfQuestions}
                        onValueChange={setNumberOfQuestions}
                        max={10}
                        min={3}
                        step={1}
                        className='w-full'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='difficulty'>Difficulty Level</Label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select difficulty' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='beginner'>Beginner</SelectItem>
                          <SelectItem value='intermediate'>
                            Intermediate
                          </SelectItem>
                          <SelectItem value='advanced'>Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={startInterview}
                      className='w-full hero-gradient'
                      disabled={loadingQuestions}>
                      {loadingQuestions
                        ? "Generating Questions..."
                        : "Start Voice Interview"}
                    </Button>
                  </CardContent>
                </Card>
                <div className='space-y-6'>
                  <Card className='hero-gradient text-white border-0'>
                    <CardContent className='p-8'>
                      <Mic className='w-12 h-12 mb-4' />
                      <h3 className='text-xl font-semibold mb-4'>
                        AI Voice Interview
                      </h3>
                      <p className='text-white/80 mb-6'>
                        Practice with our advanced AI that conducts realistic
                        voice interviews and provides instant feedback on your
                        performance.
                      </p>
                      <div className='space-y-3'>
                        <div className='flex items-center gap-3'>
                          <div className='w-2 h-2 rounded-full bg-white/60'></div>
                          <span className='text-sm'>
                            Real-time voice transcription
                          </span>
                        </div>
                        <div className='flex items-center gap-3'>
                          <div className='w-2 h-2 rounded-full bg-white/60'></div>
                          <span className='text-sm'>
                            AI-generated personalized questions
                          </span>
                        </div>
                        <div className='flex items-center gap-3'>
                          <div className='w-2 h-2 rounded-full bg-white/60'></div>
                          <span className='text-sm'>
                            Detailed performance scoring
                          </span>
                        </div>
                        <div className='flex items-center gap-3'>
                          <div className='w-2 h-2 rounded-full bg-white/60'></div>
                          <span className='text-sm'>
                            AI speaks questions aloud
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Interview Tips</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='flex items-start gap-3'>
                        <div className='w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0'>
                          <span className='text-blue-600 text-sm font-bold'>
                            1
                          </span>
                        </div>
                        <div>
                          <h4 className='font-semibold'>
                            Test Your Microphone
                          </h4>
                          <p className='text-sm text-muted-foreground'>
                            Find a quiet space and allow microphone access when
                            prompted
                          </p>
                        </div>
                      </div>
                      <div className='flex items-start gap-3'>
                        <div className='w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0'>
                          <span className='text-green-600 text-sm font-bold'>
                            2
                          </span>
                        </div>
                        <div>
                          <h4 className='font-semibold'>Speak Clearly</h4>
                          <p className='text-sm text-muted-foreground'>
                            Articulate your words and maintain a steady pace
                          </p>
                        </div>
                      </div>
                      <div className='flex items-start gap-3'>
                        <div className='w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0'>
                          <span className='text-purple-600 text-sm font-bold'>
                            3
                          </span>
                        </div>
                        <div>
                          <h4 className='font-semibold'>
                            Use Specific Examples
                          </h4>
                          <p className='text-sm text-muted-foreground'>
                            Support your answers with concrete examples from
                            experience
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            <TabsContent value='history' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Your Interview History</CardTitle>
                  <p className='text-muted-foreground'>
                    Track your progress and review past performances
                  </p>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <div className='text-center py-8'>
                      <MessageSquare className='w-12 h-12 text-muted-foreground mx-auto mb-3' />
                      <p className='text-muted-foreground'>
                        No interview history yet
                      </p>
                      <p className='text-sm text-muted-foreground mt-1'>
                        Complete an interview to see your results here
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {history.map((session) => (
                        <Card key={session.id} className='p-4'>
                          <div className='flex items-center justify-between'>
                            <div>
                              <h4 className='font-semibold'>{session.role}</h4>
                              <p className='text-sm text-muted-foreground'>
                                {session.interview_type} •{" "}
                                {session.duration_minutes} min •{" "}
                                {new Date(
                                  session.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className='text-right'>
                              <div className='text-2xl font-bold text-primary'>
                                {session.overall_score}%
                              </div>
                              <Badge
                                variant={
                                  session.overall_score >= 85
                                    ? "default"
                                    : session.overall_score >= 70
                                    ? "secondary"
                                    : "destructive"
                                }>
                                {session.overall_score >= 85
                                  ? "Excellent"
                                  : session.overall_score >= 70
                                  ? "Good"
                                  : "Needs Work"}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
