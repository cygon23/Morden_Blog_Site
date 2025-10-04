import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Type definitions
export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResumeAnalysis {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  extracted_text: string | null;
  overall_score: number | null;
  analysis_data: {
    strengths: string[];
    improvements: string[];
    detailed_feedback: {
      format: string;
      content: string;
      keywords: string;
      experience: string;
      skills: string;
    };
  } | null;
  status: "pending" | "processing" | "completed" | "failed";
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnalysisSection {
  id: string;
  resume_analysis_id: string;
  section_name: string;
  score: number;
  feedback: string;
  suggestions: string[] | null;
  created_at: string;
}

// Resume Service
export const resumeService = {
  async uploadResume(userId: string, file: File): Promise<string> {
    const fileName = `${userId}/${Date.now()}_${file.name}`;

    const { data, error } = await supabase.storage
      .from("resumes")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw new Error(`Upload failed: ${error.message}`);
    return fileName;
  },

  async createAnalysis(data: {
    user_id: string;
    file_name: string;
    file_size: number;
    file_type: string;
    file_url: string;
  }): Promise<ResumeAnalysis> {
    const { data: analysis, error } = await supabase
      .from("resume_analyses")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Create analysis failed: ${error.message}`);
    return analysis;
  },

  async getUserAnalyses(userId: string, limit = 10): Promise<ResumeAnalysis[]> {
    const { data, error } = await supabase
      .from("resume_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Fetch analyses failed: ${error.message}`);
    return data || [];
  },

  async getAnalysisById(analysisId: string): Promise<{
    analysis: ResumeAnalysis;
    sections: AnalysisSection[];
  }> {
    const { data: analysis, error: analysisError } = await supabase
      .from("resume_analyses")
      .select("*")
      .eq("id", analysisId)
      .single();

    if (analysisError)
      throw new Error(`Fetch analysis failed: ${analysisError.message}`);

    const { data: sections, error: sectionsError } = await supabase
      .from("analysis_sections")
      .select("*")
      .eq("resume_analysis_id", analysisId)
      .order("score", { ascending: false });

    if (sectionsError)
      throw new Error(`Fetch sections failed: ${sectionsError.message}`);

    return {
      analysis: analysis as ResumeAnalysis,
      sections: (sections || []) as AnalysisSection[],
    };
  },

  async analyzeResume(resumeAnalysisId: string): Promise<any> {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError)
      throw new Error(`Get session failed: ${sessionError.message}`);
    if (!session) throw new Error("No active session found");

    // Use direct fetch instead of supabase.functions.invoke
    const functionUrl = `${supabaseUrl}/functions/v1/analyze-resume`;

    try {
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: supabaseAnonKey || "",
        },
        body: JSON.stringify({ resumeAnalysisId }),
      });

      const data = await response.json();

      // Now we can access the actual response body even on 400 errors
      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Analysis failed",
        };
      }

      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Network error occurred",
      };
    }
  },
  async deleteAnalysis(analysisId: string, fileUrl: string): Promise<void> {
    const { error: storageError } = await supabase.storage
      .from("resumes")
      .remove([fileUrl]);

    if (storageError) console.warn("Storage delete warning:", storageError);

    const { error: dbError } = await supabase
      .from("resume_analyses")
      .delete()
      .eq("id", analysisId);

    if (dbError) throw new Error(`Delete failed: ${dbError.message}`);
  },

  async getResumeDownloadUrl(fileUrl: string): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(fileUrl, 3600);

    if (error) {
      console.error("URL generation error:", error);
      return null;
    }
    return data?.signedUrl || null;
  },
};

// Profile Service
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Fetch profile failed: ${error.message}`);
    }
    return data || null;
  },

  async upsertProfile(
    profile: Partial<Profile> & { user_id: string }
  ): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .upsert(profile)
      .select()
      .single();

    if (error) throw new Error(`Upsert profile failed: ${error.message}`);
    return data;
  },

  async updateProfile(
    userId: string,
    updates: Partial<Profile>
  ): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new Error(`Update profile failed: ${error.message}`);
    return data;
  },
};

// Auth Service
export const authService = {
  async signUp(
    email: string,
    password: string,
    metadata?: { full_name?: string }
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) throw new Error(`Sign up failed: ${error.message}`);

    // Create profile if user was created
    if (data.user) {
      try {
        await profileService.upsertProfile({
          user_id: data.user.id,
          full_name: metadata?.full_name || null,
        });
      } catch (profileError) {
        console.warn("Profile creation warning:", profileError);
      }
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(`Sign in failed: ${error.message}`);
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(`Sign out failed: ${error.message}`);
  },

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw new Error(`Get user failed: ${error.message}`);
    return user;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(`Password reset failed: ${error.message}`);
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw new Error(`Update password failed: ${error.message}`);
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
