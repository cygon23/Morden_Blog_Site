import { Users, Target, Award, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description: "We're committed to democratizing career growth and making professional development accessible to all."
  },
  {
    icon: Users,
    title: "Community First",
    description: "Building a supportive community where professionals can learn, grow, and succeed together."
  },
  {
    icon: Award,
    title: "Excellence",
    description: "Curating only the highest quality content and tools from industry experts and thought leaders."
  },
  {
    icon: Heart,
    title: "Authentic",
    description: "Providing genuine, practical advice based on real experiences and proven strategies."
  }
];

const team = [
  {
    name: "Sarah Johnson",
    role: "Founder & CEO",
    bio: "Former VP at Fortune 500 company with 15+ years in talent development.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
  },
  {
    name: "Michael Chen",
    role: "Head of Content",
    bio: "Career coach and author with expertise in professional development.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
  },
  {
    name: "Emily Rodriguez",
    role: "Community Manager",
    bio: "Building connections and fostering growth in professional communities.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily"
  }
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="bg-background border-b border-border">
        <div className="container-custom section-padding">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="hero-gradient text-primary-foreground mb-6">
              About CareerNamimi
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-6">
              Empowering <span className="text-gradient">Professional Growth</span> Worldwide
            </h1>
            <p className="text-lead mb-8">
              We believe every professional deserves access to expert guidance, practical tools, 
              and a supportive community to accelerate their career journey.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-heading font-bold mb-6">
                Our <span className="text-gradient">Story</span>
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  CareerNamimi was born from a simple observation: talented professionals often 
                  lack access to the right guidance and resources to unlock their full potential.
                </p>
                <p>
                  Founded in 2023, we set out to bridge this gap by creating a comprehensive 
                  platform that combines expert insights, practical tools, and community support.
                </p>
                <p>
                  Today, we're proud to serve over 50,000 professionals worldwide, helping them 
                  navigate career transitions, develop new skills, and achieve their professional goals.
                </p>
              </div>
              <div className="mt-8">
                <Link to="/contact">
                  <Button className="hero-gradient hover-lift">
                    Get in Touch
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 hero-gradient rounded-2xl opacity-20 blur-xl"></div>
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                alt="Team collaboration"
                className="relative rounded-2xl shadow-card hover-lift transition-smooth"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-muted/20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">
              Our <span className="text-gradient">Values</span>
            </h2>
            <p className="text-lead max-w-2xl mx-auto">
              These core principles guide everything we do and shape the experience we create for our community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="text-center hover-lift shadow-card transition-smooth border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 hero-gradient rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-heading font-semibold mb-3">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">
              Meet Our <span className="text-gradient">Team</span>
            </h2>
            <p className="text-lead max-w-2xl mx-auto">
              Passionate professionals dedicated to helping you achieve your career goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member) => (
              <Card key={member.name} className="text-center hover-lift shadow-card transition-smooth border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-20 h-20 rounded-full mx-auto mb-4"
                  />
                  <h3 className="font-heading font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary text-sm font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-hero text-primary-foreground">
        <div className="container-custom text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join our community of ambitious professionals and start your journey toward career success today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/blog">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                Explore Articles
              </Button>
            </Link>
            <Link to="/tools">
              <Button size="lg" variant="outline" className="border-white text-primary-foreground hover:bg-white/10">
                Try Career Tools
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}