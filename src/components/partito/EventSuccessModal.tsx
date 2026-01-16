import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import { Card } from './Card';
import { useToast } from '@/contexts/ToastContext';
import { getShareableEventUrl } from '@/lib/event-utils';

interface EventSuccessModalProps {
  event: {
    id: string;
    slug: string;
    title: string;
    start_time: string;
    edit_token: string;
    host_email?: string;
  };
  onViewEvent: () => void;
  onCreateAnother: () => void;
}

// Confetti piece component
const ConfettiPiece: React.FC<{ delay: number; left: number; color: string }> = ({
  delay,
  left,
  color,
}) => (
  <div
    className="absolute w-3 h-3 animate-confetti"
    style={{
      left: `${left}%`,
      top: '-10px',
      backgroundColor: color,
      animationDelay: `${delay}ms`,
      transform: `rotate(${Math.random() * 360}deg)`,
      borderRadius: Math.random() > 0.5 ? '50%' : '0',
    }}
  />
);

export const EventSuccessModal: React.FC<EventSuccessModalProps> = ({
  event,
  onViewEvent,
  onCreateAnother,
}) => {
  const { showToast } = useToast();
  const [showConfetti, setShowConfetti] = useState(true);

  // Use the production domain for shareable links
  const publicUrl = getShareableEventUrl(event.slug);
  const editUrl = `https://partito.org/e/${event.slug}/edit?token=${event.edit_token}`;

  // Stop confetti after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied!`, 'success');
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  const shareOptions = [
    {
      icon: 'copy' as const,
      label: 'Copy',
      action: () => copyToClipboard(publicUrl, 'Link'),
    },
    {
      icon: 'mail' as const,
      label: 'Email',
      action: () =>
        window.open(
          `mailto:?subject=${encodeURIComponent(
            `You're invited: ${event.title}`
          )}&body=${encodeURIComponent(
            `You're invited!\n\n${event.title}\n\n${publicUrl}`
          )}`
        ),
    },
    {
      icon: 'message-circle' as const,
      label: 'SMS',
      action: () =>
        window.open(
          `sms:?body=${encodeURIComponent(
            `You're invited! ${event.title} ${publicUrl}`
          )}`
        ),
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Confetti colors
  const confettiColors = ['#FF6B6B', '#F5A623', '#7CB798', '#5B9BD5', '#FFE5E5', '#FFF5E5'];

  return (
    <div className="min-h-screen bg-warm-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiPiece
              key={i}
              delay={i * 60}
              left={Math.random() * 100}
              color={confettiColors[i % confettiColors.length]}
            />
          ))}
        </div>
      )}

      <Card className="max-w-lg w-full text-center relative z-10">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="font-heading text-2xl font-semibold mb-2">
          Your event is live!
        </h2>
        <p className="text-warm-gray-700 text-lg mb-1">{event.title}</p>
        <p className="text-warm-gray-500 mb-6">{formatDate(event.start_time)}</p>

        {/* Share link */}
        <div className="mb-6 text-left">
          <label className="block text-sm font-medium text-warm-gray-700 mb-2">
            Share this link with your guests:
          </label>
          <div className="flex gap-2">
            <input
              readOnly
              value={publicUrl}
              className="flex-1 h-12 px-4 text-sm bg-warm-gray-50 border border-warm-gray-300 rounded-lg text-warm-gray-900"
            />
            <Button onClick={() => copyToClipboard(publicUrl, 'Link')}>
              <Icon name="copy" size={18} /> Copy
            </Button>
          </div>
        </div>

        {/* Share buttons */}
        <div className="flex justify-center gap-3 mb-6">
          {shareOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.action}
              title={opt.label}
              className="w-12 h-12 rounded-lg bg-warm-gray-50 border border-warm-gray-200 flex items-center justify-center text-warm-gray-700 hover:bg-cream hover:border-coral transition-all"
            >
              <Icon name={opt.icon} size={20} />
            </button>
          ))}
        </div>

        {/* Edit link */}
        <div className="border-t border-warm-gray-100 pt-6 mb-6 text-left">
          <label className="block text-sm font-medium text-warm-gray-700 mb-2">
            Your private edit link:
          </label>
          <div className="flex gap-2">
            <input
              readOnly
              value={editUrl}
              className="flex-1 h-12 px-4 text-xs bg-warm-gray-50 border border-warm-gray-300 rounded-lg text-warm-gray-700 truncate"
            />
            <Button
              variant="secondary"
              onClick={() => copyToClipboard(editUrl, 'Edit link')}
            >
              <Icon name="copy" size={18} />
            </Button>
          </div>
          <p className="text-xs text-honey mt-2 flex items-center gap-1">
            <Icon name="alert-triangle" size={14} />
            Save this link somewhere safe. It's the only way to modify your event.
          </p>
          {event.host_email && (
            <p className="text-xs text-sage mt-2 flex items-center gap-1">
              <Icon name="check" size={14} />
              We've also emailed this to {event.host_email}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onCreateAnother} className="flex-1">
            Create Another
          </Button>
          <Button onClick={onViewEvent} className="flex-1">
            View Your Event
          </Button>
        </div>
      </Card>
    </div>
  );
};
