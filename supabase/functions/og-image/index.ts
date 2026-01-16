import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Escape HTML special characters
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
 * Strip HTML tags and get plain text for description
 */
function stripHtml(html: string | undefined | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Generate full HTML page with OG meta tags for crawlers
 */
function generateOgHtml(
  title: string,
  description: string,
  image: string,
  url: string,
  redirectUrl: string
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="https://your-domain.com/favicon.png">
  <link rel="apple-touch-icon" href="https://your-domain.com/favicon.png">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${image}">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="Partito">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  
  <!-- Redirect real users to the SPA -->
  <meta http-equiv="refresh" content="0;url=${redirectUrl}">
  <script>window.location.href = "${redirectUrl}";</script>
</head>
<body>
  <p>Redirecting to <a href="${redirectUrl}">${title}</a>...</p>
</body>
</html>`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const format = url.searchParams.get("format") || "html"; // 'html' for crawlers, 'json' for API

    if (!slug) {
      return new Response(JSON.stringify({ error: "Slug is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`OG meta request for slug: ${slug}, format: ${format}`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch event from public view
    const { data: event, error } = await supabase
      .from("events_public")
      .select("title, description, host_name, cover_image, start_time")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const baseUrl = "https://your-domain.com";
    const defaultImage = `${baseUrl}/og-image.png`;
    const eventUrl = `${baseUrl}/e/${slug}`;

    if (!event) {
      // Return default meta for non-existent events
      const defaultTitle = "Partito – Beautiful Event Pages, Effortless RSVPs";
      const defaultDescription = "Create simple, beautiful event pages and collect RSVPs in seconds.";
      
      if (format === "json") {
        return new Response(
          JSON.stringify({
            title: defaultTitle,
            description: defaultDescription,
            image: defaultImage,
            url: baseUrl,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      return new Response(
        generateOgHtml(defaultTitle, defaultDescription, defaultImage, baseUrl, eventUrl),
        {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
        }
      );
    }

    // Build title
    const title = escapeHtml(event.title);
    const hostedBy = event.host_name ? ` | Hosted by ${escapeHtml(event.host_name)}` : "";
    const fullTitle = `${title}${hostedBy}`;

    // Build description - strip HTML and truncate
    let description = stripHtml(event.description) || `You're invited to ${title}`;
    if (description.length > 160) {
      description = description.substring(0, 157) + "...";
    }

    // Format date if available
    if (event.start_time) {
      const date = new Date(event.start_time);
      const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      description = `${formattedDate} • ${description}`;
      if (description.length > 160) {
        description = description.substring(0, 157) + "...";
      }
    }

    // Use cover image if available, otherwise default
    const image = event.cover_image || defaultImage;

    if (format === "json") {
      return new Response(
        JSON.stringify({
          title: fullTitle,
          description,
          image,
          url: eventUrl,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Return HTML with OG tags for crawlers
    return new Response(
      generateOgHtml(fullTitle, escapeHtml(description), image, eventUrl, eventUrl),
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in og-image function:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);