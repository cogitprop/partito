import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyRequest {
  rsvpId: string;
  wasWaitlisted?: boolean;
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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotifyRequest = await req.json();
    const { rsvpId, wasWaitlisted } = payload;

    console.log(`RSVP notification request for rsvpId ${rsvpId}`);

    if (!rsvpId) {
      return new Response(JSON.stringify({ error: "RSVP ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Create Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify RSVP exists and was recently created (within last 5 minutes)
    // This prevents spam by ensuring only recent, valid RSVPs can trigger notifications
    const { data: rsvp, error: rsvpError } = await supabase
      .from("rsvps")
      .select("id, event_id, name, email, status, plus_ones, dietary_note, created_at")
      .eq("id", rsvpId)
      .maybeSingle();

    if (rsvpError) {
      console.error("Database error fetching RSVP:", rsvpError);
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

    // Security: Only allow notifications for RSVPs created in the last 5 minutes
    const createdAt = new Date(rsvp.created_at);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (createdAt < fiveMinutesAgo) {
      console.log("RSVP too old for notification");
      return new Response(JSON.stringify({ success: true, notified: false, reason: "RSVP too old" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get event details
    const { data: event, error: dbError } = await supabase
      .from("events")
      .select("id, title, slug, host_email, host_name, notify_on_rsvp")
      .eq("id", rsvp.event_id)
      .maybeSingle();

    if (dbError) {
      console.error("Database error:", dbError);
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

    // Check if notifications are enabled and host email exists
    if (!event.notify_on_rsvp || !event.host_email) {
      console.log("Notifications disabled or no host email");
      return new Response(JSON.stringify({ success: true, notified: false }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Use data from database (trusted source)
    const guestName = rsvp.name;
    const guestEmail = rsvp.email;
    const status = rsvp.status;
    const plusOnes = rsvp.plus_ones;
    const dietaryNote = rsvp.dietary_note;

    // Prepare status display
    const statusDisplay = wasWaitlisted
      ? "added to waitlist"
      : status === "going"
        ? "is going"
        : status === "maybe"
          ? "might attend"
          : "can't make it";

    const statusEmoji = wasWaitlisted ? "⏳" : status === "going" ? "✅" : status === "maybe" ? "🤔" : "❌";

    const statusColor = wasWaitlisted
      ? "#F59E0B"
      : status === "going"
        ? "#7C9A82"
        : status === "maybe"
          ? "#3B82F6"
          : "#EF4444";

    // Build additional details - SANITIZE all user input
    const details: string[] = [];
    if (plusOnes && plusOnes > 0) {
      details.push(`<strong>+${plusOnes}</strong> additional guest${plusOnes > 1 ? "s" : ""}`);
    }
    if (guestEmail) {
      // Sanitize email before embedding in HTML
      const safeEmail = escapeHtml(guestEmail);
      details.push(`Email: <a href="mailto:${safeEmail}" style="color: #7C9A82;">${safeEmail}</a>`);
    }
    if (dietaryNote) {
      // CRITICAL: Sanitize dietary note to prevent XSS
      details.push(`Dietary: ${escapeHtml(dietaryNote)}`);
    }

    // TODO: Set SITE_URL environment variable in your Supabase project
    const baseUrl = Deno.env.get("SITE_URL") || "https://your-domain.com";

    // Sanitize event data as well
    const safeGuestName = escapeHtml(guestName);
    const safeEventTitle = escapeHtml(event.title);
    const safeEventSlug = encodeURIComponent(event.slug);

    console.log(`Sending RSVP notification to ${event.host_email}`);

    // Send the notification email using Resend REST API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Partito <noreply@partito.org>",
        to: [event.host_email],
        subject: `${statusEmoji} New RSVP: ${safeGuestName} ${statusDisplay}`,
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
                <span style="font-size: 48px;">${statusEmoji}</span>
              </div>
              <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px 0; color: #1A1A19; text-align: center;">
                New RSVP for ${safeEventTitle}
              </h1>
              <p style="font-size: 16px; color: #666; text-align: center; margin: 0 0 24px 0;">
                ${safeGuestName} <span style="color: ${statusColor}; font-weight: 600;">${statusDisplay}</span>
              </p>

              ${
                details.length > 0
                  ? `
                <div style="background-color: #FAF9F6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                  ${details.map((d) => `<p style="font-size: 14px; color: #666; margin: 4px 0;">${d}</p>`).join("")}
                </div>
              `
                  : ""
              }

              <div style="text-align: center;">
                <a href="${baseUrl}/e/${safeEventSlug}/edit" style="display: inline-block; background-color: #7C9A82; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 500; font-size: 16px;">
                  View All RSVPs
                </a>
              </div>
            </div>
            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 24px;">
              Sent by Partito • <a href="${baseUrl}/e/${safeEventSlug}/edit" style="color: #999;">Manage notification settings</a>
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

    console.log("RSVP notification email sent successfully");

    return new Response(JSON.stringify({ success: true, notified: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notify-rsvp function:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);