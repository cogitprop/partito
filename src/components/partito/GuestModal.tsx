import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { NumberStepper } from './NumberStepper';

interface GuestData {
  id?: string;
  name: string;
  email?: string | null;
  status: 'going' | 'maybe' | 'not_going' | 'waitlist';
  plus_ones?: number | null;
  dietary_note?: string | null;
}

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest?: GuestData | null;
  onSave: (data: Omit<GuestData, 'id'>) => void;
}

export const GuestModal: React.FC<GuestModalProps> = ({
  isOpen,
  onClose,
  guest,
  onSave,
}) => {
  const [formData, setFormData] = useState<Omit<GuestData, 'id'>>({
    name: '',
    email: '',
    status: 'going',
    plus_ones: 0,
    dietary_note: '',
  });

  useEffect(() => {
    if (guest) {
      setFormData({
        name: guest.name || '',
        email: guest.email || '',
        status: guest.status || 'going',
        plus_ones: guest.plus_ones || 0,
        dietary_note: guest.dietary_note || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        status: 'going',
        plus_ones: 0,
        dietary_note: '',
      });
    }
  }, [guest, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
    onClose();
  };

  const statusOptions = [
    { value: 'going', label: 'Going' },
    { value: 'maybe', label: 'Maybe' },
    { value: 'not_going', label: 'Not Going' },
    { value: 'waitlist', label: 'Waitlist' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={guest ? 'Edit Guest' : 'Add Guest'}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(v) => setFormData((p) => ({ ...p, status: v as GuestData['status'] }))}
            options={statusOptions}
          />
          <NumberStepper
            label="Plus-ones"
            value={formData.plus_ones || 0}
            onChange={(v) => setFormData((p) => ({ ...p, plus_ones: v }))}
            max={3}
          />
          <Input
            label="Dietary Note"
            value={formData.dietary_note || ''}
            onChange={(e) => setFormData((p) => ({ ...p, dietary_note: e.target.value }))}
          />
          <div className="flex gap-3 mt-2">
            <Button variant="secondary" type="button" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {guest ? 'Save Changes' : 'Add Guest'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
