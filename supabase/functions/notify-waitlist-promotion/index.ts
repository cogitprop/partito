import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PromotionRequest {
  rsvpId: string;
  eventId: string;
}

/**
 * Escape HTML special characters to prevent XSS attacks
 */
function escapeHtml(text: string | undefined | null): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Format a date in a human-readable way
 */
function formatDate(dateStr: string, timezone?: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone || "UTC",
    });
  } catch {
    return dateStr;
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: PromotionRequest = await req.json();
    const { rsvpId, eventId } = payload;

    console.log(`Waitlist promotion notification for RSVP ${rsvpId}, event ${eventId}`);

    if (!rsvpId || !eventId) {
      return new Response(JSON.stringify({ error: "RSVP ID and event ID are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!RESEND_API_KEY) {
      console.log("No Resend API key configured");
      return new Response(JSON.stringify({ success: false, error: "Email not configured" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Create Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get RSVP details (using service role bypasses RLS)
    const { data: rsvp, error: rsvpError } = await supabase
      .from("rsvps")
      .select("id, name, email, plus_ones")
      .eq("id", rsvpId)
      .maybeSingle();

    if (rsvpError) {
      console.error("RSVP fetch error:", rsvpError);
      return new Response(JSON.stringify({ error: "Failed to fetch RSVP" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!rsvp) {
      console.log("RSVP not found");
      return new Response(JSON.stringify({ error: "RSVP not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if guest has an email
    if (!rsvp.email) {
      console.log("Guest has no email address - skipping notification");
      return new Response(JSON.stringify({ success: true, notified: false, reason: "no_email" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title, slug, host_name, start_time, timezone, venue_name, address, location_type, virtual_link")
      .eq("id", eventId)
      .maybeSingle();

    if (eventError) {
      console.error("Event fetch error:", eventError);
      return new Response(JSON.stringify({ error: "Failed to fetch event" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!event) {
      console.log("Event not found");
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // TODO: Set SITE_URL environment variable in your Supabase project
    const baseUrl = Deno.env.get("SITE_URL") || "https://your-domain.com";

    // Sanitize all user-provided data
    const safeGuestName = escapeHtml(rsvp.name);
    const safeEventTitle = escapeHtml(event.title);
    const safeHostName = escapeHtml(event.host_name);
    const safeVenueName = escapeHtml(event.venue_name);
    const safeAddress = escapeHtml(event.address);
    const safeEventSlug = encodeURIComponent(event.slug);

    // Format event date
    const eventDate = formatDate(event.start_time, event.timezone);

    // Build location info
    let locationHtml = "";
    if (event.location_type === "in_person" && (event.venue_name || event.address)) {
      locationHtml = `
        <p style="font-size: 14px; color: #666; margin: 8px 0;">
          📍 ${safeVenueName}${safeAddress ? `, ${safeAddress}` : ""}
        </p>
      `;
    } else if (event.location_type === "virtual" || event.location_type === "hybrid") {
      locationHtml = `
        <p style="font-size: 14px; color: #666; margin: 8px 0;">
          💻 Virtual event - link will be provided
        </p>
      `;
    }

    console.log(`Sending waitlist promotion email to ${rsvp.email}`);

    // Send the notification email using Resend REST API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Partito <onboarding@resend.dev>",
        to: [rsvp.email],
        subject: `🎉 You're in! A spot opened up for ${safeEventTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #FAF9F6; color: #1A1A19;">
            <div style="background-color: #FFFFFF; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 48px;">🎉</span>
              </div>
              <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px 0; color: #1A1A19; text-align: center;">
                Great news, ${safeGuestName}!
              </h1>
              <p style="font-size: 16px; color: #666; text-align: center; margin: 0 0 24px 0;">
                A spot opened up and you've been moved from the waitlist to the guest list!
              </p>

              <div style="background-color: #F0F5F1; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #7C9A82;">
                <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 12px 0; color: #1A1A19;">
                  ${safeEventTitle}
                </h2>
                <p style="font-size: 14px; color: #666; margin: 8px 0;">
                  🗓️ ${eventDate}
                </p>
                ${locationHtml}
                <p style="font-size: 14px; color: #666; margin: 8px 0;">
                  👤 Hosted by ${safeHostName}
                </p>
              </div>

              <p style="font-size: 14px; color: #666; text-align: center; margin-bottom: 24px;">
                Your RSVP status has been automatically updated to <strong style="color: #7C9A82;">Going</strong>.
              </p>

              <div style="text-align: center;">
                <a href="${baseUrl}/e/${safeEventSlug}" style="display: inline-block; background-color: #7C9A82; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 500; font-size: 16px;">
                  View Event Details
                </a>
              </div>
            </div>
            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 24px;">
              Sent by Partito • <a href="${baseUrl}/e/${safeEventSlug}" style="color: #999;">View event</a>
            </p>
          </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Resend API error:", errorData);
      return new Response(JSON.stringify({ success: false, error: "Failed to send email" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Waitlist promotion notification sent successfully");

    return new Response(JSON.stringify({ success: true, notified: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notify-waitlist-promotion function:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
