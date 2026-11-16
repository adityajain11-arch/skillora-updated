import React, { useState } from 'react';
import { Award, Download, Lock, Printer, ScrollText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { RetroWindow } from '../../components/RetroWindow';
import { RetroButton } from '../../components/RetroButton';
import { StatusBadge } from '../../components/StatusBadge';
import { CertificatePreview } from '../../components/CertificatePreview';
import { LORPreview } from '../../components/LORPreview';
import { downloadCertificatePdf, downloadLORPdf } from '../../services/pdfService';

export const Certificate: React.FC = () => {
  const { session } = useAuth();
  const { state } = useApp();
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [downloadingLor, setDownloadingLor] = useState(false);

  const student = state.students.find((s) => s.id === session.studentId);
  if (!student) return null;

  const projectSub = state.projectSubmissions.find((p) => p.studentId === student.id);
  const certificate = state.certificates.find((c) => c.studentId === student.id);
  const lor = state.lors.find((l) => l.studentId === student.id);

  const handleDownloadCert = async () => {
    if (!certificate) return;
    setDownloadingCert(true);
    try {
      await downloadCertificatePdf(certificate);
    } finally {
      setDownloadingCert(false);
    }
  };

  const handleDownloadLor = async () => {
    if (!lor) return;
    setDownloadingLor(true);
    try {
      await downloadLORPdf(lor, student.college);
    } finally {
      setDownloadingLor(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Credential Status Summary */}
      <RetroWindow title="ACHIEVEMENT_UNLOCKED.EXE" headerColor="navy" className="no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-5 border-b-2 border-dotted border-[#303030]/40">
          <div>
            <span className="text-[11px] font-bold uppercase text-[#303030]">Student Name</span>
            <p className="text-sm font-bold text-[#182747] mt-0.5">{student.fullName}</p>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-[#303030]">Student ID</span>
            <p className="font-mono-data text-sm font-bold text-[#182747] mt-0.5">{student.id}</p>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-[#303030]">
              Internship Domain
            </span>
            <p className="text-sm font-bold text-[#4169E1] mt-0.5">{student.domain}</p>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-[#303030]">
              Completion Status
            </span>
            <div className="mt-1">
              <StatusBadge status={student.internshipStatus} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div className="p-3 bg-[#F4EBD0] border-2 border-[#303030] flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#182747]">Project Approval</span>
            <StatusBadge status={projectSub?.status || 'NOT SUBMITTED'} />
          </div>
          <div className="p-3 bg-[#F4EBD0] border-2 border-[#303030] flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#182747]">Certificate Status</span>
            <StatusBadge status={certificate ? 'ISSUED' : 'PENDING'} />
          </div>
          <div className="p-3 bg-[#F4EBD0] border-2 border-[#303030] flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#182747]">LOR Status</span>
            <StatusBadge status={lor ? 'ISSUED' : 'PENDING'} />
          </div>
        </div>
      </RetroWindow>

      {/* Locked State */}
      {!certificate && !lor && (
        <RetroWindow title="ACHIEVEMENT_LOCKED.EXE" headerColor="blue">
          <div className="py-8 px-4 text-center max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto bg-[#F4C542] border-2 border-[#303030] retro-shadow-sm flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#182747]" />
            </div>
            <h2 className="font-pixel text-xs sm:text-sm text-[#182747] leading-relaxed">
              YOUR ACHIEVEMENT IS WAITING!
            </h2>
            <p className="text-sm text-[#303030] leading-relaxed">
              Complete your internship tasks and submit your project. Your certificate will become
              available after successful project review and admin approval.
            </p>
          </div>
        </RetroWindow>
      )}

      {/* Certificate Section */}
      {certificate && (
        <div className="space-y-4">
          <RetroWindow
            title={`CERTIFICATE_${certificate.certificateId}.PDF`}
            headerColor="green"
            className="no-print"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-[#4E8B62] shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-[#182747]">
                    Official Certificate of Completion Issued
                  </h3>
                  <p className="font-mono-data text-xs text-[#303030] mt-0.5">
                    Certificate ID: {certificate.certificateId} · Completed:{' '}
                    {certificate.completionDate}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <RetroButton
                  variant="primary"
                  onClick={handleDownloadCert}
                  disabled={downloadingCert}
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingCert ? 'GENERATING...' : 'DOWNLOAD CERTIFICATE PDF'}</span>
                </RetroButton>
                <RetroButton variant="neutral" onClick={() => window.print()}>
                  <Printer className="w-4 h-4" />
                  <span>PRINT</span>
                </RetroButton>
              </div>
            </div>
          </RetroWindow>

          <CertificatePreview certificate={certificate} />
        </div>
      )}

      {/* LOR Section */}
      {lor && (
        <div className="space-y-4">
          <RetroWindow
            title={`LOR_${lor.lorId}.PDF`}
            headerColor="blue"
            className="no-print"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ScrollText className="w-6 h-6 text-[#4169E1] shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-[#182747]">
                    Official Letter of Recommendation Issued
                  </h3>
                  <p className="font-mono-data text-xs text-[#303030] mt-0.5">
                    LOR Reference: {lor.lorId} · Date: {lor.completionDate}
                  </p>
                </div>
              </div>
              <RetroButton
                variant="success"
                onClick={handleDownloadLor}
                disabled={downloadingLor}
              >
                <Download className="w-4 h-4" />
                <span>{downloadingLor ? 'GENERATING...' : 'DOWNLOAD LOR PDF'}</span>
              </RetroButton>
            </div>
          </RetroWindow>

          <LORPreview lor={lor} college={student.college} />
        </div>
      )}
    </div>
  );
};
