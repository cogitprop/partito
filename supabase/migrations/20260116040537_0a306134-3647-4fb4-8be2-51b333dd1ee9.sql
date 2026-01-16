-- Fix duplicate key race condition for RSVPs by making insert/update atomic via UPSERT
-- Two concurrent RSVP submissions with the same (event_id, fingerprint) could previously both pass the pre-check SELECT
-- and then one would fail on the unique constraint. Using ON CONFLICT removes the race.

CREATE OR REPLACE FUNCTION public.insert_rsvp_with_capacity_check(
  p_event_id uuid,
  p_name text,
  p_email text DEFAULT NULL::text,
  p_status text DEFAULT 'going'::text,
  p_plus_ones integer DEFAULT 0,
  p_dietary_note text DEFAULT NULL::text,
  p_custom_answers jsonb DEFAULT '{}'::jsonb,
  p_notifications_enabled boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_fingerprint text;
  v_event events;
  v_current_going integer;
  v_total_spots_needed integer;
  v_final_status text;
  v_waitlist_position integer := NULL;
  v_result rsvps;
  v_inserted boolean := false;
  v_rate_count integer;
BEGIN
  -- Generate fingerprint
  v_fingerprint := lower(trim(p_name)) || '-' || p_event_id::text;

  -- Rate limit check (max 10 RSVPs per hour per fingerprint)
  SELECT COUNT(*) INTO v_rate_count
  FROM rate_limits
  WHERE ip_address = v_fingerprint
    AND action = 'rsvp_submission'
    AND created_at > now() - interval '1 hour';

  IF v_rate_count >= 10 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Too many RSVP attempts. Please try again later.',
      'rate_limited', true
    );
  END IF;

  -- Lock the event row to prevent race conditions around capacity/waitlist
  SELECT * INTO v_event FROM events WHERE id = p_event_id FOR UPDATE;

  IF v_event IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Event not found');
  END IF;

  -- Only check capacity for 'going' status
  v_final_status := p_status;

  IF p_status = 'going' AND v_event.capacity IS NOT NULL THEN
    -- Count current attendees (including plus ones)
    SELECT COALESCE(SUM(1 + COALESCE(plus_ones, 0)), 0)::integer
      INTO v_current_going
    FROM rsvps
    WHERE event_id = p_event_id AND status = 'going';

    v_total_spots_needed := 1 + COALESCE(p_plus_ones, 0);

    IF v_current_going + v_total_spots_needed > v_event.capacity THEN
      IF v_event.enable_waitlist THEN
        v_final_status := 'waitlist';

        SELECT COALESCE(MAX(waitlist_position), 0) + 1
          INTO v_waitlist_position
        FROM rsvps
        WHERE event_id = p_event_id AND status = 'waitlist';
      ELSE
        RETURN jsonb_build_object(
          'success', false,
          'error', 'Event is at full capacity',
          'at_capacity', true
        );
      END IF;
    END IF;
  END IF;

  -- If status is explicitly waitlist, get position
  IF p_status = 'waitlist' AND v_waitlist_position IS NULL THEN
    SELECT COALESCE(MAX(waitlist_position), 0) + 1
      INTO v_waitlist_position
    FROM rsvps
    WHERE event_id = p_event_id AND status = 'waitlist';
  END IF;

  -- ATOMIC upsert to avoid duplicate key races
  WITH upserted AS (
    INSERT INTO rsvps (
      event_id,
      name,
      email,
      status,
      plus_ones,
      dietary_note,
      custom_answers,
      notifications_enabled,
      fingerprint,
      waitlist_position
    ) VALUES (
      p_event_id,
      p_name,
      p_email,
      v_final_status,
      p_plus_ones,
      p_dietary_note,
      p_custom_answers,
      p_notifications_enabled,
      v_fingerprint,
      v_waitlist_position
    )
    ON CONFLICT (event_id, fingerprint)
    DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      status = EXCLUDED.status,
      plus_ones = EXCLUDED.plus_ones,
      dietary_note = EXCLUDED.dietary_note,
      custom_answers = EXCLUDED.custom_answers,
      notifications_enabled = EXCLUDED.notifications_enabled,
      waitlist_position = EXCLUDED.waitlist_position,
      updated_at = now()
    RETURNING rsvps.*, (xmax = 0) AS inserted
  )
  SELECT * INTO v_result
  FROM upserted;

  v_inserted := COALESCE((SELECT inserted FROM upserted LIMIT 1), false);

  -- Record rate limit entry
  INSERT INTO rate_limits (ip_address, action)
  VALUES (v_fingerprint, 'rsvp_submission');

  -- Queue notification only for true new RSVP inserts
  IF v_inserted THEN
    INSERT INTO notification_queue (notification_type, payload)
    VALUES ('rsvp_created', jsonb_build_object(
      'rsvpId', v_result.id::text,
      'wasWaitlisted', v_final_status = 'waitlist' AND p_status = 'going'
    ));
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'rsvp', row_to_json(v_result)::jsonb,
    'was_updated', NOT v_inserted,
    'was_waitlisted', v_final_status = 'waitlist' AND p_status = 'going',
    'notify_rsvp_id', CASE WHEN v_inserted THEN v_result.id::text ELSE NULL END
  );
END;
$function$;