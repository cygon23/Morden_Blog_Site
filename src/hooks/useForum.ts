import { useState, useEffect } from "react";
import { supabase, Discussion, ForumComment, Category } from "../lib/forum.ts";
import { useToast } from "@/hooks/use-toast";

export const ensureProfileExists = async (user: any) => {
  let { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    const { data: newProfile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        username: user.email?.split("@")[0] ?? "user",
        full_name: user.user_metadata?.full_name ?? "",
      })
      .select()
      .single();

    if (profileError) throw profileError;
    profile = newProfile;
  }

  return profile;
};

export const useDiscussions = (filters?: {
  category?: string;
  search?: string;
  sortBy?: "recent" | "popular" | "mostReplies";
  limit?: number;
}) => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchDiscussions();
  }, [filters?.category, filters?.search, filters?.sortBy, filters?.limit]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      let query = supabase.from("discussions").select(`
        *,
        author:profiles(id, username, full_name, avatar_url),
        category:categories(id, name, slug, color)
      `);

      // Apply filters
      if (filters?.category && filters.category !== "All") {
        query = query.eq("category.slug", filters.category);
      }

      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`
        );
      }

      // Sorting
      if (filters?.sortBy === "popular") {
        query = query.order("like_count", { ascending: false });
      } else if (filters?.sortBy === "mostReplies") {
        query = query.order("reply_count", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // Pinned posts first
      query = query.order("is_pinned", { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (user && data) {
        const profile = await ensureProfileExists(user);
        const discussionIds = data.map((d) => d.id);
        const { data: likes } = await supabase
          .from("discussion_likes")
          .select("discussion_id")
          .eq("user_id", profile.id)
          .in("discussion_id", discussionIds);

        const likedIds = new Set(likes?.map((l) => l.discussion_id) || []);
        setDiscussions(
          data.map((d) => ({ ...d, user_has_liked: likedIds.has(d.id) }))
        );
      } else {
        setDiscussions(data || []);
      }
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching discussions:", err);
    } finally {
      setLoading(false);
    }
  };

  return { discussions, loading, error, refetch: fetchDiscussions };
};

// single discussion with comments
export const useDiscussion = (discussionId: string | null) => {
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (discussionId) {
      fetchDiscussion();
      fetchComments();
    }
  }, [discussionId]);

  const fetchDiscussion = async () => {
    if (!discussionId) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("discussions")
        .select(
          `
          *,
          author:profiles(id, username, full_name, avatar_url),
          category:categories(id, name, slug, color)
        `
        )
        .eq("id", discussionId)
        .single();

      if (fetchError) throw fetchError;

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (user) {
        const profile = await ensureProfileExists(user);
        const { data: like } = await supabase
          .from("discussion_likes")
          .select("id")
          .eq("discussion_id", discussionId)
          .eq("user_id", profile.id)
          .maybeSingle();

        setDiscussion({ ...data, user_has_liked: !!like });
      } else {
        setDiscussion(data);
      }

      // Increment view count
      await supabase
        .from("discussions")
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq("id", discussionId);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching discussion:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!discussionId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from("forum_comments")
        .select(
          `
          *,
          author:profiles(id, username, full_name, avatar_url)
        `
        )
        .eq("discussion_id", discussionId)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (user && data) {
        const profile = await ensureProfileExists(user);
        const commentIds = data.map((c) => c.id);
        const { data: likes } = await supabase
          .from("comment_likes")
          .select("comment_id")
          .eq("user_id", profile.id)
          .in("comment_id", commentIds);

        const likedIds = new Set(likes?.map((l) => l.comment_id) || []);
        setComments(
          data.map((c) => ({ ...c, user_has_liked: likedIds.has(c.id) }))
        );
      } else {
        setComments(data || []);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  return {
    discussion,
    comments,
    loading,
    error,
    refetch: () => {
      fetchDiscussion();
      fetchComments();
    },
  };
};

// categories
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (fetchError) throw fetchError;
      setCategories(data || []);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, error, refetch: fetchCategories };
};

// for forum stats
export const useForumStats = () => {
  const [stats, setStats] = useState({
    activeMembers: 0,
    totalDiscussions: 0,
    totalComments: 0,
    successRate: 95,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const { count: memberCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: discussionCount } = await supabase
        .from("discussions")
        .select("*", { count: "exact", head: true });

      const { count: commentCount } = await supabase
        .from("forum_comments")
        .select("*", { count: "exact", head: true });

      setStats({
        activeMembers: memberCount || 0,
        totalDiscussions: discussionCount || 0,
        totalComments: commentCount || 0,
        successRate: 95,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refetch: fetchStats };
};

// discussion actions (like, comment, create)
export const useDiscussionActions = () => {
  const { toast } = useToast();

  const toggleLike = async (discussionId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to like discussions",
          variant: "destructive",
        });
        return false;
      }

      const profile = await ensureProfileExists(user);

      const { data: existingLike } = await supabase
        .from("discussion_likes")
        .select("id")
        .eq("discussion_id", discussionId)
        .eq("user_id", profile.id)
        .maybeSingle();

      if (existingLike) {
        await supabase
          .from("discussion_likes")
          .delete()
          .eq("id", existingLike.id);
        return false;
      } else {
        await supabase.from("discussion_likes").insert({
          discussion_id: discussionId,
          user_id: profile.id,
        });
        return true;
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
      return null;
    }
  };

  const addComment = async (discussionId: string, content: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to comment",
          variant: "destructive",
        });
        return null;
      }

      const profile = await ensureProfileExists(user);
      const { data, error } = await supabase
        .from("forum_comments")
        .insert({
          discussion_id: discussionId,
          author_id: profile.id,
          content: content.trim(),
        })
        .select(
          `
          *,
          author:profiles(id, username, full_name, avatar_url)
        `
        )
        .single();

      if (error) throw error;

      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully",
      });

      return data;
    } catch (err) {
      console.error("Error adding comment:", err);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
      return null;
    }
  };

  const toggleCommentLike = async (commentId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to like comments",
          variant: "destructive",
        });
        return false;
      }
      const profile = await ensureProfileExists(user);

      const { data: existingLike } = await supabase
        .from("comment_likes")
        .select("id")
        .eq("comment_id", commentId)
        .eq("user_id", profile.id)
        .maybeSingle();

      if (existingLike) {
        await supabase.from("comment_likes").delete().eq("id", existingLike.id);
        return false;
      } else {
        await supabase.from("comment_likes").insert({
          comment_id: commentId,
          user_id: profile.id,
        });
        return true;
      }
    } catch (err) {
      console.error("Error toggling comment like:", err);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
      return null;
    }
  };

  const createDiscussion = async (data: {
    title: string;
    category_id: string;
    content: string;
  }) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create discussions",
          variant: "destructive",
        });
        return null;
      }

      const profile = await ensureProfileExists(user);

      const { data: discussion, error } = await supabase
        .from("discussions")
        .insert({
          ...data,
          author_id: profile.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Discussion created",
        description: "Your discussion has been posted successfully",
      });

      return discussion;
    } catch (err) {
      console.error("Error creating discussion:", err);
      toast({
        title: "Error",
        description: "Failed to create discussion",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    toggleLike,
    addComment,
    toggleCommentLike,
    createDiscussion,
  };
};
