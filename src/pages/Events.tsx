import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Users, Video, Mic, Award, Star } from "lucide-react";

const upcomingEvents = [
  {
    id: 1,
    title: "AI in the Workplace: Future of Jobs Panel",
    date: "Jan 25, 2024",
    time: "2:00 PM EST",
    type: "Webinar",
    location: "Online",
    attendees: 247,
    maxAttendees: 500,
    speaker: {
      name: "Dr. Sarah Chen",
      role: "AI Research Director",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    price: "Free",
    featured: true
  },
  {
    id: 2,
    title: "Networking Mixer: Tech Professionals",
    date: "Jan 28, 2024",
    time: "6:00 PM EST",
    type: "In-Person",
    location: "San Francisco, CA",
    attendees: 89,
    maxAttendees: 150,
    speaker: {
      name: "Marcus Rodriguez",
      role: "Tech Recruiter",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"
    },
    price: "$25",
    featured: false
  },
  {
    id: 3,
    title: "Mastering Remote Work: Productivity Strategies",
    date: "Feb 2, 2024",
    time: "1:00 PM EST",
    type: "Workshop",
    location: "Online",
    attendees: 156,
    maxAttendees: 300,
    speaker: {
      name: "Dr. Emily Watson",
      role: "Productivity Expert",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily"
    },
    price: "$49",
    featured: false
  },
  {
    id: 4,
    title: "Career Pivot Success Stories",
    date: "Feb 8, 2024",
    time: "3:00 PM EST",
    type: "Panel",
    location: "Online",
    attendees: 203,
    maxAttendees: 400,
    speaker: {
      name: "Alex Johnson",
      role: "Career Coach",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
    },
    price: "Free",
    featured: true
  }
];

const pastEvents = [
  {
    title: "Salary Negotiation Masterclass",
    date: "Jan 15, 2024",
    attendees: 450,
    rating: 4.8
  },
  {
    title: "Building Your Personal Brand",
    date: "Jan 10, 2024",
    attendees: 320,
    rating: 4.7
  },
  {
    title: "Interview Skills Workshop",
    date: "Jan 5, 2024",
    attendees: 280,
    rating: 4.9
  }
];

export default function Events() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container-custom py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Career <span className="text-gradient">Events</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Join workshops, webinars, and networking events to accelerate your professional growth
          </p>
          <Button size="lg" className="hero-gradient">
            Host an Event
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">150+</div>
              <div className="text-sm text-muted-foreground">Events This Month</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">12,500+</div>
              <div className="text-sm text-muted-foreground">Total Attendees</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Star className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">4.8★</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Award className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">95%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Event */}
            <div>
              <h2 className="text-2xl font-heading font-bold mb-6">Featured Event</h2>
              {upcomingEvents
                .filter(event => event.featured)
                .slice(0, 1)
                .map((event) => (
                  <Card key={event.id} className="hero-gradient text-white border-0 overflow-hidden">
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                        <div>
                          <Badge variant="secondary" className="mb-3 text-primary">
                            {event.type}
                          </Badge>
                          <h3 className="text-2xl font-heading font-bold mb-2">{event.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-white/80">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-center md:text-right">
                          <div className="text-3xl font-bold">{event.price}</div>
                          <div className="text-white/80 text-sm">per person</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={event.speaker.avatar} alt={event.speaker.name} />
                            <AvatarFallback>{event.speaker.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{event.speaker.name}</div>
                            <div className="text-white/80 text-sm">{event.speaker.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right text-sm">
                            <div className="font-semibold">{event.attendees}/{event.maxAttendees}</div>
                            <div className="text-white/80">registered</div>
                          </div>
                          <Button variant="secondary" size="lg">
                            Register Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {/* Upcoming Events */}
            <div>
              <h2 className="text-2xl font-heading font-bold mb-6">Upcoming Events</h2>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={event.type === 'In-Person' ? 'default' : 'outline'}>
                              {event.type === 'In-Person' ? (
                                <MapPin className="w-3 h-3 mr-1" />
                              ) : event.type === 'Webinar' ? (
                                <Video className="w-3 h-3 mr-1" />
                              ) : (
                                <Mic className="w-3 h-3 mr-1" />
                              )}
                              {event.type}
                            </Badge>
                            {event.featured && <Badge className="bg-primary">Featured</Badge>}
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={event.speaker.avatar} alt={event.speaker.name} />
                              <AvatarFallback>{event.speaker.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{event.speaker.name}</div>
                              <div className="text-muted-foreground text-xs">{event.speaker.role}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-4 md:mt-0">
                          <div className="text-center">
                            <div className="font-bold text-lg">{event.price}</div>
                            <div className="text-xs text-muted-foreground">
                              {event.attendees}/{event.maxAttendees} spots
                            </div>
                          </div>
                          <Button>Register</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Calendar Widget */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>This Month</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">15</div>
                    <div className="text-sm text-muted-foreground">Upcoming Events</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">8</div>
                    <div className="text-sm text-muted-foreground">Free Events</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Past Events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pastEvents.map((event, index) => (
                  <div key={index} className="p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="font-medium text-sm mb-1">{event.title}</div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{event.date}</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{event.attendees}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{event.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Newsletter Signup */}
            <Card className="hero-gradient text-white">
              <CardHeader>
                <CardTitle>Never Miss an Event</CardTitle>
                <CardDescription className="text-white/80">
                  Get notified about upcoming career events and workshops
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  Subscribe to Updates
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}