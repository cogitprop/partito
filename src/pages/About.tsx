import { useNavigate } from "react-router-dom";
import { Button } from "@/components/partito/Button";
import { Icon } from "@/components/partito/Icon";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-[720px] mx-auto px-6 py-12 md:py-16">
      <h1 className="font-heading text-3xl md:text-4xl font-semibold mb-8">About Partito</h1>

      <div className="space-y-6 text-warm-gray-700 leading-relaxed">
        <p className="text-lg">
          Partito is a free, open source platform for event invitations. We built it because we wanted to gather with
          friends without handing over their phone numbers, contact lists, and social connections to companies that
          profit from that information.
        </p>

        <h2 className="font-heading text-2xl font-semibold text-warm-gray-900 mt-10">The Problem</h2>

        <p>
          Most event apps treat your guest list as a product. When you invite 50 people to your birthday dinner, you're
          also telling the app exactly who your close friends are. When your guests RSVP, the app captures their phone
          numbers and email addresses. These companies build detailed social graphs that they monetize through
          advertising, data sales, or "features" that require access to your contacts.
        </p>

        <p>
          The moment you sync your contacts, those apps know who you text most, who you've known longest, and who shares
          mutual connections. They see when your friend RSVPs to someone else's event, triangulating relationships you
          never intended to reveal. Your casual game night becomes a node in a sprawling database of who knows whom.
        </p>

        <p>
          Some apps require every guest to download yet another app and create yet another account, complete with phone
          verification. Others blast SMS invites from unknown numbers, training your friends to expect spam. A few
          charge subscription fees, then still harvest data anyway. The "free" ones are the most aggressive, because you
          and your friends are the actual product.
        </p>

        <p>Your weekend barbecue shouldn't be a data harvesting opportunity.</p>

        <h2 className="font-heading text-2xl font-semibold text-warm-gray-900 mt-10">Our Approach</h2>

        <p>
          Partito takes a different path. No phone numbers required. No contact syncing. No social graph. Photo metadata
          stripped. Automatic deletion. Open source code that anyone can verify.
        </p>

        <p>
          We collect only the information needed to run your event, and we delete it when your event ends. We don't
          track who knows who, we don't build profiles, and we don't sell anything to anyone. Your guests don't need to
          download an app or create an account; they just click a link.
        </p>

        <h2 className="font-heading text-2xl font-semibold text-warm-gray-900 mt-10">Open Source</h2>

        <p>
          Partito's code is open source under the AGPL-3.0 license. You can read every line, suggest improvements, or
          run your own instance if you prefer. We believe transparency builds trust, and we have nothing to hide.
        </p>

        <div className="flex gap-3 mt-10">
          <Button onClick={() => navigate("/create")}>Create an Event</Button>
          <Button variant="secondary" onClick={() => window.open("https://github.com/cogitprop/partito", "_blank")}>
            <Icon name="github" size={18} /> View Source
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;
