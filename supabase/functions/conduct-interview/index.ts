import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateQuestionsRequest {
  role: string;
  interviewType: string;
  difficulty?: string;
  numberOfQuestions?: number;
}

interface AnalyzeAnswerRequest {
  sessionId: string;
  questionIndex: number;
  question: string;
  transcript: string;
}

interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: string;
}

async function callGroqAPI(prompt: string): Promise<string> {
  const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
  
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an expert interview coach and evaluator. Provide professional, constructive feedback. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Groq API error: ${response.status}, ${errorData}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateQuestions(request: GenerateQuestionsRequest): Promise<Question[]> {
  const numberOfQuestions = request.numberOfQuestions || 5;
  
  const prompt = `Generate ${numberOfQuestions} realistic ${request.interviewType} interview questions for a ${request.role} position.

Difficulty level: ${request.difficulty || 'intermediate'}

Return ONLY a JSON array with this exact structure:
[
  {
    "id": 1,
    "question": "Question text here",
    "category": "Category name",
    "difficulty": "easy/medium/hard"
  }
]

Requirements:
- Start with 1-2 easier warm-up questions
- Progress to more challenging questions
- Include a mix of behavioral and role-specific questions
- Make questions realistic and commonly asked in actual interviews
- For technical roles, include technical problem-solving questions
- For leadership roles, include situational leadership questions

Respond ONLY with the JSON array, no other text.`;

  try {
    const response = await callGroqAPI(prompt);
    const cleanedResponse = response.trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("AI question generation failed, using fallback:", error);
    return getFallbackQuestions(request.interviewType);
  }
}

function getFallbackQuestions(interviewType: string): Question[] {
  const fallbackQuestions: Record<string, Question[]> = {
    technical: [
      { id: 1, question: "Tell me about yourself and your technical background.", category: "Introduction", difficulty: "easy" },
      { id: 2, question: "Describe a challenging technical problem you solved recently.", category: "Problem Solving", difficulty: "medium" },
      { id: 3, question: "How do you approach debugging complex issues?", category: "Technical", difficulty: "medium" },
      { id: 4, question: "Explain your experience with system design and scalability.", category: "Architecture", difficulty: "hard" },
      { id: 5, question: "Where do you see yourself in your technical career in 5 years?", category: "Career Goals", difficulty: "easy" }
    ],
    behavioral: [
      { id: 1, question: "Tell me about yourself and why you're interested in this role.", category: "Introduction", difficulty: "easy" },
      { id: 2, question: "Describe a time when you had to work with a difficult team member.", category: "Teamwork", difficulty: "medium" },
      { id: 3, question: "Tell me about a time when you failed. What did you learn?", category: "Self-Awareness", difficulty: "medium" },
      { id: 4, question: "How do you handle tight deadlines and pressure?", category: "Stress Management", difficulty: "medium" },
      { id: 5, question: "What are your greatest strengths and weaknesses?", category: "Self-Assessment", difficulty: "easy" }
    ],
    default: [
      { id: 1, question: "Tell me about yourself.", category: "Introduction", difficulty: "easy" },
      { id: 2, question: "Why are you interested in this position?", category: "Motivation", difficulty: "easy" },
      { id: 3, question: "Describe a challenging situation and how you handled it.", category: "Problem Solving", difficulty: "medium" },
      { id: 4, question: "What are your key strengths?", category: "Self-Assessment", difficulty: "easy" },
      { id: 5, question: "Where do you see yourself in 3-5 years?", category: "Career Goals", difficulty: "easy" }
    ]
  };

  return fallbackQuestions[interviewType] || fallbackQuestions.default;
}

async function analyzeAnswer(
  question: string,
  transcript: string,
  role: string,
  interviewType: string
): Promise<{ score: number; feedback: string; strengths: string[]; improvements: string[] }> {
  
  if (!transcript || transcript.trim().length < 10) {
    return {
      score: 0,
      feedback: "No meaningful response detected. Please provide a more detailed answer.",
      strengths: [],
      improvements: ["Provide a more comprehensive answer", "Speak more clearly into the microphone"]
    };
  }

  const prompt = `Analyze this interview answer and provide detailed evaluation.

Interview Context:
- Role: ${role}
- Interview Type: ${interviewType}
- Question: "${question}"
- Candidate's Answer: "${transcript}"

Evaluate the answer and return ONLY valid JSON with this structure:
{
  "score": 75,
  "feedback": "Overall assessment of the answer in 2-3 sentences",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"]
}

Evaluation Criteria:
- Relevance and clarity of answer
- Specific examples and details provided
- Communication skills and structure
- Technical accuracy (if applicable)
- Behavioral indicators (if applicable)

Score scale: 0-100
- 0-40: Poor (lacks clarity, relevance, or substance)
- 41-60: Fair (basic answer but needs improvement)
- 61-80: Good (solid answer with good examples)
- 81-100: Excellent (exceptional answer with great details)

Provide constructive, professional feedback. Be encouraging but honest.`;

  try {
    const response = await callGroqAPI(prompt);
    const cleanedResponse = response.trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("AI analysis failed:", error);
    const wordCount = transcript.split(/\s+/).length;
    const estimatedScore = Math.min(Math.max(wordCount * 2, 40), 75);
    
    return {
      score: estimatedScore,
      feedback: "Your answer was recorded. Try to provide more specific examples and details to strengthen your response.",
      strengths: ["Attempted to answer the question"],
      improvements: ["Provide more specific examples", "Add more detail to your response"]
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // Generate interview questions
    if (action === "generate-questions") {
      const requestData: GenerateQuestionsRequest = await req.json();

      if (!requestData.role || !requestData.interviewType) {
        throw new Error("Role and interview type are required");
      }

      console.log("Generating questions for:", requestData);
      const questions = await generateQuestions(requestData);

      // Create interview session
      const { data: session, error: sessionError } = await supabaseClient
        .from("interview_sessions")
        .insert({
          user_id: user.id,
          role: requestData.role,
          interview_type: requestData.interviewType,
          difficulty: requestData.difficulty || 'intermediate',
          duration_minutes: requestData.numberOfQuestions ? requestData.numberOfQuestions * 5 : 30,
          questions: questions,
          answers: [],
          status: 'in_progress'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      return new Response(
        JSON.stringify({
          success: true,
          sessionId: session.id,
          questions: questions
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Analyze answer
    if (action === "analyze-answer") {
      const requestData: AnalyzeAnswerRequest = await req.json();

      console.log("Analyzing answer for session:", requestData.sessionId);

      const analysis = await analyzeAnswer(
        requestData.question,
        requestData.transcript,
        "",
        ""
      );

      // Update session with answer and score
      const { data: session } = await supabaseClient
        .from("interview_sessions")
        .select("answers, question_scores")
        .eq("id", requestData.sessionId)
        .single();

      const updatedAnswers = [...(session?.answers || [])];
      updatedAnswers[requestData.questionIndex] = {
        questionIndex: requestData.questionIndex,
        transcript: requestData.transcript,
        score: analysis.score,
        feedback: analysis.feedback,
        timestamp: new Date().toISOString()
      };

      const updatedScores = { ...(session?.question_scores || {}) };
      updatedScores[requestData.questionIndex] = analysis.score;

      await supabaseClient
        .from("interview_sessions")
        .update({
          answers: updatedAnswers,
          question_scores: updatedScores
        })
        .eq("id", requestData.sessionId);

      return new Response(
        JSON.stringify({
          success: true,
          analysis: analysis
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Complete session
    if (action === "complete-session") {
      const { sessionId } = await req.json();

      const { data: session } = await supabaseClient
        .from("interview_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (!session) throw new Error("Session not found");

      // Calculate overall score
      const scores = Object.values(session.question_scores || {}) as number[];
      const overallScore = scores.length > 0 
        ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
        : 0;

      // Generate overall feedback
      const allStrengths: string[] = [];
      const allImprovements: string[] = [];
      
      (session.answers || []).forEach((answer: any) => {
        if (answer.strengths) allStrengths.push(...answer.strengths);
        if (answer.improvements) allImprovements.push(...answer.improvements);
      });

      const overallFeedback = [
        `You completed the ${session.interview_type} interview for ${session.role} role.`,
        overallScore >= 80 ? "Excellent performance overall!" : 
        overallScore >= 60 ? "Good performance with room for improvement." :
        "Consider practicing more to improve your interview skills.",
        `Average score: ${overallScore}/100`
      ];

      await supabaseClient
        .from("interview_sessions")
        .update({
          overall_score: overallScore,
          feedback: overallFeedback,
          strengths: [...new Set(allStrengths)].slice(0, 5),
          improvements: [...new Set(allImprovements)].slice(0, 5),
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq("id", sessionId);

      return new Response(
        JSON.stringify({
          success: true,
          overallScore,
          feedback: overallFeedback,
          strengths: [...new Set(allStrengths)].slice(0, 5),
          improvements: [...new Set(allImprovements)].slice(0, 5)
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action specified");

  } catch (error) {
    console.error("Error in conduct-interview function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});