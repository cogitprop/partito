-- Events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  edit_token TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  host_name TEXT NOT NULL,
  host_email TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  timezone TEXT DEFAULT 'UTC',
  location_type TEXT DEFAULT 'in_person' CHECK (location_type IN ('in_person', 'virtual', 'tbd')),
  venue_name TEXT,
  address TEXT,
  location_visibility TEXT DEFAULT 'full' CHECK (location_visibility IN ('full', 'area', 'hidden')),
  virtual_link TEXT,
  virtual_link_visibility TEXT DEFAULT 'public' CHECK (virtual_link_visibility IN ('public', 'rsvp_only')),
  allow_going BOOLEAN DEFAULT true,
  allow_maybe BOOLEAN DEFAULT true,
  allow_not_going BOOLEAN DEFAULT true,
  allow_plus_ones BOOLEAN DEFAULT true,
  max_plus_ones INTEGER DEFAULT 2,
  capacity INTEGER,
  enable_waitlist BOOLEAN DEFAULT true,
  guest_list_visibility TEXT DEFAULT 'names' CHECK (guest_list_visibility IN ('full', 'names', 'count', 'host_only')),
  collect_email BOOLEAN DEFAULT true,
  collect_dietary BOOLEAN DEFAULT true,
  custom_questions JSONB DEFAULT '[]'::jsonb,
  password TEXT,
  password_hint TEXT,
  notify_on_rsvp BOOLEAN DEFAULT true,
  auto_delete_days INTEGER DEFAULT 30,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RSVPs table
CREATE TABLE public.rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL CHECK (status IN ('going', 'maybe', 'not_going', 'waitlist')),
  plus_ones INTEGER DEFAULT 0,
  dietary_note TEXT,
  notifications_enabled BOOLEAN DEFAULT true,
  waitlist_position INTEGER,
  custom_answers JSONB DEFAULT '{}'::jsonb,
  fingerprint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, fingerprint)
);

-- Event updates table
CREATE TABLE public.event_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  recipient_filter TEXT,
  recipient_count INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_events_edit_token ON public.events(edit_token);
CREATE INDEX idx_rsvps_event_id ON public.rsvps(event_id);
CREATE INDEX idx_rsvps_status ON public.rsvps(status);
CREATE INDEX idx_event_updates_event_id ON public.event_updates(event_id);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_updates ENABLE ROW LEVEL SECURITY;

-- Public read access for events (anyone can view events by slug)
CREATE POLICY "Events are publicly viewable" 
ON public.events 
FOR SELECT 
USING (true);

-- Public insert for creating events (no auth required for this app)
CREATE POLICY "Anyone can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (true);

-- Update events with valid edit token (checked in application layer)
CREATE POLICY "Anyone can update events" 
ON public.events 
FOR UPDATE 
USING (true);

-- Delete events (checked via edit token in application)
CREATE POLICY "Anyone can delete events" 
ON public.events 
FOR DELETE 
USING (true);

-- Public access for RSVPs
CREATE POLICY "RSVPs are publicly viewable for their event" 
ON public.rsvps 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create RSVPs" 
ON public.rsvps 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update RSVPs" 
ON public.rsvps 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete RSVPs" 
ON public.rsvps 
FOR DELETE 
USING (true);

-- Public access for event updates
CREATE POLICY "Event updates are viewable" 
ON public.event_updates 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create event updates" 
ON public.event_updates 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rsvps_updated_at
BEFORE UPDATE ON public.rsvps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();