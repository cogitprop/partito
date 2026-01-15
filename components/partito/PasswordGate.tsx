import React, { useState } from 'react';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

interface PasswordGateProps {
  eventId: string;
  password: string;
  passwordHint?: string | null;
  coverImage?: string | null;
  onVerified: () => void;
}

export const PasswordGate: React.FC<PasswordGateProps> = ({
  eventId,
  password,
  passwordHint,
  coverImage,
  onVerified,
}) => {
  const [inputPassword, setInputPassword] = useState('');
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === password) {
      sessionStorage.setItem(`partito_verified_${eventId}`, 'true');
      onVerified();
    } else {
      setError(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-warm-gray-50 flex items-center justify-center p-6 relative">
      {/* Background blur */}
      <div
        className="absolute top-0 left-0 right-0 h-[300px] blur-[20px] opacity-50"
        style={{
          background: coverImage
            ? `url(${coverImage}) center/cover`
            : 'linear-gradient(135deg, #FFE5E5 0%, #FFF5E5 100%)',
        }}
      />

      <Card className="max-w-[400px] w-full text-center relative z-10">
        <Icon name="lock" size={48} className="text-warm-gray-400 mb-4 mx-auto" />
        <h2 className="font-heading text-xl font-semibold mb-2">This event is private</h2>
        <p className="text-warm-gray-500 mb-6">Enter the password to view details.</p>
        
        <form onSubmit={handleSubmit}>
          <div
            className={cn(
              isShaking && 'animate-shake'
            )}
          >
            <Input
              type="password"
              value={inputPassword}
              onChange={(e) => {
                setInputPassword(e.target.value);
                setError(false);
              }}
              placeholder="Enter password"
              error={error ? 'Incorrect password' : undefined}
              className="mb-3"
            />
          </div>
          {passwordHint && (
            <p className="text-sm text-warm-gray-500 mb-4">Hint: {passwordHint}</p>
          )}
          <Button type="submit" fullWidth>
            View Event
          </Button>
        </form>
      </Card>
    </div>
  );
};
