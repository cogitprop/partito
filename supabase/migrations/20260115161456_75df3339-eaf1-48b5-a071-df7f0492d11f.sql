-- Fix: Remove dietary_note from rsvps_public view (medical privacy)
DROP VIEW IF EXISTS public.rsvps_public;

CREATE VIEW public.rsvps_public WITH (security_invoker = on) AS
SELECT 
  id,
  event_id,
  name,
  status,
  plus_ones,
  custom_answers,
  waitlist_position,
  created_at,
  updated_at
FROM public.rsvps;

-- Grant access to the view
GRANT SELECT ON public.rsvps_public TO anon, authenticated;