import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const len = first ? maxLen : maxLen - 1;
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
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
};

interface EventData {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  venue_name: string | null;
  address: string | null;
  virtual_link: string | null;
  slug: string;
}

const generateICS = (event: EventData): string => {
  const formatICSDate = (date: string) =>
    new Date(date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

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
    const location = event.venue_name
      ? `${event.venue_name}, ${event.address}`
      : event.address;
    lines.push(foldLine(`LOCATION:${escapeICSText(location)}`));
  }

  if (event.virtual_link) {
    lines.push(foldLine(`URL:${event.virtual_link}`));
  }

  lines.push("END:VEVENT");
  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get slug from URL path or query param
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const slugFromPath = pathParts[pathParts.length - 1]?.replace(".ics", "");
    const slug = url.searchParams.get("slug") || slugFromPath;

    if (!slug) {
      console.error("No slug provided");
      return new Response(JSON.stringify({ error: "Event slug is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Generating ICS for event: ${slug}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch event from public view
    const { data: event, error: dbError } = await supabase
      .from("events_public")
      .select("id, title, description, start_time, end_time, venue_name, address, virtual_link, slug")
      .eq("slug", slug)
      .maybeSingle();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to fetch event" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!event) {
      console.error("Event not found:", slug);
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate ICS content
    const icsContent = generateICS(event as EventData);
    const filename = `${slug}.ics`;

    console.log(`Successfully generated ICS for event: ${event.title}`);

    // Return ICS file with proper headers for download
    return new Response(icsContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
