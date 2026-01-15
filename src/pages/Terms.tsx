import { Card } from '@/components/partito/Card';

const Terms = () => {
  return (
    <div className="max-w-[720px] mx-auto px-6 py-12 md:py-16">
      <h1 className="font-heading text-3xl md:text-4xl font-semibold mb-2">
        Terms of Service
      </h1>
      <p className="text-warm-gray-500 mb-10">Last updated: January 11, 2026</p>

      <div className="space-y-6 text-warm-gray-700 leading-relaxed">
        {/* TL;DR */}
        <Card className="bg-cream border-none">
          <h3 className="font-heading font-semibold mb-3 text-warm-gray-900">The Short Version</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Use Partito for legal events</li>
            <li>Don't upload illegal or harmful content</li>
            <li>Don't abuse our service</li>
            <li>We provide the service "as is"</li>
            <li>You can leave anytime</li>
          </ul>
        </Card>

        <h2 className="font-heading text-xl font-semibold text-warm-gray-900 mt-10">
          What Partito Provides
        </h2>
        <p>
          Partito is a free, open source event invitation platform. We provide event pages, RSVP collection, 
          and guest communication tools.
        </p>

        <h2 className="font-heading text-xl font-semibold text-warm-gray-900 mt-10">
          Acceptable Use
        </h2>
        <p><strong>You may use Partito to:</strong></p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Create invitations for legal events</li>
          <li>Share event pages with potential guests</li>
          <li>Collect RSVPs and manage attendance</li>
          <li>Send updates to your guests</li>
        </ul>

        <p className="mt-4"><strong>You may not use Partito for:</strong></p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Illegal activities or promoting illegal events</li>
          <li>Harassment, spam, or unsolicited communications</li>
          <li>Content that infringes on others' rights</li>
          <li>Attempting to circumvent security measures</li>
          <li>Automated scraping or abuse of our APIs</li>
          <li>Impersonating others or creating fake events</li>
        </ul>

        <h2 className="font-heading text-xl font-semibold text-warm-gray-900 mt-10">
          Your Content
        </h2>
        <p>
          You own the content you create (event details, descriptions, images). By posting content on Partito, 
          you grant us a license to display and distribute that content to your guests as needed to provide 
          the service. We won't use your content for other purposes.
        </p>

        <h2 className="font-heading text-xl font-semibold text-warm-gray-900 mt-10">
          Service "As Is"
        </h2>
        <p>
          Partito is provided "as is" without warranties of any kind. We do our best to keep the service 
          running smoothly, but we can't guarantee uninterrupted service. We're not liable for any damages 
          arising from your use of Partito.
        </p>

        <h2 className="font-heading text-xl font-semibold text-warm-gray-900 mt-10">
          Termination
        </h2>
        <p>
          You can stop using Partito anytime by deleting your events. We can terminate or suspend your 
          access if you violate these terms, without prior notice for serious violations.
        </p>

        <h2 className="font-heading text-xl font-semibold text-warm-gray-900 mt-10">
          Changes to Terms
        </h2>
        <p>
          We may update these terms. When we do, we'll update the "Last updated" date and provide notice 
          for material changes. Continued use after changes means you accept the new terms.
        </p>

        <h2 className="font-heading text-xl font-semibold text-warm-gray-900 mt-10">
          Contact
        </h2>
        <p>
          Questions about these terms: <a href="mailto:legal@partito.org" className="text-coral hover:underline">legal@partito.org</a><br />
          General questions: <a href="mailto:hello@partito.org" className="text-coral hover:underline">hello@partito.org</a>
        </p>
      </div>
    </div>
  );
};

export default Terms;
