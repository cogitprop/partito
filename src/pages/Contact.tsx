import { useState, useRef } from "react";
import { Card } from "@/components/partito/Card";
import { Input } from "@/components/partito/Input";
import { Button } from "@/components/partito/Button";
import { Icon } from "@/components/partito/Icon";
import { useToast } from "@/contexts/ToastContext";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // FIX: Add ref to prevent double submission
  const submittingRef = useRef(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // FIX: Prevent double submission using ref
    if (submittingRef.current || isSubmitting) {
      return;
    }

    if (!formData.name || !formData.email || !formData.message) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      // Send to edge function or store in database
      const { error } = await supabase.functions.invoke("contact-form", {
        body: formData,
      });

      if (error) {
        throw error;
      }

      setSubmitted(true);
      showToast("Message sent successfully!", "success");
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Contact form error:", err);
      }
      showToast("Failed to send message. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <Card className="max-w-md text-center">
          <div className="text-5xl mb-4">
            <Icon name="check-circle" size={64} className="mx-auto text-sage" />
          </div>
          <h2 className="font-heading text-2xl font-semibold mb-2">Thanks for reaching out!</h2>
          <p className="text-warm-gray-600 mb-6">We'll get back to you as soon as possible.</p>
          <Button onClick={() => (window.location.href = "/")}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-heading text-3xl font-bold mb-2">Contact Us</h1>
      <p className="text-warm-gray-600 mb-8">Have a question or feedback? We'd love to hear from you.</p>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <Input
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="What is this about?"
            disabled={isSubmitting}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-warm-gray-700">
              Message <span className="text-coral">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              rows={5}
              className="px-4 py-3 text-base font-body text-warm-gray-900 bg-white border border-warm-gray-300 rounded-md outline-none transition-all duration-200 focus:border-coral focus:ring-3 focus:ring-coral/10 disabled:bg-warm-gray-50 disabled:cursor-not-allowed"
              placeholder="Your message..."
            />
          </div>

          <Button type="submit" loading={isSubmitting} disabled={isSubmitting} fullWidth>
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Contact;
