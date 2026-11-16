import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Download, Eye, History, Printer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { RetroWindow } from '../../components/RetroWindow';
import { RetroButton } from '../../components/RetroButton';
import { StatusBadge } from '../../components/StatusBadge';
import { OfferLetterPreview } from '../../components/OfferLetterPreview';
import { downloadOfferLetterPdf } from '../../services/pdfService';

export const OfferLetter: React.FC = () => {
  const { session } = useAuth();
  const { state, getOfferLettersForStudent } = useApp();
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const student = state.students.find((s) => s.id === session.studentId);
  const offerVersions = student ? getOfferLettersForStudent(student.id) : [];
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  if (!student) return null;

  const selectedOffer =
    offerVersions.find((ol) => ol.id === selectedOfferId) ||
    offerVersions.find((ol) => ol.isCurrent) ||
    offerVersions[0];

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await downloadOfferLetterPdf(student, selectedOffer);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    setShowPreview(true);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-6">
      <RetroWindow
        title="OFFER_LETTER_TERMINAL.EXE"
        headerColor="navy"
        className="no-print"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-pixel text-xs sm:text-sm text-[#182747]">
              OFFICIAL INTERNSHIP OFFER LETTER
            </h1>
            <p className="text-sm text-[#303030] mt-2">
              Issued to <strong className="text-[#182747]">{student.fullName}</strong> ·{' '}
              <strong className="text-[#4169E1]">
                {selectedOffer?.domain || student.domain}
              </strong>{' '}
              · <span className="font-mono-data">{selectedOffer?.issueDate || student.offerLetterDate}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <RetroButton
              type="button"
              variant="neutral"
              onClick={() => setShowPreview((p) => !p)}
            >
              <Eye className="w-4 h-4" />
              <span>{showPreview ? 'HIDE PREVIEW' : 'VIEW OFFER LETTER'}</span>
            </RetroButton>

            <RetroButton
              type="button"
              variant="primary"
              onClick={handleDownloadPdf}
              disabled={downloading}
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'GENERATING PDF...' : 'DOWNLOAD PDF'}</span>
            </RetroButton>

            <RetroButton type="button" variant="warning" onClick={handlePrint}>
              <Printer className="w-4 h-4" />
              <span>PRINT OFFER LETTER</span>
            </RetroButton>

            <RetroButton
              type="button"
              variant="success"
              onClick={() => navigate('/student/dashboard')}
            >
              <span>CONTINUE TO DASHBOARD</span>
              <ArrowRight className="w-4 h-4" />
            </RetroButton>
          </div>
        </div>

        {offerVersions.length > 1 && (
          <div className="mt-4 pt-4 border-t-2 border-dotted border-[#303030]/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#182747]">
              <History className="w-4 h-4 text-[#4169E1]" />
              <span>Offer Letter Version History ({offerVersions.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {offerVersions.map((ol) => (
                <button
                  key={ol.id}
                  type="button"
                  onClick={() => setSelectedOfferId(ol.id)}
                  className={`px-3 py-2 border-2 border-[#303030] text-xs font-mono-data flex items-center gap-2 cursor-pointer ${
                    selectedOffer?.id === ol.id
                      ? 'bg-[#4169E1] text-[#FFF8E7]'
                      : 'bg-[#F4EBD0] text-[#182747] hover:bg-[#e5d9b8]'
                  }`}
                >
                  <span className="font-bold">
                    v{ol.version} · {ol.domain}
                  </span>
                  <StatusBadge status={ol.isCurrent ? 'ACTIVE' : 'PREVIOUS'} />
                </button>
              ))}
            </div>
          </div>
        )}
      </RetroWindow>

      {showPreview && (
        <div className="py-2">
          <OfferLetterPreview student={student} offerLetter={selectedOffer} />
        </div>
      )}
    </div>
  );
};
