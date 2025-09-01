import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail, Heart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const footerSections = [
  {
    title: "Platform",
    links: [
      { name: "Blog", href: "/blog" },
      { name: "Categories", href: "/categories" },
      { name: "Career Tools", href: "/tools" },
      { name: "Forum", href: "/forum" },
    ]
  },
  {
    title: "Resources",
    links: [
      { name: "Career Templates", href: "/templates" },
      { name: "Salary Guide", href: "/salary" },
      { name: "Interview Prep", href: "/interview" },
      { name: "Skill Assessment", href: "/assessment" },
    ]
  },
  {
    title: "Community",
    links: [
      { name: "Events", href: "/events" },
      { name: "Ask Experts", href: "/experts" },
      { name: "Success Stories", href: "/stories" },
      { name: "Member Directory", href: "/members" },
    ]
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ]
  }
];

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border">
      {/* Newsletter Section */}
      <div className="border-b border-border">
        <div className="container-custom py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-heading font-bold mb-4">
              Stay Ahead in Your <span className="text-gradient">Career</span>
            </h3>
            <p className="text-muted-foreground mb-6">
              Get weekly insights, career tips, and exclusive resources delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-background border-border"
              />
              <Button className="hero-gradient hover-lift px-6">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Join 25,000+ professionals. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">CN</span>
              </div>
              <span className="font-heading font-bold text-xl text-gradient">CareerNamimi</span>
            </Link>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              Empowering professionals worldwide with expert career insights, tools, 
              and a supportive community to accelerate their career growth.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm" className="hover-glow">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hover-glow">
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hover-glow">
                <Github className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hover-glow">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-heading font-semibold mb-4 text-foreground">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-smooth hover:underline"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Bottom Footer */}
      <div className="container-custom py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© 2024 CareerNamimi. All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-primary fill-current" />
            <span>for career growth</span>
          </div>
        </div>
      </div>
    </footer>
  );
}