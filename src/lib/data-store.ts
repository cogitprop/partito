import { supabase } from "@/integrations/supabase/client";
import type { Event, Rsvp, EventUpdate, CreateEventData, CreateRsvpData, PublicEvent, CustomQuestion } from "@/types/event";
import type { Json } from "@/integrations/supabase/types";

// Re-export PublicEvent for convenience
export type { PublicEvent };

// Helper to convert Supabase Json to typed structures
const parseCustomQuestions = (json: Json | null): CustomQuestion[] => {
  if (!json || !Array.isArray(json)) return [];
  return json as unknown as CustomQuestion[];
};

// Helper to convert typed structures to Supabase Json
const toJson = <T>(value: T): Json => {
  return value as unknown as Json;
};

// Rate limit error type
export interface RateLimitError {
  isRateLimited: true;
  message: string;
  retryAfter: number;
}

export type CreateEventResult = 
  | { success: true; event: Event }
  | { success: false; error: string; isRateLimited?: boolean; retryAfter?: number };

// Event operations - now uses edge function with rate limiting
export const createEvent = async (eventData: CreateEventData): Promise<CreateEventResult> => {
  try {
    const { data, error } = await supabase.functions.invoke("create-event", {
      body: eventData,
    });

    if (error) {
      if (import.meta.env.DEV) {
        console.error("Error creating event:", error);
      }
      return { success: false, error: error.message || "Failed to create event" };
    }

    // Check for rate limit response
    if (data?.error === "Rate limit exceeded") {
      return {
        success: false,
        error: data.message,
        isRateLimited: true,
        retryAfter: data.retryAfter,
      };
    }

    if (!data?.success || !data?.event) {
      return { success: false, error: data?.message || "Failed to create event" };
    }

    return {
      success: true,
      event: {
        ...data.event,
        custom_questions: parseCustomQuestions(data.event.custom_questions),
      } as Event,
    };
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("Error creating event:", err);
    }
    return { success: false, error: "An unexpected error occurred" };
  }
};

// Get event by slug - returns public data only (no sensitive fields)
export const getEventBySlug = async (slug: string): Promise<PublicEvent | null> => {
  const { data, error } = await supabase.from("events_public").select("*").eq("slug", slug).maybeSingle();

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error fetching event:", error);
    }
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    custom_questions: parseCustomQuestions(data.custom_questions),
  } as PublicEvent;
};

// Get full event data (including sensitive fields) by validating edit token
// Uses secure RPC function that validates token server-side
export const getEventByToken = async (token: string): Promise<Event | null> => {
  const { data, error } = await supabase.rpc("get_event_by_edit_token", { p_edit_token: token });

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error fetching event by token:", error);
    }
    return null;
  }

  if (!data || data.length === 0) return null;

  const row = data[0];
  return {
    ...row,
    custom_questions: parseCustomQuestions(row.custom_questions),
  } as Event;
};

// Get full event data with both slug and token validation
export const getEventWithToken = async (slug: string, token: string): Promise<Event | null> => {
  const { data, error } = await supabase.rpc("get_event_with_token", { p_slug: slug, p_edit_token: token });

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error fetching event with token:", error);
    }
    return null;
  }

  if (!data || data.length === 0) return null;

  const row = data[0];
  return {
    ...row,
    custom_questions: parseCustomQuestions(row.custom_questions),
  } as Event;
};

export const isSlugAvailable = async (slug: string, excludeId?: string): Promise<boolean> => {
  let query = supabase.from("events_public").select("id").eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data } = await query;
  return !data || data.length === 0;
};

// Check if event requires password
export const eventHasPassword = async (slug: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc("event_has_password", { p_slug: slug });

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error checking event password:", error);
    }
    return false;
  }

  return data === true;
};

// Verify event password
export const verifyEventPassword = async (slug: string, password: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc("verify_event_password", { p_slug: slug, p_password: password });

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error verifying event password:", error);
    }
    return false;
  }

  return data === true;
};

// Get event password hint
export const getEventPasswordHint = async (slug: string): Promise<string | null> => {
  const { data, error } = await supabase.rpc("get_event_password_hint", { p_slug: slug });

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error getting password hint:", error);
    }
    return null;
  }

  return data;
};

// Update event using secure RPC function with token validation
export const updateEvent = async (id: string, updates: Partial<Event>, editToken: string): Promise<Event | null> => {
  // Remove edit_token from updates to prevent modification
  const { edit_token: _, custom_questions, ...restUpdates } = updates as Event;

  // Convert custom_questions to Json format if present
  const safeUpdates = {
    ...restUpdates,
    ...(custom_questions !== undefined ? { custom_questions: toJson(custom_questions) } : {}),
  };

  const { data, error } = await supabase.rpc("update_event_with_token", {
    p_id: id,
    p_edit_token: editToken,
    p_updates: safeUpdates,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error updating event:", error);
    }
    return null;
  }

  return {
    ...data,
    custom_questions: parseCustomQuestions(data.custom_questions),
  } as Event;
};

// Delete event using secure RPC function with token validation
export const deleteEvent = async (id: string, editToken: string): Promise<boolean> => {
  const { error } = await supabase.rpc("delete_event_with_token", {
    p_id: id,
    p_edit_token: editToken,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error deleting event:", error);
    }
    return false;
  }

  return true;
};

export const cancelEvent = async (id: string, editToken: string): Promise<Event | null> => {
  return updateEvent(id, { status: "cancelled" }, editToken);
};

// RSVP operations
export interface CreateRsvpResult {
  rsvp: Rsvp | null;
  wasUpdated: boolean;
  wasWaitlisted: boolean;
  atCapacity: boolean;
  error?: string;
}

export const createRsvp = async (rsvpData: CreateRsvpData): Promise<CreateRsvpResult> => {
  const { data, error } = await supabase.rpc("insert_rsvp_with_capacity_check", {
    p_event_id: rsvpData.event_id,
    p_name: rsvpData.name,
    p_email: rsvpData.email || null,
    p_status: rsvpData.status,
    p_plus_ones: rsvpData.plus_ones || 0,
    p_dietary_note: rsvpData.dietary_note || null,
    p_custom_answers: toJson(rsvpData.custom_answers || {}),
    p_notifications_enabled: rsvpData.notifications_enabled ?? true,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error creating RSVP:", error);
    }
    return {
      rsvp: null,
      wasUpdated: false,
      wasWaitlisted: false,
      atCapacity: false,
      error: error.message,
    };
  }

  const result = data as {
    success: boolean;
    rsvp?: Record<string, unknown>;
    was_updated?: boolean;
    was_waitlisted?: boolean;
    at_capacity?: boolean;
    error?: string;
  };

  if (!result.success) {
    return {
      rsvp: null,
      wasUpdated: false,
      wasWaitlisted: false,
      atCapacity: result.at_capacity || false,
      error: result.error,
    };
  }

  // Trigger RSVP notification (fire and forget - don't block on it)
  if (result.rsvp && !result.was_updated) {
    supabase.functions.invoke("notify-rsvp", {
      body: {
        eventId: rsvpData.event_id,
        guestName: rsvpData.name,
        guestEmail: rsvpData.email,
        status: rsvpData.status,
        plusOnes: rsvpData.plus_ones,
        dietaryNote: rsvpData.dietary_note,
        wasWaitlisted: result.was_waitlisted,
      },
    }).catch((notifyError) => {
      // Silently log notification errors - don't fail the RSVP
      if (import.meta.env.DEV) {
        console.error("Error sending RSVP notification:", notifyError);
      }
    });
  }

  return {
    rsvp: result.rsvp as unknown as Rsvp,
    wasUpdated: result.was_updated || false,
    wasWaitlisted: result.was_waitlisted || false,
    atCapacity: false,
  };
};

// Get RSVPs for public view (no email addresses)
export const getRsvpsForEvent = async (eventId: string): Promise<Rsvp[]> => {
  const { data, error } = await supabase
    .from("rsvps_public")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error fetching RSVPs:", error);
    }
    return [];
  }

  // Public RSVPs don't include email - add null for type compatibility
  return (data || []).map(r => ({ ...r, email: null, fingerprint: null, notifications_enabled: null })) as Rsvp[];
};

// Get full RSVPs with emails for event host (requires edit token)
export const getRsvpsForHost = async (eventId: string, editToken: string): Promise<Rsvp[]> => {
  const { data, error } = await supabase.rpc("get_rsvps_for_host", {
    p_event_id: eventId,
    p_edit_token: editToken,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error fetching RSVPs for host:", error);
    }
    return [];
  }

  return (data || []) as Rsvp[];
};

// Update RSVP securely using fingerprint
export const updateRsvp = async (id: string, updates: Partial<Rsvp>, fingerprint: string): Promise<Rsvp | null> => {
  const { custom_answers, ...restUpdates } = updates;
  
  const safeUpdates = {
    ...restUpdates,
    ...(custom_answers !== undefined ? { custom_answers: toJson(custom_answers) } : {}),
  };

  const { data, error } = await supabase.rpc("update_rsvp_secure", {
    p_rsvp_id: id,
    p_fingerprint: fingerprint,
    p_updates: safeUpdates,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error updating RSVP:", error);
    }
    return null;
  }

  return data as Rsvp;
};

// Delete RSVP securely (by fingerprint or host edit token)
export const deleteRsvp = async (id: string, fingerprint?: string, editToken?: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc("delete_rsvp_secure", {
    p_rsvp_id: id,
    p_fingerprint: fingerprint || null,
    p_edit_token: editToken || null,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error deleting RSVP:", error);
    }
    return false;
  }

  return data === true;
};

// Promote from waitlist - host only (requires edit token)
export const promoteFromWaitlist = async (eventId: string, editToken: string): Promise<Rsvp | null> => {
  // First get waitlisted RSVPs via host function
  const rsvps = await getRsvpsForHost(eventId, editToken);
  const waitlisted = rsvps
    .filter(r => r.status === "waitlist")
    .sort((a, b) => (a.waitlist_position || 0) - (b.waitlist_position || 0));

  if (waitlisted.length === 0) return null;

  const toPromote = waitlisted[0];
  
  // Use host edit token to delete and re-create with going status
  // This is a workaround since we can't update without fingerprint
  const deleted = await deleteRsvp(toPromote.id, undefined, editToken);
  if (!deleted) return null;

  // Re-create as going
  const result = await createRsvp({
    event_id: eventId,
    name: toPromote.name,
    email: toPromote.email || undefined,
    status: "going",
    plus_ones: toPromote.plus_ones || 0,
    dietary_note: toPromote.dietary_note || undefined,
    custom_answers: toPromote.custom_answers as Record<string, string> || {},
    notifications_enabled: toPromote.notifications_enabled ?? true,
  });

  return result.rsvp;
};

// Event updates operations - secure functions for host only
export const createEventUpdate = async (updateData: {
  event_id: string;
  edit_token: string;
  subject: string;
  body: string;
  recipient_filter?: string;
  recipient_count?: number;
}): Promise<EventUpdate | null> => {
  const { data, error } = await supabase.rpc("insert_event_update_secure", {
    p_event_id: updateData.event_id,
    p_edit_token: updateData.edit_token,
    p_subject: updateData.subject,
    p_body: updateData.body,
    p_recipient_filter: updateData.recipient_filter || null,
    p_recipient_count: updateData.recipient_count || 0,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error creating event update:", error);
    }
    return null;
  }

  return data as EventUpdate;
};

export const getUpdatesForEvent = async (eventId: string, editToken: string): Promise<EventUpdate[]> => {
  const { data, error } = await supabase.rpc("get_event_updates_for_host", {
    p_event_id: eventId,
    p_edit_token: editToken,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Error fetching event updates:", error);
    }
    return [];
  }

  return (data || []) as EventUpdate[];
};
