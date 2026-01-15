import { Link } from "react-router-dom";
import { Button } from "@/components/partito/Button";
import { Card } from "@/components/partito/Card";
import { Icon } from "@/components/partito/Icon";

const Index = () => {
  const features = [
    { icon: "lock", title: "No Login Required", desc: "Create events instantly without signing up" },
    { icon: "eye-off", title: "Privacy First", desc: "No tracking, no ads, no data selling" },
    { icon: "code", title: "Open Source", desc: "Transparent and community-driven" },
    { icon: "users", title: "Easy RSVPs", desc: "Simple guest management for any event" },
  ];

  return (
    <div className="bg-warm-gray-50">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-warm-gray-900 mb-6 leading-tight">
            Party incognito.
            <span className="block text-coral">No login required.</span>
          </h1>
          <p className="text-xl text-warm-gray-500 mb-10 max-w-2xl mx-auto">
            Create beautiful event invitations in seconds. Collect RSVPs, manage guests, and share updates — all without
            creating an account.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create">
              <Button size="lg">
                Create an Event <Icon name="arrow-up" size={20} className="rotate-45" />
              </Button>
            </Link>
            <Link to="/templates">
              <Button variant="secondary" size="lg">
                Browse Templates
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl font-semibold text-center mb-12">
            Everything you need, nothing you don't
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} hover className="text-center">
                <div className="w-14 h-14 bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name={feature.icon} size={28} className="text-coral" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-warm-gray-500 text-sm">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-coral/10 to-honey/10 rounded-3xl p-12">
          <h2 className="font-heading text-3xl font-semibold mb-4">Ready to plan your event?</h2>
          <p className="text-warm-gray-600 mb-8">No account needed. Start creating in seconds.</p>
          <Link to="/create">
            <Button size="lg">Create Your Event</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
