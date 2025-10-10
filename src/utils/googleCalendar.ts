export const createGoogleCalendarLink = (event, userEmail) => {
  try {
    let startDate;
    const localString = `${event.date} ${event.time}`;
    const parsedDate = new Date(localString);

    if (isNaN(parsedDate.getTime())) {
      const cleanDate = new Date(
        `${event.date.replace(",", "")} ${event.time}`
      );
      if (isNaN(cleanDate.getTime()))
        throw new Error("Invalid event date/time");
      startDate = cleanDate;
    } else {
      startDate = parsedDate;
    }

    const durationMs = event.duration
      ? event.duration * 60 * 60 * 1000
      : 2 * 60 * 60 * 1000;

    const endDate = new Date(startDate.getTime() + durationMs);

    const formatDate = (date) => date.toISOString().replace(/-|:|\.\d{3}/g, "");

    const details = `
Event: ${event.title}
Speaker: ${event.speaker_name}
${event.speaker_role}

📍 Location: ${event.location}
Price: ${event.price}

${event.description || "Join us for this amazing event!"}

---
Registered via Career Events Platform
    `.trim();

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details,
      location: event.location,
      add: userEmail,
      ctz: "Africa/Nairobi",
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  } catch (error) {
    console.error("Error creating calendar link:", error);
    return "https://calendar.google.com/calendar/";
  }
};
