import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search, User, Settings, LogOut, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

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
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setProfile(profile);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          setProfile(null);
        } else {
          // Fetch profile for new user
          supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
            .then(({ data }) => {
              setProfile(data);
            });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

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
              {user ? (
                <>
                  <Link to='/create-blog'>
                    <Button variant='outline' size='sm' className='hover-glow'>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Write
                    </Button>
                  </Link>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || 'User'} />
                          <AvatarFallback>
                            {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">
                            {profile?.full_name || 'User'}
                          </p>
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/create-blog" className="cursor-pointer">
                          <Edit3 className="mr-2 h-4 w-4" />
                          Write Article
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant='ghost' size='sm' className='hover-glow'>
                      Log In
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button size='sm' className='hero-gradient hover-lift'>
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
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
                {user ? (
                  <>
                    <Link
                      to='/create-blog'
                      onClick={() => setMobileMenuOpen(false)}>
                      <Button variant='outline' className='justify-start w-full'>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Write Article
                      </Button>
                    </Link>
                    <Button 
                      variant='ghost' 
                      className='justify-start w-full'
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      to='/auth'
                      onClick={() => setMobileMenuOpen(false)}>
                      <Button variant='ghost' className='justify-start w-full'>
                        Log In
                      </Button>
                    </Link>
                    <Link
                      to='/auth'
                      onClick={() => setMobileMenuOpen(false)}>
                      <Button className='hero-gradient justify-start w-full'>
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}