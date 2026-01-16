-- Fix: Block direct SELECT access to events base table
-- The events_public view will still work for public access (it's SECURITY INVOKER but selects only safe columns)
-- All SECURITY DEFINER functions will continue to work as they bypass RLS

-- Drop the permissive policy that exposes sensitive data
DROP POLICY IF EXISTS "Events base table readable for view" ON public.events;

-- Create a policy that denies all direct SELECT access
-- The events_public view and SECURITY DEFINER functions will still work
CREATE POLICY "Deny direct select on events base table"
ON public.events FOR SELECT
USING (false);