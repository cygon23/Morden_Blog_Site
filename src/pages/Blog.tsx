import { useState, useEffect } from "react";
import { Search, Filter, Clock, Heart, MessageSquare, Bookmark, Plus } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockBlogPosts, mockCategories } from "@/data/mock-data";
import { Link } from "react-router-dom";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [allPosts, setAllPosts] = useState(mockBlogPosts);

  useEffect(() => {
    // Load user-created posts from localStorage
    const userPosts = JSON.parse(localStorage.getItem("userBlogPosts") || "[]");
    setAllPosts([...userPosts, ...mockBlogPosts]);
  }, []);

  const filteredPosts = allPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container-custom py-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
                  Career <span className="text-gradient">Insights</span> & Advice
                </h1>
                <p className="text-lead">
                  Discover expert articles, tips, and strategies to accelerate your professional growth.
                </p>
              </div>
              <SignedIn>
                <Link to="/create-blog">
                  <Button className="hero-gradient hidden sm:flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Write Article
                  </Button>
                </Link>
              </SignedIn>
            </div>
            
            <SignedOut>
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 mb-8">
                <p className="text-center text-sm text-muted-foreground">
                  Want to share your career insights? 
                  <Link to="/blog" className="text-primary hover:underline ml-1">
                    Sign up to start writing
                  </Link>
                </p>
              </div>
            </SignedOut>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48 bg-background">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {mockCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="container-custom section-padding">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="group cursor-pointer hover-lift shadow-card hover:shadow-hover transition-smooth border-0 bg-card/50 backdrop-blur-sm">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-smooth"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="hero-gradient text-primary-foreground">
                    {post.category}
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
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{post.author.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime} min</span>
                  </div>
                </div>

                <Link to={`/blog/${post.id}`}>
                  <h3 className="text-lg font-heading font-semibold mb-3 group-hover:text-primary transition-smooth line-clamp-2">
                    {post.title}
                  </h3>
                </Link>
                
                <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                  
                  <Link to={`/blog/${post.id}`}>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5">
                      Read
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}