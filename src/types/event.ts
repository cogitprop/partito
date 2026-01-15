export interface Event {
  id: string;
  slug: string;
  edit_token: string;
  title: string;
  description?: string | null;
  cover_image?: string | null;
  host_name: string;
  host_email?: string | null;
  start_time: string;
  end_time?: string | null;
  timezone: string;
  location_type: "in_person" | "virtual" | "tbd";
  venue_name?: string | null;
  address?: string | null;
  location_visibility: "full" | "area" | "hidden";
  virtual_link?: string | null;
  virtual_link_visibility: "public" | "rsvp_only";
  allow_going: boolean;
  allow_maybe: boolean;
  allow_not_going: boolean;
  allow_plus_ones: boolean;
  max_plus_ones: number;
  capacity?: number | null;
  enable_waitlist: boolean;
  guest_list_visibility: "full" | "names" | "count" | "host_only";
  collect_email: boolean;
  collect_dietary: boolean;
  custom_questions: CustomQuestion[];
  password?: string | null;
  password_hint?: string | null;
  notify_on_rsvp: boolean;
  auto_delete_days: number;
  status: "active" | "cancelled";
  created_at: string;
  updated_at: string;
}

// Public event type without sensitive fields (used for public queries)
export type PublicEvent = Omit<Event, "edit_token" | "password" | "password_hint" | "host_email">;

export interface Rsvp {
  id: string;
  event_id: string;
  name: string;
  email?: string | null;
  status: "going" | "maybe" | "not_going" | "waitlist";
  plus_ones: number;
  dietary_note?: string | null;
  notifications_enabled: boolean;
  waitlist_position?: number | null;
  custom_answers: CustomAnswers;
  fingerprint?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventUpdate {
  id: string;
  event_id: string;
  subject: string;
  body: string;
  recipient_filter?: string | null;
  recipient_count: number;
  sent_at: string;
}

/**
 * Custom question definition for event RSVP forms
 */
export interface CustomQuestion {
  id: string;
  type: "text" | "select" | "checkbox";
  label: string;
  required: boolean;
  options?: string[]; // For select type only
}

/**
 * Custom answers storage type
 * Maps question ID to answer value
 */
export type CustomAnswers = Record<string, string | boolean>;

export interface CreateEventData {
  title: string;
  description?: string;
  cover_image?: string;
  host_name: string;
  host_email?: string;
  start_time: string;
  end_time?: string;
  timezone?: string;
  location_type: "in_person" | "virtual" | "tbd";
  venue_name?: string;
  address?: string;
  location_visibility?: "full" | "area" | "hidden";
  virtual_link?: string;
  virtual_link_visibility?: "public" | "rsvp_only";
  allow_going?: boolean;
  allow_maybe?: boolean;
  allow_not_going?: boolean;
  allow_plus_ones?: boolean;
  max_plus_ones?: number;
  capacity?: number;
  enable_waitlist?: boolean;
  guest_list_visibility?: "full" | "names" | "count" | "host_only";
  collect_email?: boolean;
  collect_dietary?: boolean;
  custom_questions?: CustomQuestion[];
  password?: string;
  password_hint?: string;
  notify_on_rsvp?: boolean;
  slug?: string;
}

export interface CreateRsvpData {
  event_id: string;
  name: string;
  email?: string;
  status: "going" | "maybe" | "not_going" | "waitlist";
  plus_ones?: number;
  dietary_note?: string;
  notifications_enabled?: boolean;
  custom_answers?: CustomAnswers;
}
