import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Download,
  ExternalLink,
  History,
  Plus,
  RefreshCw,
  Save,
  ScrollText,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  INTERNSHIP_DOMAINS,
  INTERNSHIP_STATUSES,
  InternshipDomain,
  InternshipStatus,
} from '../types';
import { RetroWindow } from './RetroWindow';
import { RetroButton } from './RetroButton';
import { StatusBadge } from './StatusBadge';
import { OfferLetterPreview } from './OfferLetterPreview';
import { CertificatePreview } from './CertificatePreview';
import { LORPreview } from './LORPreview';
import { ProgressTracker } from './ProgressTracker';
import {
  InternshipConfirmDialog,
  PendingFieldChange,
} from './InternshipConfirmDialog';
import { RegenerateOfferModal } from './RegenerateOfferModal';
import { NotificationDialog } from './NotificationDialog';
import { formatReadableDate, formatShortDate } from '../utils/idGenerators';
import {
  downloadCertificatePdf,
  downloadLORPdf,
  downloadOfferLetterPdf,
} from '../services/pdfService';

interface AdminStudentProfileModalProps {
  studentId: string | null;
  onClose: () => void;
}

const TABS = [
  '1. Personal Info',
  '2. Registration & Edit',
  '3. Offer Letter',
  '4. Assigned Tasks',
  '5. Project Submissions',
  '6. Admin Feedback',
  '7. Internship Progress',
  '8. Certificate',
  '9. LOR',
  '10. Internship Change Log',
] as const;

export const AdminStudentProfileModal: React.FC<AdminStudentProfileModalProps> = ({
  studentId,
  onClose,
}) => {
  const {
    state,
    updateStudentInternshipDetails,
    regenerateOfferLetter,
    getOfferLettersForStudent,
    getActiveOfferLetterForStudent,
    getChangeLogsForStudent,
    getTasksForStudent,
    getTaskSubmissionForStudent,
    createTask,
    deleteTask,
    issueCertificate,
    issueLOR,
  } = useApp();

  const [activeTab, setActiveTab] = useState<number>(0);

  const student = studentId ? state.students.find((s) => s.id === studentId) : undefined;

  // Edit internship fields inside profile
  const [domain, setDomain] = useState<InternshipDomain>('Web Development');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState('');
  const [projectDeadline, setProjectDeadline] = useState('');
  const [status, setStatus] = useState<InternshipStatus>('Registered');
  const [pendingChanges, setPendingChanges] = useState<PendingFieldChange[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [regenModalOpen, setRegenModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Quick task add inside profile
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('2026-12-20');

  useEffect(() => {
    if (student) {
      setDomain(student.domain);
      setStartDate(student.internshipStartDate);
      setEndDate(student.internshipEndDate);
      setDuration(student.internshipDuration);
      setProjectDeadline(student.projectDeadline);
      setStatus(student.internshipStatus);
      setNewTaskDeadline(student.projectDeadline || '2026-12-20');
    }
  }, [student]);

  if (!studentId || !student) return null;

  const tasks = getTasksForStudent(student);
  const taskPairs = tasks.map((t) => ({
    task: t,
    submission: getTaskSubmissionForStudent(student.id, t.id),
  }));

  const completedTasks = taskPairs.filter(
    (p) => p.submission?.status === 'APPROVED'
  ).length;
  const submittedTasks = taskPairs.filter(
    (p) => p.submission?.status === 'SUBMITTED' || p.submission?.status === 'APPROVED'
  ).length;

  const projectSub = state.projectSubmissions.find((p) => p.studentId === student.id);
  const certificate = state.certificates.find((c) => c.studentId === student.id);
  const lor = state.lors.find((l) => l.studentId === student.id);
  const offerHistory = getOfferLettersForStudent(student.id);
  const activeOffer = getActiveOfferLetterForStudent(student.id);
  const changeLogs = getChangeLogsForStudent(student.id);

  const isEligible = projectSub?.status === 'APPROVED';
  const offerMismatch = Boolean(activeOffer && activeOffer.domain !== student.domain);

  const handleRequestEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    const diffs: PendingFieldChange[] = [];
    if (domain !== student.domain) {
      diffs.push({ field: 'Internship Domain', previousValue: student.domain, newValue: domain });
    }
    if (startDate !== student.internshipStartDate) {
      diffs.push({
        field: 'Internship Start Date',
        previousValue: student.internshipStartDate,
        newValue: startDate,
      });
    }
    if (endDate !== student.internshipEndDate) {
      diffs.push({
        field: 'Internship End Date',
        previousValue: student.internshipEndDate,
        newValue: endDate,
      });
    }
    if (duration.trim() !== student.internshipDuration) {
      diffs.push({
        field: 'Internship Duration',
        previousValue: student.internshipDuration,
        newValue: duration.trim(),
      });
    }
    if (projectDeadline !== student.projectDeadline) {
      diffs.push({
        field: 'Project Submission Deadline',
        previousValue: student.projectDeadline,
        newValue: projectDeadline,
      });
    }
    if (status !== student.internshipStatus) {
      diffs.push({
        field: 'Internship Status',
        previousValue: student.internshipStatus,
        newValue: status,
      });
    }
    if (diffs.length === 0) {
      setToastMsg('No changes made to internship details.');
      return;
    }
    setPendingChanges(diffs);
    setConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    updateStudentInternshipDetails(
      student.id,
      {
        domain,
        internshipStartDate: startDate,
        internshipEndDate: endDate,
        internshipDuration: duration.trim(),
        projectDeadline,
        internshipStatus: status,
      },
      'Admin updated internship details from Individual Student Profile.'
    );
    setConfirmOpen(false);
    setToastMsg('Internship details saved and logged in Internship Change Log.');
  };

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createTask({
      domain: student.domain,
      title: newTaskTitle.trim(),
      description: `Custom assignment for ${student.fullName} in ${student.domain}.`,
      guidelines: ['Complete task requirements and upload deliverable via Quest Board.'],
      deadline: newTaskDeadline,
      assignedStudentIds: [student.id],
    });
    setNewTaskTitle('');
    setToastMsg(`Assigned new task to ${student.fullName}.`);
  };

  const inputClass =
    'w-full px-3 py-2 bg-white border-2 border-[#303030] text-sm text-[#182747]';

  return (
    <div
      className="fixed inset-0 z-50 bg-[#182747]/75 flex items-start justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <RetroWindow
        title={`STUDENT_PROFILE_${student.id}.EXE`}
        headerColor="navy"
        onClose={onClose}
        className="w-full max-w-5xl my-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-[#303030]">
          <div>
            <h3 className="text-lg font-bold text-[#182747]">{student.fullName}</h3>
            <p className="font-mono-data text-xs text-[#303030]">
              {student.id} · {student.domain} · {student.email}
            </p>
          </div>
          <StatusBadge status={student.internshipStatus} />
        </div>

        {/* 10 Tabs */}
        <div className="flex flex-wrap gap-1.5 py-3 border-b-2 border-dotted border-[#303030]/40">
          {TABS.map((label, idx) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`px-2.5 py-1.5 text-xs font-bold border-2 border-[#303030] cursor-pointer whitespace-nowrap transition-colors ${
                activeTab === idx
                  ? 'bg-[#4169E1] text-[#FFF8E7]'
                  : 'bg-[#F4EBD0] text-[#182747] hover:bg-[#e8dcc0]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="pt-5">
          {/* Tab 1: Personal Info */}
          {activeTab === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-[#F4EBD0]/70 border-2 border-[#303030]">
                <span className="text-[11px] font-bold uppercase text-[#303030]">Full Name</span>
                <p className="font-bold text-[#182747] mt-0.5">{student.fullName}</p>
              </div>
              <div className="p-3 bg-[#F4EBD0]/70 border-2 border-[#303030]">
                <span className="text-[11px] font-bold uppercase text-[#303030]">Email Address</span>
                <p className="font-bold text-[#182747] mt-0.5">{student.email}</p>
              </div>
              <div className="p-3 bg-[#F4EBD0]/70 border-2 border-[#303030]">
                <span className="text-[11px] font-bold uppercase text-[#303030]">Mobile Number</span>
                <p className="font-mono-data font-bold text-[#182747] mt-0.5">{student.mobile}</p>
              </div>
              <div className="p-3 bg-[#F4EBD0]/70 border-2 border-[#303030]">
                <span className="text-[11px] font-bold uppercase text-[#303030]">
                  College / University
                </span>
                <p className="font-bold text-[#182747] mt-0.5">{student.college}</p>
              </div>
              <div className="p-3 bg-[#F4EBD0]/70 border-2 border-[#303030]">
                <span className="text-[11px] font-bold uppercase text-[#303030]">Current Course</span>
                <p className="font-bold text-[#182747] mt-0.5">{student.course}</p>
              </div>
              <div className="p-3 bg-[#F4EBD0]/70 border-2 border-[#303030]">
                <span className="text-[11px] font-bold uppercase text-[#303030]">
                  Year / Semester
                </span>
                <p className="font-bold text-[#182747] mt-0.5">{student.semester}</p>
              </div>
            </div>
          )}

          {/* Tab 2: Registration & Admin Internship Editing */}
          {activeTab === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="p-3 bg-[#F4EBD0]/70 border-2 border-[#303030]">
                  <span className="text-[11px] font-bold uppercase text-[#303030]">Student ID</span>
                  <p className="font-mono-data font-bold text-[#182747] mt-0.5">{student.id}</p>
                </div>
                <div className="p-3 bg-[#F4EBD0]/70 border-2 border-[#303030]">
                  <span className="text-[11px] font-bold uppercase text-[#303030]">
                    Registration Date
                  </span>
                  <p className="font-mono-data font-bold text-[#182747] mt-0.5">
                    {formatReadableDate(student.registrationDate)}
                  </p>
                </div>
                <div className="p-3 bg-[#F4EBD0]/70 border-2 border-[#303030]">
                  <span className="text-[11px] font-bold uppercase text-[#303030]">
                    Active Offer Ref
                  </span>
                  <p className="font-mono-data font-bold text-[#182747] mt-0.5">
                    {student.offerLetterNumber}
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleRequestEditSave}
                className="p-4 bg-white border-2 border-[#303030] space-y-4"
              >
                <h4 className="font-pixel text-[10px] text-[#4169E1]">
                  EDIT INTERNSHIP DETAILS
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                      Internship Domain
                    </label>
                    <select
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
                    <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                      Internship Status
                    </label>
                    <select
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
                    <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`${inputClass} font-mono-data`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`${inputClass} font-mono-data`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                      Project Submission Deadline
                    </label>
                    <input
                      type="date"
                      value={projectDeadline}
                      onChange={(e) => setProjectDeadline(e.target.value)}
                      className={`${inputClass} font-mono-data`}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <RetroButton type="submit" variant="success" size="sm">
                    <Save className="w-4 h-4" />
                    <span>Save Internship Changes</span>
                  </RetroButton>
                </div>
              </form>
            </div>
          )}

          {/* Tab 3: Offer Letter & Regeneration */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-mono-data text-[#182747]">
                  Versions Issued: <strong>{offerHistory.length}</strong>
                </div>
                <div className="flex flex-wrap gap-2">
                  <RetroButton
                    size="sm"
                    variant="warning"
                    onClick={() => setRegenModalOpen(true)}
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>REGENERATE OFFER LETTER</span>
                  </RetroButton>
                  <RetroButton
                    size="sm"
                    variant="primary"
                    onClick={() => downloadOfferLetterPdf(student, activeOffer)}
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Active PDF</span>
                  </RetroButton>
                </div>
              </div>

              {offerMismatch && (
                <div className="p-3 bg-[#F4C542]/25 border-2 border-[#303030] flex items-start gap-2 text-xs text-[#182747]">
                  <AlertTriangle className="w-4 h-4 text-[#b68911] shrink-0 mt-0.5" />
                  <span>
                    Active Offer Letter lists <strong>{activeOffer?.domain}</strong> while current
                    student domain is <strong>{student.domain}</strong>. Use{' '}
                    <strong>REGENERATE OFFER LETTER</strong> to issue an updated letter.
                  </span>
                </div>
              )}

              <OfferLetterPreview student={student} offerLetter={activeOffer} />
            </div>
          )}

          {/* Tab 4: Assigned Tasks (Add / Remove) */}
          {activeTab === 3 && (
            <div className="space-y-4">
              <form
                onSubmit={handleQuickAddTask}
                className="p-3 bg-[#F4EBD0] border-2 border-[#303030] flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-end"
              >
                <div className="flex-1">
                  <label className="block text-[11px] font-bold uppercase text-[#182747] mb-1">
                    Assign Additional Task for {student.fullName}
                  </label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter new task title..."
                    className={inputClass}
                  />
                </div>
                <div className="w-full sm:w-44">
                  <label className="block text-[11px] font-bold uppercase text-[#182747] mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className={`${inputClass} font-mono-data`}
                  />
                </div>
                <RetroButton type="submit" size="sm" variant="success">
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </RetroButton>
              </form>

              <div className="space-y-2.5">
                {taskPairs.map(({ task, submission }) => (
                  <div
                    key={task.id}
                    className="p-3.5 bg-[#F4EBD0]/60 border-2 border-[#303030] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-mono-data text-xs font-bold text-[#4169E1]">
                        TASK #{task.taskNumber} · DUE {task.deadline}
                      </div>
                      <h4 className="text-sm font-bold text-[#182747] mt-0.5">{task.title}</h4>
                      {submission?.fileName && (
                        <p className="font-mono-data text-xs text-[#303030] mt-1">
                          File: {submission.fileName} ({submission.fileSize})
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={submission?.status || 'NOT STARTED'} />
                      <RetroButton
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          deleteTask(task.id, student.id);
                          setToastMsg(`Removed task "${task.title}".`);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </RetroButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Project Submissions */}
          {activeTab === 4 && (
            <div>
              {!projectSub ? (
                <div className="p-6 text-center border-2 border-dashed border-[#303030]/40 bg-[#F4EBD0]/40 text-sm text-[#303030]">
                  No final capstone project submitted yet by {student.fullName}.
                </div>
              ) : (
                <div className="p-4 bg-[#F4EBD0]/70 border-2 border-[#303030] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-base font-bold text-[#182747]">
                      {projectSub.projectTitle}
                    </h4>
                    <StatusBadge status={projectSub.status} />
                  </div>
                  <p className="text-sm text-[#303030]">{projectSub.projectDescription}</p>
                  <div className="flex flex-wrap gap-4 text-xs font-mono-data text-[#182747]">
                    <span>
                      File: {projectSub.fileName} ({projectSub.fileSize})
                    </span>
                    <span>Date: {formatReadableDate(projectSub.submissionDate)}</span>
                    {projectSub.projectUrl && (
                      <a
                        href={projectSub.projectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#4169E1] font-bold hover:underline"
                      >
                        <span>Project Link</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 6: Admin Feedback */}
          {activeTab === 5 && (
            <div className="space-y-3">
              {projectSub?.adminFeedback && (
                <div className="p-3.5 bg-[#F4C542]/20 border-2 border-[#303030]">
                  <div className="text-xs font-bold uppercase text-[#182747]">
                    Final Capstone Project Feedback
                  </div>
                  <p className="text-sm text-[#182747] mt-1">{projectSub.adminFeedback}</p>
                </div>
              )}
              {taskPairs
                .filter((p) => p.submission?.adminFeedback)
                .map(({ task, submission }) => (
                  <div
                    key={task.id}
                    className="p-3.5 bg-[#F4EBD0]/70 border-2 border-[#303030]"
                  >
                    <div className="text-xs font-bold uppercase text-[#4169E1]">
                      Task #{task.taskNumber}: {task.title}
                    </div>
                    <p className="text-sm text-[#182747] mt-1">{submission?.adminFeedback}</p>
                  </div>
                ))}
              {!projectSub?.adminFeedback &&
                taskPairs.every((p) => !p.submission?.adminFeedback) && (
                  <p className="text-sm text-[#303030]">
                    No admin feedback recorded for this student yet.
                  </p>
                )}
            </div>
          )}

          {/* Tab 7: Internship Progress */}
          {activeTab === 6 && (
            <ProgressTracker
              hasOfferLetter={student.offerLetterStatus === 'GENERATED'}
              totalTasks={tasks.length}
              completedTasks={completedTasks}
              submittedTasks={submittedTasks}
              projectStatus={projectSub?.status || 'NONE'}
              certificateIssued={Boolean(certificate)}
              lorIssued={Boolean(lor)}
            />
          )}

          {/* Tab 8: Certificate */}
          {activeTab === 7 && (
            <div className="space-y-4">
              {certificate ? (
                <>
                  <div className="flex justify-end">
                    <RetroButton
                      size="sm"
                      variant="primary"
                      onClick={() => downloadCertificatePdf(certificate)}
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Certificate PDF</span>
                    </RetroButton>
                  </div>
                  <CertificatePreview certificate={certificate} />
                </>
              ) : (
                <div className="p-6 text-center bg-[#F4EBD0]/70 border-2 border-[#303030] space-y-3">
                  <p className="text-sm font-bold text-[#182747]">
                    Certificate not yet issued for {student.fullName}.
                  </p>
                  {isEligible ? (
                    <RetroButton variant="success" onClick={() => issueCertificate(student.id)}>
                      <Award className="w-4 h-4" />
                      <span>Issue Official Certificate Now</span>
                    </RetroButton>
                  ) : (
                    <p className="text-xs text-[#C94C4C] font-semibold">
                      Eligibility Rule: Student&apos;s final project must be APPROVED before
                      issuing a certificate.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 9: LOR */}
          {activeTab === 8 && (
            <div className="space-y-4">
              {lor ? (
                <>
                  <div className="flex justify-end">
                    <RetroButton
                      size="sm"
                      variant="success"
                      onClick={() => downloadLORPdf(lor, student.college)}
                    >
                      <Download className="w-4 h-4" />
                      <span>Download LOR PDF</span>
                    </RetroButton>
                  </div>
                  <LORPreview lor={lor} college={student.college} />
                </>
              ) : (
                <div className="p-6 text-center bg-[#F4EBD0]/70 border-2 border-[#303030] space-y-3">
                  <p className="text-sm font-bold text-[#182747]">
                    Letter of Recommendation not yet issued for {student.fullName}.
                  </p>
                  {isEligible ? (
                    <RetroButton variant="primary" onClick={() => issueLOR(student.id)}>
                      <ScrollText className="w-4 h-4" />
                      <span>Issue Official LOR Now</span>
                    </RetroButton>
                  ) : (
                    <p className="text-xs text-[#C94C4C] font-semibold">
                      Eligibility Rule: Student&apos;s final project must be APPROVED before
                      issuing an LOR.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 10: INTERNSHIP CHANGE LOG */}
          {activeTab === 9 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#182747]">
                <History className="w-4 h-4 text-[#4169E1]" />
                <span>INTERNSHIP CHANGE LOG</span>
              </div>
              {changeLogs.length === 0 ? (
                <div className="p-6 text-center bg-[#F4EBD0]/50 border-2 border-[#303030] text-sm text-[#303030]">
                  No internship edits have been logged for {student.fullName}.
                </div>
              ) : (
                <div className="overflow-x-auto border-2 border-[#303030] bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#182747] text-[#FFF8E7] font-mono-data uppercase">
                        <th className="p-2.5 border-r border-[#303030]">Date &amp; Time</th>
                        <th className="p-2.5 border-r border-[#303030]">Field Changed</th>
                        <th className="p-2.5 border-r border-[#303030]">Previous Value</th>
                        <th className="p-2.5 border-r border-[#303030]">New Value</th>
                        <th className="p-2.5">Admin Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#303030]/20">
                      {changeLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="p-2.5 border-r border-[#303030]/20 font-mono-data whitespace-nowrap">
                            {formatShortDate(log.changedAt)}{' '}
                            {new Date(log.changedAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="p-2.5 border-r border-[#303030]/20 font-bold text-[#182747]">
                            {log.fieldChanged}
                          </td>
                          <td className="p-2.5 border-r border-[#303030]/20 text-[#C94C4C] font-mono-data">
                            {log.previousValue}
                          </td>
                          <td className="p-2.5 border-r border-[#303030]/20 text-[#4E8B62] font-bold font-mono-data">
                            {log.newValue}
                          </td>
                          <td className="p-2.5 text-[#303030]">{log.actionDescription}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </RetroWindow>

      <InternshipConfirmDialog
        open={confirmOpen}
        studentName={student.fullName}
        changes={pendingChanges}
        existingOfferDomain={activeOffer?.domain}
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmOpen(false)}
      />

      <RegenerateOfferModal
        open={regenModalOpen}
        student={student}
        nextVersion={(offerHistory[0]?.version || 1) + 1}
        onFinalize={(date) => {
          const rec = regenerateOfferLetter(student.id, date);
          setRegenModalOpen(false);
          if (rec) {
            setToastMsg(`Offer Letter v${rec.version} (${rec.domain}) issued!`);
          }
        }}
        onCancel={() => setRegenModalOpen(false)}
      />

      <NotificationDialog
        open={Boolean(toastMsg)}
        title="PROFILE_UPDATED.EXE"
        message={toastMsg || ''}
        type="success"
        confirmLabel="OK"
        onConfirm={() => setToastMsg(null)}
      />
    </div>
  );
};
