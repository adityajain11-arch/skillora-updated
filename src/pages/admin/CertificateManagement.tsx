import React, { useState } from 'react';
import { Award, Download, Eye, ScrollText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RetroWindow } from '../../components/RetroWindow';
import { RetroButton } from '../../components/RetroButton';
import { StatusBadge } from '../../components/StatusBadge';
import { CertificatePreview } from '../../components/CertificatePreview';
import { LORPreview } from '../../components/LORPreview';
import { AdminStudentProfileModal } from '../../components/AdminStudentProfileModal';
import { NotificationDialog } from '../../components/NotificationDialog';
import { downloadCertificatePdf, downloadLORPdf } from '../../services/pdfService';

export const CertificateManagement: React.FC = () => {
  const { state, issueCertificate, issueLOR } = useApp();

  const [filterMode, setFilterMode] = useState<'ALL' | 'ELIGIBLE'>('ALL');
  const [previewCertStudentId, setPreviewCertStudentId] = useState<string | null>(null);
  const [previewLorStudentId, setPreviewLorStudentId] = useState<string | null>(null);
  const [profileStudentId, setProfileStudentId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const rows = state.students
    .map((student) => {
      const projectSub = state.projectSubmissions.find((p) => p.studentId === student.id);
      const certificate = state.certificates.find((c) => c.studentId === student.id);
      const lor = state.lors.find((l) => l.studentId === student.id);
      const eligible = projectSub?.status === 'APPROVED';
      return { student, projectSub, certificate, lor, eligible };
    })
    .filter((r) => filterMode === 'ALL' || r.eligible);

  const previewCert = state.certificates.find(
    (c) => c.studentId === previewCertStudentId
  );
  const previewLor = state.lors.find((l) => l.studentId === previewLorStudentId);
  const previewLorStudent = state.students.find((s) => s.id === previewLorStudentId);

  return (
    <div className="space-y-6">
      <RetroWindow title="CERTIFICATE_ISSUANCE.EXE" headerColor="navy">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-dotted border-[#303030]/40">
          <div>
            <h1 className="font-pixel text-xs sm:text-sm text-[#182747]">
              CERTIFICATE &amp; LOR ISSUANCE DESK
            </h1>
            <p className="text-sm text-[#303030] mt-1">
              Eligibility Rule: Only students whose required project work is{' '}
              <strong>APPROVED</strong> can be issued an official Certificate and LOR.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <RetroButton
              size="sm"
              variant={filterMode === 'ALL' ? 'primary' : 'neutral'}
              onClick={() => setFilterMode('ALL')}
            >
              All Interns ({state.students.length})
            </RetroButton>
            <RetroButton
              size="sm"
              variant={filterMode === 'ELIGIBLE' ? 'success' : 'neutral'}
              onClick={() => setFilterMode('ELIGIBLE')}
            >
              Eligible Only
            </RetroButton>
          </div>
        </div>

        <div className="overflow-x-auto mt-4 border-2 border-[#303030] bg-white">
          <table className="w-full text-left border-collapse min-w-[980px]">
            <thead>
              <tr className="bg-[#182747] text-[#FFF8E7] font-mono-data text-xs uppercase">
                <th className="p-3 border-b-2 border-r border-[#303030]">Student ID</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Student Name</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Internship Domain</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Project Status</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Completion</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Certificate</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">LOR</th>
                <th className="p-3 border-b-2 border-[#303030]">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm divide-y divide-[#303030]/30">
              {rows.map(({ student, projectSub, certificate, lor, eligible }) => (
                <tr key={student.id} className="hover:bg-[#F4EBD0]/50">
                  <td className="p-3 border-r border-[#303030]/20 font-mono-data font-bold text-[#182747] whitespace-nowrap">
                    {student.id}
                  </td>
                  <td className="p-3 border-r border-[#303030]/20 font-bold text-[#182747] whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setProfileStudentId(student.id)}
                      className="text-left hover:text-[#4169E1] hover:underline cursor-pointer"
                    >
                      {student.fullName}
                    </button>
                  </td>
                  <td className="p-3 border-r border-[#303030]/20 font-semibold text-[#4169E1] whitespace-nowrap">
                    {student.domain}
                  </td>
                  <td className="p-3 border-r border-[#303030]/20 whitespace-nowrap">
                    <StatusBadge status={projectSub?.status || 'NOT SUBMITTED'} />
                  </td>
                  <td className="p-3 border-r border-[#303030]/20 whitespace-nowrap">
                    <StatusBadge status={student.internshipStatus} />
                  </td>
                  <td className="p-3 border-r border-[#303030]/20 whitespace-nowrap">
                    <StatusBadge
                      status={certificate ? 'ISSUED' : eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                    />
                  </td>
                  <td className="p-3 border-r border-[#303030]/20 whitespace-nowrap">
                    <StatusBadge
                      status={lor ? 'ISSUED' : eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                    />
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {!certificate ? (
                        <RetroButton
                          size="sm"
                          variant="success"
                          disabled={!eligible}
                          onClick={() => {
                            const issued = issueCertificate(student.id);
                            if (issued) {
                              setToastMsg(
                                `Certificate ${issued.certificateId} issued for ${student.fullName}!`
                              );
                            }
                          }}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Issue Cert</span>
                        </RetroButton>
                      ) : (
                        <>
                          <RetroButton
                            size="sm"
                            variant="neutral"
                            onClick={() => setPreviewCertStudentId(student.id)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Cert</span>
                          </RetroButton>
                          <RetroButton
                            size="sm"
                            variant="primary"
                            onClick={() => downloadCertificatePdf(certificate)}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </RetroButton>
                        </>
                      )}

                      {!lor ? (
                        <RetroButton
                          size="sm"
                          variant="primary"
                          disabled={!eligible}
                          onClick={() => {
                            const issued = issueLOR(student.id);
                            if (issued) {
                              setToastMsg(
                                `LOR ${issued.lorId} issued for ${student.fullName}!`
                              );
                            }
                          }}
                        >
                          <ScrollText className="w-3.5 h-3.5" />
                          <span>Issue LOR</span>
                        </RetroButton>
                      ) : (
                        <>
                          <RetroButton
                            size="sm"
                            variant="neutral"
                            onClick={() => setPreviewLorStudentId(student.id)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>LOR</span>
                          </RetroButton>
                          <RetroButton
                            size="sm"
                            variant="success"
                            onClick={() => downloadLORPdf(lor, student.college)}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </RetroButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </RetroWindow>

      {/* Preview Certificate Modal */}
      {previewCert && (
        <div
          className="fixed inset-0 z-50 bg-[#182747]/75 flex items-start justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <RetroWindow
            title={`PREVIEW_${previewCert.certificateId}.PDF`}
            headerColor="green"
            onClose={() => setPreviewCertStudentId(null)}
            className="w-full max-w-5xl my-6"
          >
            <div className="flex justify-end mb-4">
              <RetroButton
                size="sm"
                variant="primary"
                onClick={() => downloadCertificatePdf(previewCert)}
              >
                <Download className="w-4 h-4" />
                <span>Download Certificate PDF</span>
              </RetroButton>
            </div>
            <CertificatePreview certificate={previewCert} />
          </RetroWindow>
        </div>
      )}

      {/* Preview LOR Modal */}
      {previewLor && (
        <div
          className="fixed inset-0 z-50 bg-[#182747]/75 flex items-start justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <RetroWindow
            title={`PREVIEW_${previewLor.lorId}.PDF`}
            headerColor="blue"
            onClose={() => setPreviewLorStudentId(null)}
            className="w-full max-w-4xl my-6"
          >
            <div className="flex justify-end mb-4">
              <RetroButton
                size="sm"
                variant="success"
                onClick={() => downloadLORPdf(previewLor, previewLorStudent?.college)}
              >
                <Download className="w-4 h-4" />
                <span>Download LOR PDF</span>
              </RetroButton>
            </div>
            <LORPreview lor={previewLor} college={previewLorStudent?.college} />
          </RetroWindow>
        </div>
      )}

      <AdminStudentProfileModal
        studentId={profileStudentId}
        onClose={() => setProfileStudentId(null)}
      />

      <NotificationDialog
        open={Boolean(toastMsg)}
        title="CREDENTIAL_ISSUED.EXE"
        message={toastMsg || ''}
        type="success"
        confirmLabel="OK"
        onConfirm={() => setToastMsg(null)}
      />
    </div>
  );
};
