import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  destructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  destructive = true,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-warm-gray-700 mb-6">{message}</p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          variant={destructive ? 'destructive' : 'primary'}
          onClick={onConfirm}
          className="flex-1"
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
