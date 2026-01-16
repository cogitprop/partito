import React, { useState, useRef, useEffect } from 'react';
import { format, isValid, setHours, setMinutes } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  label?: string;
  value?: string; // ISO string or datetime-local format
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  minDate?: Date;
  timezone?: string;
  onTimezoneChange?: (tz: string) => void;
  showTimezone?: boolean;
}

// Common event times for quick selection
const PRESET_TIMES = [
  { label: '12:00 PM', hours: 12, minutes: 0 },
  { label: '1:00 PM', hours: 13, minutes: 0 },
  { label: '2:00 PM', hours: 14, minutes: 0 },
  { label: '3:00 PM', hours: 15, minutes: 0 },
  { label: '4:00 PM', hours: 16, minutes: 0 },
  { label: '5:00 PM', hours: 17, minutes: 0 },
  { label: '5:30 PM', hours: 17, minutes: 30 },
  { label: '6:00 PM', hours: 18, minutes: 0 },
  { label: '6:30 PM', hours: 18, minutes: 30 },
  { label: '7:00 PM', hours: 19, minutes: 0 },
  { label: '7:30 PM', hours: 19, minutes: 30 },
  { label: '8:00 PM', hours: 20, minutes: 0 },
  { label: '8:30 PM', hours: 20, minutes: 30 },
  { label: '9:00 PM', hours: 21, minutes: 0 },
  { label: '10:00 PM', hours: 22, minutes: 0 },
];

// Morning/early times
const MORNING_TIMES = [
  { label: '8:00 AM', hours: 8, minutes: 0 },
  { label: '9:00 AM', hours: 9, minutes: 0 },
  { label: '10:00 AM', hours: 10, minutes: 0 },
  { label: '11:00 AM', hours: 11, minutes: 0 },
];

// Common timezones for quick selection
const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5' },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8' },
  { value: 'America/Phoenix', label: 'Arizona (MST)', offset: 'UTC-7' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HST)', offset: 'UTC-10' },
  { value: 'America/Anchorage', label: 'Alaska (AKST)', offset: 'UTC-9' },
  { value: 'Europe/London', label: 'London (GMT)', offset: 'UTC+0' },
  { value: 'Europe/Paris', label: 'Paris (CET)', offset: 'UTC+1' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', offset: 'UTC+1' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 'UTC+9' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 'UTC+8' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 'UTC+8' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)', offset: 'UTC+11' },
];

// Get a friendly display name for a timezone
const getTimezoneLabel = (tz: string): string => {
  const found = COMMON_TIMEZONES.find(t => t.value === tz);
  if (found) return found.label;
  
  // Fallback: try to format the timezone nicely
  try {
    const parts = tz.split('/');
    return parts[parts.length - 1].replace(/_/g, ' ');
  } catch {
    return tz;
  }
};

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  value,
  onChange,
  required,
  placeholder = 'Select date & time',
  className,
  minDate,
  timezone,
  onTimezoneChange,
  showTimezone = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMorning, setShowMorning] = useState(false);
  const [showTzPicker, setShowTzPicker] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const [tzSearch, setTzSearch] = useState('');
  const customInputRef = useRef<HTMLInputElement>(null);

  // Parse the current value - handle both ISO strings and datetime-local format
  // When a timezone is specified, convert UTC to that timezone for display
  const parseValue = (): { date: Date | undefined; time: { hours: number; minutes: number } | undefined } => {
    if (!value) return { date: undefined, time: undefined };
    
    try {
      // Check if it's a datetime-local format (YYYY-MM-DDTHH:mm) without timezone
      const localMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
      if (localMatch) {
        const [, year, month, day, hours, minutes] = localMatch;
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes)
        );
        if (isValid(date)) {
          return {
            date,
            time: { hours: parseInt(hours), minutes: parseInt(minutes) }
          };
        }
      }
      
      // For ISO strings with timezone info (from database), we need to convert to the event's timezone
      // Parse as a proper Date (this handles timezone offsets correctly)
      const parsedDate = new Date(value);
      if (isValid(parsedDate) && timezone) {
        // Use Intl.DateTimeFormat to get the time in the target timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        const parts = formatter.formatToParts(parsedDate);
        const getPart = (type: string) => parts.find(p => p.type === type)?.value || '0';
        
        const tzYear = parseInt(getPart('year'));
        const tzMonth = parseInt(getPart('month')) - 1;
        const tzDay = parseInt(getPart('day'));
        const tzHours = parseInt(getPart('hour'));
        const tzMinutes = parseInt(getPart('minute'));
        
        // Create a local Date for the picker UI representing this time in the target timezone
        const localDate = new Date(tzYear, tzMonth, tzDay, tzHours, tzMinutes);
        
        return {
          date: localDate,
          time: { hours: tzHours, minutes: tzMinutes }
        };
      }
      
      // For ISO strings without a specified timezone prop, extract time components directly
      const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
      if (isoMatch) {
        const [, year, month, day, hours, minutes] = isoMatch;
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes)
        );
        if (isValid(date)) {
          return {
            date,
            time: { hours: parseInt(hours), minutes: parseInt(minutes) }
          };
        }
      }
      
      // Fallback: try parsing as Date (will use browser timezone)
      const date = new Date(value);
      if (isValid(date)) {
        return {
          date,
          time: { hours: date.getHours(), minutes: date.getMinutes() }
        };
      }
    } catch {
      // Invalid date
    }
    return { date: undefined, time: undefined };
  };

  const { date: selectedDate, time: selectedTime } = parseValue();

  // Update custom time input when value changes
  useEffect(() => {
    if (selectedTime) {
      const h = selectedTime.hours;
      const m = selectedTime.minutes;
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      setCustomTime(`${displayHour}:${m.toString().padStart(2, '0')} ${period}`);
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // If we already have a time, preserve it
    if (selectedTime) {
      const newDate = setMinutes(setHours(date, selectedTime.hours), selectedTime.minutes);
      onChange(formatForOutput(newDate));
    } else {
      // Default to 6:00 PM if no time selected yet
      const newDate = setMinutes(setHours(date, 18), 0);
      onChange(formatForOutput(newDate));
    }
  };

  const handleTimeSelect = (hours: number, minutes: number) => {
    if (!selectedDate) {
      // If no date, use today
      const today = new Date();
      const newDate = setMinutes(setHours(today, hours), minutes);
      onChange(formatForOutput(newDate));
    } else {
      const newDate = setMinutes(setHours(selectedDate, hours), minutes);
      onChange(formatForOutput(newDate));
    }
    setIsOpen(false);
  };

  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTime(e.target.value);
  };

  const handleCustomTimeBlur = () => {
    // Parse custom time input
    const timeRegex = /^(\d{1,2}):(\d{2})\s*(am|pm)?$/i;
    const match = customTime.match(timeRegex);
    
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3]?.toLowerCase();
      
      if (period === 'pm' && hours !== 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;
      
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        handleTimeSelect(hours, minutes);
      }
    }
  };

  const handleCustomTimeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomTimeBlur();
    }
  };

  const formatForOutput = (date: Date): string => {
    // Persist the selected *wall time* in the event's timezone as an absolute instant (UTC).
    // Without this, times shift depending on the viewer's/browser's timezone.

    // If no timezone is provided, fall back to a "naive" datetime-local.
    if (!timezone) {
      return format(date, "yyyy-MM-dd'T'HH:mm");
    }

    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();
    const hh = date.getHours();
    const mm = date.getMinutes();
    const ss = date.getSeconds();

    // Build a UTC timestamp from the wall-time components, then iteratively correct by the
    // target timezone's offset at that moment (handles DST correctly in most cases).
    const getOffsetMinutes = (tz: string, utcDate: Date): number => {
      // Format the *UTC instant* into the target timezone, then compare that wall time
      // back to the UTC instant to derive the offset.
      const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      const parts = dtf.formatToParts(utcDate);
      const get = (type: string) => parts.find((p) => p.type === type)?.value || '00';

      const asIfUtc = Date.UTC(
        parseInt(get('year'), 10),
        parseInt(get('month'), 10) - 1,
        parseInt(get('day'), 10),
        parseInt(get('hour'), 10),
        parseInt(get('minute'), 10),
        parseInt(get('second'), 10)
      );

      return (asIfUtc - utcDate.getTime()) / 60000;
    };

    // Initial guess: interpret wall time as if it were UTC
    let utcMillis = Date.UTC(y, m, d, hh, mm, ss);

    // Two iterations is usually enough for DST boundaries
    for (let i = 0; i < 2; i++) {
      const guess = new Date(utcMillis);
      const offsetMin = getOffsetMinutes(timezone, guess);
      utcMillis = Date.UTC(y, m, d, hh, mm, ss) - offsetMin * 60_000;
    }

    return new Date(utcMillis).toISOString();
  };

  const formatForDisplay = (): string => {
    if (!selectedDate) return '';
    
    const dateStr = format(selectedDate, 'EEE, MMM d, yyyy');
    if (selectedTime) {
      const h = selectedTime.hours;
      const m = selectedTime.minutes;
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const timeStr = `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
      return `${dateStr} at ${timeStr}`;
    }
    return dateStr;
  };

  const displayTimes = showMorning ? [...MORNING_TIMES, ...PRESET_TIMES] : PRESET_TIMES;

  const isTimeSelected = (hours: number, minutes: number): boolean => {
    return selectedTime?.hours === hours && selectedTime?.minutes === minutes;
  };

  const filteredTimezones = COMMON_TIMEZONES.filter(tz => 
    tz.label.toLowerCase().includes(tzSearch.toLowerCase()) ||
    tz.value.toLowerCase().includes(tzSearch.toLowerCase())
  );

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-warm-gray-700 mb-1.5">
          {label}
          {required && <span className="text-coral ml-0.5">*</span>}
        </label>
      )}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'w-full px-4 py-3 rounded-xl border bg-white text-left flex items-center gap-3 transition-all',
              'focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral',
              selectedDate 
                ? 'border-warm-gray-200 text-warm-gray-900' 
                : 'border-warm-gray-200 text-warm-gray-400'
            )}
          >
            <Icon name="calendar" size={18} className="text-warm-gray-500 flex-shrink-0" />
            <span className="flex-1 truncate">
              {selectedDate ? formatForDisplay() : placeholder}
            </span>
            <Icon 
              name="chevron-down" 
              size={16} 
              className={cn('text-warm-gray-400 transition-transform', isOpen && 'rotate-180')} 
            />
          </button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-auto p-0 bg-white border border-warm-gray-200 shadow-lg rounded-xl" 
          align="start"
          sideOffset={8}
        >
          <div className="flex flex-col sm:flex-row">
            {/* Calendar */}
            <div className="p-3 border-b sm:border-b-0 sm:border-r border-warm-gray-100">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => minDate ? date < minDate : date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
                className="pointer-events-auto"
              />
            </div>
            
            {/* Time Selection */}
            <div className="p-3 w-full sm:w-[180px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-warm-gray-700">Time</span>
                <button
                  type="button"
                  onClick={() => setShowMorning(!showMorning)}
                  className="text-xs text-coral hover:text-coral-dark transition-colors"
                >
                  {showMorning ? 'Hide morning' : 'Show morning'}
                </button>
              </div>
              
              {/* Custom time input */}
              <div className="mb-3">
                <input
                  ref={customInputRef}
                  type="text"
                  value={customTime}
                  onChange={handleCustomTimeChange}
                  onBlur={handleCustomTimeBlur}
                  onKeyDown={handleCustomTimeKeyDown}
                  placeholder="e.g., 7:30 PM"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-warm-gray-200 bg-white placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
                />
              </div>
              
              {/* Preset times grid */}
              <div className="grid grid-cols-2 gap-1.5 max-h-[200px] overflow-y-auto">
                {displayTimes.map((time) => (
                  <button
                    key={time.label}
                    type="button"
                    onClick={() => handleTimeSelect(time.hours, time.minutes)}
                    className={cn(
                      'px-2 py-1.5 text-sm rounded-lg transition-colors text-center',
                      isTimeSelected(time.hours, time.minutes)
                        ? 'bg-coral text-white font-medium'
                        : 'bg-warm-gray-50 text-warm-gray-700 hover:bg-warm-gray-100'
                    )}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Timezone Selector */}
      {showTimezone && onTimezoneChange && (
        <div className="mt-2 relative">
          <button
            type="button"
            onClick={() => setShowTzPicker(!showTzPicker)}
            className="flex items-center gap-1.5 text-sm text-warm-gray-500 hover:text-warm-gray-700 transition-colors"
          >
            <Icon name="globe" size={14} />
            <span>{timezone ? getTimezoneLabel(timezone) : 'Select timezone'}</span>
            <Icon name="chevron-down" size={12} className={cn('transition-transform', showTzPicker && 'rotate-180')} />
          </button>
          
          {showTzPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-warm-gray-200 rounded-lg shadow-lg z-50 w-72 max-h-64 overflow-hidden">
              <div className="p-2 border-b border-warm-gray-100">
                <input
                  type="text"
                  value={tzSearch}
                  onChange={(e) => setTzSearch(e.target.value)}
                  placeholder="Search timezones..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-warm-gray-200 bg-white placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
                />
              </div>
              <div className="overflow-y-auto max-h-48">
                {filteredTimezones.map((tz) => (
                  <button
                    key={tz.value}
                    type="button"
                    onClick={() => {
                      onTimezoneChange(tz.value);
                      setShowTzPicker(false);
                      setTzSearch('');
                    }}
                    className={cn(
                      'w-full px-3 py-2 text-sm text-left hover:bg-warm-gray-50 transition-colors flex items-center justify-between',
                      timezone === tz.value && 'bg-coral/10 text-coral'
                    )}
                  >
                    <span>{tz.label}</span>
                    <span className="text-xs text-warm-gray-400">{tz.offset}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
