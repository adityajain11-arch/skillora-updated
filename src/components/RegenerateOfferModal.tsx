import React, { useState } from 'react';
import { Check, FileCheck2 } from 'lucide-react';
import { OfferLetterRecord, Student } from '../types';
import { RetroWindow } from './RetroWindow';
import { RetroButton } from './RetroButton';
import { OfferLetterPreview } from './OfferLetterPreview';

interface RegenerateOfferModalProps {
  open: boolean;
  student: Student | null;
  nextVersion: number;
  onFinalize: (issueDate: string) => void;
  onCancel: () => void;
}

export const RegenerateOfferModal: React.FC<RegenerateOfferModalProps> = ({
  open,
  student,
  nextVersion,
  onFinalize,
  onCancel,
}) => {
  const defaultDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const [issueDate, setIssueDate] = useState(defaultDate);

  if (!open || !student) return null;

  const previewRecord: OfferLetterRecord = {
    id: 'PREVIEW',
    offerLetterNumber: `OL-${student.id}-V${nextVersion}`,
    version: nextVersion,
    studentId: student.id,
    studentName: student.fullName,
    domain: student.domain,
    issueDate: issueDate.trim() || defaultDate,
    createdAt: new Date().toISOString(),
    isCurrent: true,
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-[#182747]/80 flex items-start justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <RetroWindow
        title={`REGENERATE_OFFER_LETTER_V${nextVersion}.EXE`}
        headerColor="blue"
        onClose={onCancel}
        className="w-full max-w-4xl my-6"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-[#F4EBD0] border-2 border-[#303030] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#182747]">
                <FileCheck2 className="w-4 h-4 text-[#4169E1]" />
                <span>Previewing Regenerated Offer Letter (v{nextVersion})</span>
              </div>
              <p className="text-xs text-[#303030]">
                Student: <strong>{student.fullName}</strong> · New Domain:{' '}
                <strong className="text-[#4169E1]">{student.domain}</strong>
              </p>
            </div>

            <div className="w-full sm:w-64">
              <label
                htmlFor="regen-issue-date"
                className="block text-[11px] font-bold uppercase text-[#182747] mb-1"
              >
                Authorized Offer Letter Date
              </label>
              <input
                id="regen-issue-date"
                type="text"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                placeholder="e.g. November 15, 2026"
                className="w-full px-3 py-1.5 bg-white border-2 border-[#303030] text-sm text-[#182747] font-mono-data"
              />
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto border-2 border-[#303030] p-2 bg-[#E7DEC2]">
            <OfferLetterPreview student={student} offerLetter={previewRecord} />
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <RetroButton type="button" variant="neutral" onClick={onCancel}>
              Cancel
            </RetroButton>
            <RetroButton
              type="button"
              variant="success"
              onClick={() => onFinalize(issueDate.trim() || defaultDate)}
            >
              <Check className="w-4 h-4" />
              <span>Finalize &amp; Issue Offer Letter (v{nextVersion})</span>
            </RetroButton>
          </div>
        </div>
      </RetroWindow>
    </div>
  );
};
