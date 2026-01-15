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
  v_event events;
  v_current_rsvp rsvps;
  v_current_going integer;
  v_new_status text;
  v_new_plus_ones integer;
BEGIN
  -- Get existing RSVP and verify fingerprint
  SELECT * INTO v_current_rsvp FROM rsvps WHERE id = p_rsvp_id AND fingerprint = p_fingerprint;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid RSVP or fingerprint';
  END IF;

  -- Determine the new status and plus_ones
  v_new_status := COALESCE((p_updates->>'status')::text, v_current_rsvp.status);
  v_new_plus_ones := COALESCE((p_updates->>'plus_ones')::integer, v_current_rsvp.plus_ones);

  -- Check capacity if changing TO 'going' from another status
  IF v_new_status = 'going' AND v_current_rsvp.status != 'going' THEN
    -- Lock the event row to prevent race conditions
    SELECT * INTO v_event FROM events WHERE id = v_current_rsvp.event_id FOR UPDATE;

    IF v_event.capacity IS NOT NULL THEN
      -- Count current attendees (including their plus ones)
      SELECT COALESCE(SUM(1 + COALESCE(plus_ones, 0)), 0)::integer
      INTO v_current_going
      FROM rsvps
      WHERE event_id = v_current_rsvp.event_id AND status = 'going';

      -- Check if adding this RSVP would exceed capacity
      IF v_current_going + 1 + v_new_plus_ones > v_event.capacity THEN
        RAISE EXCEPTION 'Event is at capacity';
      END IF;
    END IF;
  END IF;

  -- Proceed with the update
  UPDATE rsvps SET
    name = COALESCE((p_updates->>'name')::text, name),
    email = CASE WHEN p_updates ? 'email' THEN (p_updates->>'email')::text ELSE email END,
    status = v_new_status,
    plus_ones = v_new_plus_ones,
    dietary_note = CASE WHEN p_updates ? 'dietary_note' THEN (p_updates->>'dietary_note')::text ELSE dietary_note END,
    custom_answers = CASE WHEN p_updates ? 'custom_answers' THEN (p_updates->'custom_answers')::jsonb ELSE custom_answers END,
    notifications_enabled = COALESCE((p_updates->>'notifications_enabled')::boolean, notifications_enabled),
    updated_at = now()
  WHERE id = p_rsvp_id
  RETURNING * INTO result;

  RETURN result;
END;
$$;