import React from 'react';
import { LORRecord } from '../types';
import { Logo } from './Logo';

interface LORPreviewProps {
  lor: LORRecord;
  college?: string;
}

export const LORPreview: React.FC<LORPreviewProps> = ({ lor, college }) => {
  return (
    <div className="print-only-container bg-white text-[#1a1f2c] border-2 border-[#082A4D] p-6 sm:p-10 md:p-12 max-w-[820px] mx-auto shadow-sm font-formal">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-[#082A4D]">
        <Logo size="md" theme="light" />
        <div className="text-xs text-[#4a5568] sm:text-right leading-relaxed">
          <p className="font-bold text-[#082A4D]">Skillora Technologies &amp; Career Academy</p>
          <p>Phone: 6394050860</p>
          <p>Email: adityajain22112006@gmail.com</p>
        </div>
      </div>

      <div className="text-center my-7">
        <h2 className="text-lg sm:text-xl font-extrabold tracking-widest text-[#082A4D] uppercase underline decoration-[#57B8B2] decoration-2 underline-offset-8">
          LETTER OF RECOMMENDATION
        </h2>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-semibold text-[#082A4D] mb-6 font-mono-data">
        <span>LOR Ref: {lor.lorId}</span>
        <span>Date: {lor.completionDate}</span>
      </div>

      <p className="text-sm font-bold text-[#082A4D] tracking-wide mb-5">
        TO WHOMSOEVER IT MAY CONCERN
      </p>

      <div className="space-y-4 text-sm text-[#2d3748] leading-relaxed">
        <p>
          It is with great pleasure that we recommend{' '}
          <strong className="text-[#082A4D]">{lor.studentName}</strong> (Student ID:{' '}
          <span className="font-mono-data">{lor.studentId}</span>)
          {college ? ` of ${college}` : ''}, who successfully completed an intensive virtual
          internship in <strong className="text-[#082A4D]">{lor.domain}</strong> with Skillora,
          concluding on <strong>{lor.completionDate}</strong>.
        </p>
        <p>
          Throughout the internship program, {lor.studentName} demonstrated strong technical
          aptitude, intellectual curiosity, and disciplined execution across all assigned domain
          tasks and the final capstone project. Every deliverable submitted met our engineering and
          quality benchmarks with thorough documentation.
        </p>
        <p>
          {lor.studentName} exhibited an impressive ability to translate conceptual knowledge into
          practical, real-world project outcomes while adhering strictly to milestone timelines and
          mentor feedback.
        </p>
        <p>
          Based on their consistent dedication, problem-solving mindset, and verified project
          performance, we wholeheartedly recommend {lor.studentName} for future academic pursuits,
          industry roles, and professional opportunities. We wish them continued success.
        </p>
      </div>

      <div className="mt-10 pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-bold text-[#082A4D] mb-4">Warm Regards,</p>
          <p className="font-certificate-serif italic text-2xl text-[#082A4D]">A. Jain</p>
          <div className="w-56 border-t border-[#082A4D] mt-1 pt-1.5">
            <p className="text-sm font-bold text-[#57B8B2]">Aditya Jain</p>
            <p className="text-xs font-bold text-[#082A4D]">Chief Executive Officer</p>
            <p className="text-xs font-bold text-[#082A4D]">Skillora</p>
          </div>
        </div>

        <div className="w-24 h-24 rounded-full border-2 border-[#57B8B2] flex items-center justify-center p-1 shrink-0">
          <div className="w-full h-full rounded-full border border-[#082A4D] flex flex-col items-center justify-center text-center">
            <span className="text-[9px] font-extrabold tracking-widest text-[#082A4D]">
              SKILLORA
            </span>
            <span className="text-[8px] font-bold tracking-wider text-[#57B8B2] mt-0.5">
              ENDORSED
            </span>
            <span className="text-[7px] font-mono-data text-[#4a5568] mt-0.5">LOR SEAL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
