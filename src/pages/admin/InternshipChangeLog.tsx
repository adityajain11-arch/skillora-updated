import React, { useMemo, useState } from 'react';
import { Eye, FileSpreadsheet, History, RefreshCw, Search, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RetroWindow } from '../../components/RetroWindow';
import { RetroButton } from '../../components/RetroButton';
import { DashboardCard } from '../../components/DashboardCard';
import { AdminStudentProfileModal } from '../../components/AdminStudentProfileModal';
import { formatDateTime } from '../../utils/idGenerators';

export const InternshipChangeLog: React.FC = () => {
  const { state } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [studentFilter, setStudentFilter] = useState('ALL');
  const [fieldFilter, setFieldFilter] = useState('ALL');
  const [profileStudentId, setProfileStudentId] = useState<string | null>(null);

  const studentMap = useMemo(() => {
    const map = new Map<string, string>();
    state.students.forEach((s) => map.set(s.id, s.fullName));
    return map;
  }, [state.students]);

  const distinctFields = useMemo(() => {
    const set = new Set<string>();
    state.changeLogs.forEach((c) => set.add(c.fieldChanged));
    return Array.from(set).sort();
  }, [state.changeLogs]);

  const sortedAndFiltered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...state.changeLogs]
      .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
      .filter((entry) => {
        const studentName = studentMap.get(entry.studentId) || entry.studentId;
        const matchesQuery =
          !q ||
          studentName.toLowerCase().includes(q) ||
          entry.studentId.toLowerCase().includes(q) ||
          entry.fieldChanged.toLowerCase().includes(q) ||
          entry.previousValue.toLowerCase().includes(q) ||
          entry.newValue.toLowerCase().includes(q) ||
          entry.actionDescription.toLowerCase().includes(q);
        const matchesStudent = studentFilter === 'ALL' || entry.studentId === studentFilter;
        const matchesField = fieldFilter === 'ALL' || entry.fieldChanged === fieldFilter;
        return matchesQuery && matchesStudent && matchesField;
      });
  }, [state.changeLogs, studentMap, searchQuery, studentFilter, fieldFilter]);

  const uniqueStudentsModified = new Set(state.changeLogs.map((c) => c.studentId)).size;
  const domainUpdatesCount = state.changeLogs.filter((c) =>
    c.fieldChanged.toLowerCase().includes('domain')
  ).length;
  const regeneratedLettersCount = state.offerLetters.filter((ol) => ol.version > 1).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Logged Changes"
          value={state.changeLogs.length}
          accent="blue"
          icon={<History className="w-4 h-4" />}
          subtitle="Full frontend audit trail"
        />
        <DashboardCard
          title="Students Modified"
          value={uniqueStudentsModified}
          accent="navy"
          icon={<Users className="w-4 h-4" />}
          subtitle="Across all domains"
        />
        <DashboardCard
          title="Domain Changes"
          value={domainUpdatesCount}
          accent="yellow"
          icon={<RefreshCw className="w-4 h-4" />}
          subtitle="Admin domain reassignments"
        />
        <DashboardCard
          title="Regenerated Offers"
          value={regeneratedLettersCount}
          accent="green"
          icon={<FileSpreadsheet className="w-4 h-4" />}
          subtitle="Updated offer versions"
        />
      </div>

      <RetroWindow title="INTERNSHIP_CHANGE_LOG.EXE" headerColor="navy">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pb-4 border-b-2 border-dotted border-[#303030]/40">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold uppercase text-[#182747] mb-1">
              Search Change History
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#303030] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student, field, previous/new value, or action..."
                className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#303030] text-sm text-[#182747] focus:outline-none focus:border-[#4169E1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#182747] mb-1">
              Filter by Student
            </label>
            <select
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#303030] text-sm text-[#182747]"
            >
              <option value="ALL">All Registered Students</option>
              {state.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#182747] mb-1">
              Filter by Field Changed
            </label>
            <select
              value={fieldFilter}
              onChange={(e) => setFieldFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#303030] text-sm text-[#182747]"
            >
              <option value="ALL">All Fields</option>
              {distinctFields.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mt-4 border-2 border-[#303030] bg-white">
          <table className="w-full text-left border-collapse min-w-[980px]">
            <thead>
              <tr className="bg-[#182747] text-[#FFF8E7] font-mono-data text-xs uppercase">
                <th className="p-3 border-b-2 border-r border-[#303030]">Date &amp; Time</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Student</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Field Changed</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Previous Value</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">New Value</th>
                <th className="p-3 border-b-2 border-r border-[#303030]">Admin Action Description</th>
                <th className="p-3 border-b-2 border-[#303030]">Profile</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm divide-y divide-[#303030]/30">
              {sortedAndFiltered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#303030]">
                    No change log records match your current search or filter criteria.
                  </td>
                </tr>
              ) : (
                sortedAndFiltered.map((entry) => {
                  const studentName = studentMap.get(entry.studentId) || 'Unknown Student';
                  return (
                    <tr key={entry.id} className="hover:bg-[#F4EBD0]/50 align-top">
                      <td className="p-3 border-r border-[#303030]/20 font-mono-data text-xs text-[#303030] whitespace-nowrap">
                        {formatDateTime(entry.changedAt)}
                      </td>
                      <td className="p-3 border-r border-[#303030]/20 whitespace-nowrap">
                        <div className="font-bold text-[#182747]">{studentName}</div>
                        <div className="font-mono-data text-[11px] text-[#4169E1]">
                          {entry.studentId}
                        </div>
                      </td>
                      <td className="p-3 border-r border-[#303030]/20 font-bold text-[#182747] whitespace-nowrap">
                        {entry.fieldChanged}
                      </td>
                      <td className="p-3 border-r border-[#303030]/20 text-[#8a2323] font-mono-data text-xs">
                        {entry.previousValue}
                      </td>
                      <td className="p-3 border-r border-[#303030]/20 text-[#2e6340] font-mono-data text-xs font-bold">
                        {entry.newValue}
                      </td>
                      <td className="p-3 border-r border-[#303030]/20 text-[#303030] min-w-[240px]">
                        {entry.actionDescription}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <RetroButton
                          size="sm"
                          variant="primary"
                          onClick={() => setProfileStudentId(entry.studentId)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </RetroButton>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </RetroWindow>

      <AdminStudentProfileModal
        studentId={profileStudentId}
        onClose={() => setProfileStudentId(null)}
      />
    </div>
  );
};
