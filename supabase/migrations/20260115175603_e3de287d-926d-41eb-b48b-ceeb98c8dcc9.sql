-- Update trigger function to call notification edge function on promotion
CREATE OR REPLACE FUNCTION public.promote_from_waitlist()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_event events;
  v_current_going integer;
  v_next_waitlist rsvps;
  v_supabase_url text;
  v_service_key text;
BEGIN
  -- Only act when status changes FROM 'going' or row is deleted
  IF (TG_OP = 'UPDATE' AND OLD.status = 'going' AND NEW.status != 'going')
     OR (TG_OP = 'DELETE' AND OLD.status = 'going') THEN
    
    -- Get event details
    SELECT * INTO v_event FROM events WHERE id = OLD.event_id;
    
    -- Check if there's capacity and waitlist enabled
    IF v_event.capacity IS NOT NULL AND v_event.enable_waitlist THEN
      -- Count current going (excluding the row being updated/deleted)
      SELECT COALESCE(SUM(1 + COALESCE(plus_ones, 0)), 0)::integer
      INTO v_current_going
      FROM rsvps
      WHERE event_id = OLD.event_id 
        AND status = 'going'
        AND id != OLD.id;
      
      -- If under capacity, promote next from waitlist
      IF v_current_going < v_event.capacity THEN
        SELECT * INTO v_next_waitlist
        FROM rsvps
        WHERE event_id = OLD.event_id AND status = 'waitlist'
        ORDER BY waitlist_position ASC
        LIMIT 1
        FOR UPDATE;
        
        IF FOUND THEN
          UPDATE rsvps
          SET status = 'going', waitlist_position = NULL, updated_at = now()
          WHERE id = v_next_waitlist.id;
          
          -- Log the promotion
          RAISE NOTICE 'Promoted RSVP % from waitlist to going', v_next_waitlist.id;
          
          -- Call edge function to notify the promoted guest (async via pg_net if available)
          -- Note: This is a best-effort notification; if it fails, the promotion still happens
          BEGIN
            PERFORM net.http_post(
              url := current_setting('app.supabase_url', true) || '/functions/v1/notify-waitlist-promotion',
              headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key', true)
              ),
              body := jsonb_build_object(
                'rsvpId', v_next_waitlist.id::text,
                'eventId', OLD.event_id::text
              )
            );
          EXCEPTION WHEN OTHERS THEN
            -- Log but don't fail the transaction if notification fails
            RAISE NOTICE 'Failed to send promotion notification: %', SQLERRM;
          END;
        END IF;
      END IF;
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;