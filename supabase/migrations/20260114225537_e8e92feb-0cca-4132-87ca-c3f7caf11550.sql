-- Fix RSVP security: Only event hosts (via edit_token) should be able to see guest emails
-- Create a function to check if someone has edit access to an event
CREATE OR REPLACE FUNCTION public.is_event_editor(p_event_id uuid, p_edit_token text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM events 
    WHERE id = p_event_id 
    AND edit_token = p_edit_token
  );
$$;

-- Create a view for public RSVP data (excludes email for privacy)
CREATE OR REPLACE VIEW public.rsvps_public
WITH (security_invoker=on) AS
SELECT 
  id,
  event_id,
  name,
  status,
  plus_ones,
  dietary_note,
  custom_answers,
  waitlist_position,
  created_at,
  updated_at
  -- Excludes: email, fingerprint, notifications_enabled
FROM public.rsvps;

-- Drop existing overly permissive RSVP policies
DROP POLICY IF EXISTS "RSVPs are publicly viewable for their event" ON public.rsvps;
DROP POLICY IF EXISTS "Anyone can update RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Anyone can delete RSVPs" ON public.rsvps;

-- RSVPs: Deny direct SELECT (use rsvps_public view instead)
CREATE POLICY "RSVPs base table deny direct select"
ON public.rsvps FOR SELECT
USING (false);

-- RSVPs: Keep INSERT open for guests to RSVP (handled by secure function)
-- The existing "Anyone can create RSVPs" policy stays

-- RSVPs: Only allow updates via fingerprint match (same person updating their RSVP)
CREATE POLICY "RSVPs update own only via fingerprint"
ON public.rsvps FOR UPDATE
USING (false);

-- RSVPs: Only allow deletes via fingerprint match
CREATE POLICY "RSVPs delete own only via fingerprint"
ON public.rsvps FOR DELETE
USING (false);

-- Create secure function to get RSVPs with email (for hosts only)
CREATE OR REPLACE FUNCTION public.get_rsvps_for_host(p_event_id uuid, p_edit_token text)
RETURNS SETOF rsvps
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT r.* FROM rsvps r
  INNER JOIN events e ON e.id = r.event_id
  WHERE r.event_id = p_event_id
  AND e.edit_token = p_edit_token;
$$;

-- Create secure function to delete RSVP (by fingerprint or host)
CREATE OR REPLACE FUNCTION public.delete_rsvp_secure(p_rsvp_id uuid, p_fingerprint text DEFAULT NULL, p_edit_token text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Allow delete if fingerprint matches OR if host edit_token is valid
  IF p_fingerprint IS NOT NULL THEN
    DELETE FROM rsvps WHERE id = p_rsvp_id AND fingerprint = p_fingerprint;
  ELSIF p_edit_token IS NOT NULL THEN
    DELETE FROM rsvps r
    USING events e
    WHERE r.id = p_rsvp_id
    AND r.event_id = e.id
    AND e.edit_token = p_edit_token;
  ELSE
    RETURN false;
  END IF;
  
  RETURN FOUND;
END;
$$;

-- Create secure function to update RSVP (by fingerprint)
CREATE OR REPLACE FUNCTION public.update_rsvp_secure(
  p_rsvp_id uuid,
  p_fingerprint text,
  p_updates jsonb
)
RETURNS rsvps
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result rsvps;
BEGIN
  -- Verify fingerprint matches
  IF NOT EXISTS (SELECT 1 FROM rsvps WHERE id = p_rsvp_id AND fingerprint = p_fingerprint) THEN
    RAISE EXCEPTION 'Invalid RSVP or fingerprint';
  END IF;
  
  UPDATE rsvps SET
    name = COALESCE((p_updates->>'name')::text, name),
    email = CASE WHEN p_updates ? 'email' THEN (p_updates->>'email')::text ELSE email END,
    status = COALESCE((p_updates->>'status')::text, status),
    plus_ones = COALESCE((p_updates->>'plus_ones')::integer, plus_ones),
    dietary_note = CASE WHEN p_updates ? 'dietary_note' THEN (p_updates->>'dietary_note')::text ELSE dietary_note END,
    custom_answers = CASE WHEN p_updates ? 'custom_answers' THEN (p_updates->'custom_answers')::jsonb ELSE custom_answers END,
    notifications_enabled = COALESCE((p_updates->>'notifications_enabled')::boolean, notifications_enabled),
    updated_at = now()
  WHERE id = p_rsvp_id
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- Fix event_updates: Only allow inserts from host (via edit_token)
DROP POLICY IF EXISTS "Anyone can create event updates" ON public.event_updates;

-- Deny direct insert to event_updates
CREATE POLICY "Event updates deny direct insert"
ON public.event_updates FOR INSERT
WITH CHECK (false);

-- Create secure function to insert event updates (host only)
CREATE OR REPLACE FUNCTION public.insert_event_update_secure(
  p_event_id uuid,
  p_edit_token text,
  p_subject text,
  p_body text,
  p_recipient_filter text DEFAULT NULL,
  p_recipient_count integer DEFAULT 0
)
RETURNS event_updates
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result event_updates;
BEGIN
  -- Verify edit token
  IF NOT EXISTS (SELECT 1 FROM events WHERE id = p_event_id AND edit_token = p_edit_token) THEN
    RAISE EXCEPTION 'Invalid edit token';
  END IF;
  
  INSERT INTO event_updates (event_id, subject, body, recipient_filter, recipient_count)
  VALUES (p_event_id, p_subject, p_body, p_recipient_filter, p_recipient_count)
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;

-- Restrict event_updates SELECT to hosts only via function
DROP POLICY IF EXISTS "Event updates are viewable" ON public.event_updates;

CREATE POLICY "Event updates deny direct select"
ON public.event_updates FOR SELECT
USING (false);

-- Create secure function to get event updates (host only)
CREATE OR REPLACE FUNCTION public.get_event_updates_for_host(p_event_id uuid, p_edit_token text)
RETURNS SETOF event_updates
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT eu.* FROM event_updates eu
  INNER JOIN events e ON e.id = eu.event_id
  WHERE eu.event_id = p_event_id
  AND e.edit_token = p_edit_token
  ORDER BY eu.sent_at DESC;
$$;