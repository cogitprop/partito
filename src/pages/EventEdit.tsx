import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/partito/Button';
import { Input } from '@/components/partito/Input';
import { Card } from '@/components/partito/Card';
import { Icon } from '@/components/partito/Icon';
import { Select } from '@/components/partito/Select';
import { Modal } from '@/components/partito/Modal';
import { Checkbox } from '@/components/partito/Checkbox';
import { Toggle } from '@/components/partito/Toggle';
import { NumberStepper } from '@/components/partito/NumberStepper';
import { DateTimePicker } from '@/components/partito/DateTimePicker';
import { useToast } from '@/contexts/ToastContext';
import { getEventByToken, getRsvpsForHost, updateEvent, deleteEvent, cancelEvent, updateRsvp, deleteRsvp, promoteFromWaitlist, createEventUpdate, getUpdatesForEvent } from '@/lib/data-store';
import { formatDate, formatTime, copyToClipboard, exportGuestsCSV, getAttendeeCount, getShareableEventUrl } from '@/lib/event-utils';
import type { Event, Rsvp } from '@/types/event';

type Tab = 'details' | 'guests' | 'settings' | 'updates';

const EventEdit = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [editToken, setEditToken] = useState<string | null>(null);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [isSaving, setIsSaving] = useState(false);
  
  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  
  // Update form
  const [updateForm, setUpdateForm] = useState({
    subject: '',
    body: '',
    recipientFilter: 'all',
  });

  useEffect(() => {
    const loadEvent = async () => {
      if (!slug) return;
      
      const token = searchParams.get('token');
      
      if (token) {
        // Use the secure RPC to get full event data with token validation
        const eventData = await getEventByToken(token);
        if (eventData && eventData.slug === slug) {
          setEvent(eventData);
          setEditToken(token);
          setIsAuthorized(true);
          // Use host-specific function to get full RSVP data including emails
          const rsvpData = await getRsvpsForHost(eventData.id, token);
          setRsvps(rsvpData);
        }
      }
      
      setLoading(false);
    };

    loadEvent();
  }, [slug, searchParams]);

  const handleSave = async (updates: Partial<Event>) => {
    if (!event || !editToken) return;
    
    setIsSaving(true);
    try {
      const updated = await updateEvent(event.id, updates, editToken);
      if (updated) {
        setEvent(updated);
        showToast('Changes saved!', 'success');
      }
    } catch (error) {
      showToast('Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !editToken) return;
    
    const success = await deleteEvent(event.id, editToken);
    if (success) {
      showToast('Event deleted', 'success');
      navigate('/');
    } else {
      showToast('Failed to delete event', 'error');
    }
  };

  const handleCancel = async () => {
    if (!event || !editToken) return;
    
    const updated = await cancelEvent(event.id, editToken);
    if (updated) {
      setEvent(updated);
      setShowCancelModal(false);
      showToast('Event cancelled', 'success');
    }
  };

  const handlePromoteFromWaitlist = async () => {
    if (!event || !editToken) return;
    
    const promoted = await promoteFromWaitlist(event.id, editToken);
    if (promoted) {
      setRsvps(prev => prev.map(r => r.id === promoted.id ? promoted : r));
      showToast(`${promoted.name} has been promoted from the waitlist!`, 'success');
    }
  };

  const handleRsvpStatusChange = async (rsvpId: string, newStatus: 'going' | 'maybe' | 'not_going' | 'waitlist') => {
    // Find the RSVP to get its fingerprint
    const rsvp = rsvps.find(r => r.id === rsvpId);
    if (!rsvp || !rsvp.fingerprint) return;
    
    const updated = await updateRsvp(rsvpId, { status: newStatus }, rsvp.fingerprint);
    if (updated) {
      setRsvps(prev => prev.map(r => r.id === rsvpId ? updated : r));
    }
  };

  const handleDeleteRsvp = async (rsvpId: string) => {
    if (!editToken) return;
    
    const success = await deleteRsvp(rsvpId, undefined, editToken);
    if (success) {
      setRsvps(prev => prev.filter(r => r.id !== rsvpId));
      showToast('Guest removed', 'success');
    }
  };

  const handleSendUpdate = async () => {
    if (!event || !updateForm.subject || !updateForm.body) {
      showToast('Please fill in subject and message', 'error');
      return;
    }

    const recipientCount = rsvps.filter(r => {
      if (updateForm.recipientFilter === 'all') return true;
      return r.status === updateForm.recipientFilter;
    }).length;

    const result = await createEventUpdate({
      event_id: event.id,
      edit_token: editToken!,
      subject: updateForm.subject,
      body: updateForm.body,
      recipient_filter: updateForm.recipientFilter,
      recipient_count: recipientCount,
    });

    if (result) {
      showToast('Update recorded!', 'success');
      setShowUpdateModal(false);
      setUpdateForm({ subject: '', body: '', recipientFilter: 'all' });
    }
  };

  // Use the shareable URL that goes through the edge function for proper OG tags
  const shareUrl = event ? getShareableEventUrl(event.slug) : '';
  const editUrl = event ? `${window.location.origin}/e/${event.slug}/edit?token=${event.edit_token}` : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-gray-50 flex items-center justify-center">
        <div className="text-warm-gray-500">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-warm-gray-50 flex items-center justify-center">
        <Card className="text-center max-w-md">
          <Icon name="calendar" size={48} className="text-warm-gray-300 mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-warm-gray-900 mb-2">Event Not Found</h1>
          <Link to="/"><Button>Go Home</Button></Link>
        </Card>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-warm-gray-50 flex items-center justify-center">
        <Card className="text-center max-w-md">
          <Icon name="lock" size={48} className="text-warm-gray-300 mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-warm-gray-900 mb-2">Access Denied</h1>
          <p className="text-warm-gray-500 mb-6">You need the edit link to manage this event.</p>
          <Link to={`/e/${slug}`}><Button variant="secondary">View Event</Button></Link>
        </Card>
      </div>
    );
  }

  const goingRsvps = rsvps.filter(r => r.status === 'going');
  const maybeRsvps = rsvps.filter(r => r.status === 'maybe');
  const notGoingRsvps = rsvps.filter(r => r.status === 'not_going');
  const waitlistRsvps = rsvps.filter(r => r.status === 'waitlist');
  const attendeeCount = getAttendeeCount(rsvps);

  return (
    <div className="min-h-screen bg-warm-gray-50">
      {/* Action buttons below global header */}
      <div className="bg-cream border-b border-warm-gray-100 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-end gap-3">
          <Link to={`/e/${event.slug}`}>
            <Button variant="ghost" size="sm">
              <Icon name="eye" size={16} /> View Event
            </Button>
          </Link>
          <Button size="sm" onClick={() => setShowShareModal(true)}>
            <Icon name="share" size={16} /> Share
          </Button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Event Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-warm-gray-900">{event.title}</h1>
          <p className="text-warm-gray-500 mt-1">
            {formatDate(event.start_time, event.timezone)} at {formatTime(event.start_time, event.timezone)}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <div className="text-2xl font-bold text-sage">{goingRsvps.length}</div>
            <div className="text-sm text-warm-gray-500">Going</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-honey">{maybeRsvps.length}</div>
            <div className="text-sm text-warm-gray-500">Maybe</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-coral">{notGoingRsvps.length}</div>
            <div className="text-sm text-warm-gray-500">Can't Go</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-warm-gray-900">{attendeeCount}</div>
            <div className="text-sm text-warm-gray-500">Total Attending</div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-warm-gray-100 p-1 rounded-xl mb-6 w-fit">
          {(['details', 'guests', 'settings', 'updates'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white text-warm-gray-900 shadow-sm'
                  : 'text-warm-gray-500 hover:text-warm-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <Card className="animate-fade-in">
            <h2 className="font-heading text-xl font-semibold mb-6">Event Details</h2>
            <div className="space-y-5">
              <Input
                label="Event Title"
                value={event.title}
                onChange={(e) => setEvent(prev => prev ? { ...prev, title: e.target.value } : null)}
                onBlur={() => handleSave({ title: event.title })}
              />
              
              <div>
                <label className="block text-sm font-medium text-warm-gray-700 mb-1.5">Description</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-warm-gray-200 bg-white text-warm-gray-900 placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all resize-none"
                  rows={4}
                  value={event.description || ''}
                  onChange={(e) => setEvent(prev => prev ? { ...prev, description: e.target.value } : null)}
                  onBlur={() => handleSave({ description: event.description })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DateTimePicker
                  label="Start Date & Time"
                  value={event.start_time}
                  onChange={(value) => {
                    setEvent(prev => prev ? { ...prev, start_time: value } : null);
                    handleSave({ start_time: value });
                  }}
                  required
                  timezone={event.timezone}
                  onTimezoneChange={(tz) => {
                    setEvent(prev => prev ? { ...prev, timezone: tz } : null);
                    handleSave({ timezone: tz });
                  }}
                  showTimezone
                />
                <DateTimePicker
                  label="End Date & Time"
                  value={event.end_time || ''}
                  onChange={(value) => {
                    setEvent(prev => prev ? { ...prev, end_time: value } : null);
                    handleSave({ end_time: value });
                  }}
                  placeholder="Optional end time"
                  timezone={event.timezone}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Venue Name"
                  value={event.venue_name || ''}
                  onChange={(e) => setEvent(prev => prev ? { ...prev, venue_name: e.target.value } : null)}
                  onBlur={() => handleSave({ venue_name: event.venue_name })}
                />
                <Input
                  label="Address"
                  value={event.address || ''}
                  onChange={(e) => setEvent(prev => prev ? { ...prev, address: e.target.value } : null)}
                  onBlur={() => handleSave({ address: event.address })}
                />
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'guests' && (
          <div className="animate-fade-in space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-heading text-xl font-semibold">Guest List</h2>
              <div className="flex gap-2">
                {waitlistRsvps.length > 0 && (
                  <Button variant="secondary" size="sm" onClick={handlePromoteFromWaitlist}>
                    <Icon name="user-plus" size={16} /> Promote from Waitlist
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => exportGuestsCSV(rsvps, event.title)}>
                  <Icon name="download" size={16} /> Export CSV
                </Button>
              </div>
            </div>

            {rsvps.length === 0 ? (
              <Card className="text-center py-12">
                <Icon name="users" size={48} className="text-warm-gray-300 mx-auto mb-4" />
                <h3 className="font-heading text-lg font-semibold mb-2">No RSVPs yet</h3>
                <p className="text-warm-gray-500">Share your event to start collecting responses!</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Going */}
                {goingRsvps.length > 0 && (
                  <Card>
                    <h3 className="font-medium text-sage mb-3 flex items-center gap-2">
                      <Icon name="check" size={16} /> Going ({goingRsvps.length})
                    </h3>
                    <div className="space-y-2">
                      {goingRsvps.map(rsvp => (
                        <GuestRow key={rsvp.id} rsvp={rsvp} onStatusChange={handleRsvpStatusChange} onDelete={handleDeleteRsvp} />
                      ))}
                    </div>
                  </Card>
                )}

                {/* Maybe */}
                {maybeRsvps.length > 0 && (
                  <Card>
                    <h3 className="font-medium text-honey mb-3 flex items-center gap-2">
                      <Icon name="clock" size={16} /> Maybe ({maybeRsvps.length})
                    </h3>
                    <div className="space-y-2">
                      {maybeRsvps.map(rsvp => (
                        <GuestRow key={rsvp.id} rsvp={rsvp} onStatusChange={handleRsvpStatusChange} onDelete={handleDeleteRsvp} />
                      ))}
                    </div>
                  </Card>
                )}

                {/* Not Going */}
                {notGoingRsvps.length > 0 && (
                  <Card>
                    <h3 className="font-medium text-coral mb-3 flex items-center gap-2">
                      <Icon name="x" size={16} /> Can't Go ({notGoingRsvps.length})
                    </h3>
                    <div className="space-y-2">
                      {notGoingRsvps.map(rsvp => (
                        <GuestRow key={rsvp.id} rsvp={rsvp} onStatusChange={handleRsvpStatusChange} onDelete={handleDeleteRsvp} />
                      ))}
                    </div>
                  </Card>
                )}

                {/* Waitlist */}
                {waitlistRsvps.length > 0 && (
                  <Card>
                    <h3 className="font-medium text-sky mb-3 flex items-center gap-2">
                      <Icon name="users" size={16} /> Waitlist ({waitlistRsvps.length})
                    </h3>
                    <div className="space-y-2">
                      {waitlistRsvps.map(rsvp => (
                        <GuestRow key={rsvp.id} rsvp={rsvp} onStatusChange={handleRsvpStatusChange} onDelete={handleDeleteRsvp} showPosition />
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <Card className="animate-fade-in">
            <h2 className="font-heading text-xl font-semibold mb-6">Event Settings</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-warm-gray-900 mb-3">Response Options</h3>
                <div className="space-y-3">
                  <Checkbox
                    label="Allow 'Going' responses"
                    checked={event.allow_going}
                    onChange={(checked) => handleSave({ allow_going: checked })}
                  />
                  <Checkbox
                    label="Allow 'Maybe' responses"
                    checked={event.allow_maybe}
                    onChange={(checked) => handleSave({ allow_maybe: checked })}
                  />
                  <Checkbox
                    label="Allow 'Not Going' responses"
                    checked={event.allow_not_going}
                    onChange={(checked) => handleSave({ allow_not_going: checked })}
                  />
                </div>
              </div>

              <div className="border-t border-warm-gray-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-warm-gray-900">Allow Plus Ones</h3>
                    <p className="text-sm text-warm-gray-500">Let guests bring additional people</p>
                  </div>
                  <Toggle
                    checked={event.allow_plus_ones}
                    onChange={(checked) => handleSave({ allow_plus_ones: checked })}
                  />
                </div>
                
                {event.allow_plus_ones && (
                  <NumberStepper
                    label="Maximum Plus Ones"
                    value={event.max_plus_ones}
                    onChange={(val) => handleSave({ max_plus_ones: val })}
                    min={1}
                    max={3}
                  />
                )}
              </div>

              <div className="border-t border-warm-gray-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-warm-gray-900">Enable Waitlist</h3>
                    <p className="text-sm text-warm-gray-500">When capacity is reached, new guests join a waitlist</p>
                  </div>
                  <Toggle
                    checked={event.enable_waitlist}
                    onChange={(checked) => handleSave({ enable_waitlist: checked })}
                  />
                </div>

                <Input
                  label="Event Capacity"
                  type="number"
                  placeholder="Leave empty for unlimited"
                  value={event.capacity?.toString() || ''}
                  onChange={(e) => setEvent(prev => prev ? { ...prev, capacity: e.target.value ? parseInt(e.target.value) : null } : null)}
                  onBlur={() => handleSave({ capacity: event.capacity })}
                />
              </div>

              <div className="border-t border-warm-gray-100 pt-6">
                <h3 className="font-medium text-warm-gray-900 mb-3">Guest Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-warm-gray-900">Collect Email Addresses</p>
                      <p className="text-sm text-warm-gray-500">Ask guests for their email when RSVPing</p>
                    </div>
                    <Toggle
                      checked={event.collect_email}
                      onChange={(checked) => handleSave({ collect_email: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-warm-gray-900">Collect Dietary Requirements</p>
                      <p className="text-sm text-warm-gray-500">Ask guests about dietary restrictions</p>
                    </div>
                    <Toggle
                      checked={event.collect_dietary}
                      onChange={(checked) => handleSave({ collect_dietary: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-warm-gray-100 pt-6">
                <h3 className="font-medium text-warm-gray-900 mb-3">Visibility Settings</h3>
                <div className="space-y-4">
                  <Select
                    label="Guest List Visibility"
                    value={event.guest_list_visibility}
                    onChange={(val) => handleSave({ guest_list_visibility: val as Event['guest_list_visibility'] })}
                    options={[
                      { value: 'full', label: 'Full details (names & responses)' },
                      { value: 'names', label: 'Names only' },
                      { value: 'count', label: 'Count only' },
                      { value: 'host_only', label: 'Host only' },
                    ]}
                  />
                  <Select
                    label="Location Visibility"
                    value={event.location_visibility || 'full'}
                    onChange={(val) => handleSave({ location_visibility: val as Event['location_visibility'] })}
                    options={[
                      { value: 'full', label: 'Show full address' },
                      { value: 'area', label: 'Show area only' },
                      { value: 'hidden', label: 'Hidden until RSVP' },
                    ]}
                  />
                  {event.virtual_link && (
                    <Select
                      label="Virtual Link Visibility"
                      value={event.virtual_link_visibility || 'public'}
                      onChange={(val) => handleSave({ virtual_link_visibility: val as Event['virtual_link_visibility'] })}
                      options={[
                        { value: 'public', label: 'Visible to everyone' },
                        { value: 'rsvp_only', label: 'Only show to confirmed guests' },
                      ]}
                    />
                  )}
                </div>
              </div>

              <div className="border-t border-warm-gray-100 pt-6">
                <h3 className="font-medium text-warm-gray-900 mb-3">Host Settings</h3>
                <div className="space-y-4">
                  <Input
                    label="Host Email"
                    type="email"
                    placeholder="your@email.com"
                    value={event.host_email || ''}
                    onChange={(e) => setEvent(prev => prev ? { ...prev, host_email: e.target.value } : null)}
                    onBlur={() => handleSave({ host_email: event.host_email })}
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-warm-gray-900">Notify on New RSVPs</p>
                      <p className="text-sm text-warm-gray-500">Receive email when guests respond</p>
                    </div>
                    <Toggle
                      checked={event.notify_on_rsvp}
                      onChange={(checked) => handleSave({ notify_on_rsvp: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-warm-gray-100 pt-6">
                <h3 className="font-medium text-warm-gray-900 mb-3">Privacy & Security</h3>
                <div className="space-y-4">
                  <div>
                    <Input
                      label="Event Password"
                      type="password"
                      placeholder="Leave empty for public event"
                      value=""
                      onChange={(e) => setEvent(prev => prev ? { ...prev, password: e.target.value } : null)}
                      onBlur={() => event.password && handleSave({ password: event.password })}
                    />
                    <p className="text-xs text-warm-gray-500 mt-1">
                      {event.password ? "Password is set. Enter a new value to change it." : "Optional. Guests must enter this to view the event."}
                    </p>
                  </div>
                  <Input
                    label="Password Hint"
                    placeholder="Optional hint for guests"
                    value={event.password_hint || ''}
                    onChange={(e) => setEvent(prev => prev ? { ...prev, password_hint: e.target.value } : null)}
                    onBlur={() => handleSave({ password_hint: event.password_hint })}
                  />
                </div>
              </div>

              <div className="border-t border-warm-gray-100 pt-6">
                <h3 className="font-medium text-warm-gray-900 mb-3">Data Management</h3>
                <Select
                  label="Auto-Delete After Event"
                  value={event.auto_delete_days?.toString() || '30'}
                  onChange={(val) => handleSave({ auto_delete_days: parseInt(val) })}
                  options={[
                    { value: '7', label: '7 days after event' },
                    { value: '30', label: '30 days after event' },
                    { value: '90', label: '90 days after event' },
                    { value: '365', label: '1 year after event' },
                  ]}
                />
              </div>

              <div className="border-t border-warm-gray-100 pt-6">
                <h3 className="font-medium text-destructive mb-4">Danger Zone</h3>
                <div className="flex gap-3">
                  {event.status !== 'cancelled' && (
                    <Button variant="secondary" onClick={() => setShowCancelModal(true)}>
                      Cancel Event
                    </Button>
                  )}
                  <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
                    <Icon name="trash" size={16} /> Delete Event
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'updates' && (
          <div className="animate-fade-in space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-heading text-xl font-semibold">Event Updates</h2>
              <Button size="sm" onClick={() => setShowUpdateModal(true)}>
                <Icon name="send" size={16} /> Send Update
              </Button>
            </div>

            <Card className="text-center py-12">
              <Icon name="send" size={48} className="text-warm-gray-300 mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold mb-2">Keep your guests informed</h3>
              <p className="text-warm-gray-500 mb-4">Send updates about your event to all your guests.</p>
              <Button onClick={() => setShowUpdateModal(true)}>Send an Update</Button>
            </Card>
          </div>
        )}
      </main>

      {/* Share Modal */}
      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Share Your Event">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-warm-gray-700 mb-2">Guest Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-4 py-2 rounded-xl border border-warm-gray-200 bg-warm-gray-50 text-warm-gray-700"
              />
              <Button variant="secondary" onClick={() => { copyToClipboard(shareUrl); showToast('Link copied!', 'success'); }}>
                <Icon name="copy" size={16} />
              </Button>
            </div>
            <p className="text-xs text-warm-gray-500 mt-2">Share this link with your guests to let them RSVP.</p>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Event">
        <p className="text-warm-gray-600 mb-6">
          Are you sure you want to delete this event? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Icon name="trash" size={16} /> Delete Event
          </Button>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Event">
        <p className="text-warm-gray-600 mb-6">
          Are you sure you want to cancel this event? Guests will be notified.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowCancelModal(false)}>Keep Event</Button>
          <Button variant="destructive" onClick={handleCancel}>Cancel Event</Button>
        </div>
      </Modal>

      {/* Send Update Modal */}
      <Modal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} title="Send Event Update">
        <div className="space-y-4">
          <Select
            label="Send to"
            value={updateForm.recipientFilter}
            onChange={(val) => setUpdateForm(prev => ({ ...prev, recipientFilter: val }))}
            options={[
              { value: 'all', label: 'All guests' },
              { value: 'going', label: 'Going only' },
              { value: 'maybe', label: 'Maybe only' },
            ]}
          />
          <Input
            label="Subject"
            placeholder="Update about..."
            value={updateForm.subject}
            onChange={(e) => setUpdateForm(prev => ({ ...prev, subject: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-warm-gray-700 mb-1.5">Message</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-warm-gray-200 bg-white text-warm-gray-900 placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all resize-none"
              rows={4}
              placeholder="Write your update..."
              value={updateForm.body}
              onChange={(e) => setUpdateForm(prev => ({ ...prev, body: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setShowUpdateModal(false)}>Cancel</Button>
          <Button onClick={handleSendUpdate}>
            <Icon name="send" size={16} /> Send Update
          </Button>
        </div>
      </Modal>
    </div>
  );
};

// Guest Row Component
const GuestRow = ({ 
  rsvp, 
  onStatusChange, 
  onDelete,
  showPosition = false 
}: { 
  rsvp: Rsvp; 
  onStatusChange: (id: string, status: 'going' | 'maybe' | 'not_going' | 'waitlist') => void;
  onDelete: (id: string) => void;
  showPosition?: boolean;
}) => {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-warm-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        {showPosition && rsvp.waitlist_position && (
          <span className="text-sm text-warm-gray-400">#{rsvp.waitlist_position}</span>
        )}
        <div>
          <div className="font-medium text-warm-gray-900">
            {rsvp.name}
            {rsvp.plus_ones > 0 && <span className="text-warm-gray-500"> +{rsvp.plus_ones}</span>}
          </div>
          {rsvp.email && <div className="text-sm text-warm-gray-500">{rsvp.email}</div>}
          {rsvp.dietary_note && <div className="text-xs text-warm-gray-400">🍽️ {rsvp.dietary_note}</div>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={rsvp.status}
          onChange={(e) => onStatusChange(rsvp.id, e.target.value as 'going' | 'maybe' | 'not_going' | 'waitlist')}
          className="text-sm border border-warm-gray-200 rounded-lg px-2 py-1 bg-white"
        >
          <option value="going">Going</option>
          <option value="maybe">Maybe</option>
          <option value="not_going">Not Going</option>
          <option value="waitlist">Waitlist</option>
        </select>
        <button
          onClick={() => onDelete(rsvp.id)}
          className="p-1 text-warm-gray-400 hover:text-destructive transition-colors"
        >
          <Icon name="trash" size={16} />
        </button>
      </div>
    </div>
  );
};

export default EventEdit;
