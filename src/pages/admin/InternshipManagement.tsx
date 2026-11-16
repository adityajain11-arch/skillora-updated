import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Download,
  Edit3,
  Eye,
  FilePlus2,
  History,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  INTERNSHIP_DOMAINS,
  INTERNSHIP_STATUSES,
  InternshipDomain,
  InternshipStatus,
  InternshipTask,
  OfferLetterRecord,
} from '../../types';
import { RetroWindow } from '../../components/RetroWindow';
import { RetroButton } from '../../components/RetroButton';
import { StatusBadge } from '../../components/StatusBadge';
import {
  InternshipConfirmDialog,
  PendingFieldChange,
} from '../../components/InternshipConfirmDialog';
import { RegenerateOfferModal } from '../../components/RegenerateOfferModal';
import { OfferLetterPreview } from '../../components/OfferLetterPreview';
import { NotificationDialog } from '../../components/NotificationDialog';
import { downloadOfferLetterPdf } from '../../services/pdfService';
import { formatShortDate } from '../../utils/idGenerators';

export const InternshipManagement: React.FC = () => {
  const {
    state,
    updateStudentInternshipDetails,
    regenerateOfferLetter,
    getOfferLettersForStudent,
    getActiveOfferLetterForStudent,
    getChangeLogsForStudent,
    getTasksForStudent,
    createTask,
    updateTask,
    deleteTask,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    state.students[0]?.id || ''
  );

  // Editable internship form state
  const [domain, setDomain] = useState<InternshipDomain>('Web Development');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState('');
  const [projectDeadline, setProjectDeadline] = useState('');
  const [status, setStatus] = useState<InternshipStatus>('Registered');

  // Confirmation & Modals
  const [pendingChanges, setPendingChanges] = useState<PendingFieldChange[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [regenModalOpen, setRegenModalOpen] = useState(false);
  const [previewOffer, setPreviewOffer] = useState<OfferLetterRecord | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // Inline Task Editor Modal
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<InternshipTask | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('2026-12-20');
  const [taskGuidelines, setTaskGuidelines] = useState('');
  const [taskError, setTaskError] = useState('');

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return state.students.filter(
      (s) =>
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.domain.toLowerCase().includes(q)
    );
  }, [state.students, searchQuery]);

  const selectedStudent = useMemo(
    () =>
      state.students.find((s) => s.id === selectedStudentId) ||
      filteredStudents[0] ||
      null,
    [state.students, selectedStudentId, filteredStudents]
  );

  useEffect(() => {
    if (selectedStudent) {
      setDomain(selectedStudent.domain);
      setStartDate(selectedStudent.internshipStartDate);
      setEndDate(selectedStudent.internshipEndDate);
      setDuration(selectedStudent.internshipDuration);
      setProjectDeadline(selectedStudent.projectDeadline);
      setStatus(selectedStudent.internshipStatus);
      setFormError('');
    }
  }, [selectedStudent]);

  const offerHistory = selectedStudent ? getOfferLettersForStudent(selectedStudent.id) : [];
  const activeOffer = selectedStudent ? getActiveOfferLetterForStudent(selectedStudent.id) : undefined;
  const changeLogs = selectedStudent ? getChangeLogsForStudent(selectedStudent.id) : [];
  const studentTasks = selectedStudent ? getTasksForStudent(selectedStudent) : [];

  const offerMismatch =
    Boolean(selectedStudent && activeOffer && activeOffer.domain !== selectedStudent.domain);

  const handleRequestSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setFormError('');

    if (!startDate || !endDate || !duration.trim() || !projectDeadline) {
      setFormError('Start date, end date, duration, and project deadline are required.');
      return;
    }

    const diffs: PendingFieldChange[] = [];
    if (domain !== selectedStudent.domain) {
      diffs.push({
        field: 'Internship Domain',
        previousValue: selectedStudent.domain,
        newValue: domain,
      });
    }
    if (startDate !== selectedStudent.internshipStartDate) {
      diffs.push({
        field: 'Internship Start Date',
        previousValue: selectedStudent.internshipStartDate,
        newValue: startDate,
      });
    }
    if (endDate !== selectedStudent.internshipEndDate) {
      diffs.push({
        field: 'Internship End Date',
        previousValue: selectedStudent.internshipEndDate,
        newValue: endDate,
      });
    }
    if (duration.trim() !== selectedStudent.internshipDuration) {
      diffs.push({
        field: 'Internship Duration',
        previousValue: selectedStudent.internshipDuration,
        newValue: duration.trim(),
      });
    }
    if (projectDeadline !== selectedStudent.projectDeadline) {
      diffs.push({
        field: 'Project Submission Deadline',
        previousValue: selectedStudent.projectDeadline,
        newValue: projectDeadline,
      });
    }
    if (status !== selectedStudent.internshipStatus) {
      diffs.push({
        field: 'Internship Status',
        previousValue: selectedStudent.internshipStatus,
        newValue: status,
      });
    }

    if (diffs.length === 0) {
      setFormError('No changes detected. Modify at least one field before saving.');
      return;
    }

    setPendingChanges(diffs);
    setConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    if (!selectedStudent) return;
    updateStudentInternshipDetails(
      selectedStudent.id,
      {
        domain,
        internshipStartDate: startDate,
        internshipEndDate: endDate,
        internshipDuration: duration.trim(),
        projectDeadline,
        internshipStatus: status,
      },
      'Admin saved edited internship configuration from INTERNSHIP MANAGEMENT.EXE.'
    );
    setConfirmOpen(false);
    setToastMsg(
      `Saved ${pendingChanges.length} internship update(s) for ${selectedStudent.fullName}. Student notified & Change Log updated.`
    );
  };

  const handleFinalizeRegenOffer = (issueDate: string) => {
    if (!selectedStudent) return;
    const regenerated = regenerateOfferLetter(selectedStudent.id, issueDate);
    setRegenModalOpen(false);
    if (regenerated) {
      setToastMsg(
        `Offer Letter v${regenerated.version} (${regenerated.domain}) generated and saved to ${selectedStudent.fullName}'s profile.`
      );
    }
  };

  const openAddTask = () => {
    if (!selectedStudent) return;
    setEditingTask(null);
    setTaskTitle('');
    setTaskDesc('');
    setTaskDeadline(selectedStudent.projectDeadline || '2026-12-20');
    setTaskGuidelines('Follow domain coding/design standards\nSubmit deliverables before deadline');
    setTaskError('');
    setTaskModalOpen(true);
  };

  const openEditTask = (t: InternshipTask) => {
    setEditingTask(t);
    setTaskTitle(t.title);
    setTaskDesc(t.description);
    setTaskDeadline(t.deadline);
    setTaskGuidelines(t.guidelines.join('\n'));
    setTaskError('');
    setTaskModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (!taskTitle.trim() || !taskDesc.trim() || !taskDeadline) {
      setTaskError('Task title, description, and deadline are required.');
      return;
    }
    const guidelinesArr = taskGuidelines
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (editingTask) {
      updateTask(
        editingTask.id,
        {
          title: taskTitle.trim(),
          description: taskDesc.trim(),
          deadline: taskDeadline,
          guidelines: guidelinesArr,
        },
        selectedStudent.id
      );
      setToastMsg(`Updated task "${taskTitle.trim()}" for ${selectedStudent.fullName}.`);
    } else {
      createTask({
        domain: selectedStudent.domain,
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        deadline: taskDeadline,
        guidelines: guidelinesArr,
        assignedStudentIds: [selectedStudent.id],
      });
      setToastMsg(`Assigned new task "${taskTitle.trim()}" to ${selectedStudent.fullName}.`);
    }
    setTaskModalOpen(false);
  };

  const inputClass =
    'w-full px-3 py-2 bg-white border-2 border-[#303030] text-sm text-[#182747] focus:outline-none focus:border-[#4169E1]';

  return (
    <div className="space-y-6">
      <RetroWindow title="INTERNSHIP MANAGEMENT.EXE" headerColor="navy">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Student Selector Panel */}
          <div className="lg:col-span-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#303030] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student name, ID, domain..."
                className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#303030] text-sm text-[#182747]"
              />
            </div>

            <div className="border-2 border-[#303030] bg-white max-h-[540px] overflow-y-auto divide-y divide-[#303030]/20">
              {filteredStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#303030]">
                  No students match your search.
                </div>
              ) : (
                filteredStudents.map((stu) => {
                  const isSelected = selectedStudent?.id === stu.id;
                  return (
                    <button
                      key={stu.id}
                      type="button"
                      onClick={() => setSelectedStudentId(stu.id)}
                      className={`w-full text-left p-3 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#4169E1] text-[#FFF8E7]'
                          : 'bg-white text-[#182747] hover:bg-[#F4EBD0]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono-data text-[11px] font-bold">
                          {stu.id}
                        </span>
                        <span
                          className={`font-mono-data text-[10px] px-1.5 py-0.5 border ${
                            isSelected
                              ? 'border-[#FFF8E7]/60 bg-[#182747]/40 text-[#FFF8E7]'
                              : 'border-[#303030] bg-[#F4EBD0] text-[#182747]'
                          }`}
                        >
                          {stu.internshipStatus}
                        </span>
                      </div>
                      <p className="font-bold text-sm mt-1 truncate">{stu.fullName}</p>
                      <p
                        className={`text-xs mt-0.5 truncate ${
                          isSelected ? 'text-[#F4EBD0]' : 'text-[#4169E1] font-semibold'
                        }`}
                      >
                        {stu.domain}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Editor & Controls Panel */}
          <div className="lg:col-span-8 space-y-6">
            {!selectedStudent ? (
              <div className="p-8 text-center border-2 border-dashed border-[#303030]/40 bg-[#F4EBD0]/50">
                Select a registered student on the left to manage and edit their internship.
              </div>
            ) : (
              <>
                {/* Selected Student Header */}
                <div className="p-4 bg-[#F4EBD0] border-2 border-[#303030] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-mono-data text-xs font-bold text-[#4169E1]">
                      EDITING RECORD · {selectedStudent.id}
                    </div>
                    <h3 className="text-lg font-bold text-[#182747]">
                      {selectedStudent.fullName}
                    </h3>
                    <p className="text-xs text-[#303030]">
                      {selectedStudent.college} · {selectedStudent.email}
                    </p>
                  </div>
                  <StatusBadge status={selectedStudent.internshipStatus} />
                </div>

                {/* Edit Internship Details Form */}
                <form
                  onSubmit={handleRequestSave}
                  className="p-4 bg-white border-2 border-[#303030] space-y-4"
                >
                  <div className="flex items-center gap-2 pb-2 border-b-2 border-dotted border-[#303030]/30">
                    <Calendar className="w-4 h-4 text-[#4169E1]" />
                    <h4 className="font-pixel text-[10px] text-[#182747]">
                      EDIT INTERNSHIP PARAMETERS
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="im-domain"
                        className="block text-xs font-bold uppercase text-[#182747] mb-1"
                      >
                        Assigned Internship Domain
                      </label>
                      <select
                        id="im-domain"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value as InternshipDomain)}
                        className={inputClass}
                      >
                        {INTERNSHIP_DOMAINS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="im-status"
                        className="block text-xs font-bold uppercase text-[#182747] mb-1"
                      >
                        Internship Status
                      </label>
                      <select
                        id="im-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as InternshipStatus)}
                        className={inputClass}
                      >
                        {INTERNSHIP_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="im-start"
                        className="block text-xs font-bold uppercase text-[#182747] mb-1"
                      >
                        Internship Start Date
                      </label>
                      <input
                        id="im-start"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={`${inputClass} font-mono-data`}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="im-end"
                        className="block text-xs font-bold uppercase text-[#182747] mb-1"
                      >
                        Internship End Date
                      </label>
                      <input
                        id="im-end"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={`${inputClass} font-mono-data`}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="im-duration"
                        className="block text-xs font-bold uppercase text-[#182747] mb-1"
                      >
                        Internship Duration
                      </label>
                      <input
                        id="im-duration"
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="e.g. 6 Weeks / 2 Months"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="im-deadline"
                        className="block text-xs font-bold uppercase text-[#182747] mb-1"
                      >
                        Project Submission Deadline
                      </label>
                      <input
                        id="im-deadline"
                        type="date"
                        value={projectDeadline}
                        onChange={(e) => setProjectDeadline(e.target.value)}
                        className={`${inputClass} font-mono-data`}
                      />
                    </div>
                  </div>

                  {formError && <p className="text-xs font-bold text-[#C94C4C]">{formError}</p>}

                  <div className="flex justify-end pt-1">
                    <RetroButton type="submit" variant="success">
                      <Save className="w-4 h-4" />
                      <span>Review &amp; Save Changes</span>
                    </RetroButton>
                  </div>
                </form>

                {/* Offer Letter Versioning & Regeneration */}
                <div className="p-4 bg-[#FFF8E7] border-2 border-[#303030] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-dotted border-[#303030]/30">
                    <div>
                      <h4 className="font-pixel text-[10px] text-[#182747]">
                        OFFER LETTER &amp; REGENERATION
                      </h4>
                      <p className="text-xs text-[#303030] mt-1">
                        Existing offer letters are preserved when domain changes. Regenerate to
                        issue a new version with the updated domain.
                      </p>
                    </div>
                    <RetroButton
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => setRegenModalOpen(true)}
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>REGENERATE OFFER LETTER</span>
                    </RetroButton>
                  </div>

                  {offerMismatch && (
                    <div className="p-3 bg-[#F4C542]/25 border-2 border-[#303030] flex items-start gap-2.5 text-xs text-[#182747]">
                      <AlertTriangle className="w-4 h-4 text-[#b68911] shrink-0 mt-0.5" />
                      <div>
                        <strong>Domain Mismatch Detected:</strong> Current Offer Letter (v
                        {activeOffer?.version}) lists <strong>{activeOffer?.domain}</strong>, while
                        the student&apos;s updated internship domain is{' '}
                        <strong>{selectedStudent.domain}</strong>. Click{' '}
                        <strong>REGENERATE OFFER LETTER</strong> to issue an updated letter.
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {offerHistory.map((ol) => (
                      <div
                        key={ol.id}
                        className="p-3 bg-white border-2 border-[#303030] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono-data font-bold text-[#182747]">
                              {ol.offerLetterNumber} (v{ol.version})
                            </span>
                            <StatusBadge status={ol.isCurrent ? 'ACTIVE' : 'PREVIOUS'} />
                          </div>
                          <p className="text-[#303030] mt-1">
                            Domain: <strong className="text-[#4169E1]">{ol.domain}</strong> · Issued:{' '}
                            <span className="font-mono-data">{ol.issueDate}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <RetroButton
                            size="sm"
                            variant="neutral"
                            onClick={() => setPreviewOffer(ol)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </RetroButton>
                          <RetroButton
                            size="sm"
                            variant="primary"
                            onClick={() => downloadOfferLetterPdf(selectedStudent, ol)}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </RetroButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assigned Tasks & Deadlines */}
                <div className="p-4 bg-white border-2 border-[#303030] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-dotted border-[#303030]/30">
                    <div>
                      <h4 className="font-pixel text-[10px] text-[#182747]">
                        ASSIGNED TASKS &amp; DEADLINES ({selectedStudent.domain})
                      </h4>
                    </div>
                    <RetroButton size="sm" variant="success" onClick={openAddTask}>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Task</span>
                    </RetroButton>
                  </div>

                  <div className="space-y-2">
                    {studentTasks.length === 0 ? (
                      <p className="text-xs text-[#303030]">
                        No tasks assigned yet for {selectedStudent.domain}.
                      </p>
                    ) : (
                      studentTasks.map((t) => (
                        <div
                          key={t.id}
                          className="p-3 bg-[#F4EBD0]/60 border-2 border-[#303030] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="font-mono-data text-[11px] font-bold text-[#4169E1]">
                              QUEST #{String(t.taskNumber).padStart(2, '0')} · DEADLINE: {t.deadline}
                            </div>
                            <p className="text-sm font-bold text-[#182747]">{t.title}</p>
                            <p className="text-xs text-[#303030] truncate">{t.description}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <RetroButton
                              size="sm"
                              variant="neutral"
                              onClick={() => openEditTask(t)}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </RetroButton>
                            <RetroButton
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                deleteTask(t.id, selectedStudent.id);
                                setToastMsg(`Removed task "${t.title}".`);
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </RetroButton>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* INTERNSHIP CHANGE LOG */}
                <div className="p-4 bg-white border-2 border-[#303030] space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b-2 border-dotted border-[#303030]/30">
                    <History className="w-4 h-4 text-[#4169E1]" />
                    <h4 className="font-pixel text-[10px] text-[#182747]">
                      INTERNSHIP CHANGE LOG
                    </h4>
                  </div>

                  {changeLogs.length === 0 ? (
                    <p className="text-xs text-[#303030]">
                      No admin modifications logged for this student yet.
                    </p>
                  ) : (
                    <div className="overflow-x-auto border border-[#303030]">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#182747] text-[#FFF8E7] font-mono-data text-[11px] uppercase">
                            <th className="p-2 border-r border-[#303030]">Date &amp; Time</th>
                            <th className="p-2 border-r border-[#303030]">Field Changed</th>
                            <th className="p-2 border-r border-[#303030]">Previous</th>
                            <th className="p-2 border-r border-[#303030]">New Value</th>
                            <th className="p-2">Admin Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#303030]/20">
                          {changeLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-[#F4EBD0]/40">
                              <td className="p-2 border-r border-[#303030]/20 font-mono-data whitespace-nowrap">
                                {formatShortDate(log.changedAt)}{' '}
                                {new Date(log.changedAt).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                              <td className="p-2 border-r border-[#303030]/20 font-bold text-[#182747]">
                                {log.fieldChanged}
                              </td>
                              <td className="p-2 border-r border-[#303030]/20 text-[#C94C4C] font-mono-data">
                                {log.previousValue}
                              </td>
                              <td className="p-2 border-r border-[#303030]/20 text-[#4E8B62] font-bold font-mono-data">
                                {log.newValue}
                              </td>
                              <td className="p-2 text-[#303030]">{log.actionDescription}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </RetroWindow>

      {/* Confirmation Dialog */}
      <InternshipConfirmDialog
        open={confirmOpen}
        studentName={selectedStudent?.fullName || ''}
        changes={pendingChanges}
        existingOfferDomain={activeOffer?.domain}
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Regenerate Offer Letter Preview Modal */}
      <RegenerateOfferModal
        open={regenModalOpen}
        student={selectedStudent}
        nextVersion={(offerHistory[0]?.version || 1) + 1}
        onFinalize={handleFinalizeRegenOffer}
        onCancel={() => setRegenModalOpen(false)}
      />

      {/* Preview Specific Offer Letter Version */}
      {previewOffer && selectedStudent && (
        <div
          className="fixed inset-0 z-50 bg-[#182747]/75 flex items-start justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <RetroWindow
            title={`OFFER_LETTER_${previewOffer.offerLetterNumber}.PDF`}
            headerColor="blue"
            onClose={() => setPreviewOffer(null)}
            className="w-full max-w-4xl my-6"
          >
            <div className="flex justify-end mb-4">
              <RetroButton
                size="sm"
                variant="success"
                onClick={() => downloadOfferLetterPdf(selectedStudent, previewOffer)}
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </RetroButton>
            </div>
            <OfferLetterPreview student={selectedStudent} offerLetter={previewOffer} />
          </RetroWindow>
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {taskModalOpen && selectedStudent && (
        <div
          className="fixed inset-0 z-50 bg-[#182747]/75 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <RetroWindow
            title={editingTask ? 'EDIT_STUDENT_TASK.EXE' : 'ASSIGN_STUDENT_TASK.EXE'}
            headerColor="blue"
            onClose={() => setTaskModalOpen(false)}
            className="w-full max-w-lg"
          >
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                  Submission Deadline *
                </label>
                <input
                  type="date"
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                  className={`${inputClass} font-mono-data`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                  Guidelines (one per line)
                </label>
                <textarea
                  rows={3}
                  value={taskGuidelines}
                  onChange={(e) => setTaskGuidelines(e.target.value)}
                  className={inputClass}
                />
              </div>
              {taskError && <p className="text-xs font-bold text-[#C94C4C]">{taskError}</p>}
              <div className="flex justify-end gap-2">
                <RetroButton
                  type="button"
                  variant="neutral"
                  onClick={() => setTaskModalOpen(false)}
                >
                  Cancel
                </RetroButton>
                <RetroButton type="submit" variant="success">
                  <FilePlus2 className="w-4 h-4" />
                  <span>{editingTask ? 'Save Task' : 'Assign Task'}</span>
                </RetroButton>
              </div>
            </form>
          </RetroWindow>
        </div>
      )}

      <NotificationDialog
        open={Boolean(toastMsg)}
        title="INTERNSHIP_MANAGER_LOG.EXE"
        message={toastMsg || ''}
        type="success"
        confirmLabel="OK"
        onConfirm={() => setToastMsg(null)}
      />
    </div>
  );
};
