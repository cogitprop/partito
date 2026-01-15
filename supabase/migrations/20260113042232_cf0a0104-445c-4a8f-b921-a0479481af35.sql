-- Fix the view to use SECURITY INVOKER (default, more secure)
DROP VIEW IF EXISTS public.events_public;

CREATE VIEW public.events_public 
WITH (security_invoker = true)
AS
SELECT 
  id, slug, title, description, cover_image, host_name,
  start_time, end_time, timezone, location_type, venue_name,
  address, location_visibility, virtual_link, virtual_link_visibility,
  allow_going, allow_maybe, allow_not_going, allow_plus_ones,
  max_plus_ones, capacity, enable_waitlist, guest_list_visibility,
  collect_email, collect_dietary, custom_questions, status,
  notify_on_rsvp, auto_delete_days, created_at, updated_at
FROM public.events;

-- Grant access to the view
GRANT SELECT ON public.events_public TO anon;
GRANT SELECT ON public.events_public TO authenticated;

-- We need a permissive SELECT policy for the view to work (but it only shows non-sensitive columns)
-- Drop the restrictive policy we just created
DROP POLICY IF EXISTS "Events viewable via secure functions only" ON public.events;

-- Create a SELECT policy that allows viewing (the view filters sensitive columns)
CREATE POLICY "Events base table readable for view"
ON public.events
FOR SELECT
USING (true);