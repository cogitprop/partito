-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add password_hash column
ALTER TABLE events ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Migrate existing plain text passwords to hashed versions
UPDATE events 
SET password_hash = crypt(password, gen_salt('bf')) 
WHERE password IS NOT NULL AND password != '' AND password_hash IS NULL;

-- Update verify_event_password to check hashed passwords with legacy fallback
CREATE OR REPLACE FUNCTION public.verify_event_password(p_slug text, p_password text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_password_hash text;
  v_legacy_password text;
BEGIN
  SELECT password_hash, password INTO v_password_hash, v_legacy_password
  FROM events WHERE slug = p_slug;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- No password set = public event
  IF v_password_hash IS NULL AND (v_legacy_password IS NULL OR v_legacy_password = '') THEN
    RETURN true;
  END IF;

  -- Check hashed password first (new system)
  IF v_password_hash IS NOT NULL THEN
    RETURN v_password_hash = crypt(p_password, v_password_hash);
  END IF;

  -- Fall back to legacy plain text (for migration period)
  RETURN v_legacy_password = p_password;
END;
$$;

-- Update update_event_with_token to hash passwords on update
CREATE OR REPLACE FUNCTION public.update_event_with_token(p_id uuid, p_edit_token text, p_updates jsonb)
 RETURNS events
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result events;
  v_new_password text;
  v_new_password_hash text;
BEGIN
  -- Verify the token matches
  IF NOT EXISTS (SELECT 1 FROM events WHERE id = p_id AND edit_token = p_edit_token) THEN
    RAISE EXCEPTION 'Invalid edit token';
  END IF;
  
  -- Hash password if provided
  v_new_password := p_updates->>'password';
  IF v_new_password IS NOT NULL AND v_new_password != '' THEN
    v_new_password_hash := crypt(v_new_password, gen_salt('bf'));
  ELSIF p_updates ? 'password' AND (v_new_password IS NULL OR v_new_password = '') THEN
    -- Password is being cleared
    v_new_password_hash := NULL;
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
    password_hash = CASE WHEN p_updates ? 'password' THEN v_new_password_hash ELSE password_hash END,
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
$function$;