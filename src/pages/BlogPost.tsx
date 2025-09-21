import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Heart, MessageSquare, Share2, Edit, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  image_url?: string;
  status: 'draft' | 'published';
  created_at: string;
  published_at?: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
  };
  user_id: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
  };
  user_id: string;
}

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (id) {
      fetchBlogPost();
      fetchComments();
      fetchLikesData();
    }
  }, [id, user]);

  const fetchBlogPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          profiles!inner(full_name, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setPost(data as any);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      toast({
        title: "Error",
        description: "Failed to load blog post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!inner(full_name, avatar_url)
        `)
        .eq('blog_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data as any || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchLikesData = async () => {
    try {
      // Get total likes count
      const { count, error: countError } = await supabase
        .from('likes')
        .select('*', { count: 'exact' })
        .eq('blog_id', id);

      if (countError) throw countError;
      setLikesCount(count || 0);

      // Check if current user has liked
      if (user) {
        const { data, error } = await supabase
          .from('likes')
          .select('id')
          .eq('blog_id', id)
          .eq('user_id', user.id)
          .single();

        setIsLiked(!!data);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('blog_id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({
            blog_id: id,
            user_id: user.id
          });

        if (error) throw error;
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          blog_id: id,
          user_id: user.id,
          content: newComment.trim()
        })
        .select(`
          *,
          profiles!inner(full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      setComments(prev => [...prev, data as any]);
      setNewComment("");
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = `${post?.title} - CareerNamimi`;
    const shareText = `Check out this insightful article: "${post?.title}" on CareerNamimi`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Article link copied to clipboard",
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast({
          title: "Share",
          description: `Share this article: ${shareUrl}`,
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Blog Deleted",
        description: "Your blog post has been deleted successfully",
      });
      navigate('/blog');
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-heading font-bold mb-2">Blog Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/blog')} variant="outline">
              Back to Blog
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = user && user.id === post.user_id;
  const readTime = Math.ceil(post.content.length / 1000);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container-custom section-padding">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/blog')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Button>
            
            {isOwner && (
              <div className="flex items-center gap-2">
                <Link to={`/edit-blog/${post.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          {/* Blog Post */}
          <Card className="shadow-card border-0 mb-8">
            <CardContent className="p-8">
              {/* Category and Status */}
              <div className="flex items-center gap-2 mb-4">
                <Badge className="hero-gradient text-primary-foreground">
                  {post.category}
                </Badge>
                {post.status === 'draft' && (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-6">
                {post.title}
              </h1>

              {/* Author Info */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={post.profiles?.avatar_url} />
                    <AvatarFallback>
                      {post.profiles?.full_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{post.profiles?.full_name || 'Anonymous'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(post.published_at || post.created_at).toLocaleDateString()} • {readTime} min read
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : ''}`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    {likesCount}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Featured Image */}
              {post.image_url && (
                <div className="mb-8">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-64 sm:h-96 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {post.content}
                </div>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="shadow-card border-0">
            <CardContent className="p-8">
              <h3 className="text-xl font-heading font-semibold mb-6">
                Comments ({comments.length})
              </h3>

              {/* Add Comment */}
              <div className="mb-8">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-4"
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  Post Comment
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={comment.profiles?.avatar_url} />
                      <AvatarFallback>
                        {comment.profiles?.full_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {comment.profiles?.full_name || 'Anonymous'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-foreground">{comment.content}</p>
                    </div>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}