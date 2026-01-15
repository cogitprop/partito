-- Create a function to verify event password securely (returns boolean, not the password)
CREATE OR REPLACE FUNCTION public.verify_event_password(p_slug text, p_password text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM events 
    WHERE slug = p_slug 
    AND (password IS NULL OR password = p_password)
  );
$$;

-- Create a function to check if an event has a password
CREATE OR REPLACE FUNCTION public.event_has_password(p_slug text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM events 
    WHERE slug = p_slug 
    AND password IS NOT NULL
    AND password != ''
  );
$$;

-- Create a function to get password hint without exposing the password
CREATE OR REPLACE FUNCTION public.get_event_password_hint(p_slug text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT password_hint FROM events WHERE slug = p_slug;
$$;