import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    content: "hello@careernamimi.com",
    description: "We'll respond within 24 hours"
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    content: "Available 9 AM - 6 PM EST",
    description: "Get instant support"
  },
  {
    icon: MapPin,
    title: "Office",
    content: "San Francisco, CA",
    description: "Remote-first company"
  }
];

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <section className="bg-background border-b border-border">
        <div className="container-custom section-padding">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="hero-gradient text-primary-foreground mb-6">
              Get in Touch
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-6">
              We'd Love to <span className="text-gradient">Hear From You</span>
            </h1>
            <p className="text-lead">
              Have questions, feedback, or partnership opportunities? Our team is here to help 
              you succeed in your career journey.
            </p>
          </div>
        </div>
      </section>

      <div className="container-custom section-padding">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-heading font-bold mb-4">
                Get in <span className="text-gradient">Touch</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                Choose the best way to reach us. We're committed to providing 
                excellent support for our community.
              </p>
            </div>

            {contactInfo.map((info) => {
              const Icon = info.icon;
              return (
                <Card key={info.title} className="hover-lift shadow-card transition-smooth border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 hero-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold mb-1">{info.title}</h3>
                        <p className="text-foreground font-medium mb-1">{info.content}</p>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <Card className="hover-lift shadow-card transition-smooth border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-heading font-semibold mb-2">Support Hours</h3>
                <p className="text-sm text-muted-foreground">
                  Monday - Friday: 9 AM - 6 PM EST<br />
                  Weekend: Emergency support only
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-heading">
                  Send us a Message
                </CardTitle>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="text-sm font-medium mb-2 block">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="text-sm font-medium mb-2 block">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="bg-background"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="text-sm font-medium mb-2 block">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="bg-background"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="text-sm font-medium mb-2 block">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    placeholder="How can we help you?"
                    className="bg-background"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="text-sm font-medium mb-2 block">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                    className="bg-background"
                  />
                </div>

                <Button className="hero-gradient hover-lift w-full sm:w-auto" size="lg">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="section-padding bg-muted/20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-heading font-bold mb-4">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Quick answers to common questions about CareerNamimi.
            </p>
            
            <div className="space-y-4 text-left">
              <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-heading font-semibold mb-2">Is CareerNamimi free to use?</h3>
                  <p className="text-muted-foreground">
                    Yes! We offer a comprehensive free tier with access to articles, basic tools, 
                    and community features. Premium features are available for advanced tools and personalized coaching.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-heading font-semibold mb-2">How often is new content published?</h3>
                  <p className="text-muted-foreground">
                    We publish new expert articles and resources weekly, covering the latest trends 
                    in career development, industry insights, and professional growth strategies.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-heading font-semibold mb-2">Can I contribute content to the platform?</h3>
                  <p className="text-muted-foreground">
                    Absolutely! We welcome contributions from industry experts and experienced professionals. 
                    Contact us to learn about our contributor program and submission guidelines.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}