import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
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
    const body: ContactFormData = await req.json();

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      console.error("Missing required fields:", { name: !!body.name, email: !!body.email, message: !!body.message });
      return new Response(JSON.stringify({ error: "Missing required fields: name, email, and message are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      console.error("Invalid email format:", body.email);
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate field lengths
    if (body.name.length > 100) {
      return new Response(JSON.stringify({ error: "Name must be less than 100 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.email.length > 255) {
      return new Response(JSON.stringify({ error: "Email must be less than 255 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.message.length > 5000) {
      return new Response(JSON.stringify({ error: "Message must be less than 5000 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.subject && body.subject.length > 200) {
      return new Response(JSON.stringify({ error: "Subject must be less than 200 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store the contact submission
    const { error: insertError } = await supabase.from("contact_submissions").insert({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      subject: body.subject?.trim() || null,
      message: body.message.trim(),
    });

    if (insertError) {
      console.error("Database insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to submit contact form. Please try again later." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email notification to hello@partito.org
    if (RESEND_API_KEY) {
      try {
        // SANITIZE all user input before embedding in HTML
        const safeName = escapeHtml(body.name.trim());
        const safeEmail = escapeHtml(body.email.trim().toLowerCase());
        const safeSubject = escapeHtml(body.subject?.trim());
        const safeMessage = escapeHtml(body.message.trim());

        const emailSubject = body.subject?.trim() || `Contact form: ${safeName}`;

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Partito <noreply@partito.org>",
            to: ["hello@partito.org"],
            reply_to: body.email.trim().toLowerCase(),
            subject: emailSubject,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #FAF9F6; color: #1A1A19;">
                <div style="background-color: #FFFFFF; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                  <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 24px 0; color: #1A1A19;">
                    📬 New Contact Form Submission
                  </h1>

                  <div style="background-color: #FAF9F6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                    <p style="font-size: 14px; color: #666; margin: 4px 0;">
                      <strong>From:</strong> ${safeName}
                    </p>
                    <p style="font-size: 14px; color: #666; margin: 4px 0;">
                      <strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #7C9A82;">${safeEmail}</a>
                    </p>
                    ${safeSubject ? `<p style="font-size: 14px; color: #666; margin: 4px 0;"><strong>Subject:</strong> ${safeSubject}</p>` : ""}
                  </div>

                  <div style="border-top: 1px solid #E5E5E5; padding-top: 24px;">
                    <p style="font-size: 14px; color: #666; margin: 0 0 8px 0;"><strong>Message:</strong></p>
                    <p style="font-size: 14px; color: #1A1A19; white-space: pre-wrap; line-height: 1.6; margin: 0;">${safeMessage}</p>
                  </div>
                </div>
                <p style="font-size: 12px; color: #999; text-align: center; margin-top: 24px;">
                  Sent via Partito contact form
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
          console.log("Email notification sent to hello@partito.org");
        }
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }
    } else {
      console.warn("RESEND_API_KEY not configured, skipping email notification");
    }

    console.log("Contact form submitted successfully:", { name: body.name, email: body.email, subject: body.subject });

    return new Response(JSON.stringify({ success: true, message: "Contact form submitted successfully" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Contact form error:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
