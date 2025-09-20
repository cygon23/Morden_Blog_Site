import { Link } from "react-router-dom";
import { Home, ArrowLeft, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      <div className="container-custom px-4">
        <Card className="max-w-2xl mx-auto shadow-hover border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            {/* Animated 404 */}
            <div className="relative mb-8">
              <div className="text-[150px] sm:text-[200px] font-heading font-bold text-gradient leading-none">
                404
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 hero-gradient rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
                Oops! Page Not Found
              </h1>
              <p className="text-lead mb-6">
                The page you're looking for seems to have taken a career break. 
                Let's get you back on track to success!
              </p>
              <div className="text-sm text-muted-foreground">
                Don't worry, even the best professionals sometimes take a wrong turn.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button className="hero-gradient w-full sm:w-auto">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              
              <Link to="/blog">
                <Button variant="outline" className="w-full sm:w-auto glass backdrop-blur-sm">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Articles
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>

            {/* Helpful Links */}
            <div className="mt-12 pt-8 border-t border-border/50">
              <h3 className="font-heading font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                Popular Destinations
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                <Link to="/tools">
                  <Button variant="ghost" size="sm" className="text-xs">Career Tools</Button>
                </Link>
                <Link to="/events">
                  <Button variant="ghost" size="sm" className="text-xs">Events</Button>
                </Link>
                <Link to="/forum">
                  <Button variant="ghost" size="sm" className="text-xs">Community</Button>
                </Link>
                <Link to="/about">
                  <Button variant="ghost" size="sm" className="text-xs">About Us</Button>
                </Link>
                <Link to="/contact">
                  <Button variant="ghost" size="sm" className="text-xs">Contact</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;