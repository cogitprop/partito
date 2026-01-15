import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/partito/Card';
import { Button } from '@/components/partito/Button';
import { Icon } from '@/components/partito/Icon';

const Docs = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('getting-started');

  const navigation = [
    {
      title: 'Getting Started',
      items: [
        { id: 'getting-started', label: 'Creating Your First Event' },
        { id: 'sharing', label: 'Sharing Your Event' },
        { id: 'managing-rsvps', label: 'Managing RSVPs' },
        { id: 'edit-link', label: 'Understanding Your Edit Link' },
      ],
    },
    {
      title: 'Features',
      items: [
        { id: 'cover-images', label: 'Cover Images' },
        { id: 'rsvp-settings', label: 'RSVP Settings' },
        { id: 'guest-privacy', label: 'Guest List Privacy' },
        { id: 'custom-questions', label: 'Custom Questions' },
        { id: 'password-protection', label: 'Password Protection' },
        { id: 'calendar', label: 'Calendar Integration' },
        { id: 'updates', label: 'Sending Updates' },
      ],
    },
    {
      title: 'Self-Hosting',
      items: [
        { id: 'self-hosting', label: 'Overview' },
        { id: 'docker', label: 'Docker Quick Start' },
      ],
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-16 grid md:grid-cols-[240px_1fr] gap-8">
      {/* Sidebar Navigation */}
      <nav className="md:sticky md:top-4 self-start">
        {navigation.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="text-sm font-semibold text-warm-gray-500 uppercase tracking-wider mb-3">
              {section.title}
            </h3>
            <ul className="space-y-2">
              {section.items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`text-sm text-left transition-colors ${
                      activeSection === item.id
                        ? 'text-coral font-medium'
                        : 'text-warm-gray-700 hover:text-coral'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Content */}
      <div>
        {activeSection === 'getting-started' && (
          <article>
            <h1 className="font-heading text-3xl md:text-4xl font-semibold mb-8">
              Creating Your First Event
            </h1>
            <div className="text-warm-gray-700 leading-relaxed space-y-4">
              <p className="text-lg">
                Creating an event on Partito takes about 30 seconds. Here's how:
              </p>

              <h2 className="font-heading text-xl font-semibold mt-10 mb-3 text-warm-gray-900">
                Step 1: Go to the Create Page
              </h2>
              <p>
                Click "Create an Event" from the homepage or go directly to partito.org/create.
              </p>

              <h2 className="font-heading text-xl font-semibold mt-10 mb-3 text-warm-gray-900">
                Step 2: Fill in Your Details
              </h2>
              <p><strong>Required fields:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Event title</li>
                <li>Start date and time</li>
                <li>Your name (as host)</li>
              </ul>
              <p className="mt-4"><strong>Optional but recommended:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Description: Tell guests what to expect</li>
                <li>Cover image: Makes your event page more inviting</li>
                <li>End time: Helps guests plan</li>
                <li>Location: Where is this happening?</li>
              </ul>

              <h2 className="font-heading text-xl font-semibold mt-10 mb-3 text-warm-gray-900">
                Step 3: Customize RSVP Options
              </h2>
              <p>
                Decide how you want guests to respond. You can enable "Going," "Maybe," and "Can't Make It" options. 
                You can also allow plus-ones, set a capacity limit, and choose what information to collect from guests.
              </p>

              <h2 className="font-heading text-xl font-semibold mt-10 mb-3 text-warm-gray-900">
                Step 4: Create Your Event
              </h2>
              <p>
                Click "Create Event" and you're done! You'll see a success page with your shareable link and your private edit link.
              </p>

              <Card className="bg-cream border-none mt-8">
                <div className="flex gap-3 items-start">
                  <Icon name="alert-triangle" size={20} className="text-honey flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Important: Save your edit link!</p>
                    <p className="text-sm text-warm-gray-600">
                      Your edit link is the only way to modify or delete your event. We recommend saving it somewhere safe 
                      or providing your email so we can recover it if needed.
                    </p>
                  </div>
                </div>
              </Card>

              <div className="mt-10">
                <Button onClick={() => navigate('/create')}>Create Your First Event</Button>
              </div>
            </div>
          </article>
        )}

        {activeSection === 'edit-link' && (
          <article>
            <h1 className="font-heading text-3xl md:text-4xl font-semibold mb-8">
              Understanding Your Edit Link
            </h1>
            <div className="text-warm-gray-700 leading-relaxed space-y-4">
              <p>
                When you create an event on Partito, you receive two links: a public link to share with guests, 
                and a private edit link that lets you modify your event.
              </p>

              <h2 className="font-heading text-xl font-semibold mt-10 mb-3 text-warm-gray-900">
                Why Edit Links?
              </h2>
              <p>
                Unlike other event platforms, Partito doesn't require you to create an account. Your edit link acts 
                as your "password" to manage your event. This approach means we don't need to collect or store your login credentials.
              </p>

              <h2 className="font-heading text-xl font-semibold mt-10 mb-3 text-warm-gray-900">
                Keep It Safe
              </h2>
              <p>
                Anyone with your edit link can modify your event, so treat it like a password. Don't share it publicly 
                or include it in posts or messages to your guests.
              </p>

              <h2 className="font-heading text-xl font-semibold mt-10 mb-3 text-warm-gray-900">
                Lost Your Link?
              </h2>
              <p>
                If you provided an email when creating your event, you can recover your edit link at{' '}
                <button 
                  onClick={() => navigate('/recover')} 
                  className="text-coral hover:underline"
                >
                  partito.org/recover
                </button>. 
                If you didn't provide an email, unfortunately we cannot verify you're the host.
              </p>
            </div>
          </article>
        )}

        {/* Default content for other sections */}
        {!['getting-started', 'edit-link'].includes(activeSection) && (
          <article>
            <h1 className="font-heading text-3xl md:text-4xl font-semibold mb-8 capitalize">
              {activeSection.replace(/-/g, ' ')}
            </h1>
            <div className="text-warm-gray-700 leading-relaxed">
              <p>Documentation for this section is coming soon.</p>
              <p className="mt-4">
                In the meantime, check out our{' '}
                <button 
                  onClick={() => setActiveSection('getting-started')} 
                  className="text-coral hover:underline"
                >
                  Getting Started guide
                </button>{' '}
                or{' '}
                <a href="mailto:hello@partito.org" className="text-coral hover:underline">
                  contact us
                </a>{' '}
                with questions.
              </p>
            </div>
          </article>
        )}
      </div>
    </div>
  );
};

export default Docs;
