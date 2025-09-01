import { ArrowRight, Play, Star, TrendingUp, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-subtle section-padding">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 hero-gradient rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 accent-gradient rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 left-1/2 transform -translate-x-1/2 w-96 h-96 primary-gradient rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      </div>

      <div className="container-custom relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <Badge className="hero-gradient text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover-lift">
              <Star className="w-4 h-4 mr-2" />
              #1 Career Growth Platform
            </Badge>
          </div>

          {/* Main headline */}
          <h1 className="text-hero font-heading mb-6 animate-slide-up">
            Accelerate Your{" "}
            <span className="text-gradient">Career Journey</span>
            <br />
            with Expert Insights
          </h1>

          {/* Subheading */}
          <p className="text-lead max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Join thousands of professionals who are transforming their careers with our 
            expert-curated content, tools, and community-driven insights.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button size="lg" className="hero-gradient hover-lift px-8 py-4 text-base font-semibold">
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary/20 hover:bg-primary/5 px-8 py-4 text-base">
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-primary mr-2" />
                <span className="text-2xl font-bold text-foreground">95%</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Career Growth Rate</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-primary mr-2" />
                <span className="text-2xl font-bold text-foreground">50K+</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Active Members</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="w-6 h-6 text-primary mr-2" />
                <span className="text-2xl font-bold text-foreground">1000+</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Expert Articles</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}