-- Create function to get public attendee count
CREATE OR REPLACE FUNCTION public.get_public_attendee_count(p_event_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(SUM(1 + COALESCE(plus_ones, 0)), 0)::integer
  FROM rsvps
  WHERE event_id = p_event_id AND status = 'going';
$$;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_public_attendee_count(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_attendee_count(uuid) TO authenticated;