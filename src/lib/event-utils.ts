import type { Event, Rsvp } from "@/types/event";

// Production domain for shareable links
const PRODUCTION_DOMAIN = "https://partito.org";

/**
 * Generate the shareable URL for an event.
 * Uses clean production URLs - Cloudflare Worker handles crawler detection
 * and proxies to Supabase edge function for dynamic OG meta tags.
 */
export const getShareableEventUrl = (slug: string): string => {
  return `https://share.partito.org/e/${slug}`;
};

/**
 * Generate the direct event URL (for internal use/redirects)
 */
export const getDirectEventUrl = (slug: string): string => {
  return `${PRODUCTION_DOMAIN}/e/${slug}`;
};

export const generateId = (): string => {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

/**
 * Generate a cryptographically secure token for edit links
 * Uses Web Crypto API for proper randomness
 */
export const generateToken = (): string => {
  const array = new Uint8Array(32); // 32 bytes = 256 bits
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

export const generateSlug = (title: string, suffix?: string): string => {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 50);

  // Add random suffix to help ensure uniqueness
  if (suffix) {
    slug = `${slug}-${suffix}`;
  }

  return slug;
};

/**
 * Generate a short random suffix for slug uniqueness
 */
export const generateSlugSuffix = (): string => {
  const array = new Uint8Array(3);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(36))
    .join("")
    .substring(0, 4);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatDate = (dateString: string, timezone?: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: timezone,
  });
};

export const formatTime = (dateString: string, timezone?: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  });
};

export const getTimezoneAbbr = (timezone: string): string => {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    });
    const parts = formatter.formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value || timezone;
  } catch {
    return timezone;
  }
};

/**
 * Format a date string for datetime-local input in the event's timezone
 */
export const formatDateTimeLocal = (dateString: string, timezone?: string): string => {
  try {
    const date = new Date(dateString);
    // Create a formatter that outputs in the target timezone
    const formatter = new Intl.DateTimeFormat("sv-SE", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // sv-SE locale gives us YYYY-MM-DD HH:mm format
    const formatted = formatter.format(date);
    // Convert "YYYY-MM-DD HH:mm" to "YYYY-MM-DDTHH:mm" for datetime-local input
    return formatted.replace(" ", "T");
  } catch {
    // Fallback to ISO string slice if timezone formatting fails
    return new Date(dateString).toISOString().slice(0, 16);
  }
};

/**
 * Fold long lines per RFC 5545 (max 75 octets per line)
 */
const foldLine = (line: string): string => {
  const maxLen = 75;
  if (line.length <= maxLen) return line;

  const parts: string[] = [];
  let remaining = line;
  let first = true;

  while (remaining.length > 0) {
    const len = first ? maxLen : maxLen - 1; // Continuation lines have leading space
    parts.push((first ? "" : " ") + remaining.substring(0, len));
    remaining = remaining.substring(len);
    first = false;
  }

  return parts.join("\r\n");
};

/**
 * Escape text for ICS format per RFC 5545
 */
const escapeICSText = (text: string): string => {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
};

export const generateICS = (event: Event): string => {
  const formatICSDate = (date: string) => new Date(date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Partito//partito.org//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@partito.org`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatICSDate(event.start_time)}`,
  ];

  if (event.end_time) {
    lines.push(`DTEND:${formatICSDate(event.end_time)}`);
  }

  lines.push(foldLine(`SUMMARY:${escapeICSText(event.title)}`));

  if (event.description) {
    const cleanDesc = event.description.replace(/<[^>]*>/g, "");
    lines.push(foldLine(`DESCRIPTION:${escapeICSText(cleanDesc)}`));
  }

  if (event.address) {
    const location = event.venue_name ? `${event.venue_name}, ${event.address}` : event.address;
    lines.push(foldLine(`LOCATION:${escapeICSText(location)}`));
  }

  if (event.virtual_link) {
    lines.push(foldLine(`URL:${event.virtual_link}`));
  }

  lines.push("END:VEVENT");
  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
};

export const downloadICS = (icsContent: string, filename: string): void => {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const generateGoogleCalendarUrl = (event: Event): string => {
  const formatGoogleDate = (date: string) => new Date(date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const endTime = event.end_time || event.start_time;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatGoogleDate(event.start_time)}/${formatGoogleDate(endTime)}`,
  });

  if (event.description) {
    params.set("details", event.description.replace(/<[^>]*>/g, ""));
  }

  if (event.address) {
    params.set("location", event.venue_name ? `${event.venue_name}, ${event.address}` : event.address);
  }

  return `https://calendar.google.com/calendar/render?${params}`;
};

export const generateOutlookUrl = (event: Event): string => {
  const endTime = event.end_time || event.start_time;

  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    startdt: new Date(event.start_time).toISOString(),
    enddt: new Date(endTime).toISOString(),
  });

  if (event.description) {
    params.set("body", event.description.replace(/<[^>]*>/g, ""));
  }

  if (event.address) {
    params.set("location", event.venue_name ? `${event.venue_name}, ${event.address}` : event.address);
  }

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params}`;
};

export const generateAppleCalendarUrl = (event: Event): string => {
  // Apple Calendar uses webcal protocol with ICS served from edge function
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const functionUrl = `${supabaseUrl}/functions/v1/event-calendar?slug=${event.slug}`;
  // Convert https:// to webcal:// for Apple Calendar subscription
  return functionUrl.replace(/^https:\/\//, "webcal://");
};

export const generateMapsUrl = (address: string): string => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const encoded = encodeURIComponent(address);
  return isIOS ? `maps://maps.apple.com/?q=${encoded}` : `https://www.google.com/maps/search/?api=1&query=${encoded}`;
};

/**
 * Sanitize a string for safe CSV output
 * Escapes double quotes and removes/replaces problematic characters
 */
const sanitizeCSVCell = (value: string | number | boolean | null | undefined): string => {
  const str = String(value ?? "");
  // Replace newlines and carriage returns with spaces
  // Escape double quotes by doubling them
  // Remove any other control characters
  return str
    .replace(/[\r\n]+/g, " ")
    .replace(/"/g, '""')
    .replace(/[\x00-\x1F\x7F]/g, ""); // Remove control characters
};

export const exportGuestsCSV = (
  guests: Rsvp[],
  eventTitle: string,
  customQuestions?: Array<{ id: string; label: string }>,
): void => {
  // Base headers
  const headers = ["Name", "Email", "Status", "Plus Ones", "Dietary Note", "RSVP Date"];

  // Add custom question headers
  if (customQuestions && customQuestions.length > 0) {
    customQuestions.forEach((q) => headers.push(q.label));
  }

  const rows = guests.map((g) => {
    const row: (string | number)[] = [
      sanitizeCSVCell(g.name),
      sanitizeCSVCell(g.email),
      sanitizeCSVCell(g.status),
      g.plus_ones || 0,
      sanitizeCSVCell(g.dietary_note),
      new Date(g.created_at).toLocaleDateString(),
    ];

    // Add custom question answers
    if (customQuestions && customQuestions.length > 0) {
      customQuestions.forEach((q) => {
        const answer = g.custom_answers?.[q.id];
        row.push(sanitizeCSVCell(answer !== undefined ? String(answer) : ""));
      });
    }

    return row;
  });

  // Build CSV with proper quoting
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${sanitizeCSVCell(cell)}"`).join(",")).join("\n");

  const slug = eventTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug}-guests.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
};

export const getAttendeeCount = (rsvps: Rsvp[]): number => {
  return rsvps.filter((r) => r.status === "going").reduce((sum, r) => sum + 1 + (r.plus_ones || 0), 0);
};

/**
 * Get remaining capacity for an event
 */
export const getRemainingCapacity = (event: Event, rsvps: Rsvp[]): number | null => {
  if (!event.capacity) return null;
  const attendeeCount = getAttendeeCount(rsvps);
  return Math.max(0, event.capacity - attendeeCount);
};

/**
 * Check if event is at capacity
 */
export const isAtCapacity = (event: Event, rsvps: Rsvp[]): boolean => {
  if (!event.capacity) return false;
  const remaining = getRemainingCapacity(event, rsvps);
  return remaining !== null && remaining <= 0;
};
