import React from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

interface FooterLinkProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
}

const FooterLink: React.FC<FooterLinkProps> = ({ children, onClick, href }) => {
  const baseStyles =
    "text-warm-gray-400 text-base no-underline bg-transparent border-none cursor-pointer text-left p-0 hover:text-warm-gray-300 transition-colors";

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={baseStyles}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={baseStyles}>
      {children}
    </button>
  );
};

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const navigate = useNavigate();

  const handleNavigate = (route: string) => {
    navigate(`/${route === "home" ? "" : route}`);
  };

  return (
    <footer className={cn("bg-warm-gray-900 pt-16 pb-8 px-6", className)}>
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <span className="font-heading text-xl font-bold text-white">Partito</span>
          <p className="text-warm-gray-500 text-sm mt-2">
            Party incognito.
            <br />
            Open source event invitations.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="text-warm-gray-500 text-xs uppercase tracking-wider mb-4">Product</h4>
          <div className="flex flex-col gap-2">
            <FooterLink onClick={() => handleNavigate("create")}>Create Event</FooterLink>
            <FooterLink onClick={() => handleNavigate("templates")}>Templates</FooterLink>
          </div>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-warm-gray-500 text-xs uppercase tracking-wider mb-4">Resources</h4>
          <div className="flex flex-col gap-2">
            {/* FIX: Removed link to /docs which doesn't exist */}
            <FooterLink onClick={() => handleNavigate("recover")}>Recover Edit Link</FooterLink>
            <FooterLink href="https://github.com/partito/partito">GitHub</FooterLink>
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-warm-gray-500 text-xs uppercase tracking-wider mb-4">Company</h4>
          <div className="flex flex-col gap-2">
            {/* FIX: Removed links to /about, /privacy, /terms which don't exist */}
            {/* TODO: Add these pages or use external links to your legal documents */}
            <FooterLink onClick={() => handleNavigate("contact")}>Contact</FooterLink>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1200px] mx-auto mt-8 pt-6 border-t border-warm-gray-700 flex justify-between items-center flex-wrap gap-4">
        <span className="text-warm-gray-500 text-sm">© 2026 Partito. Open source under AGPL-3.0.</span>
        <div className="flex gap-4">
          <a
            href="https://github.com/partito"
            target="_blank"
            rel="noopener noreferrer"
            className="text-warm-gray-400 hover:text-warm-gray-300 transition-colors"
            aria-label="GitHub"
          >
            <Icon name="github" size={24} />
          </a>
          <a
            href="https://bsky.app/profile/partito.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-warm-gray-400 hover:text-warm-gray-300 transition-colors"
            aria-label="Bluesky"
          >
            <Icon name="cloud" size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
};
