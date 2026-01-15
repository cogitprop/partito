import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit configuration
const RATE_LIMIT_WINDOW_MINUTES = 60; // 1 hour window
const MAX_EVENTS_PER_WINDOW = 5; // Max 5 events per hour per IP

interface EventData {
  title: string;
  description?: string;
  cover_image?: string;
  host_name: string;
  host_email?: string;
  start_time: string;
  end_time?: string;
  timezone?: string;
  location_type?: string;
  venue_name?: string;
  address?: string;
  virtual_link?: string;
  virtual_link_visibility?: string;
  location_visibility?: string;
  password?: string;
  password_hint?: string;
  allow_going?: boolean;
  allow_maybe?: boolean;
  allow_not_going?: boolean;
  allow_plus_ones?: boolean;
  max_plus_ones?: number;
  capacity?: number;
  enable_waitlist?: boolean;
  guest_list_visibility?: string;
  collect_email?: boolean;
  collect_dietary?: boolean;
  custom_questions?: unknown[];
  notify_on_rsvp?: boolean;
  auto_delete_days?: number;
  slug?: string;
}

// Generate a random slug from title
function generateSlug(title: string, suffix?: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 40);
  
  return suffix ? `${base}-${suffix}` : base;
}

// Generate random suffix
function generateSuffix(): string {
  return Math.random().toString(36).substring(2, 6);
}

// Generate secure token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from headers
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("cf-connecting-ip") 
      || req.headers.get("x-real-ip")
      || "unknown";

    console.log(`Event creation request from IP: ${clientIP}`);

    // Create Supabase client with service role for rate limiting
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
    
    const { count, error: countError } = await supabase
      .from("rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", clientIP)
      .eq("action", "event_creation")
      .gte("created_at", windowStart);

    if (countError) {
      console.error("Error checking rate limit:", countError);
      // Continue anyway - don't block on rate limit errors
    }

    const currentCount = count || 0;
    console.log(`Rate limit check: ${currentCount}/${MAX_EVENTS_PER_WINDOW} events in last ${RATE_LIMIT_WINDOW_MINUTES} minutes`);

    if (currentCount >= MAX_EVENTS_PER_WINDOW) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: `You can only create ${MAX_EVENTS_PER_WINDOW} events per hour. Please try again later.`,
          retryAfter: RATE_LIMIT_WINDOW_MINUTES * 60,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(RATE_LIMIT_WINDOW_MINUTES * 60) },
        }
      );
    }

    // Parse and validate request body
    const eventData: EventData = await req.json();

    if (!eventData.title || eventData.title.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Validation error", message: "Event title is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!eventData.host_name || eventData.host_name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Validation error", message: "Host name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!eventData.start_time) {
      return new Response(
        JSON.stringify({ error: "Validation error", message: "Start time is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Input length validation
    if (eventData.title.length > 200) {
      return new Response(
        JSON.stringify({ error: "Validation error", message: "Title must be less than 200 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (eventData.description && eventData.description.length > 10000) {
      return new Response(
        JSON.stringify({ error: "Validation error", message: "Description must be less than 10000 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate unique slug
    let slug = eventData.slug || generateSlug(eventData.title);
    let isAvailable = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!isAvailable && attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from("events_public")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      
      if (!existing) {
        isAvailable = true;
      } else {
        slug = generateSlug(eventData.title, generateSuffix());
        attempts++;
      }
    }

    if (!isAvailable) {
      return new Response(
        JSON.stringify({ error: "Server error", message: "Failed to generate unique event URL" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate edit token
    const editToken = generateToken();

    // Hash password if provided
    let passwordHash: string | null = null;
    if (eventData.password && eventData.password.trim() !== '') {
      passwordHash = await bcrypt.hash(eventData.password);
      console.log("Password hashed successfully");
    }

    // Create the event
    const { data: event, error: insertError } = await supabase
      .from("events")
      .insert({
        ...eventData,
        slug,
        edit_token: editToken,
        password_hash: passwordHash,
        timezone: eventData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating event:", insertError);
      return new Response(
        JSON.stringify({ error: "Database error", message: "Failed to create event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record rate limit entry
    await supabase.from("rate_limits").insert({
      ip_address: clientIP,
      action: "event_creation",
    });

    // Clean up old rate limit entries periodically (1% chance per request)
    if (Math.random() < 0.01) {
      await supabase.rpc("cleanup_old_rate_limits");
    }

    console.log(`Event created successfully: ${slug} (${event.id})`);

    return new Response(
      JSON.stringify({
        success: true,
        event: {
          ...event,
          custom_questions: event.custom_questions || [],
        },
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Server error", message: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
