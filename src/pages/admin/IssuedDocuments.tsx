import React, { useState } from 'react';
import { Award, Download, Eye, ScrollText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RetroWindow } from '../../components/RetroWindow';
import { RetroButton } from '../../components/RetroButton';
import { StatusBadge } from '../../components/StatusBadge';
import { CertificatePreview } from '../../components/CertificatePreview';
import { LORPreview } from '../../components/LORPreview';
import { downloadCertificatePdf, downloadLORPdf } from '../../services/pdfService';

export const IssuedDocuments: React.FC = () => {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<'certificates' | 'lors'>('certificates');
  const [previewCertId, setPreviewCertId] = useState<string | null>(null);
  const [previewLorId, setPreviewLorId] = useState<string | null>(null);

  const certificates = state.certificates;
  const lors = state.lors;

  const previewCert = certificates.find((c) => c.id === previewCertId);
  const previewLor = lors.find((l) => l.id === previewLorId);
  const previewLorStudent = state.students.find((s) => s.id === previewLor?.studentId);

  return (
    <div className="space-y-6">
      <RetroWindow title="ISSUED_DOCUMENTS_VAULT.EXE" headerColor="navy">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-dotted border-[#303030]/40">
          <div>
            <h1 className="font-pixel text-xs sm:text-sm text-[#182747]">
              ADMIN ISSUED DOCUMENTS VAULT
            </h1>
            <p className="text-sm text-[#303030] mt-1">
              View, inspect and download official certificates and LORs explicitly authorized and issued by administrators.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <RetroButton
              size="sm"
              variant={activeTab === 'certificates' ? 'primary' : 'neutral'}
              onClick={() => setActiveTab('certificates')}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Certificates Issued ({certificates.length})</span>
            </RetroButton>
            <RetroButton
              size="sm"
              variant={activeTab === 'lors' ? 'success' : 'neutral'}
              onClick={() => setActiveTab('lors')}
            >
              <ScrollText className="w-3.5 h-3.5" />
              <span>LORs Issued ({lors.length})</span>
            </RetroButton>
          </div>
        </div>

        {activeTab === 'certificates' ? (
          <div className="overflow-x-auto mt-4 border-2 border-[#303030] bg-white">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#182747] text-[#FFF8E7] font-mono-data text-xs uppercase">
                  <th className="p-3 border-b-2 border-r border-[#303030]">Certificate ID</th>
                  <th className="p-3 border-b-2 border-r border-[#303030]">Student Name</th>
                  <th className="p-3 border-b-2 border-r border-[#303030]">Domain</th>
                  <th className="p-3 border-b-2 border-r border-[#303030]">Completion Date</th>
                  <th className="p-3 border-b-2 border-r border-[#303030]">Status</th>
                  <th className="p-3 border-b-2 border-[#303030]">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm divide-y divide-[#303030]/30">
                {certificates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500 font-mono-data">
                      No certificates issued by admin yet.
                    </td>
                  </tr>
                ) : (
                  certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-[#F4EBD0]/50">
                      <td className="p-3 border-r border-[#303030]/20 font-mono-data font-bold text-[#182747] whitespace-nowrap">
                        {cert.certificateId}
                      </td>
                      <td className="p-3 border-r border-[#303030]/20 font-bold text-[#182747] whitespace-nowrap">
                        {cert.studentName}
                      </td>
                      <td className="p-3 border-r border-[#303030]/20 font-semibold text-[#4169E1] whitespace-nowrap">
                        {cert.domain}
                      </td>
                      <td className="p-3 border-r border-[#303030]/20 font-mono-data whitespace-nowrap">
                        {cert.completionDate}
                      </td>
                      <td className="p-3 border-r border-[#303030]/20 whitespace-nowrap">
                        <StatusBadge status="ISSUED" />
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <RetroButton
                            size="sm"
                            variant="neutral"
                            onClick={() => setPreviewCertId(cert.id)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </RetroButton>
                          <RetroButton
                            size="sm"
                            variant="primary"
                            onClick={() => downloadCertificatePdf(cert)}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </RetroButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto mt-4 border-2 border-[#303030] bg-white">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#182747] text-[#FFF8E7] font-mono-data text-xs uppercase">
                  <th className="p-3 border-b-2 border-r border-[#303030]">LOR Reference ID</th>
                  <th className="p-3 border-b-2 border-r border-[#303030]">Student Name</th>
                  <th className="p-3 border-b-2 border-r border-[#303030]">Domain</th>
                  <th className="p-3 border-b-2 border-r border-[#303030]">Completion Date</th>
                  <th className="p-3 border-b-2 border-r border-[#303030]">Status</th>
                  <th className="p-3 border-b-2 border-[#303030]">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm divide-y divide-[#303030]/30">
                {lors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500 font-mono-data">
                      No LORs issued by admin yet.
                    </td>
                  </tr>
                ) : (
                  lors.map((lor) => {
                    const stu = state.students.find((s) => s.id === lor.studentId);
                    return (
                      <tr key={lor.id} className="hover:bg-[#F4EBD0]/50">
                        <td className="p-3 border-r border-[#303030]/20 font-mono-data font-bold text-[#182747] whitespace-nowrap">
                          {lor.lorId}
                        </td>
                        <td className="p-3 border-r border-[#303030]/20 font-bold text-[#182747] whitespace-nowrap">
                          {lor.studentName}
                        </td>
                        <td className="p-3 border-r border-[#303030]/20 font-semibold text-[#4169E1] whitespace-nowrap">
                          {lor.domain}
                        </td>
                        <td className="p-3 border-r border-[#303030]/20 font-mono-data whitespace-nowrap">
                          {lor.completionDate}
                        </td>
                        <td className="p-3 border-r border-[#303030]/20 whitespace-nowrap">
                          <StatusBadge status="ISSUED" />
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <RetroButton
                              size="sm"
                              variant="neutral"
                              onClick={() => setPreviewLorId(lor.id)}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </RetroButton>
                            <RetroButton
                              size="sm"
                              variant="success"
                              onClick={() => downloadLORPdf(lor, stu?.college)}
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </RetroButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </RetroWindow>

      {/* Certificate Preview Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-[#182747]/75 flex items-start justify-center p-4 overflow-y-auto">
          <RetroWindow
            title={`CERTIFICATE_${previewCert.certificateId}.PDF`}
            headerColor="green"
            onClose={() => setPreviewCertId(null)}
            className="w-full max-w-5xl my-6"
          >
            <div className="flex justify-end mb-4">
              <RetroButton
                size="sm"
                variant="primary"
                onClick={() => downloadCertificatePdf(previewCert)}
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </RetroButton>
            </div>
            <CertificatePreview certificate={previewCert} />
          </RetroWindow>
        </div>
      )}

      {/* LOR Preview Modal */}
      {previewLor && (
        <div className="fixed inset-0 z-50 bg-[#182747]/75 flex items-start justify-center p-4 overflow-y-auto">
          <RetroWindow
            title={`LOR_${previewLor.lorId}.PDF`}
            headerColor="blue"
            onClose={() => setPreviewLorId(null)}
            className="w-full max-w-4xl my-6"
          >
            <div className="flex justify-end mb-4">
              <RetroButton
                size="sm"
                variant="success"
                onClick={() => downloadLORPdf(previewLor, previewLorStudent?.college)}
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </RetroButton>
            </div>
            <LORPreview lor={previewLor} college={previewLorStudent?.college} />
          </RetroWindow>
        </div>
      )}
    </div>
  );
};
