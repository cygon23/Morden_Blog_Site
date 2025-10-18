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
      console.log("Extracting text from file:", resumeData.file_type);

      // For PDFs, use OCR.space API directly with the file URL
      if (resumeData.file_type === "application/pdf") {
        try {
          console.log("Attempting OCR extraction...");
          extractedText = await extractPDFTextWithOCR(
            resumeData.file_url,
            supabaseClient
          );
          console.log("OCR extraction succeeded");
        } catch (ocrError) {
          console.error(
            "OCR extraction failed, trying fallback:",
            ocrError.message
          );

          // Fallback to basic extraction if OCR fails
          try {
            console.log("Downloading file for fallback extraction...");
            const { data: fileData, error: downloadError } =
              await supabaseClient.storage
                .from("resumes")
                .download(resumeData.file_url);

            if (downloadError) {
              throw new Error(
                `Failed to download file: ${downloadError.message}`
              );
            }

            const arrayBuffer = await fileData.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            extractedText = await extractPDFText(uint8Array);

            if (!extractedText || extractedText.length < 30) {
              throw new Error(
                "Could not extract text from PDF using any method. The file may be image-based, corrupted, or in an unsupported format. Please try: 1) Converting to a text-based PDF, or 2) Uploading in DOCX format."
              );
            }

            console.log("Fallback extraction succeeded");
          } catch (fallbackError) {
            console.error(
              "Fallback extraction also failed:",
              fallbackError.message
            );
            throw new Error(
              `Failed to extract text from PDF: ${fallbackError.message}`
            );
          }
        }
      } else {
        // For non-PDF files (DOCX, etc.), download and extract normally
        const { data: fileData, error: downloadError } =
          await supabaseClient.storage
            .from("resumes")
            .download(resumeData.file_url);

        if (downloadError) {
          throw new Error(`Failed to download file: ${downloadError.message}`);
        }

        extractedText = await extractTextFromFile(
          fileData,
          resumeData.file_type
        );
      }

      // Check if extraction produced valid text
      if (!extractedText || extractedText.trim().length < 20) {
        await supabaseClient
          .from("resume_analyses")
          .update({
            status: "failed",
            error_message: "Text extraction failed",
          })
          .eq("id", resumeAnalysisId);

        throw new Error(
          "Could not extract sufficient text from the file. Please ensure your file is not corrupted and try again."
        );
      }

      // Save extracted text
      await supabaseClient
        .from("resume_analyses")
        .update({ extracted_text: extractedText })
        .eq("id", resumeAnalysisId);
    }

    console.log("Extracted text length:", extractedText?.length || 0);
    console.log("First 300 characters:", extractedText?.substring(0, 300));

    // Validate if the document is actually a resume
    const isValidResume = validateResumeContent(extractedText);

    if (!isValidResume.valid) {
      await supabaseClient
        .from("resume_analyses")
        .update({
          status: "failed",
          analysis_data: { error: isValidResume.reason },
        })
        .eq("id", resumeAnalysisId);

      throw new Error(isValidResume.reason);
    }

    // Intelligently truncate resume text for API
    const truncatedText = intelligentTruncate(extractedText, 1200);
    console.log("Truncated text length:", truncatedText.length);

    // Create a concise, optimized prompt
    const analysisPrompt = `Analyze this resume. Return ONLY valid JSON (no markdown).

Resume:
${truncatedText}

JSON format:
{"overall_score":75,"strengths":["str1","str2","str3","str4"],"improvements":["imp1","imp2","imp3","imp4"],"sections":[{"section_name":"Format & Design","score":85,"feedback":"text","suggestions":["sug1","sug2"]},{"section_name":"Professional Summary","score":70,"feedback":"text","suggestions":["sug1","sug2"]},{"section_name":"Work Experience","score":80,"feedback":"text","suggestions":["sug1","sug2"]},{"section_name":"Skills & Keywords","score":75,"feedback":"text","suggestions":["sug1","sug2"]},{"section_name":"Education","score":90,"feedback":"text","suggestions":["sug1","sug2"]}],"detailed_feedback":{"format":"advice","content":"advice","keywords":"advice","experience":"advice","skills":"advice"}}

Score 0-100. Be specific.`;

    console.log("Calling AI API...");

    let aiResponse = "";
    let usingFallback = false;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries && !usingFallback) {
      try {
        console.log(`AI API attempt ${retryCount + 1}/${maxRetries + 1}`);
        aiResponse = await callAIAPI(analysisPrompt);
        console.log("AI Response received:", aiResponse.substring(0, 200));
        break; // Success, exit loop
      } catch (error) {
        console.error(
          `AI API attempt ${retryCount + 1} failed:`,
          error.message
        );
        retryCount++;

        if (retryCount > maxRetries) {
          console.log("All AI API attempts failed, using intelligent fallback");
          usingFallback = true;
          aiResponse = "";
        } else {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          );
        }
      }
    }

    const analysisResult: AnalysisResult = parseAIResponse(
      aiResponse,
      extractedText,
      usingFallback
    );

    console.log(
      "Analysis complete. Score:",
      analysisResult.overall_score,
      "Using fallback:",
      usingFallback
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
    // Map technical errors to user-friendly messages
    let userMessage =
      "Unable to analyze this document. Please ensure you've uploaded a valid resume or CV.";

    const errorMsg = error.message || "";

    // Categorize errors for user-friendly responses
    if (errorMsg.includes("words") || errorMsg.includes("too short")) {
      userMessage =
        "This document appears too short to be a resume. Please upload a complete resume or CV.";
    } else if (
      errorMsg.includes("missing key resume sections") ||
      errorMsg.includes("doesn't contain typical resume elements")
    ) {
      userMessage =
        "This doesn't appear to be a resume. Please upload a valid resume or CV document.";
    } else if (errorMsg.includes("appears to be a")) {
      userMessage =
        "Invalid document type detected. Please upload your resume or CV only.";
    } else if (errorMsg.includes("contact information")) {
      userMessage =
        "This document is missing essential resume information. Please upload a complete resume.";
    } else if (
      errorMsg.includes("text extraction") ||
      errorMsg.includes("scanned images") ||
      errorMsg.includes("image-based")
    ) {
      userMessage =
        "Unable to read this PDF. Please try a text-based PDF or upload a DOCX file instead.";
    } else if (errorMsg.includes("Unauthorized")) {
      userMessage = "Authentication required. Please sign in and try again.";
    } else if (errorMsg.includes("Resume not found")) {
      userMessage = "File not found. Please try uploading again.";
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: userMessage,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
});

// Validate if the uploaded document is actually a resume
function validateResumeContent(text: string): {
  valid: boolean;
  reason?: string;
} {
  if (!text || text.trim().length === 0) {
    return {
      valid: false,
      reason:
        "No text could be extracted from the document. Please ensure your PDF is not image-based or try DOCX format.",
    };
  }

  const normalizedText = text.toLowerCase();
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const wordCount = words.length;

  console.log("=== Resume Validation ===");
  console.log("Word count:", wordCount);
  console.log("Character count:", text.length);
  console.log("Sample text (first 300 chars):", text.substring(0, 300));

  // Minimum content check
  if (wordCount < 20) {
    return {
      valid: false,
      reason: `Extracted text is too short (${wordCount} words). Please ensure your PDF contains selectable text, not scanned images. Try saving your resume as a new PDF or use DOCX format.`,
    };
  }

  // STRICT: Check for obvious non-resume patterns FIRST (before checking resume indicators)
  const nonResumePatterns = [
    {
      pattern: /invoice|bill|receipt|payment due|total amount|invoice number/i,
      type: "invoice",
    },
    {
      pattern: /chapter \d+|table of contents|bibliography|appendix|preface/i,
      type: "book/document",
    },
    {
      pattern: /lorem ipsum|sample text|placeholder text|dummy text/i,
      type: "placeholder",
    },
    { pattern: /test (document|file|data|page)/i, type: "test file" },
    {
      pattern: /purchase order|shipping address|order number|tracking number/i,
      type: "order",
    },
    {
      pattern:
        /agreement|contract|terms and conditions|whereas|party of the first part/i,
      type: "legal document",
    },
    {
      pattern: /prescription|diagnosis|patient|medical record|symptoms/i,
      type: "medical document",
    },
    {
      pattern:
        /abstract|introduction|methodology|conclusion|references|journal/i,
      type: "research paper",
    },
    {
      pattern: /agenda|minutes|meeting notes|attendees|action items/i,
      type: "meeting notes",
    },
    {
      pattern: /balance sheet|income statement|cash flow|assets|liabilities/i,
      type: "financial statement",
    },
  ];

  for (const { pattern, type } of nonResumePatterns) {
    if (pattern.test(text)) {
      console.log("Rejected: matched non-resume pattern:", type);
      return {
        valid: false,
        reason: `The uploaded document appears to be a ${type}, not a resume. Please upload a valid resume/CV.`,
      };
    }
  }

  // STRICT: Must have MULTIPLE resume section headers
  const criticalSections = {
    experience:
      /(work\s+)?experience|employment(\s+history)?|professional\s+background/i.test(
        text
      ),
    education: /education(al\s+background)?|academic|qualifications/i.test(
      text
    ),
    skills:
      /skills|competencies|expertise|technical\s+skills|proficiencies/i.test(
        text
      ),
    contact: /@|email|phone|linkedin|contact|mobile|\+\d{1,3}[\s-]?\d/i.test(
      text
    ),
    summary: /summary|objective|profile|about\s+me/i.test(text),
  };

  const sectionsFound = Object.entries(criticalSections)
    .filter(([_, found]) => found)
    .map(([name]) => name);
  console.log("Critical sections found:", sectionsFound);

  // MUST have at least 2 of these: experience, education, skills
  const hasWorkSection = criticalSections.experience;
  const hasEducationSection = criticalSections.education;
  const hasSkillsSection = criticalSections.skills;

  const coreResumeSections = [
    hasWorkSection,
    hasEducationSection,
    hasSkillsSection,
  ].filter(Boolean).length;

  if (coreResumeSections < 2) {
    return {
      valid: false,
      reason:
        "This document is missing key resume sections. A valid resume must include at least 2 of: Work Experience, Education, or Skills sections.",
    };
  }

  // Check for resume-specific terminology (job titles, action verbs, etc.)
  const resumeSpecificTerms = [
    // Job titles/roles
    /\b(intern|analyst|developer|engineer|manager|coordinator|specialist|consultant|assistant|director|senior|junior|lead|designer|architect|administrator|officer|executive|supervisor)\b/i,

    // Action verbs commonly in resumes
    /\b(managed|led|developed|designed|implemented|created|improved|increased|reduced|achieved|delivered|coordinated|analyzed|established|launched|optimized|streamlined|facilitated|executed|spearheaded)\b/i,

    // Education indicators
    /\b(bachelor|master|phd|degree|university|college|diploma|certification|gpa|graduated|major)\b/i,

    // Date ranges (work experience dates)
    /\b(20\d{2}\s*[-–—]\s*(20\d{2}|present|current)|\d{1,2}\/\d{4})/i,
  ];

  const resumeTermsFound = resumeSpecificTerms.filter((pattern) =>
    pattern.test(text)
  ).length;
  console.log("Resume-specific terms matched:", resumeTermsFound);

  if (resumeTermsFound < 2) {
    return {
      valid: false,
      reason:
        "This document doesn't contain typical resume elements (job titles, work history, or education credentials). Please upload a valid resume/CV.",
    };
  }

  // Check contact information patterns
  const hasEmail = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone =
    /(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}|\+?\d{10,}/.test(
      text
    );
  const hasLinkedIn = /linkedin\.com|linkedin/i.test(text);

  const contactMethods = [hasEmail, hasPhone, hasLinkedIn].filter(
    Boolean
  ).length;
  console.log("Contact methods found:", contactMethods, {
    hasEmail,
    hasPhone,
    hasLinkedIn,
  });

  // A resume should have at least 1 contact method
  if (contactMethods === 0) {
    return {
      valid: false,
      reason:
        "This document is missing contact information (email, phone, or LinkedIn). Please upload a complete resume/CV.",
    };
  }

  console.log("=== Validation PASSED ===");
  console.log(
    "Core sections:",
    coreResumeSections,
    "Resume terms:",
    resumeTermsFound,
    "Contact:",
    contactMethods
  );
  return { valid: true };
}

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

async function extractPDFTextWithOCR(
  fileUrl: string,
  supabaseClient: any
): Promise<string> {
  try {
    const ocrApiKey = Deno.env.get("OCR_SPACE_API_KEY");

    if (!ocrApiKey) {
      console.error("OCR_SPACE_API_KEY not found in environment");
      throw new Error("OCR service not configured");
    }

    // Create a signed URL that's valid for 10 minutes
    const { data: signedUrlData, error: signedUrlError } =
      await supabaseClient.storage
        .from("resumes")
        .createSignedUrl(fileUrl, 600); // 600 seconds = 10 minutes

    if (signedUrlError || !signedUrlData) {
      console.error("Failed to create signed URL:", signedUrlError);
      throw new Error("Failed to create temporary file access");
    }

    console.log("Created signed URL for OCR processing");
    console.log("Calling OCR.space API...");

    // Call OCR.space API with GET request and timeout
    const ocrUrl = `https://api.ocr.space/parse/imageurl?apikey=${ocrApiKey}&url=${encodeURIComponent(
      signedUrlData.signedUrl
    )}&filetype=PDF&language=eng&isOverlayRequired=false&detectOrientation=true&scale=true&OCREngine=2`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

    try {
      const ocrResponse = await fetch(ocrUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!ocrResponse.ok) {
        console.error(
          `OCR API error: ${ocrResponse.status} ${ocrResponse.statusText}`
        );
        const errorText = await ocrResponse.text();
        console.error("OCR error response:", errorText);
        throw new Error(`OCR service returned status ${ocrResponse.status}`);
      }

      const ocrResult = await ocrResponse.json();
      console.log("OCR API response received");

      // Check if OCR was successful
      if (ocrResult.IsErroredOnProcessing) {
        console.error("OCR processing error:", ocrResult.ErrorMessage);
        throw new Error(
          `OCR failed: ${ocrResult.ErrorMessage || "Unknown error"}`
        );
      }

      if (!ocrResult.ParsedResults || ocrResult.ParsedResults.length === 0) {
        console.error("No text extracted from OCR");
        throw new Error("No text could be extracted from the PDF");
      }

      // Extract text from all pages
      const extractedText = ocrResult.ParsedResults.map(
        (result: any) => result.ParsedText || ""
      )
        .join("\n\n")
        .trim();

      console.log("OCR extraction successful. Length:", extractedText.length);
      console.log("First 300 chars:", extractedText.substring(0, 300));

      if (extractedText.length < 30) {
        throw new Error(
          "OCR extracted insufficient text. The PDF might be blank or corrupted."
        );
      }

      return extractedText;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        console.error("OCR request timed out");
        throw new Error(
          "OCR processing timed out. Please try a smaller PDF or DOCX format."
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("OCR extraction failed:", error.message);
    throw error;
  }
}

async function extractPDFText(data: Uint8Array): Promise<string> {
  // This is now just a fallback/backup method
  // The main extraction will use OCR
  try {
    // Try multiple encodings
    let text = "";
    try {
      text = new TextDecoder("utf-8").decode(data);
    } catch {
      text = new TextDecoder("latin1").decode(data);
    }

    console.log("PDF raw data length:", data.length);

    let extractedText = "";
    const extractedParts: string[] = [];

    // Extract text between parentheses (most reliable for text-based PDFs)
    const parenthesesRegex = /\(([^)]*)\)/g;
    let match;
    while ((match = parenthesesRegex.exec(text)) !== null) {
      if (match[1] && match[1].length > 0) {
        let cleaned = match[1]
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "\n")
          .replace(/\\t/g, " ")
          .replace(/\\\(/g, "(")
          .replace(/\\\)/g, ")")
          .replace(/\\\\/g, "\\")
          .replace(/\\(\d{3})/g, (_, oct) =>
            String.fromCharCode(parseInt(oct, 8))
          )
          .trim();

        if (cleaned.length > 0) {
          extractedParts.push(cleaned);
        }
      }
    }

    if (extractedParts.length > 0) {
      extractedText = extractedParts.join(" ");
    }

    // Clean up the final extracted text
    extractedText = extractedText
      .replace(/\s+/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .trim();

    console.log("Fallback extraction result length:", extractedText.length);

    return extractedText;
  } catch (error) {
    console.error("Fallback PDF extraction error:", error);
    return "";
  }
}

async function extractDOCXText(data: Uint8Array): Promise<string> {
  try {
    const text = new TextDecoder().decode(data);
    const textMatches = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
    if (textMatches) {
      return textMatches
        .map((match) => match.replace(/<[^>]+>/g, ""))
        .join(" ")
        .trim();
    }
    return "Could not extract text from DOCX. Please try PDF format.";
  } catch (error) {
    return "Error extracting DOCX text. Please try PDF format instead.";
  }
}

function truncate(str: string, max = 1500) {
  return str.length > max ? str.slice(0, max) + "..." : str;
}

// Intelligently truncate resume to keep important sections
function intelligentTruncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }

  // Try to preserve key sections
  const sections = {
    summary: text.match(/(summary|objective|profile)[\s\S]{0,300}/i)?.[0] || "",
    experience:
      text.match(/(experience|work|employment)[\s\S]{0,400}/i)?.[0] || "",
    education: text.match(/(education|academic)[\s\S]{0,200}/i)?.[0] || "",
    skills:
      text.match(/(skills|competencies|expertise)[\s\S]{0,200}/i)?.[0] || "",
  };

  let combined = Object.values(sections)
    .filter((s) => s)
    .join(" ");

  if (combined.length > maxChars) {
    combined = combined.slice(0, maxChars);
  } else if (combined.length < maxChars * 0.5) {
    // If we didn't capture enough, just take the beginning
    combined = text.slice(0, maxChars);
  }

  return combined.trim();
}


// Replace the callAIAPI function with this GROQ-compatible version

async function callAIAPI(prompt: string): Promise<string> {
  const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

  if (!GROQ_API_KEY) {
    console.error("GROQ_API_KEY not found");
    throw new Error("AI service not configured");
  }

  // Groq uses OpenAI-compatible endpoint
  const API_URL = "https://api.groq.com/openai/v1/chat/completions";

  const systemMessage = `You are a professional resume analyzer. Analyze the resume and return ONLY valid JSON with no markdown formatting, no code blocks, and no additional text.

Your response must be a valid JSON object with this exact structure:
{
  "overall_score": 75,
  "strengths": ["strength1", "strength2", "strength3", "strength4"],
  "improvements": ["improvement1", "improvement2", "improvement3", "improvement4"],
  "sections": [
    {"section_name": "Format & Design", "score": 80, "feedback": "specific feedback text", "suggestions": ["suggestion1", "suggestion2"]},
    {"section_name": "Professional Summary", "score": 70, "feedback": "specific feedback text", "suggestions": ["suggestion1", "suggestion2"]},
    {"section_name": "Work Experience", "score": 75, "feedback": "specific feedback text", "suggestions": ["suggestion1", "suggestion2"]},
    {"section_name": "Skills & Keywords", "score": 72, "feedback": "specific feedback text", "suggestions": ["suggestion1", "suggestion2"]},
    {"section_name": "Education", "score": 85, "feedback": "specific feedback text", "suggestions": ["suggestion1", "suggestion2"]}
  ],
  "detailed_feedback": {
    "format": "specific advice on formatting",
    "content": "specific advice on content quality",
    "keywords": "specific advice on keywords and ATS optimization",
    "experience": "specific advice on experience section",
    "skills": "specific advice on skills section"
  }
}

Provide specific, actionable feedback. Scores should be realistic (0-100). Return ONLY the JSON object.`;

  try {
    console.log("Calling Groq API...");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Fast and powerful model for analysis
        messages: [
          {
            role: "system",
            content: systemMessage,
          },
          {
            role: "user",
            content: `Resume to analyze:\n\n${prompt}`,
          },
        ],
        temperature: 0.3, // Lower for more consistent analysis
        max_completion_tokens: 2000,
        top_p: 0.9,
        stream: false,
      }),
    });

    console.log("Groq API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error details:", errorText);

      try {
        const errorJson = JSON.parse(errorText);
        console.error(
          "Error:",
          errorJson.error?.message || errorJson.error || errorText
        );
      } catch {
        console.error("Raw error:", errorText);
      }

      throw new Error(`Groq API error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Groq API response received");

    // Extract the assistant's message (OpenAI-compatible format)
    if (result.choices && result.choices.length > 0) {
      const generatedText = result.choices[0].message?.content || "";

      if (!generatedText) {
        console.error("No content in Groq response");
        throw new Error("Empty response from Groq API");
      }

      console.log("Generated text preview:", generatedText.substring(0, 200));
      return generatedText;
    } else {
      console.error(
        "Unexpected Groq response structure:",
        JSON.stringify(result)
      );
      throw new Error("Invalid response format from Groq API");
    }
  } catch (error) {
    console.error("Groq API call failed:", error.message);
    throw error;
  }
}

function parseAIResponse(
  response: string,
  resumeText: string,
  forceFallback = false
): AnalysisResult {
  if (!forceFallback) {
    console.log("Attempting to parse AI response...");

    try {
      // Clean the response more aggressively
      let cleanResponse = response
        .trim()
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .replace(/^[^{]*/, "") // Remove anything before first {
        .replace(/[^}]*$/, ""); // Remove anything after last }

      // Try to find and extract JSON
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Validate that we have the required fields
        if (
          typeof parsed.overall_score === "number" &&
          Array.isArray(parsed.strengths) &&
          Array.isArray(parsed.improvements) &&
          Array.isArray(parsed.sections) &&
          parsed.sections.length >= 3 &&
          parsed.detailed_feedback
        ) {
          console.log("Successfully parsed valid AI response");
          return parsed;
        } else {
          console.error("Parsed JSON missing required fields");
        }
      }
    } catch (error) {
      console.error("JSON parse error:", error.message);
    }
  }

  // If we reach here, AI parsing failed or was forced - generate intelligent fallback
  console.log("Using intelligent fallback analysis");
  return generateIntelligentFallback(resumeText);
}

function generateIntelligentFallback(resumeText: string): AnalysisResult {
  const normalizedText = resumeText.toLowerCase();

  // More sophisticated scoring based on actual content analysis
  const hasExperienceSection =
    /\b(work\s+)?experience|employment(\s+history)?/i.test(resumeText);
  const hasEducationSection = /education(al\s+background)?|academic/i.test(
    resumeText
  );
  const hasSkillsSection = /skills|competencies|expertise/i.test(resumeText);
  const hasContactInfo = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
  const hasSummary = /summary|objective|profile/i.test(resumeText);

  // Check for quality indicators
  const hasActionVerbs =
    /\b(managed|led|developed|designed|implemented|created|improved|increased|reduced|achieved)\b/i.test(
      resumeText
    );
  const hasQuantifiedAchievements =
    /\d+%|\$\d+|increased by|reduced by|improved by/i.test(resumeText);
  const hasBulletPoints = (resumeText.match(/[•·\-\*]\s/g) || []).length;
  const hasDateRanges = (
    resumeText.match(/20\d{2}\s*[-–—]\s*(20\d{2}|present|current)/gi) || []
  ).length;

  const wordCount = resumeText.split(/\s+/).length;
  const hasNumbers = (resumeText.match(/\d+/g) || []).length;
  const hasJobTitles =
    /\b(intern|analyst|developer|engineer|manager|coordinator|specialist|consultant|director|senior|lead)\b/i.test(
      resumeText
    );

  // Calculate score more strictly
  let baseScore = 30; // Start much lower

  // Core sections (max +30)
  if (hasExperienceSection) baseScore += 12;
  if (hasEducationSection) baseScore += 10;
  if (hasSkillsSection) baseScore += 8;

  // Quality indicators (max +25)
  if (hasActionVerbs) baseScore += 8;
  if (hasQuantifiedAchievements) baseScore += 10;
  if (hasBulletPoints > 5) baseScore += 5;
  if (hasDateRanges >= 2) baseScore += 2;

  // Content quality (max +15)
  if (hasContactInfo) baseScore += 5;
  if (hasSummary) baseScore += 5;
  if (hasJobTitles) baseScore += 5;

  // Length and detail (max +10)
  if (wordCount > 300) baseScore += 5;
  if (wordCount > 500) baseScore += 3;
  if (hasNumbers > 10) baseScore += 2;

  // Cap the score - fallback should never give excellent scores
  baseScore = Math.min(70, Math.max(30, baseScore));

  console.log("Fallback score calculation:", {
    baseScore,
    hasExperienceSection,
    hasEducationSection,
    hasSkillsSection,
    hasActionVerbs,
    hasQuantifiedAchievements,
    wordCount,
  });

  return {
    overall_score: baseScore,
    strengths: generateStrengths(
      resumeText,
      hasExperienceSection,
      hasEducationSection,
      hasSkillsSection,
      hasQuantifiedAchievements
    ),
    improvements: [
      "Add more quantified achievements with specific metrics (e.g., 'Increased sales by 35%' instead of 'Improved sales')",
      "Include industry-specific keywords to improve ATS (Applicant Tracking System) compatibility",
      "Use strong action verbs at the start of each bullet point (Led, Developed, Implemented, Achieved, Delivered)",
      "Add a compelling professional summary highlighting your top 3-5 achievements and years of experience",
    ],
    sections: generateSections(
      baseScore,
      hasExperienceSection,
      hasEducationSection,
      hasSkillsSection
    ),
    detailed_feedback: {
      format:
        "Ensure consistent formatting: use the same font throughout (11pt Arial or Calibri), maintain 0.75-1 inch margins, and use clear section headers with consistent spacing.",
      content:
        "Strengthen your bullet points by adding specific outcomes. Example: Instead of 'Managed projects', write 'Led 5 concurrent software projects with combined $500K budget, delivering all milestones 2 weeks ahead of schedule'.",
      keywords:
        "Add high-value keywords such as: 'cross-functional collaboration', 'stakeholder management', 'strategic planning', 'process optimization', 'data-driven decision making', and relevant technical skills for your industry.",
      experience:
        "Quantify every achievement with numbers, percentages, or timeframes. Examples: 'Increased team productivity by 30%', 'Reduced operational costs by $75K annually', 'Trained 20+ new employees', 'Achieved 98% customer satisfaction rating'.",
      skills:
        "Organize skills into clear categories: Technical Skills (programming languages, software, tools), Professional Skills (project management, leadership, communication), and Certifications. Remove generic skills like 'Microsoft Office' and add industry-specific ones.",
    },
  };
}

function generateStrengths(
  text: string,
  hasExperience: boolean,
  hasEducation: boolean,
  hasSkills: boolean,
  hasAchievements: boolean
): string[] {
  const strengths: string[] = [];

  if (hasExperience) {
    strengths.push(
      "Professional experience section is present with relevant work history"
    );
  }

  if (hasEducation) {
    strengths.push("Educational background is clearly documented");
  }

  if (hasSkills) {
    strengths.push(
      "Skills section helps demonstrate technical and professional capabilities"
    );
  }

  if (hasAchievements) {
    strengths.push(
      "Resume includes quantifiable achievements and measurable results"
    );
  }

  // Ensure we have at least 4 strengths
  const fillerStrengths = [
    "Resume has a clear structure with identifiable sections",
    "Contact information appears to be included",
    "Content is formatted in a readable manner",
    "Resume demonstrates professional presentation",
  ];

  while (strengths.length < 4) {
    const filler = fillerStrengths[strengths.length];
    if (filler) strengths.push(filler);
    else break;
  }

  return strengths.slice(0, 4);
}

function generateSections(
  baseScore: number,
  hasExperience: boolean,
  hasEducation: boolean,
  hasSkills: boolean
) {
  return [
    {
      section_name: "Format & Design",
      score: Math.min(85, baseScore + 10),
      feedback:
        "Resume structure is readable but could benefit from more consistent formatting and visual hierarchy.",
      suggestions: [
        "Use bullet points consistently throughout: '• Led team of 5' not 'Led team of 5.'",
        "Maintain consistent spacing between sections (use 1.5x line spacing within sections, 2x between sections)",
      ],
    },
    {
      section_name: "Professional Summary",
      score: Math.max(40, baseScore - 15),
      feedback:
        "A strong professional summary is missing or needs enhancement to capture attention immediately.",
      suggestions: [
        "Add a 2-3 sentence summary at the top. Example: 'Senior Software Engineer with 8+ years developing scalable web applications, leading teams of 10+ developers, and increasing system performance by 60%'",
        "Focus on your biggest achievements, years of experience, and unique value proposition",
      ],
    },
    {
      section_name: "Work Experience",
      score: hasExperience ? baseScore + 5 : Math.max(30, baseScore - 20),
      feedback: hasExperience
        ? "Experience section exists but needs stronger action verbs and quantified results"
        : "Work experience section needs significant expansion with specific achievements",
      suggestions: [
        "Apply STAR method: 'Redesigned checkout flow (Situation), reducing cart abandonment by 25% (Result), by implementing A/B testing and user research (Action)'",
        "Start each bullet with power verbs: Spearheaded, Architected, Optimized, Delivered, Drove, Transformed",
      ],
    },
    {
      section_name: "Skills & Keywords",
      score: hasSkills ? baseScore : Math.max(35, baseScore - 15),
      feedback:
        "Skills section needs better ATS optimization with industry-relevant keywords and proper categorization.",
      suggestions: [
        "Add technical skills: React, Node.js, Python, AWS, Docker, Kubernetes, SQL, MongoDB (adjust to your field)",
        "Remove outdated or assumed skills (e.g., 'Microsoft Office') and add emerging technologies",
      ],
    },
    {
      section_name: "Education",
      score: hasEducation ? baseScore + 15 : Math.max(40, baseScore - 10),
      feedback: hasEducation
        ? "Education section is present - ensure it includes all relevant details"
        : "Education section needs complete information including degree, institution, and dates",
      suggestions: [
        "Include: Degree type, Major, University name, Graduation year",
        "Add GPA if above 3.5, relevant coursework, academic honors, or thesis title if applicable",
      ],
    },
  ];
}
