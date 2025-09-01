import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./theme-toggle";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Blog", href: "/blog" },
  { name: "Categories", href: "/categories" },
  { name: "Career Tools", href: "/tools" },
  { name: "Forum", href: "/forum" },
  { name: "Events", href: "/events" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className='bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-soft'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center h-16'>
          {/* Logo */}
          <Link
            to='/'
            className='flex items-center space-x-3 hover-glow transition-smooth mr-8'>
            <img
              src='/logo.png'
              alt='CareerNamimi Logo'
              className='h-8 w-8 object-contain'
            />
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden lg:flex items-center space-x-1 flex-1'>
            {navigation.slice(0, 6).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth hover-glow ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:text-primary hover:bg-muted/50"
                }`}>
                {item.name}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className='hidden md:flex items-center flex-1 max-w-sm mx-6'>
            <div className='relative w-full'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
              <Input
                type='search'
                placeholder='Search articles, topics...'
                className='pl-10 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20'
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className='flex items-center space-x-3'>
            <ThemeToggle />

            {/* Auth buttons - desktop */}
            <div className='hidden sm:flex items-center space-x-2'>
              <SignedOut>
                <SignInButton mode='modal'>
                  <Button variant='ghost' size='sm' className='hover-glow'>
                    Log In
                  </Button>
                </SignInButton>
                <SignUpButton mode='modal'>
                  <Button size='sm' className='hero-gradient hover-lift'>
                    Sign Up
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link to='/create-blog'>
                  <Button variant='outline' size='sm'>
                    Write
                  </Button>
                </Link>
                <UserButton afterSignOutUrl='/' />
              </SignedIn>
            </div>

            {/* Mobile menu button */}
            <Button
              variant='ghost'
              size='sm'
              className='lg:hidden'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? (
                <X className='w-5 h-5' />
              ) : (
                <Menu className='w-5 h-5' />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className='lg:hidden border-t border-border'>
            <div className='px-2 pt-2 pb-3 space-y-1'>
              {/* Mobile search */}
              <div className='relative mb-3'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                <Input
                  type='search'
                  placeholder='Search...'
                  className='pl-10 bg-muted/50'
                />
              </div>

              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-base font-medium transition-smooth ${
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:text-primary hover:bg-muted/50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}>
                  {item.name}
                </Link>
              ))}

              {/* Mobile auth buttons */}
              <div className='pt-4 flex flex-col space-y-2'>
                <SignedOut>
                  <SignInButton mode='modal'>
                    <Button variant='ghost' className='justify-start'>
                      Log In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode='modal'>
                    <Button className='hero-gradient justify-start'>
                      Sign Up
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link
                    to='/create-blog'
                    onClick={() => setMobileMenuOpen(false)}>
                    <Button variant='outline' className='justify-start w-full'>
                      Write Article
                    </Button>
                  </Link>
                  <div className='flex justify-center pt-2'>
                    <UserButton afterSignOutUrl='/' />
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}