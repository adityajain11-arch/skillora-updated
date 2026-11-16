import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, FileText, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INTERNSHIP_DOMAINS, INTERNSHIP_STATUSES, InternshipStatus } from '../../types';
import { RetroWindow } from '../../components/RetroWindow';
import { RetroButton } from '../../components/RetroButton';
import { StatusBadge } from '../../components/StatusBadge';
import { AdminStudentProfileModal } from '../../components/AdminStudentProfileModal';
import { OfferLetterPreview } from '../../components/OfferLetterPreview';
import {
  InternshipConfirmDialog,
  PendingFieldChange,
} from '../../components/InternshipConfirmDialog';
import { formatShortDate } from '../../utils/idGenerators';

const PAGE_SIZE = 8;

export const StudentManagement: React.FC = () => {
  const { state, updateStudentStatus, getActiveOfferLetterForStudent } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);

  const [profileStudentId, setProfileStudentId] = useState<string | null>(null);
  const [offerModalStudentId, setOfferModalStudentId] = useState<string | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    studentId: string;
    studentName: string;
    previous: InternshipStatus;
    next: InternshipStatus;
  } | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return state.students.filter((s) => {
      const matchesQuery =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);
      const matchesDomain = domainFilter === 'ALL' || s.domain === domainFilter;
      const isoDay = s.registrationDate.slice(0, 10);
      const matchesDate = !dateFilter || isoDay === dateFilter;
      return matchesQuery && matchesDomain && matchesDate;
    });
  }, [state.students, searchQuery, domainFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const offerStudent = state.students.find((s) => s.id === offerModalStudentId) || null;
  const offerRecord = offerStudent ? getActiveOfferLetterForStudent(offerStudent.id) : undefined;

  const confirmChanges: PendingFieldChange[] = pendingStatusChange
    ? [
        {
          field: 'Internship Status',
          previousValue: pendingStatusChange.previous,
          newValue: pendingStatusChange.next,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <RetroWindow title="STUDENT_DATABASE.EXE" headerColor="navy">
        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pb-4 border-b-2 border-dotted border-[#303030]/40">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold uppercase text-[#182747] mb-1">
              Search by Name or Student ID
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#303030] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search student name or SKL-2026-..."
                className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#303030] text-sm text-[#182747] focus:outline-none focus:border-[#4169E1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#182747] mb-1">
              Filter by Domain
            </label>
            <select
              value={domainFilter}
              onChange={(e) => {
                setDomainFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-white border-2 border-[#303030] text-sm text-[#182747]"
            >
              <option value="ALL">All Internship Domains</option>
              {INTERNSHIP_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#182747] mb-1">
              Filter by Registration Date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-white border-2 border-[#303030] text-sm text-[#182747] font-mono-data"
            />
          </div>
        </div>

        {/* Spreadsheet Table */}
        <div className="overflow-x-auto mt-4 border-2 border-[#303030] bg-white">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="bg-[#182747] text-[#FFF8E7] font-mono-data text-xs uppercase">
                <th className="p-3 border-b-2 border-r border-[#303030]">Student ID</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Student Name</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Email Address</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Mobile Number</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">College Name</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Internship Domain</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Reg. Date</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Offer Letter</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Internship Status</th>
                <th className="p-3 border-b-2 border-[#303030]">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm divide-y divide-[#303030]/30">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-[#303030]">
                    No registered students match your current search or filter criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F4EBD0]/50">
                    <td className="p-3 border-r border-[#303030]/20 font-mono-data font-bold text-[#182747] whitespace-nowrap">
                      {s.id}
                    </td>
                    <td className="p-3 border-r border-[#303030]/20 font-bold text-[#182747] whitespace-nowrap">
                      {s.fullName}
                    </td>
                    <td className="p-3 border-r border-[#303030]/20 text-[#303030] whitespace-nowrap">
                      {s.email}
                    </td>
                    <td className="p-3 border-r border-[#303030]/20 font-mono-data text-[#303030] whitespace-nowrap">
                      {s.mobile}
                    </td>
                    <td className="p-3 border-r border-[#303030]/20 text-[#303030] max-w-[180px] truncate">
                      {s.college}
                    </td>
                    <td className="p-3 border-r border-[#303030]/20 font-semibold text-[#4169E1] whitespace-nowrap">
                      {s.domain}
                    </td>
                    <td className="p-3 border-r border-[#303030]/20 font-mono-data text-[#303030] whitespace-nowrap">
                      {formatShortDate(s.registrationDate)}
                    </td>
                    <td className="p-3 border-r border-[#303030]/20 whitespace-nowrap">
                      <StatusBadge status={s.offerLetterStatus} />
                    </td>
                    <td className="p-3 border-r border-[#303030]/20 whitespace-nowrap">
                      <select
                        aria-label={`Update status for ${s.fullName}`}
                        value={s.internshipStatus}
                        onChange={(e) => {
                          const nextVal = e.target.value as InternshipStatus;
                          if (nextVal !== s.internshipStatus) {
                            setPendingStatusChange({
                              studentId: s.id,
                              studentName: s.fullName,
                              previous: s.internshipStatus,
                              next: nextVal,
                            });
                          }
                        }}
                        className="px-2 py-1 bg-[#FFF8E7] border-2 border-[#303030] text-xs font-mono-data font-bold text-[#182747]"
                      >
                        {INTERNSHIP_STATUSES.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <RetroButton
                          size="sm"
                          variant="primary"
                          onClick={() => setProfileStudentId(s.id)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Profile</span>
                        </RetroButton>
                        <RetroButton
                          size="sm"
                          variant="neutral"
                          onClick={() => setOfferModalStudentId(s.id)}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Offer</span>
                        </RetroButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 text-xs font-mono-data text-[#182747]">
          <span>
            Showing {paginated.length} of {filtered.length} student records
          </span>
          <div className="flex items-center gap-2">
            <RetroButton
              size="sm"
              variant="neutral"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </RetroButton>
            <span className="px-2 font-bold">
              Page {safePage} / {totalPages}
            </span>
            <RetroButton
              size="sm"
              variant="neutral"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </RetroButton>
          </div>
        </div>
      </RetroWindow>

      <AdminStudentProfileModal
        studentId={profileStudentId}
        onClose={() => setProfileStudentId(null)}
      />

      {offerStudent && (
        <div
          className="fixed inset-0 z-50 bg-[#182747]/75 flex items-start justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <RetroWindow
            title={`OFFER_LETTER_${offerRecord?.offerLetterNumber || offerStudent.offerLetterNumber}.PDF`}
            headerColor="blue"
            onClose={() => setOfferModalStudentId(null)}
            className="w-full max-w-4xl my-6"
          >
            <OfferLetterPreview student={offerStudent} offerLetter={offerRecord} />
          </RetroWindow>
        </div>
      )}

      <InternshipConfirmDialog
        open={Boolean(pendingStatusChange)}
        studentName={pendingStatusChange?.studentName || ''}
        changes={confirmChanges}
        onConfirm={() => {
          if (pendingStatusChange) {
            updateStudentStatus(pendingStatusChange.studentId, pendingStatusChange.next);
            setPendingStatusChange(null);
          }
        }}
        onCancel={() => setPendingStatusChange(null)}
      />
    </div>
  );
};
