import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/partito/Card';
import { Button } from '@/components/partito/Button';
import { Input } from '@/components/partito/Input';
import { Icon } from '@/components/partito/Icon';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/integrations/supabase/client';

const Recover = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('recover-edit-link', {
        body: { slug, email },
      });

      if (error) {
        console.error('Recovery request failed:', error);
      }
    } catch (err) {
      console.error('Recovery request error:', err);
    }

    // Always show success to prevent email enumeration
    setIsSubmitting(false);
    setSubmitted(true);
    showToast("If that email is associated with this event, we've sent a recovery link.", 'success');
  };

  return (
    <div className="max-w-[480px] mx-auto px-6 py-12 md:py-16">
      <h1 className="font-heading text-2xl md:text-3xl font-semibold mb-4">
        Recover your edit link
      </h1>
      <p className="text-warm-gray-500 mb-8">
        Lost access to your event? If you provided an email when creating it, we can send you a new edit link.
      </p>

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Event URL or slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="partito.org/e/birthday-bash or just birthday-bash"
              helper="Paste the full URL or just the event slug"
              required
            />
            <Input
              label="Your email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@email.com"
              helper="Must match the email you used when creating the event"
              required
            />
            <Button type="submit" fullWidth loading={isSubmitting}>
              Send Recovery Link
            </Button>
          </div>
        </form>
      ) : (
        <Card className="text-center bg-cream">
          <div className="w-12 h-12 rounded-full bg-sage flex items-center justify-center mx-auto mb-4">
            <Icon name="check" size={24} className="text-white" />
          </div>
          <h3 className="font-heading text-lg font-semibold mb-2">
            Check your inbox
          </h3>
          <p className="text-warm-gray-600">
            If that email is associated with this event, we've sent a recovery link. 
            Check your inbox and spam folder.
          </p>
          <Button variant="ghost" onClick={() => setSubmitted(false)} className="mt-4">
            Try another email
          </Button>
        </Card>
      )}

      <div className="mt-10 border-t border-warm-gray-200 pt-8">
        <h3 className="font-heading text-lg font-semibold mb-2">
          Didn't provide an email?
        </h3>
        <p className="text-warm-gray-500 text-sm mb-4">
          Unfortunately, we can't recover edit links for events created without an email address. 
          This is a privacy feature: we don't have enough information to verify you're the host.
        </p>
        <Button variant="secondary" onClick={() => navigate('/create')}>
          Create New Event
        </Button>
      </div>

      <div className="mt-6 p-4 bg-warm-gray-50 rounded-lg">
        <p className="text-sm text-warm-gray-600 flex items-start gap-2">
          <Icon name="info" size={16} className="flex-shrink-0 mt-0.5" />
          For security, we can't confirm whether an email is associated with a specific event. 
          You'll always see the same success message.
        </p>
      </div>
    </div>
  );
};

export default Recover;
