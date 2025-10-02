import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AnalysisResult {
  overall_score: number;
  strengths: string[];
  improvements: string[];
  sections: {
    section_name: string;
    score: number;
    feedback: string;
    suggestions: string[];
  }[];
  detailed_feedback: {
    format: string;
    content: string;
    keywords: string;
    experience: string;
    skills: string;
  };
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

    const { resumeAnalysisId } = await req.json();

    if (!resumeAnalysisId) {
      throw new Error("Resume analysis ID is required");
    }

    await supabaseClient
      .from("resume_analyses")
      .update({ status: "processing" })
      .eq("id", resumeAnalysisId);

    const { data: resumeData, error: fetchError } = await supabaseClient
      .from("resume_analyses")
      .select("*")
      .eq("id", resumeAnalysisId)
      .single();

    if (fetchError || !resumeData) {
      throw new Error("Resume not found");
    }

    let extractedText = resumeData.extracted_text;

    if (!extractedText) {
      const { data: fileData, error: downloadError } =
        await supabaseClient.storage
          .from("resumes")
          .download(resumeData.file_url);

      if (downloadError) {
        throw new Error(`Failed to download file: ${downloadError.message}`);
      }

      extractedText = await extractTextFromFile(fileData, resumeData.file_type);

      await supabaseClient
        .from("resume_analyses")
        .update({ extracted_text: extractedText })
        .eq("id", resumeAnalysisId);
    }

    const analysisPrompt = `You are an expert resume analyst. Analyze this resume and provide ONLY valid JSON output (no markdown, no code blocks).

Resume Content:
${extractedText}

Return ONLY this JSON structure:
{
  "overall_score": 75,
  "strengths": ["Strength 1 with specific example", "Strength 2", "Strength 3", "Strength 4"],
  "improvements": ["Improvement 1 with example", "Improvement 2", "Improvement 3", "Improvement 4"],
  "sections": [
    {
      "section_name": "Format & Design",
      "score": 85,
      "feedback": "Detailed feedback about formatting",
      "suggestions": ["Specific suggestion 1", "Specific suggestion 2"]
    },
    {
      "section_name": "Professional Summary",
      "score": 70,
      "feedback": "Feedback about summary",
      "suggestions": ["Example: Instead of 'Experienced developer' use 'Senior Full-Stack Developer with 5+ years building scalable web applications'"]
    },
    {
      "section_name": "Work Experience",
      "score": 80,
      "feedback": "Feedback about experience",
      "suggestions": ["Example: Change 'Managed team' to 'Led cross-functional team of 8 developers, increasing sprint velocity by 40%'"]
    },
    {
      "section_name": "Skills & Keywords",
      "score": 75,
      "feedback": "Feedback about skills",
      "suggestions": ["Add: React, Node.js, AWS, Docker", "Remove outdated skills like jQuery"]
    },
    {
      "section_name": "Education",
      "score": 90,
      "feedback": "Feedback about education",
      "suggestions": ["Add relevant coursework", "Include GPA if above 3.5"]
    }
  ],
  "detailed_feedback": {
    "format": "Use consistent bullet points: '• Led team' not 'Led team.'",
    "content": "Add STAR method. Example: 'Developed payment system (Situation) reducing checkout time by 50% (Result) using React and Stripe API (Action)'",
    "keywords": "Missing: 'stakeholder management', 'agile', 'CI/CD', 'microservices'",
    "experience": "Quantify everything. Change 'Improved performance' to 'Optimized database queries, reducing load time from 3s to 0.5s'",
    "skills": "Group by category: Technical Skills (Languages, Frameworks), Tools (Git, Docker), Soft Skills (Leadership, Communication)"
  }
}`;

    const aiResponse = await callAIAPI(analysisPrompt);
    const analysisResult: AnalysisResult = parseAIResponse(
      aiResponse,
      extractedText
    );

    await supabaseClient
      .from("resume_analyses")
      .update({
        overall_score: analysisResult.overall_score,
        analysis_data: {
          strengths: analysisResult.strengths,
          improvements: analysisResult.improvements,
          detailed_feedback: analysisResult.detailed_feedback,
        },
        status: "completed",
      })
      .eq("id", resumeAnalysisId);

    const sectionsToInsert = analysisResult.sections.map((section) => ({
      resume_analysis_id: resumeAnalysisId,
      section_name: section.section_name,
      score: section.score,
      feedback: section.feedback,
      suggestions: section.suggestions,
    }));

    await supabaseClient.from("analysis_sections").insert(sectionsToInsert);

    return new Response(
      JSON.stringify({ success: true, data: analysisResult }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error analyzing resume:", error);

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

async function extractTextFromFile(
  file: Blob,
  fileType: string
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  if (fileType === "application/pdf") {
    return await extractPDFText(uint8Array);
  } else if (fileType.includes("word") || fileType.includes("document")) {
    return await extractDOCXText(uint8Array);
  }

  return await file.text();
}

async function extractPDFText(data: Uint8Array): Promise<string> {
  try {
    // Simple PDF text extraction using regex patterns
    const text = new TextDecoder().decode(data);
    const textMatches = text.match(/\(([^)]+)\)/g);

    if (textMatches) {
      return textMatches
        .map((match) => match.slice(1, -1))
        .join(" ")
        .replace(/\\n/g, "\n")
        .replace(/\\/g, "")
        .trim();
    }

    return "Could not extract text from PDF. Please try a different format.";
  } catch (error) {
    console.error("PDF extraction error:", error);
    return "Error extracting PDF text. Please use a text-based PDF or try DOCX format.";
  }
}

async function extractDOCXText(data: Uint8Array): Promise<string> {
  try {
    // Basic DOCX is a ZIP file with XML
    const text = new TextDecoder().decode(data);

    // Try to find text content between XML tags
    const textMatches = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);

    if (textMatches) {
      return textMatches
        .map((match) => match.replace(/<[^>]+>/g, ""))
        .join(" ")
        .trim();
    }

    return "Could not extract text from DOCX. Please try PDF format.";
  } catch (error) {
    console.error("DOCX extraction error:", error);
    return "Error extracting DOCX text. Please try PDF format instead.";
  }
}

function truncate(str: string, max = 1500) {
  return str.length > max ? str.slice(0, max) + "..." : str;
}

async function callAIAPI(prompt: string): Promise<string> {
  const API_URL = "https://creepytech-creepy-ai.hf.space/ai/logic";

  const safePrompt = truncate(prompt, 1500);

  const url = `${API_URL}?q=${encodeURIComponent(safePrompt)}&logic=chat`;

  const response = await fetch(url, { method: "GET" });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status} ${response.statusText}`);
  }

  return await response.text();
}

function parseAIResponse(response: string, resumeText: string): AnalysisResult {
  try {
    // Remove markdown code blocks if present
    let cleanResponse = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "");

    // Try to extract JSON
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Validate the structure
      if (parsed.overall_score && parsed.strengths && parsed.sections) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Parse error:", error);
  }

  // Generate intelligent fallback based on resume content
  const hasExperience =
    resumeText.toLowerCase().includes("experience") ||
    resumeText.toLowerCase().includes("work");
  const hasEducation =
    resumeText.toLowerCase().includes("education") ||
    resumeText.toLowerCase().includes("university");
  const hasSkills =
    resumeText.toLowerCase().includes("skills") ||
    resumeText.toLowerCase().includes("proficient");
  const wordCount = resumeText.split(/\s+/).length;

  const baseScore = Math.min(85, Math.max(50, Math.floor(wordCount / 10)));

  return {
    overall_score: baseScore,
    strengths: [
      hasExperience
        ? "Work experience section is present and structured"
        : "Resume has clear sections",
      hasEducation
        ? "Education credentials are included"
        : "Basic information is provided",
      hasSkills ? "Skills are listed" : "Contact information appears complete",
      wordCount > 200 ? "Resume has substantial content" : "Resume is concise",
    ],
    improvements: [
      "Add quantified achievements. Example: 'Increased sales by 35%' instead of 'Improved sales'",
      "Include industry keywords like 'project management', 'stakeholder engagement', 'data analysis'",
      "Use action verbs. Change 'Was responsible for' to 'Led', 'Developed', 'Implemented'",
      "Add a professional summary at the top highlighting your top 3 achievements",
    ],
    sections: [
      {
        section_name: "Format & Design",
        score: baseScore,
        feedback:
          "Your resume structure is readable. Consider using consistent formatting throughout.",
        suggestions: [
          "Use bullet points consistently: '• Managed team' not just 'Managed team'",
          "Keep margins at 0.75-1 inch for professional appearance",
        ],
      },
      {
        section_name: "Professional Summary",
        score: baseScore - 10,
        feedback: hasExperience
          ? "Summary could be stronger"
          : "Consider adding a professional summary",
        suggestions: [
          "Example: 'Results-driven Marketing Manager with 7+ years growing brand presence and driving 40% revenue increase through data-driven campaigns'",
          "Keep it to 2-3 sentences focusing on your biggest wins",
        ],
      },
      {
        section_name: "Work Experience",
        score: hasExperience ? baseScore + 5 : baseScore - 15,
        feedback: hasExperience
          ? "Experience is present but needs quantification"
          : "Add more detail to work experience",
        suggestions: [
          "Use STAR method: 'Launched new product line (Situation) generating $2M revenue in Q1 (Result) by conducting market research and partnering with sales team (Action)'",
          "Start each bullet with action verbs: Led, Developed, Implemented, Achieved",
        ],
      },
      {
        section_name: "Skills & Keywords",
        score: hasSkills ? baseScore : baseScore - 10,
        feedback:
          "Skills section needs optimization for Applicant Tracking Systems (ATS)",
        suggestions: [
          "Add technical skills relevant to your industry",
          "Include: Python, Excel, Project Management, SQL, Salesforce (adjust based on your field)",
          "Remove outdated skills (e.g., 'Microsoft Office' - assume it)",
        ],
      },
      {
        section_name: "Education",
        score: hasEducation ? baseScore + 10 : baseScore - 5,
        feedback: hasEducation
          ? "Education section is good"
          : "Ensure education details are complete",
        suggestions: [
          "Include graduation year, degree type, and major",
          "Add GPA if it's above 3.5",
          "Include relevant coursework or thesis if applicable",
        ],
      },
    ],
    detailed_feedback: {
      format:
        "Use consistent formatting: same font (Arial or Calibri 10-11pt), consistent spacing between sections, and clear headers.",
      content:
        "Strengthen content with specific examples. Instead of 'Managed projects', write 'Managed 5 concurrent software development projects with $500K budget, delivering all on time and 15% under budget.'",
      keywords:
        "Add these keywords based on common job postings: 'cross-functional collaboration', 'strategic planning', 'process improvement', 'stakeholder management', 'budget optimization'",
      experience:
        "Quantify every achievement. Examples: '↑ team productivity by 30%', 'Reduced costs by $50K annually', 'Trained 25+ employees', 'Achieved 98% customer satisfaction'",
      skills:
        "Organize skills into categories: Technical Skills (Languages, Tools, Software), Professional Skills (Leadership, Communication, Problem-Solving), Certifications (PMP, AWS, Google Analytics)",
    },
  };
}
