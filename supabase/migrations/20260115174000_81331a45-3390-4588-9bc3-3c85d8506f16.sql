CREATE OR REPLACE FUNCTION public.verify_event_password(p_slug text, p_password text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stored_password text;
BEGIN
  -- Get the stored password for this event
  SELECT password INTO v_stored_password FROM events WHERE slug = p_slug;

  -- If event doesn't exist, return false
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- If no password is set (NULL or empty), event is public - return true
  IF v_stored_password IS NULL OR v_stored_password = '' THEN
    RETURN true;
  END IF;

  -- Compare the provided password with stored password
  RETURN v_stored_password = p_password;
END;
$$;