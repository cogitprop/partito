import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/partito/Button";
import { Input } from "@/components/partito/Input";
import { Card } from "@/components/partito/Card";
import { Icon } from "@/components/partito/Icon";
import { Checkbox } from "@/components/partito/Checkbox";
import { NumberStepper } from "@/components/partito/NumberStepper";
import { Select } from "@/components/partito/Select";
import { Modal } from "@/components/partito/Modal";
import { CalendarDropdown } from "@/components/partito/CalendarDropdown";
import { useToast } from "@/contexts/ToastContext";
import { supabase } from "@/integrations/supabase/client";
import {
  getEventBySlug,
  createRsvp,
  eventHasPassword,
  verifyEventPassword,
  getEventPasswordHint,
} from "@/lib/data-store";
import {
  formatDate,
  formatTime,
  generateMapsUrl,
  isValidEmail,
  getTimezoneAbbr,
} from "@/lib/event-utils";
import type { PublicEvent, CreateRsvpData, CustomQuestion } from "@/types/event";

const EventView = () => {
  const { slug } = useParams<{ slug: string }>();
  const { showToast } = useToast();
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [attendeeCount, setAttendeeCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordHint, setPasswordHint] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [currentUserIsGoing, setCurrentUserIsGoing] = useState(false);

  const [rsvpForm, setRsvpForm] = useState<CreateRsvpData & { custom_answers: Record<string, string | boolean> }>({
    event_id: "",
    name: "",
    email: "",
    status: "going",
    plus_ones: 0,
    dietary_note: "",
    notifications_enabled: true,
    custom_answers: {},
  });

  // Build dynamic meta tags for SEO/link previews
  const metaInfo = useMemo(() => {
    if (!event) return null;

    const title = `${event.title}${event.host_name ? ` | Hosted by ${event.host_name}` : ""}`;
    // Use window.location.origin for dynamic base URL
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const eventUrl = `${baseUrl}/e/${slug}`;

    let description = event.description?.replace(/<[^>]*>/g, "").trim() || `You're invited to ${event.title}`;

    if (event.start_time) {
      const date = new Date(event.start_time);
      const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      description = `${formattedDate} • ${description}`;
    }

    if (description.length > 160) {
      description = description.substring(0, 157) + "...";
    }

    const image = event.cover_image || `${baseUrl}/og-image.png`;

    return { title, description, image, eventUrl };
  }, [event, slug]);

  // Check localStorage for previously submitted RSVP
  useEffect(() => {
    if (event?.id) {
      const storedRsvp = localStorage.getItem(`partito_rsvp_${event.id}`);
      if (storedRsvp) {
        try {
          const parsed = JSON.parse(storedRsvp);
          if (parsed.status === "going") {
            setCurrentUserIsGoing(true);
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, [event?.id]);

  // Load attendee count via RPC
  const loadAttendeeCount = useCallback(async (eventId: string) => {
    const { data, error } = await supabase.rpc('get_public_attendee_count', { p_event_id: eventId });
    if (!error && typeof data === 'number') {
      setAttendeeCount(data);
    }
  }, []);

  useEffect(() => {
    const loadEvent = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      const eventData = await getEventBySlug(slug);

      if (eventData) {
        setEvent(eventData);
        const defaultStatus = eventData.allow_going
          ? "going"
          : eventData.allow_maybe
            ? "maybe"
            : eventData.allow_not_going
              ? "not_going"
              : "going";
        setRsvpForm((prev) => ({ ...prev, event_id: eventData.id, status: defaultStatus }));

        const hasPassword = await eventHasPassword(slug);
        if (hasPassword) {
          const hint = await getEventPasswordHint(slug);
          setPasswordHint(hint);
          setShowPasswordModal(true);
        } else {
          setIsUnlocked(true);
          await loadAttendeeCount(eventData.id);
        }
      }
      setLoading(false);
    };

    loadEvent();
  }, [slug, loadAttendeeCount]);

  const handlePasswordSubmit = async () => {
    if (!slug || !passwordInput.trim()) return;

    setIsVerifyingPassword(true);
    try {
      const isValid = await verifyEventPassword(slug, passwordInput);

      if (isValid) {
        setIsUnlocked(true);
        setShowPasswordModal(false);
        if (event) {
          await loadAttendeeCount(event.id);
        }
      } else {
        showToast("Incorrect password", "error");
      }
    } catch (error) {
      showToast("Failed to verify password", "error");
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const handleRsvpSubmit = async () => {
    if (!rsvpForm.name.trim()) {
      showToast("Please enter your name", "error");
      return;
    }

    if (event?.collect_email && rsvpForm.email) {
      if (!isValidEmail(rsvpForm.email)) {
        showToast("Please enter a valid email address", "error");
        return;
      }
    }

    const customQuestions = (event?.custom_questions || []) as CustomQuestion[];
    for (const question of customQuestions) {
      if (question.required && !rsvpForm.custom_answers[question.id]) {
        showToast(`Please answer: ${question.label}`, "error");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let finalStatus = rsvpForm.status;

      const { rsvp, wasWaitlisted, atCapacity, error } = await createRsvp({
        ...rsvpForm,
        status: finalStatus,
        custom_answers: rsvpForm.custom_answers,
      });

      if (atCapacity) {
        showToast("This event is at full capacity", "error");
        return;
      }

      if (error || !rsvp) {
        showToast(error || "Failed to submit RSVP", "error");
        return;
      }

      if (wasWaitlisted) {
        showToast("Event is full - you've been added to the waitlist", "info");
      }

      if (event?.id) {
        localStorage.setItem(
          `partito_rsvp_${event.id}`,
          JSON.stringify({
            name: rsvpForm.name,
            status: rsvp.status,
            timestamp: Date.now(),
          }),
        );
        if (rsvp.status === "going") {
          setCurrentUserIsGoing(true);
        }
        // Reload count after RSVP
        await loadAttendeeCount(event.id);
      }

      setRsvpSuccess(true);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error submitting RSVP:", error);
      }
      showToast("Failed to submit RSVP", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseRsvpModal = () => {
    setShowRsvpModal(false);
    setRsvpSuccess(false);
    setRsvpForm({
      event_id: event?.id || "",
      name: "",
      email: "",
      status: "going",
      plus_ones: 0,
      dietary_note: "",
      notifications_enabled: true,
      custom_answers: {},
    });
  };

  const updateCustomAnswer = (questionId: string, value: string | boolean) => {
    setRsvpForm((prev) => ({
      ...prev,
      custom_answers: {
        ...prev.custom_answers,
        [questionId]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-gray-50 flex items-center justify-center">
        <div className="text-warm-gray-500">Loading event...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-warm-gray-50 flex items-center justify-center">
        <Card className="text-center max-w-md">
          <Icon name="calendar" size={48} className="text-warm-gray-300 mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-warm-gray-900 mb-2">Event Not Found</h1>
          <p className="text-warm-gray-500 mb-6">This event may have been deleted or the link is incorrect.</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Calculate capacity status from attendeeCount (already loaded via RPC)
  const atCapacity = event.capacity ? attendeeCount >= event.capacity : false;
  const remainingCapacity = event.capacity ? Math.max(0, event.capacity - attendeeCount) : null;
  const customQuestions = (event.custom_questions || []) as CustomQuestion[];

  const canSeeVirtualLink = event.virtual_link_visibility === "public" || currentUserIsGoing;

  return (
    <div className="min-h-screen bg-warm-gray-50">
      {metaInfo && (
        <Helmet>
          <title>{metaInfo.title}</title>
          <meta name="description" content={metaInfo.description} />
          <meta property="og:title" content={metaInfo.title} />
          <meta property="og:description" content={metaInfo.description} />
          <meta property="og:image" content={metaInfo.image} />
          <meta property="og:url" content={metaInfo.eventUrl} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={metaInfo.title} />
          <meta name="twitter:description" content={metaInfo.description} />
          <meta name="twitter:image" content={metaInfo.image} />
          <link rel="canonical" href={metaInfo.eventUrl} />
        </Helmet>
      )}

      {/* Password Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => {}} title="Event Protected" hideClose>
        <p className="text-warm-gray-500 mb-4">
          This event requires a password to view.
          {passwordHint && (
            <span className="block text-sm mt-2 text-warm-gray-600">
              <Icon name="info" size={14} className="inline mr-1" />
              Hint: {passwordHint}
            </span>
          )}
        </p>
        <Input
          label="Password"
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          placeholder="Enter password"
          onKeyDown={(e) => e.key === "Enter" && !isVerifyingPassword && handlePasswordSubmit()}
          disabled={isVerifyingPassword}
        />
        <div className="flex justify-end mt-6">
          <Button onClick={handlePasswordSubmit} disabled={isVerifyingPassword}>
            {isVerifyingPassword ? "Verifying..." : "Unlock Event"}
          </Button>
        </div>
      </Modal>

      {isUnlocked && (
        <main className="max-w-4xl mx-auto px-6 py-10">
          {/* Event Header */}
          <div className="mb-8">
            {event.status === "cancelled" && (
              <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg mb-4 flex items-center gap-2">
                <Icon name="x" size={18} />
                <span>This event has been cancelled</span>
              </div>
            )}

            {event.cover_image && (
              <img src={event.cover_image} alt={event.title} className="w-full h-64 object-cover rounded-2xl mb-6" />
            )}

            <h1 className="font-heading text-4xl font-bold text-warm-gray-900 mb-4">{event.title}</h1>

            <div className="flex flex-wrap gap-6 text-warm-gray-600">
              <div className="flex items-center gap-2">
                <Icon name="calendar" size={20} />
                <span>{formatDate(event.start_time, event.timezone)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="clock" size={20} />
                <span>
                  {formatTime(event.start_time, event.timezone)}
                  {event.end_time && ` - ${formatTime(event.end_time, event.timezone)}`}
                  {event.timezone && (
                    <span className="text-warm-gray-400 ml-1">({getTimezoneAbbr(event.timezone)})</span>
                  )}
                </span>
              </div>
              {event.location_type === "in_person" && event.venue_name && (
                <div className="flex items-center gap-2">
                  <Icon name="map-pin" size={20} />
                  <span>{event.venue_name}</span>
                </div>
              )}
              {event.location_type === "virtual" && (
                <div className="flex items-center gap-2">
                  <Icon name="video" size={20} />
                  <span>Virtual Event</span>
                </div>
              )}
            </div>

            <p className="text-warm-gray-500 mt-2">Hosted by {event.host_name}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {event.description && (
                <Card>
                  <h2 className="font-heading text-lg font-semibold mb-3">About this event</h2>
                  <p className="text-warm-gray-600 whitespace-pre-wrap">{event.description}</p>
                </Card>
              )}

              {event.location_type === "in_person" && event.address && event.location_visibility !== "hidden" && (
                <Card>
                  <h2 className="font-heading text-lg font-semibold mb-3">Location</h2>
                  <div className="flex items-start justify-between">
                    <div>
                      {event.venue_name && <p className="font-medium text-warm-gray-900">{event.venue_name}</p>}
                      <p className="text-warm-gray-600">
                        {event.location_visibility === "area"
                          ? event.address.split(",").slice(-2).join(",").trim()
                          : event.address}
                      </p>
                    </div>
                    {event.location_visibility === "full" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.open(generateMapsUrl(event.address!), "_blank")}
                      >
                        <Icon name="map-pin" size={16} /> Directions
                      </Button>
                    )}
                  </div>
                </Card>
              )}

              {event.location_type === "virtual" && event.virtual_link && canSeeVirtualLink && (
                <Card>
                  <h2 className="font-heading text-lg font-semibold mb-3">Join Online</h2>
                  <Button variant="secondary" onClick={() => window.open(event.virtual_link!, "_blank")}>
                    <Icon name="video" size={18} /> Join Meeting
                  </Button>
                </Card>
              )}

              {event.location_type === "virtual" &&
                event.virtual_link &&
                event.virtual_link_visibility === "rsvp_only" &&
                !currentUserIsGoing && (
                  <Card className="bg-warm-gray-50">
                    <div className="flex items-center gap-3">
                      <Icon name="lock" size={20} className="text-warm-gray-400" />
                      <p className="text-warm-gray-600">The meeting link will be visible after you RSVP as "Going"</p>
                    </div>
                  </Card>
                )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <div className="space-y-3">
                  {event.status !== "cancelled" && (
                    <>
                      <Button className="w-full" onClick={() => setShowRsvpModal(true)}>
                        {atCapacity && event.enable_waitlist ? "Join Waitlist" : "RSVP Now"}
                      </Button>
                      {remainingCapacity !== null && remainingCapacity > 0 && remainingCapacity <= 10 && (
                        <p className="text-center text-sm text-honey">
                          {remainingCapacity} spot{remainingCapacity === 1 ? "" : "s"} remaining
                        </p>
                      )}
                      {atCapacity && !event.enable_waitlist && (
                        <p className="text-center text-sm text-coral">Event is at capacity</p>
                      )}
                    </>
                  )}
                  <CalendarDropdown event={event} />
                </div>
              </Card>

              <Card className="bg-cream">
                <div className="text-center">
                  <div className="text-3xl font-bold text-coral">{attendeeCount}</div>
                  <div className="text-warm-gray-600">attending</div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      )}

      {/* RSVP Modal */}
      <Modal
        isOpen={showRsvpModal}
        onClose={handleCloseRsvpModal}
        title={rsvpSuccess ? "You're all set!" : "RSVP to this event"}
        size="md"
      >
        {rsvpSuccess ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="check" size={32} className="text-sage" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2">Thanks for your RSVP!</h3>
            <p className="text-warm-gray-600 mb-6">
              {rsvpForm.status === "waitlist"
                ? "You're on the waitlist. We'll notify you if a spot opens up."
                : "We'll see you there!"}
            </p>
            <Button onClick={handleCloseRsvpModal}>Done</Button>
          </div>
        ) : (
          <>
            <div className="space-y-5">
              <Input
                label="Your Name"
                placeholder="Enter your name"
                value={rsvpForm.name}
                onChange={(e) => setRsvpForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />

              {event?.collect_email && (
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={rsvpForm.email || ""}
                  onChange={(e) => setRsvpForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              )}

              <div>
                <label className="block text-sm font-medium text-warm-gray-700 mb-3">Your Response</label>
                <div className="flex gap-2" role="radiogroup" aria-label="RSVP Response">
                  {event?.allow_going && (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={rsvpForm.status === "going"}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                        rsvpForm.status === "going"
                          ? "border-sage bg-sage/10 text-sage"
                          : "border-warm-gray-200 text-warm-gray-600 hover:border-sage/50"
                      }`}
                      onClick={() => setRsvpForm((prev) => ({ ...prev, status: "going" }))}
                    >
                      <Icon name="check" size={18} className="mx-auto mb-1" />
                      Going
                    </button>
                  )}
                  {event?.allow_maybe && (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={rsvpForm.status === "maybe"}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                        rsvpForm.status === "maybe"
                          ? "border-honey bg-honey/10 text-honey"
                          : "border-warm-gray-200 text-warm-gray-600 hover:border-honey/50"
                      }`}
                      onClick={() => setRsvpForm((prev) => ({ ...prev, status: "maybe" }))}
                    >
                      <Icon name="clock" size={18} className="mx-auto mb-1" />
                      Maybe
                    </button>
                  )}
                  {event?.allow_not_going && (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={rsvpForm.status === "not_going"}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                        rsvpForm.status === "not_going"
                          ? "border-coral bg-coral/10 text-coral"
                          : "border-warm-gray-200 text-warm-gray-600 hover:border-coral/50"
                      }`}
                      onClick={() => setRsvpForm((prev) => ({ ...prev, status: "not_going" }))}
                    >
                      <Icon name="x" size={18} className="mx-auto mb-1" />
                      Can't Go
                    </button>
                  )}
                </div>
              </div>

              {event?.allow_plus_ones && rsvpForm.status === "going" && (
                <NumberStepper
                  label="Plus Ones"
                  value={rsvpForm.plus_ones || 0}
                  onChange={(val) => setRsvpForm((prev) => ({ ...prev, plus_ones: val }))}
                  min={0}
                  max={event.max_plus_ones}
                />
              )}

              {event?.collect_dietary && (
                <Input
                  label="Dietary Requirements"
                  placeholder="Any allergies or preferences?"
                  value={rsvpForm.dietary_note || ""}
                  onChange={(e) => setRsvpForm((prev) => ({ ...prev, dietary_note: e.target.value }))}
                />
              )}

              {customQuestions.length > 0 && (
                <div className="border-t border-warm-gray-100 pt-5 space-y-4">
                  {customQuestions.map((question) => (
                    <div key={question.id}>
                      {question.type === "text" && (
                        <Input
                          label={question.label}
                          required={question.required}
                          value={(rsvpForm.custom_answers[question.id] as string) || ""}
                          onChange={(e) => updateCustomAnswer(question.id, e.target.value)}
                        />
                      )}
                      {question.type === "select" && question.options && (
                        <Select
                          label={question.label}
                          value={(rsvpForm.custom_answers[question.id] as string) || ""}
                          onChange={(val) => updateCustomAnswer(question.id, val)}
                          options={[
                            { value: "", label: "Select an option..." },
                            ...question.options.map((opt) => ({ value: opt, label: opt })),
                          ]}
                        />
                      )}
                      {question.type === "checkbox" && (
                        <Checkbox
                          label={question.label}
                          checked={(rsvpForm.custom_answers[question.id] as boolean) || false}
                          onChange={(checked) => updateCustomAnswer(question.id, checked)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Checkbox
                label="Notify me of event updates"
                checked={rsvpForm.notifications_enabled ?? true}
                onChange={(checked) => setRsvpForm((prev) => ({ ...prev, notifications_enabled: checked }))}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={handleCloseRsvpModal}>
                Cancel
              </Button>
              <Button onClick={handleRsvpSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit RSVP"}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default EventView;
