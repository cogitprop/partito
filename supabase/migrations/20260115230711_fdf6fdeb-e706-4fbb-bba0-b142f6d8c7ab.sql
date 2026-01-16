-- Fix the insert_rsvp_with_capacity_check to use request.jwt.claims for authorization
-- Instead of trying to use pg_net which requires external settings,
-- we'll store a notification request that a cron job or webhook can process

-- Actually, let's try using the built-in Supabase vault or a simpler approach
-- Supabase provides supabase.auth.jwt() but for service role we need a different approach

-- The cleanest solution: Use a notifications table and process async

-- Create a notifications queue table for async processing
CREATE TABLE IF NOT EXISTS public.notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Enable RLS
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Only service role can access
CREATE POLICY "Notification queue service role only" ON public.notification_queue
  FOR ALL USING (false);

-- Update the function to queue notifications instead of direct HTTP calls
CREATE OR REPLACE FUNCTION public.insert_rsvp_with_capacity_check(
  p_event_id uuid,
  p_name text,
  p_email text DEFAULT NULL,
  p_status text DEFAULT 'going',
  p_plus_ones integer DEFAULT 0,
  p_dietary_note text DEFAULT NULL,
  p_custom_answers jsonb DEFAULT '{}'::jsonb,
  p_notifications_enabled boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_fingerprint text;
  v_existing_rsvp rsvps;
  v_event events;
  v_current_going integer;
  v_total_spots_needed integer;
  v_final_status text;
  v_waitlist_position integer := NULL;
  v_result rsvps;
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
  
  -- Lock the event row to prevent race conditions
  SELECT * INTO v_event FROM events WHERE id = p_event_id FOR UPDATE;
  
  IF v_event IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Event not found');
  END IF;
  
  -- Check for existing RSVP
  SELECT * INTO v_existing_rsvp FROM rsvps WHERE fingerprint = v_fingerprint;
  
  IF v_existing_rsvp IS NOT NULL THEN
    -- Update existing RSVP
    UPDATE rsvps SET
      name = p_name,
      email = p_email,
      status = p_status,
      plus_ones = p_plus_ones,
      dietary_note = p_dietary_note,
      custom_answers = p_custom_answers,
      notifications_enabled = p_notifications_enabled,
      updated_at = now()
    WHERE id = v_existing_rsvp.id
    RETURNING * INTO v_result;
    
    -- Record rate limit entry
    INSERT INTO rate_limits (ip_address, action)
    VALUES (v_fingerprint, 'rsvp_submission');
    
    RETURN jsonb_build_object(
      'success', true,
      'rsvp', row_to_json(v_result)::jsonb,
      'was_updated', true
    );
  END IF;
  
  -- Only check capacity for 'going' status
  v_final_status := p_status;
  
  IF p_status = 'going' AND v_event.capacity IS NOT NULL THEN
    -- Count current attendees (including their plus ones)
    SELECT COALESCE(SUM(1 + COALESCE(plus_ones, 0)), 0)::integer
    INTO v_current_going
    FROM rsvps
    WHERE event_id = p_event_id AND status = 'going';
    
    -- Calculate spots needed for this RSVP
    v_total_spots_needed := 1 + COALESCE(p_plus_ones, 0);
    
    -- Check if there's capacity
    IF v_current_going + v_total_spots_needed > v_event.capacity THEN
      -- No capacity available
      IF v_event.enable_waitlist THEN
        -- Assign to waitlist
        v_final_status := 'waitlist';
        
        -- Get next waitlist position
        SELECT COALESCE(MAX(waitlist_position), 0) + 1
        INTO v_waitlist_position
        FROM rsvps
        WHERE event_id = p_event_id AND status = 'waitlist';
      ELSE
        -- No waitlist, reject
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
  
  -- Insert the new RSVP
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
  RETURNING * INTO v_result;
  
  -- Record rate limit entry
  INSERT INTO rate_limits (ip_address, action)
  VALUES (v_fingerprint, 'rsvp_submission');
  
  -- Queue notification for async processing (will be sent by client after RPC returns)
  INSERT INTO notification_queue (notification_type, payload)
  VALUES ('rsvp_created', jsonb_build_object(
    'rsvpId', v_result.id::text,
    'wasWaitlisted', v_final_status = 'waitlist' AND p_status = 'going'
  ));
  
  RETURN jsonb_build_object(
    'success', true,
    'rsvp', row_to_json(v_result)::jsonb,
    'was_updated', false,
    'was_waitlisted', v_final_status = 'waitlist' AND p_status = 'going',
    'notify_rsvp_id', v_result.id::text
  );
END;
$function$;