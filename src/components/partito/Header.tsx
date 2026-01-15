import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  minimal?: boolean;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ minimal = false, className }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (route: string) => {
    setMobileMenuOpen(false);
    switch (route) {
      case 'home':
        navigate('/');
        break;
      case 'create':
        navigate('/create');
        break;
      case 'templates':
        navigate('/templates');
        break;
      case 'about':
        navigate('/about');
        break;
      default:
        navigate('/');
    }
  };

  const navItems = [
    { key: 'templates', label: 'Templates' },
    { key: 'about', label: 'About' },
  ];

  return (
    <header
      className={cn(
        'bg-white px-6 py-4 relative z-50',
        !minimal && 'border-b border-warm-gray-100',
        className
      )}
    >
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        <button
          onClick={() => handleNavigate('home')}
          className="bg-transparent border-none cursor-pointer flex items-center gap-2"
        >
          <span className="font-heading text-2xl font-bold text-coral">
            Partito
          </span>
        </button>

        {!minimal ? (
          <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-6 items-center">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavigate(item.key)}
                  className="bg-transparent border-none cursor-pointer text-warm-gray-700 text-base hover:text-coral transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <Button onClick={() => handleNavigate('create')}>Create Event</Button>
            </nav>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden bg-transparent border-none cursor-pointer p-2 text-warm-gray-700 hover:text-coral transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </>
        ) : (
          <button
            onClick={() => handleNavigate('home')}
            className="bg-transparent border-none cursor-pointer text-warm-gray-500 text-base hover:text-warm-gray-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {!minimal && mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-warm-gray-100 shadow-lg z-50">
          <nav className="flex flex-col p-4 gap-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavigate(item.key)}
                className="bg-transparent border-none cursor-pointer text-warm-gray-700 text-base hover:text-coral transition-colors text-left py-3 px-4 rounded-lg hover:bg-warm-gray-50"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-warm-gray-100 mt-2">
              <Button 
                onClick={() => handleNavigate('create')} 
                className="w-full justify-center"
              >
                Create Event
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
