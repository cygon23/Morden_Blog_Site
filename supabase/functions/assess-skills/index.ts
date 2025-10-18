import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AssessmentRequest {
  category: string;
  answers: { questionId: string; userAnswer: number }[];
  timeTaken: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { category, answers, timeTaken }: AssessmentRequest =
      await req.json();

    if (!category || !answers || answers.length === 0) {
      throw new Error("Invalid assessment data");
    }

    console.log(
      `Processing assessment for user ${user.id}, category: ${category}`
    );

    // Fetch all questions for validation
    const { data: questions, error: questionsError } = await supabaseClient
      .from("assessment_questions")
      .select("*")
      .in(
        "id",
        answers.map((a) => a.questionId)
      );

    if (questionsError || !questions) {
      throw new Error("Failed to fetch questions");
    }

    // Calculate score
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const detailedAnswers = answers
      .map((answer) => {
        const question = questions.find((q) => q.id === answer.questionId);
        if (!question) return null;

        const isCorrect = answer.userAnswer === question.correct_answer;
        totalPoints += question.points || 1;

        if (isCorrect) {
          correctCount++;
          earnedPoints += question.points || 1;
        }

        return {
          questionId: question.id,
          question: question.question,
          userAnswer: answer.userAnswer,
          correctAnswer: question.correct_answer,
          isCorrect,
          explanation: question.explanation,
          category: question.category,
          difficulty: question.difficulty,
        };
      })
      .filter(Boolean);

    const score = Math.round((earnedPoints / totalPoints) * 100);
    const level =
      score >= 80 ? "Expert" : score >= 60 ? "Intermediate" : "Beginner";

    console.log(`Score calculated: ${score}%, Level: ${level}`);

    // Generate AI-powered personalized feedback
    const aiFeedback = await generateAIFeedback(
      category,
      score,
      level,
      detailedAnswers,
      timeTaken
    );

    // Save assessment result
    const { data: assessmentResult, error: resultError } = await supabaseClient
      .from("assessment_results")
      .insert({
        user_id: user.id,
        category,
        total_questions: answers.length,
        correct_answers: correctCount,
        score,
        level,
        time_taken: timeTaken,
        ai_feedback: aiFeedback,
      })
      .select()
      .single();

    if (resultError || !assessmentResult) {
      throw new Error("Failed to save assessment result");
    }

    // Save individual answers
    const answerRecords = detailedAnswers.map((answer) => ({
      assessment_result_id: assessmentResult.id,
      question_id: answer.questionId,
      user_answer: answer.userAnswer,
      is_correct: answer.isCorrect,
    }));

    const { error: answersError } = await supabaseClient
      .from("assessment_answers")
      .insert(answerRecords);

    if (answersError) {
      console.error("Failed to save answers:", answersError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          score,
          level,
          correctAnswers: correctCount,
          totalQuestions: answers.length,
          feedback: aiFeedback,
          assessmentId: assessmentResult.id,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Assessment error:", error.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to process assessment",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

async function generateAIFeedback(
  category: string,
  score: number,
  level: string,
  detailedAnswers: any[],
  timeTaken: number
): Promise<any> {
  const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

  if (!GROQ_API_KEY) {
    console.warn("GROQ_API_KEY not found, using fallback feedback");
    return generateFallbackFeedback(category, score, level, detailedAnswers);
  }

  try {
    // Analyze answers for patterns
    const wrongAnswers = detailedAnswers.filter((a) => !a.isCorrect);
    const difficultiesWrong = wrongAnswers.map((a) => a.difficulty);
    const categoriesWrong = wrongAnswers.map((a) => a.category);

    const prompt = `You are a professional skills assessment advisor. Analyze this assessment result and provide personalized feedback.

Assessment Details:
- Category: ${category}
- Score: ${score}%
- Level: ${level}
- Total Questions: ${detailedAnswers.length}
- Correct: ${detailedAnswers.filter((a) => a.isCorrect).length}
- Time Taken: ${Math.round(timeTaken / 60)} minutes

Questions Answered Incorrectly:
${wrongAnswers
  .map((a, i) => `${i + 1}. ${a.question} (${a.difficulty} level)`)
  .join("\n")}

Return ONLY valid JSON (no markdown) with this structure:
{
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3", "recommendation4"],
  "summary": "A brief 2-3 sentence personalized summary of their performance"
}

Be specific and actionable. Reference the actual questions they got wrong if relevant.`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are a professional skills assessment advisor. Provide specific, actionable feedback based on test performance. Return only valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.4,
          max_completion_tokens: 1000,
        }),
      }
    );

    if (!response.ok) {
      console.error("Groq API error:", response.status);
      throw new Error("AI feedback generation failed");
    }

    const result = await response.json();
    const aiText = result.choices?.[0]?.message?.content || "";

    // Parse AI response
    const cleanText = aiText
      .trim()
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "");

    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }

    throw new Error("Failed to parse AI response");
  } catch (error) {
    console.error("AI feedback error:", error.message);
    return generateFallbackFeedback(category, score, level, detailedAnswers);
  }
}

function generateFallbackFeedback(
  category: string,
  score: number,
  level: string,
  detailedAnswers: any[]
): any {
  const wrongAnswers = detailedAnswers.filter((a) => !a.isCorrect);
  const correctAnswers = detailedAnswers.filter((a) => a.isCorrect);

  const strengths = [];
  const improvements = [];
  const recommendations = [];

  // Generate strengths
  if (score >= 80) {
    strengths.push(
      `Excellent performance in ${category} with ${score}% accuracy`
    );
    strengths.push("Strong grasp of fundamental concepts");
    strengths.push("Consistently accurate across different difficulty levels");
  } else if (score >= 60) {
    strengths.push(`Solid understanding of ${category} fundamentals`);
    strengths.push("Good performance on core concepts");
    if (correctAnswers.length > 0) {
      strengths.push(
        `Successfully answered ${correctAnswers.length} questions correctly`
      );
    }
  } else {
    strengths.push(`Shows potential in ${category} area`);
    strengths.push("Demonstrates willingness to learn and improve");
    if (correctAnswers.length > 0) {
      strengths.push("Correctly identified some key concepts");
    }
  }

  // Generate improvements
  if (wrongAnswers.length > 0) {
    const difficulties = [...new Set(wrongAnswers.map((a) => a.difficulty))];
    if (difficulties.includes("expert")) {
      improvements.push("Focus on advanced concepts and expert-level topics");
    }
    if (difficulties.includes("intermediate")) {
      improvements.push(
        "Strengthen understanding of intermediate-level concepts"
      );
    }
    if (difficulties.includes("beginner")) {
      improvements.push("Review fundamental concepts and basic principles");
    }
  }

  improvements.push(`Practice more questions in the ${category} category`);
  improvements.push("Review incorrect answers and understand the reasoning");

  // Generate recommendations
  if (score < 60) {
    recommendations.push(
      `Take foundational courses in ${category} to build core knowledge`
    );
    recommendations.push(
      "Practice with beginner-level questions before moving to advanced topics"
    );
  } else if (score < 80) {
    recommendations.push(
      `Take intermediate-level courses to strengthen your ${category} skills`
    );
    recommendations.push("Work on practical projects to apply your knowledge");
  } else {
    recommendations.push(`Consider advanced certifications in ${category}`);
    recommendations.push("Mentor others to reinforce your expertise");
  }

  recommendations.push(
    "Retake the assessment in 2-4 weeks to track improvement"
  );
  recommendations.push(`Join professional communities focused on ${category}`);

  const summary =
    score >= 80
      ? `Excellent work! You've demonstrated strong mastery of ${category} skills with a ${score}% score. You're at an ${level} level and ready for advanced challenges.`
      : score >= 60
      ? `Good performance! You've shown solid understanding of ${category} with a ${score}% score. Focus on the areas where you struggled to reach expert level.`
      : `You're building a foundation in ${category} with a ${score}% score. Review the fundamentals and practice regularly to improve your skills.`;

  return {
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
    recommendations: recommendations.slice(0, 4),
    summary,
  };
}
