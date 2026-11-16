import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { RetroWindow } from './RetroWindow';
import { RetroButton } from './RetroButton';

interface NotificationDialogProps {
  open: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const NotificationDialog: React.FC<NotificationDialogProps> = ({
  open,
  title,
  message,
  type = 'info',
  confirmLabel = 'OK',
  cancelLabel,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  const headerColor =
    type === 'success' ? 'green' : type === 'error' ? 'red' : 'navy';

  const Icon =
    type === 'success'
      ? CheckCircle2
      : type === 'error'
      ? AlertCircle
      : Info;

  const iconColor =
    type === 'success'
      ? 'text-[#4E8B62]'
      : type === 'error'
      ? 'text-[#C94C4C]'
      : 'text-[#4169E1]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#182747]/65 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="retro-dialog-title"
    >
      <RetroWindow
        title={title}
        headerColor={headerColor}
        onClose={onCancel || onConfirm}
        className="w-full max-w-md"
      >
        <div className="flex items-start gap-4">
          <div className={`p-2 bg-[#F4EBD0] border-2 border-[#303030] shrink-0 ${iconColor}`}>
            <Icon className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p
              id="retro-dialog-title"
              className="text-sm sm:text-base font-bold text-[#182747] leading-relaxed"
            >
              {message}
            </p>
          </div>
        </div>

        <hr className="retro-dotted-hr my-5" />

        <div className="flex flex-wrap items-center justify-end gap-3">
          {cancelLabel && onCancel && (
            <RetroButton variant="neutral" onClick={onCancel}>
              {cancelLabel}
            </RetroButton>
          )}
          <RetroButton
            variant={type === 'success' ? 'success' : type === 'error' ? 'danger' : 'primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </RetroButton>
        </div>
      </RetroWindow>
    </div>
  );
};
