import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SalaryRequest {
  jobTitle: string;
  location: string;
  yearsExperience: number;
  education?: string;
  industry: string;
  companySize?: string;
  skills?: string;
}

interface SalaryFactor {
  name: string;
  impact: string;
  value: string;
}

interface AISalaryResponse {
  medianSalary: number;
  salaryRange: { min: number; max: number };
  percentiles: { p25: number; p50: number; p75: number };
  factors: SalaryFactor[];
  trends: {
    growth: string;
    demand: string;
    outlook: string;
  };
  insights: string;
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
            content: `You are an expert salary analyst and compensation consultant. Provide realistic salary estimates based on market data. Always respond with valid JSON only, no additional text.

Format your response as JSON with this exact structure:
{
  "medianSalary": 85000,
  "salaryRange": {
    "min": 70000,
    "max": 110000
  },
  "percentiles": {
    "p25": 75000,
    "p50": 85000,
    "p75": 95000
  },
  "factors": [
    {
      "name": "Factor name",
      "impact": "+X%",
      "value": "Description"
    }
  ],
  "trends": {
    "growth": "+X%",
    "demand": "High/Medium/Low",
    "outlook": "Growing/Stable/Declining"
  },
  "insights": "2-3 sentences of personalized career advice and salary negotiation tips"
}

Requirements:
- Provide realistic salary ranges based on 2024-2025 market data
- Consider location cost of living adjustments
- Factor in experience level appropriately
- Include 4-6 relevant salary factors
- Provide actionable insights for salary negotiation
- Be conservative with estimates if unsure
- Use USD currency for all amounts`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 1500,
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

function generatePrompt(request: SalaryRequest): string {
  return `Analyze and provide a comprehensive salary estimate for the following position:

Job Details:
- Job Title: ${request.jobTitle}
- Location: ${request.location}
- Years of Experience: ${request.yearsExperience} years
- Education: ${request.education || "Bachelor's degree (assumed)"}
- Industry: ${request.industry}
- Company Size: ${request.companySize || "Not specified"}
- Key Skills: ${request.skills || "Not specified"}

Provide:
1. Realistic median salary for this exact role and location
2. Salary range (min to max) based on experience and qualifications
3. Percentile breakdown (25th, 50th, 75th)
4. 4-6 key factors affecting this salary (experience, location, education, industry, skills, company size)
5. Market trends (growth rate, job demand, future outlook)
6. Personalized insights for salary negotiation and career growth

Consider:
- Cost of living for ${request.location}
- Current market conditions in ${request.industry}
- Experience level impact (${request.yearsExperience} years)
- Industry-specific compensation patterns

Respond ONLY with valid JSON in the format specified in your system prompt.`;
}

function generateFallbackSalary(request: SalaryRequest): AISalaryResponse {
  const baseRanges: Record<string, { min: number; max: number }> = {
    "software engineer": { min: 70000, max: 150000 },
    "product manager": { min: 80000, max: 180000 },
    "data scientist": { min: 75000, max: 160000 },
    designer: { min: 60000, max: 130000 },
    "marketing manager": { min: 55000, max: 120000 },
    "sales manager": { min: 50000, max: 140000 },
  };

  const jobLower = request.jobTitle.toLowerCase();
  let baseRange = { min: 45000, max: 100000 };

  for (const [key, range] of Object.entries(baseRanges)) {
    if (jobLower.includes(key)) {
      baseRange = range;
      break;
    }
  }

  const experienceMultiplier = 1 + Math.min(request.yearsExperience, 15) * 0.04;
  const locationMultiplier =
    request.location.toLowerCase() === "remote" ? 1.0 : 1.1;
  const multiplier = experienceMultiplier * locationMultiplier;

  const min = Math.round(baseRange.min * multiplier);
  const max = Math.round(baseRange.max * multiplier);
  const median = Math.round((min + max) / 2);

  return {
    medianSalary: median,
    salaryRange: { min, max },
    percentiles: {
      p25: Math.round(min * 1.1),
      p50: median,
      p75: Math.round(max * 0.9),
    },
    factors: [
      {
        name: "Experience Level",
        impact: `+${Math.round((experienceMultiplier - 1) * 100)}%`,
        value: `${request.yearsExperience} years`,
      },
      {
        name: "Location",
        impact: request.location.toLowerCase() === "remote" ? "Base" : "+10%",
        value: request.location,
      },
      {
        name: "Industry",
        impact: "+8%",
        value: request.industry,
      },
      {
        name: "Education",
        impact:
          request.education === "Masters" || request.education === "PhD"
            ? "+12%"
            : "+5%",
        value: request.education || "Bachelor's",
      },
    ],
    trends: {
      growth: "+5-7%",
      demand: "Moderate",
      outlook: "Stable",
    },
    insights: `Based on ${request.yearsExperience} years of experience in ${request.industry}, you're positioned in a competitive salary range. Consider highlighting your specialized skills during negotiations, and research company-specific compensation packages for better insights.`,
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

    const requestData: SalaryRequest = await req.json();

    if (
      !requestData.jobTitle ||
      !requestData.location ||
      !requestData.industry
    ) {
      throw new Error("Job title, location, and industry are required");
    }

    console.log("Calculating salary for user:", user.id);

    let salaryResult: AISalaryResponse;
    let usedFallback = false;

    try {
      const prompt = generatePrompt(requestData);
      console.log("Calling Groq API for salary calculation...");

      const aiResponse = await callGroqAPI(prompt);
      console.log("Groq API response received");

      const cleanedResponse = aiResponse
        .trim()
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      salaryResult = JSON.parse(cleanedResponse);

      if (
        !salaryResult.medianSalary ||
        !salaryResult.salaryRange ||
        !salaryResult.percentiles
      ) {
        throw new Error("Invalid AI response structure");
      }
    } catch (aiError) {
      console.error("AI calculation failed, using fallback:", aiError);
      salaryResult = generateFallbackSalary(requestData);
      usedFallback = true;
    }

    const { data: savedCalculation, error: insertError } = await supabaseClient
      .from("salary_calculations")
      .insert({
        user_id: user.id,
        job_title: requestData.jobTitle,
        location: requestData.location,
        years_experience: requestData.yearsExperience,
        education: requestData.education,
        industry: requestData.industry,
        company_size: requestData.companySize,
        skills: requestData.skills,
        median_salary: salaryResult.medianSalary,
        salary_range: salaryResult.salaryRange,
        percentiles: salaryResult.percentiles,
        factors: salaryResult.factors,
        trends: salaryResult.trends,
        ai_insights: salaryResult.insights,
        status: "completed",
        used_fallback: usedFallback,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw insertError;
    }

    console.log("Salary calculation saved successfully");

    return new Response(
      JSON.stringify({
        success: true,
        data: savedCalculation,
        usedFallback,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in calculate-salary function:", error);

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
