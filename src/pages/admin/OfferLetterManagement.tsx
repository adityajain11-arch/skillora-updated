import React, { useMemo, useState } from 'react';
import { AlertTriangle, Download, Eye, RefreshCw, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INTERNSHIP_DOMAINS, OfferLetterRecord, Student } from '../../types';
import { RetroWindow } from '../../components/RetroWindow';
import { RetroButton } from '../../components/RetroButton';
import { StatusBadge } from '../../components/StatusBadge';
import { OfferLetterPreview } from '../../components/OfferLetterPreview';
import { RegenerateOfferModal } from '../../components/RegenerateOfferModal';
import { NotificationDialog } from '../../components/NotificationDialog';
import { downloadOfferLetterPdf } from '../../services/pdfService';

export const OfferLetterManagement: React.FC = () => {
  const {
    state,
    getOfferLettersForStudent,
    getActiveOfferLetterForStudent,
    regenerateOfferLetter,
  } = useApp();

  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [previewTarget, setPreviewTarget] = useState<{
    student: Student;
    offer?: OfferLetterRecord;
  } | null>(null);
  const [regenStudent, setRegenStudent] = useState<Student | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.students.filter((s) => {
      const matchesQ =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.offerLetterNumber.toLowerCase().includes(q);
      const matchesDomain = domainFilter === 'ALL' || s.domain === domainFilter;
      return matchesQ && matchesDomain;
    });
  }, [state.students, search, domainFilter]);

  return (
    <div className="space-y-6">
      <RetroWindow title="OFFER_LETTER_MANAGER.EXE" headerColor="navy">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2 border-dotted border-[#303030]/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#182747] mb-1">
                Search Student / Offer Ref
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#303030] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name, Student ID, or OL-SKL-..."
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#303030] text-sm text-[#182747]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#182747] mb-1">
                Internship Domain
              </label>
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#303030] text-sm text-[#182747]"
              >
                <option value="ALL">All Domains</option>
                {INTERNSHIP_DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="font-mono-data text-xs font-bold bg-[#F4EBD0] border-2 border-[#303030] px-3 py-2 shrink-0">
            GENERATED: {state.offerLetters.length} TOTAL VERSIONS
          </div>
        </div>

        <div className="overflow-x-auto mt-4 border-2 border-[#303030] bg-white">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="bg-[#182747] text-[#FFF8E7] font-mono-data text-xs uppercase">
                <th className="p-3 border-b-2 border-r border-[#303030]">Active Ref</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Student</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Current Domain</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Letter Domain</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Issue Date</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Status</th>
                <th className="p-3 border-b-2 border-[#303030]">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm divide-y divide-[#303030]/30">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#303030]">
                    No offer letters match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const active = getActiveOfferLetterForStudent(s.id);
                  const versions = getOfferLettersForStudent(s.id);
                  const mismatch = Boolean(active && active.domain !== s.domain);

                  return (
                    <tr key={s.id} className="hover:bg-[#F4EBD0]/50">
                      <td className="p-3 border-r border-[#303030]/20 font-mono-data font-bold text-[#182747] whitespace-nowrap">
                        {s.offerLetterNumber}
                        <span className="block text-[10px] text-[#4169E1]">
                          v{active?.version || 1} ({versions.length} total)
                        </span>
                      </td>
                      <td className="p-3 border-r border-[#303030]/20 whitespace-nowrap">
                        <div className="font-bold text-[#182747]">{s.fullName}</div>
                        <div className="font-mono-data text-[11px] text-[#303030]">{s.id}</div>
                      </td>
                      <td className="p-3 border-r border-[#303030]/20 font-semibold text-[#4169E1] whitespace-nowrap">
                        {s.domain}
                      </td>
                      <td className="p-3 border-r border-[#303030]/20 whitespace-nowrap">
                        <span className="font-semibold text-[#182747]">
                          {active?.domain || s.domain}
                        </span>
                        {mismatch && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[#b68911]">
                            <AlertTriangle className="w-3 h-3" />
                            Needs Regeneration
                          </span>
                        )}
                      </td>
                      <td className="p-3 border-r border-[#303030]/20 font-mono-data text-[#303030] whitespace-nowrap">
                        {active?.issueDate || s.offerLetterDate}
                      </td>
                      <td className="p-3 border-r border-[#303030]/20 whitespace-nowrap">
                        <StatusBadge status={s.offerLetterStatus} />
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <RetroButton
                            size="sm"
                            variant="primary"
                            onClick={() => setPreviewTarget({ student: s, offer: active })}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </RetroButton>
                          <RetroButton
                            size="sm"
                            variant="success"
                            onClick={() => downloadOfferLetterPdf(s, active)}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </RetroButton>
                          <RetroButton
                            size="sm"
                            variant="warning"
                            onClick={() => setRegenStudent(s)}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Regenerate</span>
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
      </RetroWindow>

      {previewTarget && (
        <div
          className="fixed inset-0 z-50 bg-[#182747]/75 flex items-start justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <RetroWindow
            title={`OFFER_PREVIEW_${previewTarget.offer?.offerLetterNumber || previewTarget.student.offerLetterNumber}.PDF`}
            headerColor="blue"
            onClose={() => setPreviewTarget(null)}
            className="w-full max-w-4xl my-6"
          >
            <div className="flex justify-end mb-4">
              <RetroButton
                size="sm"
                variant="success"
                onClick={() =>
                  downloadOfferLetterPdf(previewTarget.student, previewTarget.offer)
                }
              >
                <Download className="w-4 h-4" />
                <span>Download Official PDF</span>
              </RetroButton>
            </div>
            <OfferLetterPreview
              student={previewTarget.student}
              offerLetter={previewTarget.offer}
            />
          </RetroWindow>
        </div>
      )}

      <RegenerateOfferModal
        open={Boolean(regenStudent)}
        student={regenStudent}
        nextVersion={
          regenStudent
            ? (getOfferLettersForStudent(regenStudent.id)[0]?.version || 1) + 1
            : 2
        }
        onFinalize={(date) => {
          if (!regenStudent) return;
          const rec = regenerateOfferLetter(regenStudent.id, date);
          setRegenStudent(null);
          if (rec) {
            setToastMsg(
              `Regenerated Offer Letter v${rec.version} (${rec.domain}) for ${regenStudent.fullName}.`
            );
          }
        }}
        onCancel={() => setRegenStudent(null)}
      />

      <NotificationDialog
        open={Boolean(toastMsg)}
        title="OFFER_LETTER_ISSUED.EXE"
        message={toastMsg || ''}
        type="success"
        confirmLabel="OK"
        onConfirm={() => setToastMsg(null)}
      />
    </div>
  );
};
