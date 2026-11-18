/** An interview as a calendar event. */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  minutes: number;
  details: string;
  location: string | null;
}

/** "20261201T083000Z", the format both Google Calendar and .ics files use. */
export function calendarStamp(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function end(event: CalendarEvent): Date {
  return new Date(event.start.getTime() + event.minutes * 60000);
}

/** A link that opens Google Calendar with the event filled in. */
export function googleCalendarLink(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${calendarStamp(event.start)}/${calendarStamp(end(event))}`,
    details: event.details,
  });
  if (event.location) params.set("location", event.location);
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Escapes text for an .ics field. */
function icsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** An .ics file, which Apple Calendar, Outlook and others can import. */
export function icsFile(event: CalendarEvent, now = new Date()): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Interview Coach//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@interview-coach`,
    `DTSTAMP:${calendarStamp(now)}`,
    `DTSTART:${calendarStamp(event.start)}`,
    `DTEND:${calendarStamp(end(event))}`,
    `SUMMARY:${icsText(event.title)}`,
    `DESCRIPTION:${icsText(event.details)}`,
    ...(event.location ? [`LOCATION:${icsText(event.location)}`] : []),
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsText(event.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.join("\r\n")}\r\n`;
}
