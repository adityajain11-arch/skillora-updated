import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { OfferLetterRecord, Student } from '../types';
import { Logo } from './Logo';

interface OfferLetterPreviewProps {
  student: Student;
  offerLetter?: OfferLetterRecord;
}

export const OfferLetterPreview: React.FC<OfferLetterPreviewProps> = ({
  student,
  offerLetter,
}) => {
  const displayName = offerLetter?.studentName || student.fullName;
  const displayDomain = offerLetter?.domain || student.domain;
  const displayDate = offerLetter?.issueDate || student.offerLetterDate;
  const firstName = displayName.trim().split(/\s+/)[0] || displayName;

  return (
    <div className="print-only-container bg-[#082A4D] p-3 sm:p-5 max-w-[820px] mx-auto shadow-md font-formal">
      <div className="relative bg-white rounded-3xl overflow-hidden text-[#1a2b3c]">
        {/* Main Sheet Content */}
        <div className="relative z-10 px-6 sm:px-12 pt-8 pb-10">
          {/* Top Centered Attached Skillora Logo */}
          <div className="flex flex-col items-center text-center">
            <Logo size="lg" theme="light" className="h-16 sm:h-20" />
            <p className="mt-3 text-xs sm:text-sm font-bold tracking-[0.22em] text-[#57B8B2] uppercase">
              YOUR NEXT CHAPTER STARTS HERE
            </p>
            <h2 className="mt-4 text-xl sm:text-2xl font-extrabold tracking-[0.14em] text-[#57B8B2] uppercase underline decoration-[#57B8B2] decoration-2 underline-offset-8">
              INTERNSHIP OFFER LETTER
            </h2>
          </div>

          {/* Horizontal Divider with Center Accent */}
          <div className="relative my-7 flex items-center justify-center">
            <div className="w-full h-px bg-[#cbd5e1]" />
            <div className="absolute w-28 h-1 bg-[#57B8B2] rounded-full" />
          </div>

          {/* Recipient & Issue Date Highlight Card */}
          <div className="bg-[#EEF4FB] rounded-xl px-5 sm:px-7 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <p className="text-[11px] font-bold tracking-[0.15em] text-[#57B8B2] uppercase">
                RECIPIENT
              </p>
              <p className="text-base sm:text-lg font-extrabold text-[#082A4D] uppercase tracking-wide mt-0.5">
                {displayName}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-[11px] font-bold tracking-[0.15em] text-[#57B8B2] uppercase">
                ISSUE DATE
              </p>
              <p className="text-base sm:text-lg font-extrabold text-[#082A4D] uppercase tracking-wide mt-0.5">
                {displayDate}
              </p>
            </div>
          </div>

          {/* Salutation & Body Copy (Preserving exact template wording) */}
          <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-[#1e293b]">
            <p className="font-semibold">
              <span className="text-[#082A4D]">Dear </span>
              <span className="text-[#57B8B2] font-bold">{firstName},</span>
            </p>

            <p>
              Congratulations! We are pleased to offer you a place in the{' '}
              <strong className="text-[#082A4D]">{displayDomain}</strong> Internship Program at
              Skillora.
            </p>

            <p>
              This internship is designed to help you strengthen your technical knowledge, gain
              practical experience, and build skills for your future career. You will have the
              opportunity to learn by doing, stay curious, and work toward meaningful professional
              growth.
            </p>

            <p>
              We are excited to welcome you to Skillora and hope this experience becomes a valuable
              step in your journey.
            </p>

            <p className="font-bold text-[#57B8B2] text-base">Welcome to Skillora.</p>

            <p className="pt-1 text-[#082A4D] font-medium">Warm regards,</p>
          </div>

          {/* Signature & Contact Block */}
          <div className="mt-7 relative z-10">
            {/* Signature Flourish */}
            <div className="mb-1">
              <span className="font-certificate-serif italic text-3xl text-[#1f2937] tracking-tight select-none">
                A. Jain
              </span>
            </div>
            <p className="text-base font-extrabold text-[#57B8B2]">Aditya Jain</p>
            <p className="text-sm font-bold text-[#082A4D]">Chief Executive Officer</p>
            <p className="text-sm font-bold text-[#082A4D]">Skillora</p>

            <div className="mt-5 space-y-2 text-xs sm:text-sm text-[#082A4D] font-medium">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#082A4D] text-white flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </span>
                <span className="font-mono-data">Phone: 6394050860</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#082A4D] text-white flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                <span>Email: adityajain22112006@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Bottom-right subtle decorative Skillora stair watermark */}
          <svg
            aria-hidden="true"
            viewBox="0 0 220 200"
            className="pointer-events-none absolute right-2 bottom-2 w-44 sm:w-56 opacity-15"
            fill="none"
          >
            <rect x="20" y="160" width="90" height="26" fill="#7D9CC7" />
            <rect x="52" y="128" width="76" height="24" fill="#7D9CC7" />
            <rect x="85" y="98" width="58" height="22" fill="#7D9CC7" />
            <rect x="118" y="70" width="34" height="20" fill="#7D9CC7" />
            <path
              d="M92 186C136 168 184 148 184 114C184 82 140 76 140 50C140 28 164 16 196 10C172 22 156 36 158 54C160 72 206 84 206 118C206 154 156 176 122 186H92Z"
              fill="#57B8B2"
            />
          </svg>
        </div>

        {/* Bottom Dark Navy Association Footer */}
        <div className="bg-[#082A4D] text-white text-center px-4 py-3.5 text-xs sm:text-sm font-medium tracking-wide">
          Issued by Skillora in association with Pashupati Electrical and Craft &amp; Curve
        </div>
      </div>
    </div>
  );
};
