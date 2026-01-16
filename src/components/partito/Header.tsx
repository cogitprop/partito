import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from './Button';
import { Logo } from './Logo';
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
        'bg-cream px-6 py-4 relative z-50',
        !minimal && 'border-b border-warm-gray-200',
        className
      )}
    >
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        <button
          onClick={() => handleNavigate('home')}
          className="bg-transparent border-none cursor-pointer flex items-center gap-2"
        >
          <Logo size="md" />
        </button>

        {!minimal ? (
          <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-6 items-center">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavigate(item.key)}
                  className="bg-transparent border-none cursor-pointer text-warm-gray-700 text-base hover:text-sage-dark transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <Button onClick={() => handleNavigate('create')}>Create Event</Button>
            </nav>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden bg-transparent border-none cursor-pointer p-2 text-warm-gray-700 hover:text-sage-dark transition-colors"
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
        <div className="md:hidden absolute top-full left-0 right-0 bg-cream border-b border-warm-gray-200 shadow-lg z-50">
          <nav className="flex flex-col p-4 gap-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavigate(item.key)}
                className="bg-transparent border-none cursor-pointer text-warm-gray-700 text-base hover:text-sage-dark transition-colors text-left py-3 px-4 rounded-lg hover:bg-cream-dark"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-warm-gray-200 mt-2">
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
