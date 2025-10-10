import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Mic,
  Award,
  Star,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useAdmin } from "@/hooks/useAdmin";
import { EventForm } from "@/components/EventForm";
import { RegistrationForm } from "../components/RegistrationForm..tsx";
import { RatingForm } from "@/components/RatingForm";
import { createGoogleCalendarLink } from "@/utils/googleCalendar";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Events() {
  const {
    upcomingEvents,
    pastEvents,
    loading,
    stats,
    addEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    rateEvent,
  } = useEvents();
  const { toast } = useToast();
  const { isAdmin } = useAdmin();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [registrationModal, setRegistrationModal] = useState({
    open: false,
    event: null,
  });
  const [ratingModal, setRatingModal] = useState({ open: false, event: null });

  const handleSubmit = async (formData) => {
    if (editingEvent) {
      await updateEvent(editingEvent.id, formData);
    } else {
      await addEvent(formData);
    }
    setEditingEvent(null);
  };

  const handleEdit = (event) => {
    setEditingEvent({
      ...event,
      speaker_name: event.speaker?.name || event.speaker_name || "",
      speaker_role: event.speaker?.role || event.speaker_role || "",
      speaker_avatar: event.speaker?.avatar || event.speaker_avatar || "",
    });
    setIsFormOpen(true);
  };

 const handleDelete = async (id) => {
  if (confirm("Are you sure you want to delete this event?")) {
    try {
      await deleteEvent(id);
      toast({
        title: "Event Deleted",
        description: "The event has been removed successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete the event. Please try again.",
      });
    }
  }
};

  const handleRegister = (event) => {
    setRegistrationModal({ open: true, event });
  };

  const handleRate = (event) => {
    setRatingModal({ open: true, event });
  };

const submitRegistration = async (formData) => {
  try {
    await registerForEvent(registrationModal.event.id, formData);

    const calendarLink = createGoogleCalendarLink(
      registrationModal.event,
      formData.user_email
    );

    if (calendarLink.includes("calendar.google.com/calendar/render")) {
      window.open(calendarLink, "_blank");
      toast({
        title: "Registration Successful! 🎉",
        description: "Google Calendar opened. Please save the event.",
      });
    } else {
      toast({
        title: "Registration Successful! ✅",
        description: "Please add the event to your calendar manually.",
      });
    }

    setRegistrationModal({ open: false, event: null });
  } catch (error) {
    console.error("Registration error:", error);

    // User-friendly error messages
    let errorTitle = "Registration Failed";
    let errorDescription = "Something went wrong. Please try again.";

    if (error.message.includes("already registered")) {
      errorTitle = "Already Registered";
      errorDescription =
        "You've already registered for this event. Check your email!";
    } else if (
      error.message.includes("network") ||
      error.message.includes("fetch")
    ) {
      errorTitle = "Connection Error";
      errorDescription = "Please check your internet connection and try again.";
    } else if (error.message) {
      errorDescription = error.message;
    }

    toast({
      variant: "destructive",
      title: errorTitle,
      description: errorDescription,
    });
  }
};

const submitRating = async (formData) => {
  if (formData.rating === 0) {
    toast({
      variant: "destructive",
      title: "Rating Required",
      description: "Please select a rating before submitting.",
    });
    return;
  }
  if (!formData.user_email) {
    toast({
      variant: "destructive",
      title: "Email Required",
      description: "Please enter your email address.",
    });
    return;
  }

  try {
    await rateEvent(ratingModal.event.id, formData);
    toast({
      title: "Thank you for your feedback! ⭐",
      description: "Your rating has been submitted successfully.",
    });
    setRatingModal({ open: false, event: null });
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Rating Failed",
      description: error.message || "You may have already rated this event.",
    });
  }
};

  const isEventPast = (eventDate) => {
    const today = new Date();
    const eventDateObj = new Date(eventDate);
    return eventDateObj < today;
  };

 if (loading) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-background to-muted/20'>
      <div className='container mx-auto px-4 py-12'>
        {/* Header Skeleton */}
        <div className='text-center mb-12 space-y-4'>
          <Skeleton className='h-12 w-64 mx-auto' />
          <Skeleton className='h-6 w-96 mx-auto' />
        </div>

        {/* Stats Skeleton */}
        <div className='grid md:grid-cols-4 gap-6 mb-12'>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className='pt-6 space-y-3'>
                <Skeleton className='h-8 w-8 mx-auto' />
                <Skeleton className='h-8 w-16 mx-auto' />
                <Skeleton className='h-4 w-24 mx-auto' />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Main Content Skeleton */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Featured Event Skeleton */}
            <div>
              <Skeleton className='h-8 w-48 mb-6' />
              <Card>
                <CardContent className='p-8 space-y-4'>
                  <Skeleton className='h-6 w-32' />
                  <Skeleton className='h-8 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                  <div className='flex items-center justify-between'>
                    <Skeleton className='h-10 w-10 rounded-full' />
                    <Skeleton className='h-10 w-32' />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Events List Skeleton */}
            <div>
              <Skeleton className='h-8 w-48 mb-6' />
              <div className='space-y-4'>
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className='p-6 space-y-3'>
                      <Skeleton className='h-6 w-full' />
                      <Skeleton className='h-4 w-3/4' />
                      <Skeleton className='h-4 w-1/2' />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className='space-y-6'>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className='h-6 w-32' />
                </CardHeader>
                <CardContent className='space-y-3'>
                  <Skeleton className='h-20 w-full' />
                  <Skeleton className='h-20 w-full' />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

  const featuredEvents = upcomingEvents.filter((e) => e.featured);

  return (
    <div className='min-h-screen bg-gradient-to-br from-background to-muted/20'>
      <div className='container mx-auto px-4 py-12'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl md:text-5xl font-bold mb-4'>
            Career{" "}
            <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              Events
            </span>
          </h1>
          <p className='text-xl text-muted-foreground max-w-2xl mx-auto mb-6'>
            Join workshops, webinars, and networking events to accelerate your
            professional growth
          </p>
          {isAdmin && (
            <Button
              size='lg'
              className='bg-gradient-to-r from-blue-600 to-purple-600'
              onClick={() => {
                setEditingEvent(null);
                setIsFormOpen(true);
              }}>
              <Plus className='w-4 h-4 mr-2' />
              Add New Event
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className='grid md:grid-cols-4 gap-6 mb-12'>
          <Card className='text-center'>
            <CardContent className='pt-6'>
              <Calendar className='w-8 h-8 text-primary mx-auto mb-2' />
              <div className='text-2xl font-bold'>{stats.totalEvents}</div>
              <div className='text-sm text-muted-foreground'>
                Events This Month
              </div>
            </CardContent>
          </Card>
          <Card className='text-center'>
            <CardContent className='pt-6'>
              <Users className='w-8 h-8 text-primary mx-auto mb-2' />
              <div className='text-2xl font-bold'>
                {stats.totalAttendees.toLocaleString()}+
              </div>
              <div className='text-sm text-muted-foreground'>
                Total Attendees
              </div>
            </CardContent>
          </Card>
          <Card className='text-center'>
            <CardContent className='pt-6'>
              <Star className='w-8 h-8 text-primary mx-auto mb-2' />
              <div className='text-2xl font-bold'>{stats.averageRating}★</div>
              <div className='text-sm text-muted-foreground'>
                Average Rating
              </div>
            </CardContent>
          </Card>
          <Card className='text-center'>
            <CardContent className='pt-6'>
              <Award className='w-8 h-8 text-primary mx-auto mb-2' />
              <div className='text-2xl font-bold'>
                {stats.satisfactionRate}%
              </div>
              <div className='text-sm text-muted-foreground'>
                Satisfaction Rate
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Featured Event */}
            {
              featuredEvents.length > 0 && (
                <div>
                  <h2 className='text-2xl font-bold mb-6'>Featured Event</h2>
                  {featuredEvents.slice(0, 1).map((event) => {
                    const isPast = isEventPast(event.date);
                    return (
                      <Card
                        key={event.id}
                        className='bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 overflow-hidden'>
                        <CardContent className='p-8'>
                          <div className='flex flex-col md:flex-row md:items-center justify-between mb-6'>
                            <div>
                              <Badge
                                variant='secondary'
                                className='mb-3 text-primary'>
                                {event.type}
                              </Badge>
                              <h3 className='text-2xl font-bold mb-2'>
                                {event.title}
                              </h3>
                              <div className='flex flex-wrap items-center gap-4 text-white/80'>
                                <div className='flex items-center space-x-1'>
                                  <Calendar className='w-4 h-4' />
                                  <span>{event.date}</span>
                                </div>
                                <div className='flex items-center space-x-1'>
                                  <Clock className='w-4 h-4' />
                                  <span>{event.time}</span>
                                </div>
                                <div className='flex items-center space-x-1'>
                                  <MapPin className='w-4 h-4' />
                                  <span>{event.location}</span>
                                </div>
                              </div>
                            </div>
                            <div className='text-center md:text-right mt-4 md:mt-0'>
                              <div className='text-3xl font-bold'>
                                {event.price}
                              </div>
                              <div className='text-white/80 text-sm'>
                                per person
                              </div>
                            </div>
                          </div>

                          <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-3'>
                              <Avatar className='w-10 h-10'>
                                <AvatarImage
                                  src={event.speaker_avatar}
                                  alt={event.speaker_name}
                                />
                                <AvatarFallback>
                                  {event.speaker_name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className='font-semibold'>
                                  {event.speaker_name}
                                </div>
                                <div className='text-white/80 text-sm'>
                                  {event.speaker_role}
                                </div>
                              </div>
                            </div>
                            <div className='flex items-center space-x-4'>
                              <div className='text-right text-sm'>
                                <div className='font-semibold'>
                                  {event.attendees || 0}/{event.max_attendees}
                                </div>
                                <div className='text-white/80'>registered</div>
                              </div>
                              {isAdmin ? (
                                <div className='flex gap-2'>
                                  <Button
                                    variant='secondary'
                                    size='sm'
                                    onClick={() => handleEdit(event)}>
                                    <Edit className='w-4 h-4' />
                                  </Button>
                                  <Button
                                    variant='destructive'
                                    size='sm'
                                    onClick={() => handleDelete(event.id)}>
                                    <Trash2 className='w-4 h-4' />
                                  </Button>
                                </div>
                              ) : isPast ? (
                                <Button
                                  variant='secondary'
                                  size='lg'
                                  onClick={() => handleRate(event)}>
                                  <Star className='w-4 h-4 mr-2' />
                                  Rate Us
                                </Button>
                              ) : (
                                <Button
                                  variant='secondary'
                                  size='lg'
                                  onClick={() => handleRegister(event)}>
                                  Register Now
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )
            }

            {
              /* Upcoming Events */
            }
            <div>
              <h2 className='text-2xl font-bold mb-6'>Upcoming Events</h2>
              {upcomingEvents.length === 0 ? (
                <Card>
                  <CardContent className='p-12 text-center text-muted-foreground'>
                    No upcoming events at the moment. Check back soon!
                  </CardContent>
                </Card>
              ) : (
                <div className='space-y-4'>
                  {upcomingEvents.map((event) => {
                    const isPast = isEventPast(event.date);
                    return (
                      <Card
                        key={event.id}
                        className='hover:shadow-lg transition-all duration-300'>
                        <CardContent className='p-6'>
                          <div className='flex flex-col md:flex-row md:items-center justify-between'>
                            <div className='flex-1'>
                              <div className='flex items-center space-x-2 mb-2'>
                                <Badge
                                  variant={
                                    event.type === "In-Person"
                                      ? "default"
                                      : "outline"
                                  }>
                                  {event.type === "In-Person" ? (
                                    <MapPin className='w-3 h-3 mr-1' />
                                  ) : event.type === "Webinar" ? (
                                    <Video className='w-3 h-3 mr-1' />
                                  ) : (
                                    <Mic className='w-3 h-3 mr-1' />
                                  )}
                                  {event.type}
                                </Badge>
                                {event.featured && (
                                  <Badge className='bg-primary'>Featured</Badge>
                                )}
                                {isPast && (
                                  <Badge variant='secondary'>Past Event</Badge>
                                )}
                              </div>
                              <h3 className='text-lg font-semibold mb-2'>
                                {event.title}
                              </h3>
                              <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3'>
                                <div className='flex items-center space-x-1'>
                                  <Calendar className='w-4 h-4' />
                                  <span>{event.date}</span>
                                </div>
                                <div className='flex items-center space-x-1'>
                                  <Clock className='w-4 h-4' />
                                  <span>{event.time}</span>
                                </div>
                                <div className='flex items-center space-x-1'>
                                  <MapPin className='w-4 h-4' />
                                  <span>{event.location}</span>
                                </div>
                              </div>
                              <div className='flex items-center space-x-3'>
                                <Avatar className='w-8 h-8'>
                                  <AvatarImage
                                    src={event.speaker_avatar}
                                    alt={event.speaker_name}
                                  />
                                  <AvatarFallback>
                                    {event.speaker_name
                                      ?.split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className='font-medium text-sm'>
                                    {event.speaker_name}
                                  </div>
                                  <div className='text-muted-foreground text-xs'>
                                    {event.speaker_role}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className='flex items-center space-x-4 mt-4 md:mt-0'>
                              <div className='text-center'>
                                <div className='font-bold text-lg'>
                                  {event.price}
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                  {event.attendees || 0}/{event.max_attendees}{" "}
                                  spots
                                </div>
                              </div>
                              {isAdmin ? (
                                <div className='flex gap-2'>
                                  <Button
                                    size='sm'
                                    onClick={() => handleEdit(event)}>
                                    <Edit className='w-4 h-4' />
                                  </Button>
                                  <Button
                                    variant='destructive'
                                    size='sm'
                                    onClick={() => handleDelete(event.id)}>
                                    <Trash2 className='w-4 h-4' />
                                  </Button>
                                </div>
                              ) : isPast ? (
                                <Button onClick={() => handleRate(event)}>
                                  <Star className='w-4 h-4 mr-2' />
                                  Rate Us
                                </Button>
                              ) : (
                                <Button onClick={() => handleRegister(event)}>
                                  Register
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>;
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Event Calendar Widget */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Calendar className='w-5 h-5' />
                  <span>This Month</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='text-center p-4 bg-primary/10 rounded-lg'>
                    <div className='text-2xl font-bold text-primary'>
                      {upcomingEvents.length}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Upcoming Events
                    </div>
                  </div>
                  <div className='text-center p-4 bg-muted/50 rounded-lg'>
                    <div className='text-2xl font-bold'>
                      {upcomingEvents.filter((e) => e.price === "Free").length}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Free Events
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Past Events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {pastEvents.length === 0 ? (
                  <div className='text-center text-muted-foreground text-sm py-4'>
                    No past events yet
                  </div>
                ) : (
                  pastEvents.map((event) => (
                    <div
                      key={event.id}
                      className='p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer'
                      onClick={() => handleRate(event)}>
                      <div className='font-medium text-sm mb-1'>
                        {event.title}
                      </div>
                      <div className='flex items-center justify-between text-xs text-muted-foreground'>
                        <span>{event.date}</span>
                        <div className='flex items-center space-x-2'>
                          <div className='flex items-center space-x-1'>
                            <Users className='w-3 h-3' />
                            <span>{event.attendees || 0}</span>
                          </div>
                          {event.rating && (
                            <div className='flex items-center space-x-1'>
                              <Star className='w-3 h-3 fill-yellow-400 text-yellow-400' />
                              <span>{event.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Newsletter Signup */}
            <Card className='bg-gradient-to-r from-blue-600 to-purple-600 text-white'>
              <CardHeader>
                <CardTitle>Never Miss an Event</CardTitle>
                <CardDescription className='text-white/80'>
                  Get notified about upcoming career events and workshops
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant='secondary' className='w-full'>
                  Subscribe to Updates
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EventForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingEvent}
      />

      <RegistrationForm
        open={registrationModal.open}
        onClose={() => setRegistrationModal({ open: false, event: null })}
        onSubmit={submitRegistration}
        event={registrationModal.event}
      />

      <RatingForm
        open={ratingModal.open}
        onClose={() => setRatingModal({ open: false, event: null })}
        onSubmit={submitRating}
        event={ratingModal.event}
      />
    </div>
  );
}
