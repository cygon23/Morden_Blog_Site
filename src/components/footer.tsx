import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NewsletterForm } from "./Newsletter/NewsletterForm";

const footerSections = [
  {
    title: "Platform",
    links: [
      { name: "Blog", href: "/blog" },
      { name: "Categories", href: "/categories" },
      { name: "Career Tools", href: "/tools" },
      { name: "Forum", href: "/forum" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Career Templates", href: "/templates" },
      { name: "Salary Guide", href: "/salary" },
      { name: "Interview Prep", href: "/interview" },
      { name: "Skill Assessment", href: "/assessment" },
    ],
  },
  {
    title: "Community",
    links: [
      { name: "Events", href: "/events" },
      { name: "Ask Experts", href: "/experts" },
      { name: "Success Stories", href: "/stories" },
      { name: "Member Directory", href: "/members" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className='bg-muted/30 border-t border-border mt-12'>
      {/* Newsletter Section */}
      <div className='bg-background/60 backdrop-blur-sm py-10 border-b border-border'>
        <div className='container-custom text-center max-w-2xl'>
          <h3 className='font-heading text-2xl font-semibold mb-3'>
            Stay Updated
          </h3>
          <p className='text-sm text-muted-foreground mb-6'>
            Join 25,000+ professionals who receive weekly career insights,
            resources, and updates straight to their inbox.
          </p>
          <div className='flex justify-center'>
            <NewsletterForm variant='inline' />
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className='container-custom py-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10'>
          {/* Brand Section */}
          <div className='lg:col-span-2'>
            <Link to='/' className='flex items-center space-x-2 mb-6'>
              <div className='w-9 h-9 primary-gradient rounded-lg flex items-center justify-center'>
                <span className='text-primary-foreground font-bold text-sm'>
                  CN
                </span>
              </div>
              <span className='font-heading font-bold text-xl text-gradient'>
                CareerNamimi
              </span>
            </Link>
            <p className='text-muted-foreground mb-8 text-sm leading-relaxed'>
              Empowering professionals worldwide with expert career insights,
              tools, and a supportive community to accelerate their career
              growth.
            </p>
            <div className='flex space-x-4'>
              <Button variant='ghost' size='icon' className='hover-glow'>
                <Twitter className='w-5 h-5' />
              </Button>
              <Button variant='ghost' size='icon' className='hover-glow'>
                <Linkedin className='w-5 h-5' />
              </Button>
              <Button variant='ghost' size='icon' className='hover-glow'>
                <Github className='w-5 h-5' />
              </Button>
              <Button variant='ghost' size='icon' className='hover-glow'>
                <Mail className='w-5 h-5' />
              </Button>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className='font-heading font-semibold mb-5 text-foreground'>
                {section.title}
              </h4>
              <ul className='space-y-3'>
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className='text-sm text-muted-foreground hover:text-primary transition-colors hover:underline'>
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
      <div className='container-custom py-6'>
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
          <p className='text-xs text-muted-foreground'>
            © 2024 CareerNamimi. All rights reserved.
          </p>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <span>Made with</span>
            <Heart className='w-4 h-4 text-primary fill-current' />
            <span>for career growth</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
