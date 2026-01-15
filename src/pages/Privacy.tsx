import { Card } from '@/components/partito/Card';

const Privacy = () => {
  return (
    <div className="max-w-[720px] mx-auto px-6 py-12 md:py-16">
      <h1 className="font-heading text-3xl md:text-4xl font-semibold mb-2">
        Privacy Policy
      </h1>
      <p className="text-warm-gray-500 mb-10">Last updated: January 11, 2026</p>

      <div className="space-y-6 text-warm-gray-700 leading-relaxed">
        {/* TL;DR */}
        <Card className="bg-cream border-none">
          <h3 className="font-heading font-semibold mb-3 text-warm-gray-900">The Short Version</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>We collect only what's needed to run your event</li>
            <li>We never sell your data</li>
            <li>We delete everything when your event expires</li>
            <li>We never ask for phone numbers</li>
            <li>We never access your contacts</li>
            <li>We're open source, so you can verify it yourself</li>
          </ul>
        </Card>

        <h2 className="font-heading text-xl font-semibold text-warm-gray-900 mt-10">
          What We Collect
        </h2>
        <p>
          <strong>When you create an event:</strong> Event details (title, description, date, location), 
          your name as host, your email (optional, for edit link recovery), and any cover image you upload 
          (we strip GPS and metadata).
        </p>
        <p>
          <strong>When guests RSVP:</strong> Name, email (if you choose to collect it), RSVP status, 
          plus-ones, dietary notes, and answers to custom questions you create.
        </p>
        <p>
          <strong>Automatically:</strong> Basic server logs (IP addresses, timestamps) for security purposes. 
          We don't use analytics cookies or tracking pixels.
        </p>

        <h2 className="font-heading text-xl font-semibold text-warm-gray-900 mt-10">
          What We Don't Collect
        </h2>
        <p>We specifically design our product to avoid collecting:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Phone numbers (not from hosts, not from guests)</li>
          <li>Contact lists or address book access</li>
          <li>GPS coordinates from images (we strip EXIF metadata)</li>
          <li>Device fingerprints or unique identifiers</li>
          <li>Social connections between guests</li>
          <li>Third-party tracking cookies or pixels</li>
        </ul>

        <h2 className="font-heading text-xl font-semibold text-warm-gray-900 mt-10">
          How We Use Your Data
        </h2>
        <p>
          We use your data to provide the service you requested: display your event page, collect RSVPs, 
          send updates you authorize, and enable calendar integration. That's it. We don't use your data 
          for advertising, profiling, or any purpose beyond running your event.
        </p>

        <h2 className="font-heading text-xl font-semibold text-warm-gray-900 mt-10">
          Data Retention
        </h2>
        <p>
          By default, events and all associated data are automatically deleted 30 days after the event date. 
          You can choose different retention periods (7 days, 90 days, or 1 year for supporters). 
          You can also delete your event anytime using your edit link.
        </p>

        <h2 className="font-heading text-xl font-semibold text-warm-gray-900 mt-10">
          Your Rights
        </h2>
        <p>
          You can access, correct, or delete your event data anytime using your edit link. 
          Guests can contact event hosts or email us at privacy@partito.org for data requests. 
          We respond within 30 days.
        </p>

        <h2 className="font-heading text-xl font-semibold text-warm-gray-900 mt-10">
          Third-Party Services
        </h2>
        <p>We use limited third-party services:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Stripe:</strong> Payment processing for supporters</li>
          <li><strong>Resend:</strong> Transactional email delivery</li>
          <li><strong>Cloudflare R2:</strong> Image storage</li>
        </ul>
        <p>We do not use Google Analytics, Facebook Pixel, or any advertising or tracking services.</p>

        <h2 className="font-heading text-xl font-semibold text-warm-gray-900 mt-10">
          Contact Us
        </h2>
        <p>
          Privacy questions: <a href="mailto:privacy@partito.org" className="text-coral hover:underline">privacy@partito.org</a><br />
          General questions: <a href="mailto:hello@partito.org" className="text-coral hover:underline">hello@partito.org</a>
        </p>
      </div>
    </div>
  );
};

export default Privacy;
