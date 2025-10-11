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

// Types
export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  post_count: number;
  created_at: string;
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category_id: string | null;
  is_pinned: boolean;
  reply_count: number;
  like_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  author?: Profile;
  category?: Category;
  user_has_liked?: boolean;
}

export interface ForumComment {
  id: string;
  discussion_id: string;
  author_id: string;
  content: string;
  like_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  author?: Profile;
  user_has_liked?: boolean;
}

export interface DiscussionLike {
  id: string;
  discussion_id: string;
  user_id: string;
  created_at: string;
}

export interface CommentLike {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
}
