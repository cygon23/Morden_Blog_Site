import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Heart, MessageSquare, ArrowRight, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

export function FeaturedPosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedPosts();
  }, []);

  const fetchFeaturedPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          profiles!inner(full_name, avatar_url)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      
      // Get likes and comments counts separately
      const postsWithCounts = await Promise.all(
        (data || []).map(async (post) => {
          const [likesResult, commentsResult] = await Promise.all([
            supabase
              .from('likes')
              .select('id', { count: 'exact' })
              .eq('blog_id', post.id),
            supabase
              .from('comments')
              .select('id', { count: 'exact' })
              .eq('blog_id', post.id)
          ]);
          
          return {
            ...post,
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0
          };
        })
      );
      
      setPosts(postsWithCounts);
    } catch (error) {
      console.error('Error fetching featured posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
              Featured <span className="text-gradient">Articles</span>
            </h2>
            <p className="text-lead max-w-2xl mx-auto">
              Discover the latest insights and strategies from career experts and industry leaders.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-card/50">
                <div className="h-64 bg-muted rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
              Featured <span className="text-gradient">Articles</span>
            </h2>
            <p className="text-lead max-w-2xl mx-auto">
              No featured articles available at the moment. Check back soon!
            </p>
          </div>
        </div>
      </section>
    );
  }

  const mainPost = posts[0];
  const sidePosts = posts.slice(1, 3);

  // Calculate read time (roughly 200 words per minute)
  const calculateReadTime = (content: string) => {
    const words = content.split(' ').length;
    return Math.ceil(words / 200);
  };

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
            Featured <span className="text-gradient">Articles</span>
          </h2>
          <p className="text-lead max-w-2xl mx-auto">
            Discover the latest insights and strategies from career experts and industry leaders.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Main Featured Post */}
          {mainPost && (
            <Card className="group cursor-pointer hover-lift shadow-card hover:shadow-hover transition-smooth border-0 bg-card/50 backdrop-blur-sm">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={mainPost.image_url}
                  alt={mainPost.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-smooth"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="hero-gradient text-primary-foreground">
                    {mainPost.category}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-smooth glass backdrop-blur-sm"
                >
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={mainPost.profiles?.avatar_url} />
                      <AvatarFallback>
                        {mainPost.profiles?.full_name?.[0] || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{mainPost.profiles?.full_name || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{calculateReadTime(mainPost.content)} min read</span>
                  </div>
                </div>

                <Link to={`/blog/${mainPost.id}`}>
                  <h3 className="text-xl font-heading font-semibold mb-3 group-hover:text-primary transition-smooth">
                    {mainPost.title}
                  </h3>
                </Link>
                
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {mainPost.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                     <div className="flex items-center gap-1">
                       <Heart className="w-4 h-4" />
                       <span>{mainPost.likes_count || 0}</span>
                     </div>
                     <div className="flex items-center gap-1">
                       <MessageSquare className="w-4 h-4" />
                       <span>{mainPost.comments_count || 0}</span>
                     </div>
                  </div>
                  
                  <Link to={`/blog/${mainPost.id}`}>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5">
                      Read More
                      <ArrowRight className="ml-1 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Side Posts */}
          <div className="space-y-6">
            {sidePosts.map((post, index) => (
              <Card key={post.id} className="group cursor-pointer hover-lift shadow-card hover:shadow-hover transition-smooth border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="flex gap-4">
                    <div className="relative w-32 h-24 flex-shrink-0 overflow-hidden rounded-l-lg">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                      />
                      <Badge className="absolute top-2 left-2 text-xs hero-gradient text-primary-foreground">
                        {post.category}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 p-4">
                      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={post.profiles?.avatar_url} />
                          <AvatarFallback>
                            {post.profiles?.full_name?.[0] || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{post.profiles?.full_name || 'Anonymous'}</span>
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        <span>{calculateReadTime(post.content)} min</span>
                      </div>
                      
                      <Link to={`/blog/${post.id}`}>
                        <h4 className="font-heading font-medium text-sm mb-2 group-hover:text-primary transition-smooth line-clamp-2">
                          {post.title}
                        </h4>
                      </Link>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                           <div className="flex items-center gap-1">
                             <Heart className="w-3 h-3" />
                             <span>{post.likes_count || 0}</span>
                           </div>
                           <div className="flex items-center gap-1">
                             <MessageSquare className="w-3 h-3" />
                             <span>{post.comments_count || 0}</span>
                           </div>
                        </div>
                        
                        <Link to={`/blog/${post.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary h-6 px-2">
                            Read
                            <ArrowRight className="ml-1 w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* View All Posts CTA */}
            <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-smooth cursor-pointer hover-lift">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 hero-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="w-6 h-6 text-primary-foreground" />
                </div>
                <h4 className="font-heading font-semibold mb-2">Explore More Articles</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover hundreds of career insights and expert advice.
                </p>
                <Link to="/blog">
                  <Button className="hero-gradient">
                    View All Posts
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}