-- Drop existing permissive policies on events
DROP POLICY IF EXISTS "Anyone can update events" ON public.events;
DROP POLICY IF EXISTS "Anyone can delete events" ON public.events;
DROP POLICY IF EXISTS "Events are publicly viewable" ON public.events;

-- Create a public view without sensitive fields
CREATE OR REPLACE VIEW public.events_public AS
SELECT 
  id, slug, title, description, cover_image, host_name,
  start_time, end_time, timezone, location_type, venue_name,
  address, location_visibility, virtual_link, virtual_link_visibility,
  allow_going, allow_maybe, allow_not_going, allow_plus_ones,
  max_plus_ones, capacity, enable_waitlist, guest_list_visibility,
  collect_email, collect_dietary, custom_questions, status,
  notify_on_rsvp, auto_delete_days, created_at, updated_at
FROM public.events;

-- Grant access to public view for anonymous users
GRANT SELECT ON public.events_public TO anon;
GRANT SELECT ON public.events_public TO authenticated;

-- Create a function to validate edit token and get full event data
CREATE OR REPLACE FUNCTION public.get_event_with_token(p_slug text, p_edit_token text)
RETURNS SETOF events
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM events 
  WHERE slug = p_slug 
  AND edit_token = p_edit_token;
$$;

-- Create a function to validate edit token by token lookup
CREATE OR REPLACE FUNCTION public.get_event_by_edit_token(p_edit_token text)
RETURNS SETOF events
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM events 
  WHERE edit_token = p_edit_token;
$$;

-- Create a function to update event with token validation
CREATE OR REPLACE FUNCTION public.update_event_with_token(
  p_id uuid,
  p_edit_token text,
  p_updates jsonb
)
RETURNS events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result events;
BEGIN
  -- Verify the token matches
  IF NOT EXISTS (SELECT 1 FROM events WHERE id = p_id AND edit_token = p_edit_token) THEN
    RAISE EXCEPTION 'Invalid edit token';
  END IF;
  
  -- Update the event (excluding sensitive fields from being overwritten)
  UPDATE events SET
    title = COALESCE((p_updates->>'title')::text, title),
    description = COALESCE((p_updates->>'description')::text, description),
    cover_image = CASE WHEN p_updates ? 'cover_image' THEN (p_updates->>'cover_image')::text ELSE cover_image END,
    host_name = COALESCE((p_updates->>'host_name')::text, host_name),
    host_email = CASE WHEN p_updates ? 'host_email' THEN (p_updates->>'host_email')::text ELSE host_email END,
    start_time = COALESCE((p_updates->>'start_time')::timestamptz, start_time),
    end_time = CASE WHEN p_updates ? 'end_time' THEN (p_updates->>'end_time')::timestamptz ELSE end_time END,
    timezone = COALESCE((p_updates->>'timezone')::text, timezone),
    location_type = COALESCE((p_updates->>'location_type')::text, location_type),
    venue_name = CASE WHEN p_updates ? 'venue_name' THEN (p_updates->>'venue_name')::text ELSE venue_name END,
    address = CASE WHEN p_updates ? 'address' THEN (p_updates->>'address')::text ELSE address END,
    virtual_link = CASE WHEN p_updates ? 'virtual_link' THEN (p_updates->>'virtual_link')::text ELSE virtual_link END,
    virtual_link_visibility = COALESCE((p_updates->>'virtual_link_visibility')::text, virtual_link_visibility),
    location_visibility = COALESCE((p_updates->>'location_visibility')::text, location_visibility),
    password = CASE WHEN p_updates ? 'password' THEN (p_updates->>'password')::text ELSE password END,
    password_hint = CASE WHEN p_updates ? 'password_hint' THEN (p_updates->>'password_hint')::text ELSE password_hint END,
    allow_going = COALESCE((p_updates->>'allow_going')::boolean, allow_going),
    allow_maybe = COALESCE((p_updates->>'allow_maybe')::boolean, allow_maybe),
    allow_not_going = COALESCE((p_updates->>'allow_not_going')::boolean, allow_not_going),
    allow_plus_ones = COALESCE((p_updates->>'allow_plus_ones')::boolean, allow_plus_ones),
    max_plus_ones = COALESCE((p_updates->>'max_plus_ones')::integer, max_plus_ones),
    capacity = CASE WHEN p_updates ? 'capacity' THEN (p_updates->>'capacity')::integer ELSE capacity END,
    enable_waitlist = COALESCE((p_updates->>'enable_waitlist')::boolean, enable_waitlist),
    guest_list_visibility = COALESCE((p_updates->>'guest_list_visibility')::text, guest_list_visibility),
    collect_email = COALESCE((p_updates->>'collect_email')::boolean, collect_email),
    collect_dietary = COALESCE((p_updates->>'collect_dietary')::boolean, collect_dietary),
    custom_questions = CASE WHEN p_updates ? 'custom_questions' THEN (p_updates->'custom_questions')::jsonb ELSE custom_questions END,
    notify_on_rsvp = COALESCE((p_updates->>'notify_on_rsvp')::boolean, notify_on_rsvp),
    auto_delete_days = COALESCE((p_updates->>'auto_delete_days')::integer, auto_delete_days),
    status = COALESCE((p_updates->>'status')::text, status),
    updated_at = now()
  WHERE id = p_id
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- Create a function to delete event with token validation
CREATE OR REPLACE FUNCTION public.delete_event_with_token(p_id uuid, p_edit_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the token matches
  IF NOT EXISTS (SELECT 1 FROM events WHERE id = p_id AND edit_token = p_edit_token) THEN
    RAISE EXCEPTION 'Invalid edit token';
  END IF;
  
  -- Delete the event
  DELETE FROM events WHERE id = p_id;
  
  RETURN true;
END;
$$;

-- New restrictive policy: Only allow SELECT on the base table for RPC calls
-- This allows the SECURITY DEFINER functions to work while blocking direct access
CREATE POLICY "Events viewable via secure functions only"
ON public.events
FOR SELECT
USING (false);

-- Block all direct updates - must use RPC function
CREATE POLICY "Events update via secure function only"
ON public.events
FOR UPDATE
USING (false);

-- Block all direct deletes - must use RPC function
CREATE POLICY "Events delete via secure function only"
ON public.events
FOR DELETE
USING (false);