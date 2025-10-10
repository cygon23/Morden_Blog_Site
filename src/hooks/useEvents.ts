import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const useEvents = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    averageRating: 4.8,
    satisfactionRate: 95,
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const currentDate = new Date().toISOString();

      // Fetch all events
      const { data: allEvents, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (eventsError) throw eventsError;

      // Get registration counts for all events
      const eventsWithCounts = await Promise.all(
        (allEvents || []).map(async (event) => {
          const { count } = await supabase
            .from("event_registrations")
            .select("*", { count: "exact", head: true })
            .eq("event_id", event.id);

          const { data: ratings } = await supabase
            .from("event_ratings")
            .select("rating")
            .eq("event_id", event.id);

          const avgRating =
            ratings && ratings.length > 0
              ? (
                  ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
                ).toFixed(1)
              : null;

          return {
            ...event,
            attendees: count || 0,
            rating: avgRating ? parseFloat(avgRating) : null,
          };
        })
      );

      // Separate into upcoming and past based on date
      const upcoming = eventsWithCounts.filter((event) => {
        const eventDate = new Date(event.date).toISOString();
        return eventDate >= currentDate || event.status === "upcoming";
      });

      const past = eventsWithCounts
        .filter((event) => {
          const eventDate = new Date(event.date).toISOString();
          return eventDate < currentDate || event.status === "past";
        })
        .slice(0, 3);

      setUpcomingEvents(upcoming);
      setPastEvents(past);

      const totalAttendees = eventsWithCounts.reduce(
        (sum, event) => sum + (event.attendees || 0),
        0
      );

      const avgRating =
        past.length > 0
          ? (
              past.reduce((sum, event) => sum + (event.rating || 0), 0) /
              past.length
            ).toFixed(1)
          : 4.8;

      setStats({
        totalEvents: upcoming.length,
        totalAttendees,
        averageRating: parseFloat(avgRating),
        satisfactionRate: 95,
      });
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (eventData) => {
    const { data, error } = await supabase
      .from("events")
      .insert([eventData])
      .select();

    if (error) throw error;
    await fetchEvents();
    return data;
  };

  const updateEvent = async (id, eventData) => {
    const { data, error } = await supabase
      .from("events")
      .update(eventData)
      .eq("id", id)
      .select();

    if (error) throw error;
    await fetchEvents();
    return data;
  };

  const deleteEvent = async (id) => {
    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) throw error;
    await fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const registerForEvent = async (eventId, registrationData) => {
    const { data, error } = await supabase
      .from("event_registrations")
      .insert([
        {
          event_id: eventId,
          ...registrationData,
          reminder_method: "google_calendar",
        },
      ])
      .select();

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        throw new Error("You have already registered for this event.");
      } else if (
        error.message.includes("duplicate") ||
        error.message.includes("already")
      ) {
        throw new Error("You have already registered for this event.");
      } else {
        throw new Error("Registration failed. Please try again.");
      }
    }

    await fetchEvents();
    return data;
  };

  const rateEvent = async (eventId, ratingData) => {
    const { data, error } = await supabase
      .from("event_ratings")
      .insert([{ event_id: eventId, ...ratingData }])
      .select();

    if (error) {
      // Handle specific error codes
      if (error.code === "23505") {
        throw new Error("You have already rated this event.");
      } else if (
        error.message.includes("duplicate") ||
        error.message.includes("already")
      ) {
        throw new Error("You have already rated this event.");
      } else {
        throw new Error("Failed to submit rating. Please try again.");
      }
    }

    await fetchEvents();
    return data;
  };

  const getEventRegistrationCount = async (eventId) => {
    const { count, error } = await supabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId);

    if (error) throw error;
    return count;
  };

  return {
    upcomingEvents,
    pastEvents,
    loading,
    stats,
    addEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    rateEvent,
    getEventRegistrationCount,
    refetch: fetchEvents,
  };
};
