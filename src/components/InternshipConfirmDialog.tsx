import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { RetroWindow } from './RetroWindow';
import { RetroButton } from './RetroButton';

export interface PendingFieldChange {
  field: string;
  previousValue: string;
  newValue: string;
}

interface InternshipConfirmDialogProps {
  open: boolean;
  studentName: string;
  changes: PendingFieldChange[];
  existingOfferDomain?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const InternshipConfirmDialog: React.FC<InternshipConfirmDialogProps> = ({
  open,
  studentName,
  changes,
  existingOfferDomain,
  onConfirm,
  onCancel,
}) => {
  if (!open || changes.length === 0) return null;

  const domainChange = changes.find((c) => c.field === 'Internship Domain');

  return (
    <div
      className="fixed inset-0 z-[60] bg-[#182747]/75 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <RetroWindow
        title="CONFIRM_INTERNSHIP_CHANGES.EXE"
        headerColor="navy"
        onClose={onCancel}
        className="w-full max-w-xl"
      >
        <div className="space-y-4">
          <p className="text-sm font-bold text-[#182747]">
            Review the following changes for <span className="text-[#4169E1]">{studentName}</span>{' '}
            before saving:
          </p>

          <div className="border-2 border-[#303030] bg-white overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#182747] text-[#FFF8E7] font-mono-data text-[11px] uppercase">
                  <th className="p-2.5 border-b-2 border-r border-[#303030]">Field Name</th>
                  <th className="p-2.5 border-b-2 border-r border-[#303030]">Previous Value</th>
                  <th className="p-2.5 border-b-2 border-[#303030]">Updated Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#303030]/20">
                {changes.map((c) => (
                  <tr key={c.field}>
                    <td className="p-2.5 border-r border-[#303030]/20 font-bold text-[#182747]">
                      {c.field}
                    </td>
                    <td className="p-2.5 border-r border-[#303030]/20 text-[#C94C4C] font-mono-data">
                      {c.previousValue}
                    </td>
                    <td className="p-2.5 text-[#4E8B62] font-bold font-mono-data">
                      {c.newValue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {domainChange && existingOfferDomain && (
            <div className="p-3.5 bg-[#F4C542]/25 border-2 border-[#303030] flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#b68911] shrink-0 mt-0.5" />
              <div className="text-xs text-[#182747] leading-relaxed">
                <p className="font-bold uppercase">Existing Offer Letter Notice</p>
                <p className="mt-1">
                  An Offer Letter has already been issued containing the previous internship domain (
                  <strong>{existingOfferDomain}</strong>). Confirming this change will update the
                  student&apos;s domain, dashboard, and tasks, while keeping the previously issued
                  Offer Letter unchanged. You can issue an updated letter anytime using{' '}
                  <strong>REGENERATE OFFER LETTER</strong>.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 pt-2 border-t-2 border-dotted border-[#303030]/40">
            <RetroButton type="button" variant="neutral" onClick={onCancel}>
              Cancel
            </RetroButton>
            <RetroButton type="button" variant="success" onClick={onConfirm}>
              <Check className="w-4 h-4" />
              <span>Confirm Changes</span>
            </RetroButton>
          </div>
        </div>
      </RetroWindow>
    </div>
  );
};
