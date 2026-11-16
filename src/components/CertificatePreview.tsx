import React from 'react';
import { CertificateRecord } from '../types';
import { Logo } from './Logo';

interface CertificatePreviewProps {
  certificate: CertificateRecord;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({ certificate }) => {
  return (
    <div className="print-only-container bg-[#FFFDF8] text-[#082A4D] border-4 border-[#082A4D] p-3 sm:p-5 max-w-[900px] mx-auto shadow-sm">
      <div className="border-2 border-[#57B8B2] p-5 sm:p-10 text-center">
        <div className="flex justify-center mb-4">
          <Logo size="lg" theme="light" />
        </div>

        <p className="text-[11px] font-bold tracking-[0.25em] text-[#57B8B2] uppercase">
          Official Internship Credential
        </p>

        <h2 className="font-certificate-serif text-2xl sm:text-4xl font-bold text-[#082A4D] mt-2 tracking-wide">
          CERTIFICATE OF COMPLETION
        </h2>

        <div className="w-36 h-0.5 bg-[#57B8B2] mx-auto my-4" />

        <p className="text-sm sm:text-base text-[#4a5568]">
          This is to proudly certify that
        </p>

        <p className="font-certificate-serif text-2xl sm:text-4xl font-bold text-[#082A4D] mt-3 pb-2 border-b border-[#082A4D]/40 inline-block px-8">
          {certificate.studentName}
        </p>

        <p className="text-xs sm:text-sm text-[#374151] max-w-2xl mx-auto mt-5 leading-relaxed">
          bearing Student ID <strong className="font-mono-data">{certificate.studentId}</strong>,
          has successfully completed the structured virtual internship program and final capstone
          project requirements in the domain of
        </p>

        <p className="text-lg sm:text-2xl font-extrabold text-[#57B8B2] tracking-wide uppercase mt-3">
          {certificate.domain}
        </p>

        <p className="text-xs sm:text-sm text-[#4a5568] max-w-xl mx-auto mt-3 leading-relaxed">
          demonstrating dedication, analytical skill, and professional execution as evaluated by
          the Skillora Review Board.
        </p>

        <div className="mt-10 pt-6 border-t border-[#082A4D]/15 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-left sm:text-center">
          <div className="sm:text-left">
            <p className="text-[11px] uppercase tracking-wider text-[#64748b] font-semibold">
              Completion Date
            </p>
            <p className="text-sm font-bold text-[#082A4D] mt-0.5">
              {certificate.completionDate}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-[#64748b] font-semibold mt-3">
              Certificate ID
            </p>
            <p className="font-mono-data text-xs font-bold text-[#082A4D] mt-0.5">
              {certificate.certificateId}
            </p>
          </div>

          <div className="flex justify-start sm:justify-center">
            <div className="w-24 h-24 rounded-full border-2 border-[#57B8B2] flex items-center justify-center p-1">
              <div className="w-full h-full rounded-full border border-[#082A4D] flex flex-col items-center justify-center text-center">
                <span className="text-[9px] font-extrabold tracking-widest text-[#082A4D]">
                  SKILLORA
                </span>
                <span className="text-[8px] font-bold text-[#57B8B2] mt-0.5">VERIFIED</span>
                <span className="text-[7px] font-mono-data text-[#4a5568] mt-0.5">CREDENTIAL</span>
              </div>
            </div>
          </div>

          <div className="sm:text-right">
            <p className="font-certificate-serif italic text-2xl text-[#082A4D]">A. Jain</p>
            <div className="border-t border-[#082A4D] mt-1 pt-1 inline-block min-w-[170px]">
              <p className="text-xs font-bold text-[#57B8B2]">Aditya Jain</p>
              <p className="text-[11px] font-bold text-[#082A4D]">
                Chief Executive Officer, Skillora
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
