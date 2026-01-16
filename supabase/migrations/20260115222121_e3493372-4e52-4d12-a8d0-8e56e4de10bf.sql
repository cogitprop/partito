-- Fix public event reads: events_public must bypass RLS on events base table
-- The base events table denies direct SELECT, so the public view cannot be security_invoker.

ALTER VIEW public.events_public SET (security_invoker = off);

-- Ensure ownership stays with the view owner (typically postgres) so it can bypass RLS.
-- (No-op if already owned by the database owner.)
ALTER VIEW public.events_public OWNER TO postgres;
