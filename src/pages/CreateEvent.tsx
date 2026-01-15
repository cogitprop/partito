import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/partito/Button";
import { Input } from "@/components/partito/Input";
import { Card } from "@/components/partito/Card";
import { Icon } from "@/components/partito/Icon";
import { Select } from "@/components/partito/Select";
import { Checkbox } from "@/components/partito/Checkbox";
import { Toggle } from "@/components/partito/Toggle";
import { NumberStepper } from "@/components/partito/NumberStepper";
import { CustomQuestionsBuilder } from "@/components/partito/CustomQuestionsBuilder";
import { EventSuccessModal } from "@/components/partito/EventSuccessModal";
import { useToast } from "@/contexts/ToastContext";
import { createEvent, type CreateEventResult } from "@/lib/data-store";
import { isValidEmail } from "@/lib/event-utils";
import type { CreateEventData, CustomQuestion } from "@/types/event";
import type { Event } from "@/types/event";

// Template presets with pre-filled data
const templatePresets: Record<string, Partial<CreateEventData> & { displayName: string }> = {
  birthday: {
    displayName: "Birthday Party",
    title: "Birthday Celebration",
    description:
      "Join us for a fun birthday celebration! There will be cake, games, and good times with friends and family.",
    collect_dietary: true,
    allow_plus_ones: true,
    max_plus_ones: 1,
  },
  "wedding-shower": {
    displayName: "Wedding Shower",
    title: "Wedding Shower",
    description:
      "Please join us to celebrate the upcoming wedding! Come share in the joy and help us shower the happy couple with love.",
    collect_dietary: true,
    allow_plus_ones: true,
    max_plus_ones: 1,
  },
  "baby-shower": {
    displayName: "Baby Shower",
    title: "Baby Shower",
    description: "Join us to celebrate the upcoming arrival! Games, gifts, and lots of love for the parents-to-be.",
    collect_dietary: true,
    allow_plus_ones: false,
  },
  "dinner-party": {
    displayName: "Dinner Party",
    title: "Dinner Party",
    description:
      "You're invited to an intimate dinner gathering. Good food, great company, and wonderful conversation await!",
    collect_dietary: true,
    allow_plus_ones: true,
    max_plus_ones: 1,
    capacity: 12,
  },
  "game-night": {
    displayName: "Game Night",
    title: "Game Night",
    description:
      "Bring your competitive spirit! We'll have board games, card games, and plenty of snacks. May the best player win!",
    collect_dietary: false,
    allow_plus_ones: true,
    max_plus_ones: 1,
  },
  "movie-night": {
    displayName: "Movie Night",
    title: "Movie Night",
    description: "Grab some popcorn and join us for a movie screening! Cozy up for a night of great cinema.",
    collect_dietary: false,
    allow_plus_ones: true,
    max_plus_ones: 1,
  },
  potluck: {
    displayName: "Potluck",
    title: "Potluck Gathering",
    description:
      "Everyone brings a dish to share! Let us know what you're bringing so we can coordinate. Looking forward to tasting your creations!",
    collect_dietary: true,
    allow_plus_ones: true,
    max_plus_ones: 2,
  },
  "happy-hour": {
    displayName: "Team Happy Hour",
    title: "Team Happy Hour",
    description: "Time to unwind! Join the team for drinks, snacks, and casual conversation after work.",
    collect_dietary: false,
    allow_plus_ones: false,
  },
  networking: {
    displayName: "Networking Event",
    title: "Networking Mixer",
    description:
      "Connect with professionals in your field. Bring your business cards and be ready to make valuable connections!",
    collect_dietary: false,
    allow_plus_ones: false,
    collect_email: true,
  },
  workshop: {
    displayName: "Workshop",
    title: "Interactive Workshop",
    description: "Join us for a hands-on learning session. Come ready to participate and take away practical skills!",
    collect_dietary: false,
    allow_plus_ones: false,
    collect_email: true,
    capacity: 20,
  },
  holiday: {
    displayName: "Holiday Party",
    title: "Holiday Celebration",
    description:
      "Tis the season to celebrate! Join us for festive fun, holiday treats, and time with friends and family.",
    collect_dietary: true,
    allow_plus_ones: true,
    max_plus_ones: 2,
  },
  "summer-bbq": {
    displayName: "Summer BBQ",
    title: "Summer BBQ",
    description:
      "Fire up the grill! Join us for burgers, hot dogs, and all your favorite summer treats. Don't forget your sunscreen!",
    collect_dietary: true,
    allow_plus_ones: true,
    max_plus_ones: 3,
  },
  "new-years": {
    displayName: "New Year's Eve",
    title: "New Year's Eve Party",
    description: "Ring in the new year with us! Champagne, music, and a midnight countdown. Dress to impress!",
    collect_dietary: true,
    allow_plus_ones: true,
    max_plus_ones: 1,
  },
};

const CreateEvent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("template");
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [createdEvent, setCreatedEvent] = useState<Event | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const getInitialFormData = (): CreateEventData => {
    const baseData: CreateEventData = {
      title: "",
      description: "",
      host_name: "",
      host_email: "",
      start_time: "",
      end_time: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      location_type: "in_person",
      venue_name: "",
      address: "",
      virtual_link: "",
      virtual_link_visibility: "public",
      location_visibility: "full",
      allow_going: true,
      allow_maybe: true,
      allow_not_going: true,
      allow_plus_ones: true,
      max_plus_ones: 2,
      capacity: undefined,
      enable_waitlist: true,
      guest_list_visibility: "names",
      collect_email: true,
      collect_dietary: true,
      password: "",
      password_hint: "",
      notify_on_rsvp: true,
    };

    if (templateId && templatePresets[templateId]) {
      const { displayName, ...templateData } = templatePresets[templateId];
      return { ...baseData, ...templateData };
    }

    return baseData;
  };

  const [formData, setFormData] = useState<CreateEventData>(getInitialFormData);

  // Update form data when template changes
  useEffect(() => {
    setFormData(getInitialFormData());
  }, [templateId]);

  const templateName = templateId && templatePresets[templateId] ? templatePresets[templateId].displayName : null;

  const updateField = <K extends keyof CreateEventData>(field: K, value: CreateEventData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Validation for each step
  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        if (!formData.title?.trim()) {
          showToast("Please enter an event title", "error");
          return false;
        }
        if (!formData.host_name?.trim()) {
          showToast("Please enter your name", "error");
          return false;
        }
        // Validate email format if provided
        if (formData.host_email?.trim() && !isValidEmail(formData.host_email)) {
          showToast("Please enter a valid email address", "error");
          return false;
        }
        if (!formData.start_time) {
          showToast("Please select a start date and time", "error");
          return false;
        }
        // Validate end time is after start time if set
        if (formData.end_time && formData.start_time) {
          const start = new Date(formData.start_time);
          const end = new Date(formData.end_time);
          if (end <= start) {
            showToast("End time must be after start time", "error");
            return false;
          }
        }
        return true;
      case 2:
        if (formData.location_type === "in_person" && !formData.venue_name?.trim() && !formData.address?.trim()) {
          // Allow proceeding without location details (TBD is valid)
        }
        if (formData.location_type === "virtual" && !formData.virtual_link?.trim()) {
          showToast("Please enter a virtual meeting link", "warning");
          // Still allow proceeding as they might add it later
        }
        return true;
      case 3:
        // RSVP settings are all optional with defaults
        return true;
      case 4:
        // Custom questions are optional
        return true;
      default:
        return true;
    }
  };

  const goToNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.host_name || !formData.start_time) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result: CreateEventResult = await createEvent(formData);
      if (result.success === true) {
        setCreatedEvent(result.event);
        setShowSuccess(true);
      } else {
        // Handle rate limit or other errors
        if (result.isRateLimited) {
          const minutes = Math.ceil((result.retryAfter ?? 3600) / 60);
          showToast(`Rate limit exceeded. You can create up to 5 events per hour. Please try again in ${minutes} minutes.`, "error");
        } else {
          showToast(result.error || "Failed to create event. Please try again.", "error");
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error creating event:", error);
      }
      showToast("Failed to create event", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewEvent = () => {
    if (createdEvent) {
      navigate(`/e/${createdEvent.slug}`);
    }
  };

  const handleCreateAnother = () => {
    setShowSuccess(false);
    setCreatedEvent(null);
    setStep(1);
    setFormData(getInitialFormData());
  };

  const locationTypes = [
    { value: "in_person", label: "In Person" },
    { value: "virtual", label: "Virtual" },
    { value: "tbd", label: "To Be Determined" },
  ];

  const guestListOptions = [
    { value: "full", label: "Full details (names & responses)" },
    { value: "names", label: "Names only" },
    { value: "count", label: "Count only" },
    { value: "host_only", label: "Host only (private)" },
  ];

  const locationVisibilityOptions = [
    { value: "full", label: "Show full address" },
    { value: "area", label: "Show city/area only" },
    { value: "hidden", label: "Hidden until RSVP" },
  ];

  // Show success modal if event was created
  if (showSuccess && createdEvent) {
    return (
      <EventSuccessModal
        event={{
          id: createdEvent.id,
          slug: createdEvent.slug,
          title: createdEvent.title,
          start_time: createdEvent.start_time,
          edit_token: createdEvent.edit_token,
          host_email: createdEvent.host_email || undefined,
        }}
        onViewEvent={handleViewEvent}
        onCreateAnother={handleCreateAnother}
      />
    );
  }

  return (
    <div className="min-h-screen bg-warm-gray-50">
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-heading text-3xl font-bold text-warm-gray-900">
            {templateName ? `Create ${templateName}` : "Create Your Event"}
          </h1>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-coral/10 text-coral text-sm font-medium">
            Step {step} of 4
          </span>
        </div>
        <p className="text-warm-gray-500 mb-8">
          {templateName
            ? `We've pre-filled some details for your ${templateName.toLowerCase()}. Customize as needed!`
            : "Fill in the details to create your event invitation."}
        </p>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-coral" : "bg-warm-gray-200"}`}
            />
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card className="animate-fade-in">
            <h2 className="font-heading text-xl font-semibold mb-6">Basic Information</h2>

            <div className="space-y-5">
              <Input
                label="Event Title"
                placeholder="e.g., Birthday Bash 2026"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-medium text-warm-gray-700 mb-1.5">Description</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-warm-gray-200 bg-white text-warm-gray-900 placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all resize-none"
                  rows={4}
                  placeholder="Tell your guests what to expect..."
                  value={formData.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Your Name"
                  placeholder="Host name"
                  value={formData.host_name}
                  onChange={(e) => updateField("host_name", e.target.value)}
                  required
                />
                <Input
                  label="Your Email"
                  type="email"
                  placeholder="For notifications"
                  value={formData.host_email || ""}
                  onChange={(e) => updateField("host_email", e.target.value)}
                  helper="Optional, but needed to recover your edit link"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date & Time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => updateField("start_time", e.target.value)}
                  required
                />
                <Input
                  label="End Date & Time"
                  type="datetime-local"
                  value={formData.end_time || ""}
                  onChange={(e) => updateField("end_time", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <Button onClick={goToNextStep}>
                Continue <Icon name="arrow-right" size={18} />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <Card className="animate-fade-in">
            <h2 className="font-heading text-xl font-semibold mb-6">Location Details</h2>

            <div className="space-y-5">
              <Select
                label="Location Type"
                value={formData.location_type}
                onChange={(val) => updateField("location_type", val as CreateEventData["location_type"])}
                options={locationTypes}
              />

              {formData.location_type === "in_person" && (
                <>
                  <Input
                    label="Venue Name"
                    placeholder="e.g., The Grand Ballroom"
                    value={formData.venue_name || ""}
                    onChange={(e) => updateField("venue_name", e.target.value)}
                  />
                  <Input
                    label="Address"
                    placeholder="Full address"
                    value={formData.address || ""}
                    onChange={(e) => updateField("address", e.target.value)}
                  />
                  <Select
                    label="Address Visibility"
                    value={formData.location_visibility || "full"}
                    onChange={(val) =>
                      updateField("location_visibility", val as CreateEventData["location_visibility"])
                    }
                    options={locationVisibilityOptions}
                  />
                </>
              )}

              {formData.location_type === "virtual" && (
                <>
                  <Input
                    label="Virtual Meeting Link"
                    placeholder="https://zoom.us/j/..."
                    value={formData.virtual_link || ""}
                    onChange={(e) => updateField("virtual_link", e.target.value)}
                  />
                  <div className="flex items-center gap-3">
                    <Toggle
                      checked={formData.virtual_link_visibility === "rsvp_only"}
                      onChange={(checked) => updateField("virtual_link_visibility", checked ? "rsvp_only" : "public")}
                    />
                    <span className="text-sm text-warm-gray-700">Only show link to guests who RSVP</span>
                  </div>
                </>
              )}

              {formData.location_type === "tbd" && (
                <div className="bg-warm-gray-50 rounded-lg p-4 text-sm text-warm-gray-600">
                  <Icon name="info" size={16} className="inline mr-2" />
                  You can update the location later from your event dashboard.
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <Icon name="arrow-left" size={18} /> Back
              </Button>
              <Button onClick={goToNextStep}>
                Continue <Icon name="arrow-right" size={18} />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: RSVP Settings */}
        {step === 3 && (
          <Card className="animate-fade-in">
            <h2 className="font-heading text-xl font-semibold mb-6">RSVP Settings</h2>

            <div className="space-y-6">
              {/* Response Options */}
              <div>
                <h3 className="text-sm font-medium text-warm-gray-700 mb-3">Response Options</h3>
                <div className="space-y-3">
                  <Checkbox
                    label="Allow 'Going' responses"
                    checked={formData.allow_going ?? true}
                    onChange={(checked) => updateField("allow_going", checked)}
                  />
                  <Checkbox
                    label="Allow 'Maybe' responses"
                    checked={formData.allow_maybe ?? true}
                    onChange={(checked) => updateField("allow_maybe", checked)}
                  />
                  <Checkbox
                    label="Allow 'Not Going' responses"
                    checked={formData.allow_not_going ?? true}
                    onChange={(checked) => updateField("allow_not_going", checked)}
                  />
                </div>
              </div>

              {/* Plus Ones */}
              <div className="border-t border-warm-gray-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-warm-gray-700">Allow Plus Ones</h3>
                    <p className="text-xs text-warm-gray-500">Let guests bring additional people</p>
                  </div>
                  <Toggle
                    checked={formData.allow_plus_ones ?? true}
                    onChange={(checked) => updateField("allow_plus_ones", checked)}
                  />
                </div>

                {formData.allow_plus_ones && (
                  <NumberStepper
                    label="Maximum Plus Ones per Guest"
                    value={formData.max_plus_ones ?? 2}
                    onChange={(val) => updateField("max_plus_ones", val)}
                    min={1}
                    max={10}
                  />
                )}
              </div>

              {/* Capacity & Waitlist */}
              <div className="border-t border-warm-gray-100 pt-6">
                <Input
                  label="Event Capacity"
                  type="number"
                  placeholder="Leave empty for unlimited"
                  value={formData.capacity?.toString() || ""}
                  onChange={(e) => updateField("capacity", e.target.value ? parseInt(e.target.value) : undefined)}
                  helper="Maximum number of attendees (including plus ones)"
                />

                {formData.capacity && (
                  <div className="flex items-center gap-3 mt-4">
                    <Toggle
                      checked={formData.enable_waitlist ?? true}
                      onChange={(checked) => updateField("enable_waitlist", checked)}
                    />
                    <span className="text-sm text-warm-gray-700">Enable waitlist when at capacity</span>
                  </div>
                )}
              </div>

              {/* Guest List Visibility */}
              <div className="border-t border-warm-gray-100 pt-6">
                <Select
                  label="Guest List Visibility"
                  value={formData.guest_list_visibility || "names"}
                  onChange={(val) =>
                    updateField("guest_list_visibility", val as CreateEventData["guest_list_visibility"])
                  }
                  options={guestListOptions}
                />
              </div>

              {/* Information to Collect */}
              <div className="border-t border-warm-gray-100 pt-6">
                <h3 className="text-sm font-medium text-warm-gray-700 mb-3">Information to Collect</h3>
                <div className="space-y-3">
                  <Checkbox
                    label="Collect email addresses"
                    checked={formData.collect_email ?? true}
                    onChange={(checked) => updateField("collect_email", checked)}
                  />
                  <Checkbox
                    label="Collect dietary requirements"
                    checked={formData.collect_dietary ?? true}
                    onChange={(checked) => updateField("collect_dietary", checked)}
                  />
                </div>
              </div>

              {/* Password Protection */}
              <div className="border-t border-warm-gray-100 pt-6">
                <h3 className="text-sm font-medium text-warm-gray-700 mb-3">Password Protection</h3>
                <Input
                  label="Event Password"
                  type="password"
                  placeholder="Leave empty for public event"
                  value={formData.password || ""}
                  onChange={(e) => updateField("password", e.target.value)}
                  helper="Guests will need this password to view the event"
                />
                {formData.password && (
                  <div className="mt-3">
                    <Input
                      label="Password Hint"
                      placeholder="Optional hint for guests"
                      value={formData.password_hint || ""}
                      onChange={(e) => updateField("password_hint", e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="border-t border-warm-gray-100 pt-6">
                <div className="flex items-center gap-3">
                  <Toggle
                    checked={formData.notify_on_rsvp ?? true}
                    onChange={(checked) => updateField("notify_on_rsvp", checked)}
                  />
                  <div>
                    <span className="text-sm text-warm-gray-700">Email me when guests RSVP</span>
                    {!formData.host_email && (
                      <p className="text-xs text-honey mt-0.5">Add your email in Step 1 to enable</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <Icon name="arrow-left" size={18} /> Back
              </Button>
              <Button onClick={goToNextStep}>
                Continue <Icon name="arrow-right" size={18} />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Custom Questions */}
        {step === 4 && (
          <Card className="animate-fade-in">
            <h2 className="font-heading text-xl font-semibold mb-2">Custom Questions</h2>
            <p className="text-warm-gray-500 text-sm mb-6">
              Add optional questions to collect additional information from your guests.
            </p>

            <CustomQuestionsBuilder
              questions={(formData.custom_questions as CustomQuestion[]) || []}
              onChange={(questions) => updateField("custom_questions", questions)}
              maxQuestions={5}
            />

            <div className="flex justify-between mt-8">
              <Button variant="ghost" onClick={() => setStep(3)}>
                <Icon name="arrow-left" size={18} /> Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default CreateEvent;
