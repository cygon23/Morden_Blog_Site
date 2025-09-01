import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, Clock, Users, TrendingUp, Pin } from "lucide-react";

const forumCategories = [
  { name: "Career Advice", posts: 1247, color: "bg-blue-500" },
  { name: "Job Search", posts: 892, color: "bg-green-500" },
  { name: "Salary & Benefits", posts: 634, color: "bg-purple-500" },
  { name: "Networking", posts: 456, color: "bg-orange-500" },
  { name: "Interview Tips", posts: 789, color: "bg-red-500" },
  { name: "Skills Development", posts: 567, color: "bg-teal-500" }
];

const trendingPosts = [
  {
    id: 1,
    title: "How I negotiated a 40% salary increase in tech",
    author: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    category: "Salary & Benefits",
    replies: 45,
    likes: 127,
    timeAgo: "2 hours ago",
    isPinned: true
  },
  {
    id: 2,
    title: "Remote work vs office: Which is better for career growth?",
    author: "Marcus Rodriguez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    category: "Career Advice",
    replies: 38,
    likes: 89,
    timeAgo: "4 hours ago",
    isPinned: false
  },
  {
    id: 3,
    title: "LinkedIn networking strategies that actually work",
    author: "Dr. Emily Watson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    category: "Networking",
    replies: 62,
    likes: 156,
    timeAgo: "6 hours ago",
    isPinned: false
  },
  {
    id: 4,
    title: "Switching careers at 35: My journey from finance to tech",
    author: "Alex Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    category: "Career Advice",
    replies: 73,
    likes: 234,
    timeAgo: "8 hours ago",
    isPinned: false
  }
];

export default function Forum() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container-custom py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Career <span className="text-gradient">Forum</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Connect with professionals, share experiences, and get career advice from the community
          </p>
          <Button size="lg" className="hero-gradient">
            Start a Discussion
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">25,847</div>
              <div className="text-sm text-muted-foreground">Active Members</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <MessageSquare className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">4,592</div>
              <div className="text-sm text-muted-foreground">Discussions</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <ThumbsUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">18,734</div>
              <div className="text-sm text-muted-foreground">Helpful Answers</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">95%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-heading font-bold">Trending Discussions</h2>
              <Button variant="outline">View All</Button>
            </div>

            {trendingPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={post.avatar} alt={post.author} />
                      <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {post.isPinned && <Pin className="w-4 h-4 text-primary" />}
                        <Badge variant="outline">{post.category}</Badge>
                        <span className="text-sm text-muted-foreground">{post.timeAgo}</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 hover:text-primary cursor-pointer">
                        {post.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.replies} replies</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{post.likes} likes</span>
                        </div>
                        <span>by {post.author}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Categories</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {forumCategories.map((category) => (
                  <div key={category.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.posts}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Community Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <span>Be respectful and professional in all interactions</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <span>Share genuine experiences and advice</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <span>Keep discussions career-focused and relevant</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <span>No spam, self-promotion, or offensive content</span>
                </div>
              </CardContent>
            </Card>

            {/* Join CTA */}
            <Card className="hero-gradient text-white">
              <CardHeader>
                <CardTitle>Join the Conversation</CardTitle>
                <CardDescription className="text-white/80">
                  Get personalized career advice from thousands of professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  Sign Up Free
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}