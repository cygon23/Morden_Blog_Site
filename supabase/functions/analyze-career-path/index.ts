import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CareerPathRequest {
  currentRole: string;
  yearsExperience?: string;
  targetRole: string;
  industry?: string;
  location?: string;
  currentSkills: string[];
  careerInterests: string[];
}

interface CareerStep {
  title: string;
  timeframe: string;
  requirements: string[];
  skills: string[];
  salary: string;
  completed: boolean;
}

interface AICareerPathResponse {
  timeline: string;
  steps: CareerStep[];
  recommendations: string[];
}

async function callGroqAPI(prompt: string): Promise<string> {
  const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not configured");
  }

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
            content: `You are an expert career advisor and analyst. Generate detailed, realistic career paths based on user input. Always respond with valid JSON only, no additional text.

Format your response as JSON with this exact structure:
{
  "timeline": "X-Y months",
  "steps": [
    {
      "title": "Phase Name",
      "timeframe": "X-Y months",
      "requirements": ["requirement 1", "requirement 2", "requirement 3"],
      "skills": ["skill 1", "skill 2", "skill 3"],
      "salary": "$XX,000 - $YY,000",
      "completed": false
    }
  ],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3", "recommendation 4", "recommendation 5"]
}

Requirements:
- Provide 3-4 realistic career steps
- Include specific, actionable requirements for each step
- List relevant skills needed for each phase
- Provide realistic salary ranges based on market data
- Give 5-7 personalized, actionable recommendations
- Base timeline on experience level and role transition difficulty
- Consider industry standards and typical career progression paths`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Groq API error: ${response.status}, ${errorData}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function generatePrompt(request: CareerPathRequest): string {
  return `Analyze this career transition and create a detailed career path:

Current Situation:
- Current Role: ${request.currentRole}
- Years of Experience: ${request.yearsExperience || "Not specified"}
- Target Role: ${request.targetRole}
- Industry: ${request.industry || "Not specified"}
- Location: ${request.location || "Not specified"}
- Current Skills: ${
    request.currentSkills.length > 0
      ? request.currentSkills.join(", ")
      : "Not specified"
  }
- Career Interests: ${
    request.careerInterests.length > 0
      ? request.careerInterests.join(", ")
      : "Not specified"
  }

Create a realistic, step-by-step career path from ${request.currentRole} to ${
    request.targetRole
  }. 
Include:
1. Estimated total timeline
2. 3-4 progressive career steps with specific timeframes
3. Requirements and actions for each step
4. Key skills to develop at each stage
5. Expected salary ranges for each level
6. Personalized recommendations based on their skills and interests

Respond ONLY with valid JSON in the format specified in your system prompt.`;
}

function generateFallbackPath(
  request: CareerPathRequest
): AICareerPathResponse {
  const experienceYears = request.yearsExperience || "2-3";
  const isJuniorToMid =
    experienceYears.includes("0-1") || experienceYears.includes("2-3");
  const timeline = isJuniorToMid ? "18-24 months" : "12-18 months";

  return {
    timeline,
    steps: [
      {
        title: "Foundation & Skill Development",
        timeframe: "0-6 months",
        requirements: [
          `Master core competencies required for ${request.targetRole}`,
          "Complete relevant certifications or courses",
          "Build portfolio projects demonstrating new skills",
          "Network with professionals in target role",
        ],
        skills: request.currentSkills
          .slice(0, 3)
          .concat(["Problem Solving", "Communication"]),
        salary: "$60,000 - $80,000",
        completed: false,
      },
      {
        title: "Intermediate Growth",
        timeframe: "6-12 months",
        requirements: [
          "Take on projects with increased responsibility",
          "Seek mentorship from senior professionals",
          "Develop leadership and collaboration skills",
          "Contribute to team initiatives and improvements",
        ],
        skills: ["Leadership", "Project Management", "Technical Expertise"],
        salary: "$75,000 - $95,000",
        completed: false,
      },
      {
        title: "Advanced Preparation",
        timeframe: "12-18 months",
        requirements: [
          `Demonstrate proficiency in ${request.targetRole} responsibilities`,
          "Lead significant projects or initiatives",
          "Build cross-functional relationships",
          "Pursue advanced certifications if applicable",
        ],
        skills: [
          "Strategic Thinking",
          "Advanced Technical Skills",
          "Team Leadership",
        ],
        salary: "$90,000 - $120,000",
        completed: false,
      },
    ],
    recommendations: [
      `Focus on developing skills specific to ${request.targetRole}`,
      "Build a strong professional network in your target field",
      "Seek opportunities to demonstrate leadership potential",
      "Keep learning through courses, workshops, and conferences",
      "Document your achievements and build a compelling portfolio",
    ],
  };
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

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const requestData: CareerPathRequest = await req.json();

    if (!requestData.currentRole || !requestData.targetRole) {
      throw new Error("Current role and target role are required");
    }

    console.log("Analyzing career path for user:", user.id);

    let analysisResult: AICareerPathResponse;
    let usedFallback = false;

    try {
      const prompt = generatePrompt(requestData);
      console.log("Calling Groq API for career analysis...");

      const aiResponse = await callGroqAPI(prompt);
      console.log("Groq API response received");

      const cleanedResponse = aiResponse
        .trim()
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      analysisResult = JSON.parse(cleanedResponse);

      if (
        !analysisResult.timeline ||
        !analysisResult.steps ||
        !analysisResult.recommendations
      ) {
        throw new Error("Invalid AI response structure");
      }

      analysisResult.steps = analysisResult.steps.map((step) => ({
        ...step,
        completed: false,
      }));
    } catch (aiError) {
      console.error("AI analysis failed, using fallback:", aiError);
      analysisResult = generateFallbackPath(requestData);
      usedFallback = true;
    }

    const { data: savedAnalysis, error: insertError } = await supabaseClient
      .from("career_path_analyses")
      .insert({
        user_id: user.id,
        role: requestData.currentRole,
        years_experience: requestData.yearsExperience,
        target_role: requestData.targetRole,
        industry: requestData.industry,
        location: requestData.location,
        current_skills: requestData.currentSkills,
        career_interests: requestData.careerInterests,
        estimated_timeline: analysisResult.timeline,
        total_steps: analysisResult.steps.length,
        career_steps: analysisResult.steps,
        recommendations: analysisResult.recommendations,
        status: "completed",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw insertError;
    }

    console.log("Career path analysis saved successfully");

    return new Response(
      JSON.stringify({
        success: true,
        data: savedAnalysis,
        usedFallback,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-career-path function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
