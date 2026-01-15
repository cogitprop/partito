import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecoverRequest {
  slug: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { slug, email }: RecoverRequest = await req.json();

    console.log(`Recovery request for slug: ${slug}, email: ${email}`);

    if (!slug || !email) {
      return new Response(
        JSON.stringify({ error: "Slug and email are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Clean the slug (extract from full URL if needed)
    let cleanSlug = slug.trim();
    if (cleanSlug.includes("/e/")) {
      cleanSlug = cleanSlug.split("/e/").pop() || cleanSlug;
    }
    if (cleanSlug.includes("/")) {
      cleanSlug = cleanSlug.split("/").pop() || cleanSlug;
    }

    console.log(`Cleaned slug: ${cleanSlug}`);

    // Create Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up the event by slug AND email (case-insensitive email match)
    const { data: event, error: dbError } = await supabase
      .from("events")
      .select("id, title, slug, edit_token, host_email, host_name")
      .eq("slug", cleanSlug)
      .maybeSingle();

    if (dbError) {
      console.error("Database error:", dbError);
      // Don't reveal database errors to user
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Always return success to prevent email enumeration attacks
    if (!event) {
      console.log("No event found for slug");
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if email matches (case-insensitive)
    if (!event.host_email || event.host_email.toLowerCase() !== email.toLowerCase()) {
      console.log("Email does not match host_email");
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate the edit link
    const baseUrl = Deno.env.get("SITE_URL") || "https://partito.org";
    const editLink = `${baseUrl}/e/${event.slug}/edit?token=${event.edit_token}`;

    console.log(`Sending recovery email to ${event.host_email}`);

    // Send the recovery email using Resend REST API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Partito <onboarding@resend.dev>",
        to: [event.host_email],
        subject: `Your edit link for "${event.title}"`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #FAF9F6; color: #1A1A19;">
            <div style="background-color: #FFFFFF; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px 0; color: #1A1A19;">
                Here's your edit link
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 24px 0;">
                Hi${event.host_name ? ` ${event.host_name}` : ''},<br><br>
                You requested the edit link for your event <strong>"${event.title}"</strong>. 
                Click the button below to manage your event.
              </p>
              <a href="${editLink}" style="display: inline-block; background-color: #7C9A82; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 500; font-size: 16px;">
                Manage Your Event
              </a>
              <p style="font-size: 14px; color: #999; margin: 24px 0 0 0; line-height: 1.5;">
                Or copy this link:<br>
                <a href="${editLink}" style="color: #7C9A82; word-break: break-all;">${editLink}</a>
              </p>
              <hr style="border: none; border-top: 1px solid #E5E5E5; margin: 24px 0;">
              <p style="font-size: 12px; color: #999; margin: 0;">
                If you didn't request this email, you can safely ignore it. 
                Someone may have entered your email by mistake.
              </p>
            </div>
            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 24px;">
              Sent by Partito • Simple event invitations
            </p>
          </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Resend API error:", errorData);
    } else {
      console.log("Email sent successfully");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in recover-edit-link function:", error);
    // Return success even on error to prevent information leakage
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
