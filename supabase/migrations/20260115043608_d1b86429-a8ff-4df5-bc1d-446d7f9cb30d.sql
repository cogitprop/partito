-- Create rate limits table for tracking event creation attempts
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'event_creation',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_rate_limits_ip_action_time ON public.rate_limits (ip_address, action, created_at DESC);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow inserts via edge function (service role)
CREATE POLICY "Rate limits insert via service role only"
  ON public.rate_limits FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Rate limits select via service role only"
  ON public.rate_limits FOR SELECT
  USING (false);

-- Auto-cleanup old rate limit records (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.rate_limits WHERE created_at < now() - interval '1 hour';
END;
$$;