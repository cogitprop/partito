import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

interface CalendarDropdownProps {
  event: {
    title: string;
    description?: string;
    start_time: string;
    end_time?: string;
    venue_name?: string;
    address?: string;
    virtual_link?: string;
    location_type?: string;
  };
}

export const CalendarDropdown: React.FC<CalendarDropdownProps> = ({ event }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateForGoogle = (dateString: string) => {
    return new Date(dateString).toISOString().replace(/-|:|\.\d+/g, '');
  };

  const formatDateForOutlook = (dateString: string) => {
    return new Date(dateString).toISOString();
  };

  const getLocation = () => {
    if (event.location_type === 'virtual' && event.virtual_link) {
      return event.virtual_link;
    }
    const parts = [event.venue_name, event.address].filter(Boolean);
    return parts.join(', ');
  };

  const generateGoogleCalendarUrl = () => {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      details: event.description || '',
      location: getLocation(),
      dates: `${formatDateForGoogle(event.start_time)}/${formatDateForGoogle(event.end_time || event.start_time)}`,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const generateOutlookUrl = () => {
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: event.title,
      body: event.description || '',
      location: getLocation(),
      startdt: formatDateForOutlook(event.start_time),
      enddt: formatDateForOutlook(event.end_time || event.start_time),
    });
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  };

  const generateICSContent = () => {
    const formatICSDate = (dateString: string) => {
      return new Date(dateString).toISOString().replace(/-|:|\.\d+/g, '').slice(0, -1) + 'Z';
    };

    const escapeICS = (text: string) => {
      return text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
    };

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Partito//Event//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@partito.org`,
      `DTSTAMP:${formatICSDate(new Date().toISOString())}`,
      `DTSTART:${formatICSDate(event.start_time)}`,
      `DTEND:${formatICSDate(event.end_time || event.start_time)}`,
      `SUMMARY:${escapeICS(event.title)}`,
    ];

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
    }

    const location = getLocation();
    if (location) {
      lines.push(`LOCATION:${escapeICS(location)}`);
    }

    lines.push('END:VEVENT', 'END:VCALENDAR');
    return lines.join('\r\n');
  };

  const downloadICS = () => {
    const content = generateICSContent();
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const calendarOptions = [
    {
      label: 'Google Calendar',
      icon: 'calendar' as const,
      action: () => {
        window.open(generateGoogleCalendarUrl(), '_blank');
        setIsOpen(false);
      },
    },
    {
      label: 'Apple Calendar',
      icon: 'calendar' as const,
      action: downloadICS, // Apple uses .ics files
    },
    {
      label: 'Outlook',
      icon: 'calendar' as const,
      action: () => {
        window.open(generateOutlookUrl(), '_blank');
        setIsOpen(false);
      },
    },
    {
      label: 'Download .ics',
      icon: 'download' as const,
      action: downloadICS,
    },
  ];

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <Button variant="secondary" onClick={() => setIsOpen(!isOpen)}>
        <Icon name="calendar" size={18} /> Add to Calendar
        <Icon name="chevron-down" size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-warm-gray-100 rounded-lg shadow-lg z-50 min-w-[200px] animate-fade-in">
          {calendarOptions.map((option) => (
            <button
              key={option.label}
              onClick={option.action}
              className="w-full px-4 py-3 text-sm text-warm-gray-700 hover:bg-cream flex items-center gap-3 first:rounded-t-lg last:rounded-b-lg transition-colors text-left"
            >
              <Icon name={option.icon} size={16} className="text-warm-gray-500" />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
