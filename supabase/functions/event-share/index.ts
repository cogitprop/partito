import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Common crawler/bot user agents
const CRAWLER_PATTERNS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'Slackbot',
  'TelegramBot',
  'Discordbot',
  'Pinterest',
  'Googlebot',
  'bingbot',
  'iMessageLinkPreview',
  'Applebot',
  'vkShare',
  'W3C_Validator',
  'redditbot',
  'Embedly',
  'SkypeUriPreview',
  'quora link preview',
  'Tumblr',
  'Yahoo Link Preview',
  'Google-PageRenderer',
];

function isCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return CRAWLER_PATTERNS.some(pattern => ua.includes(pattern.toLowerCase()));
}

function escapeHtml(text: string | undefined | null): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripHtml(html: string | undefined | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

function generateOgHtml(
  title: string,
  description: string,
  image: string,
  url: string,
  canonicalUrl: string
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
  
  <link rel="canonical" href="${canonicalUrl}">
  
  <!-- Redirect real users to the SPA -->
  <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
  <script>window.location.replace("${canonicalUrl}");</script>
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #FAF9F7;
      color: #4A4A4A;
    }
    .loading {
      text-align: center;
    }
    a {
      color: #C4704F;
    }
  </style>
</head>
<body>
  <div class="loading">
    <p>Loading event...</p>
    <p><a href="${canonicalUrl}">Click here if you're not redirected</a></p>
  </div>
</body>
</html>`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userAgent = req.headers.get("user-agent");
    
    // Extract slug from path: /event-share/my-slug or query param
    const pathParts = url.pathname.split('/');
    const slugFromPath = pathParts[pathParts.length - 1];
    const slug = url.searchParams.get("slug") || (slugFromPath !== 'event-share' ? slugFromPath : null);

    console.log(`Event share request - slug: ${slug}, UA: ${userAgent?.substring(0, 100)}`);

    if (!slug) {
      // Redirect to homepage if no slug
      return new Response(null, {
        status: 302,
        headers: { 
          "Location": "https://your-domain.com",
          ...corsHeaders 
        },
      });
    }

    const baseUrl = "https://your-domain.com";
    const canonicalUrl = `${baseUrl}/e/${slug}`;
    const defaultImage = `${baseUrl}/og-image.png`;

    // For non-crawlers, immediately redirect to the SPA
    if (!isCrawler(userAgent)) {
      console.log("Non-crawler detected, redirecting to SPA");
      return new Response(null, {
        status: 302,
        headers: { 
          "Location": canonicalUrl,
          ...corsHeaders 
        },
      });
    }

    console.log("Crawler detected, serving OG HTML");

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
    }

    if (!event) {
      // Return default Partito branding for non-existent events
      const defaultTitle = "Partito – Beautiful Event Pages, Effortless RSVPs";
      const defaultDescription = "Create simple, beautiful event pages and collect RSVPs in seconds.";
      
      return new Response(
        generateOgHtml(defaultTitle, defaultDescription, defaultImage, baseUrl, canonicalUrl),
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
    let description = stripHtml(event.description) || `You're invited to ${event.title}`;
    
    // Format date if available
    if (event.start_time) {
      try {
        const date = new Date(event.start_time);
        const formattedDate = date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        });
        description = `${formattedDate} • ${description}`;
      } catch (e) {
        console.error("Date formatting error:", e);
      }
    }
    
    if (description.length > 160) {
      description = description.substring(0, 157) + "...";
    }

    // Use cover image if available, otherwise default
    const image = event.cover_image || defaultImage;

    // Serve HTML with OG tags
    return new Response(
      generateOgHtml(fullTitle, escapeHtml(description), image, canonicalUrl, canonicalUrl),
      {
        status: 200,
        headers: { 
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300", // Cache for 5 minutes
          ...corsHeaders 
        },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in event-share function:", error);
    
    // On error, redirect to homepage
    return new Response(null, {
      status: 302,
      headers: { 
        "Location": "https://your-domain.com",
        ...corsHeaders 
      },
    });
  }
};

serve(handler);