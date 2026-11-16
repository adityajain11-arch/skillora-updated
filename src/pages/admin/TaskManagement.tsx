import React, { useState } from 'react';
import { Check, Edit3, Plus, RotateCcw, Trash2, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INTERNSHIP_DOMAINS, InternshipDomain, InternshipTask } from '../../types';
import { RetroWindow } from '../../components/RetroWindow';
import { RetroButton } from '../../components/RetroButton';
import { StatusBadge } from '../../components/StatusBadge';
import { NotificationDialog } from '../../components/NotificationDialog';

export const TaskManagement: React.FC = () => {
  const { state, createTask, updateTask, deleteTask, reviewTaskSubmission } = useApp();

  const [tab, setTab] = useState<'tasks' | 'reviews'>('tasks');
  const [domainFilter, setDomainFilter] = useState<string>('ALL');

  // Task Create/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<InternshipTask | null>(null);
  const [formDomain, setFormDomain] = useState<InternshipDomain>('Web Development');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formGuidelines, setFormGuidelines] = useState('');
  const [formDeadline, setFormDeadline] = useState('2026-12-20');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  // Assigned Students Viewer Modal
  const [viewingAssignedTask, setViewingAssignedTask] = useState<InternshipTask | null>(null);

  // Feedback input map for task reviews
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filteredTasks = state.tasks.filter(
    (t) => domainFilter === 'ALL' || t.domain === domainFilter
  );

  const openCreateModal = () => {
    setEditingTask(null);
    setFormDomain('Web Development');
    setFormTitle('');
    setFormDesc('');
    setFormGuidelines(
      'Follow clean code structure\nEnsure full responsiveness\nInclude README documentation'
    );
    setFormDeadline('2026-12-20');
    setSelectedStudentIds([]);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (task: InternshipTask) => {
    setEditingTask(task);
    setFormDomain(task.domain);
    setFormTitle(task.title);
    setFormDesc(task.description);
    setFormGuidelines(task.guidelines.join('\n'));
    setFormDeadline(task.deadline);
    setSelectedStudentIds(task.assignedStudentIds);
    setFormError('');
    setModalOpen(true);
  };

  const toggleStudentAssignment = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim() || !formDeadline) {
      setFormError('Title, description, and deadline are required.');
      return;
    }

    const guidelinesList = formGuidelines
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (editingTask) {
      updateTask(editingTask.id, {
        domain: formDomain,
        title: formTitle.trim(),
        description: formDesc.trim(),
        guidelines: guidelinesList,
        deadline: formDeadline,
        assignedStudentIds: selectedStudentIds,
      });
      setToastMsg(`Updated task "${formTitle.trim()}".`);
    } else {
      createTask({
        domain: formDomain,
        title: formTitle.trim(),
        description: formDesc.trim(),
        guidelines: guidelinesList,
        deadline: formDeadline,
        assignedStudentIds: selectedStudentIds,
      });
      setToastMsg(`Created new task for ${formDomain}.`);
    }
    setModalOpen(false);
  };

  const domainStudents = state.students.filter((s) => s.domain === formDomain);

  // Task submissions for Review Queue
  const submittedTaskItems = state.taskSubmissions.filter(
    (s) => s.status === 'SUBMITTED' || s.status === 'NEEDS REVISION' || s.status === 'APPROVED'
  );

  return (
    <div className="space-y-6">
      <RetroWindow title="QUEST_MANAGER.EXE" headerColor="navy">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-dotted border-[#303030]/40">
          <div className="flex flex-wrap gap-2">
            <RetroButton
              size="sm"
              variant={tab === 'tasks' ? 'primary' : 'neutral'}
              onClick={() => setTab('tasks')}
            >
              <span>Manage Domain Tasks ({state.tasks.length})</span>
            </RetroButton>
            <RetroButton
              size="sm"
              variant={tab === 'reviews' ? 'primary' : 'neutral'}
              onClick={() => setTab('reviews')}
            >
              <span>Review Task Submissions ({submittedTaskItems.length})</span>
            </RetroButton>
          </div>

          {tab === 'tasks' && (
            <RetroButton size="sm" variant="success" onClick={openCreateModal}>
              <Plus className="w-4 h-4" />
              <span>Create New Task</span>
            </RetroButton>
          )}
        </div>

        {tab === 'tasks' ? (
          <>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="w-full sm:w-72">
                <select
                  aria-label="Filter tasks by domain"
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
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
              <span className="font-mono-data text-xs font-bold text-[#182747]">
                SHOWING {filteredTasks.length} QUESTS
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {filteredTasks.map((task) => {
                const eligibleStudents = state.students.filter(
                  (s) =>
                    s.domain === task.domain &&
                    (task.assignedStudentIds.length === 0 ||
                      task.assignedStudentIds.includes(s.id))
                );

                return (
                  <div
                    key={task.id}
                    className="p-4 bg-[#FFF8E7] border-2 border-[#303030] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 font-mono-data text-xs">
                        <span className="font-bold text-[#4169E1]">
                          QUEST #{String(task.taskNumber).padStart(2, '0')}
                        </span>
                        <span>·</span>
                        <span className="font-bold text-[#182747]">{task.domain}</span>
                        <span>·</span>
                        <span className="text-[#303030]">Deadline: {task.deadline}</span>
                      </div>
                      <h3 className="text-base font-bold text-[#182747]">{task.title}</h3>
                      <p className="text-sm text-[#303030]">{task.description}</p>
                      <p className="text-xs font-mono-data text-[#4E8B62] font-bold pt-1">
                        Assigned to:{' '}
                        {task.assignedStudentIds.length === 0
                          ? `All ${task.domain} Interns (${eligibleStudents.length})`
                          : `${task.assignedStudentIds.length} Selected Intern(s)`}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <RetroButton
                        size="sm"
                        variant="neutral"
                        onClick={() => setViewingAssignedTask(task)}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Students ({eligibleStudents.length})</span>
                      </RetroButton>
                      <RetroButton
                        size="sm"
                        variant="primary"
                        onClick={() => openEditModal(task)}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </RetroButton>
                      <RetroButton
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          deleteTask(task.id);
                          setToastMsg(`Deleted task "${task.title}".`);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </RetroButton>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-4 mt-4">
            {submittedTaskItems.length === 0 ? (
              <p className="p-6 text-center text-sm text-[#303030]">
                No task submissions received yet.
              </p>
            ) : (
              submittedTaskItems.map((sub) => {
                const student = state.students.find((s) => s.id === sub.studentId);
                const task = state.tasks.find((t) => t.id === sub.taskId);
                if (!student || !task) return null;

                const draftFeedback =
                  feedbackMap[sub.id] !== undefined
                    ? feedbackMap[sub.id]
                    : sub.adminFeedback || '';

                return (
                  <div
                    key={sub.id}
                    className="p-4 bg-[#FFF8E7] border-2 border-[#303030] space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="font-mono-data text-xs text-[#4169E1] font-bold">
                          {student.id} · {student.fullName} · {task.domain}
                        </div>
                        <h4 className="text-base font-bold text-[#182747] mt-0.5">
                          Quest #{task.taskNumber}: {task.title}
                        </h4>
                      </div>
                      <StatusBadge status={sub.status} />
                    </div>

                    <p className="text-sm text-[#303030]">{sub.projectDescription}</p>
                    {sub.fileName && (
                      <p className="font-mono-data text-xs text-[#182747] font-semibold">
                        File Metadata: {sub.fileName} ({sub.fileSize})
                      </p>
                    )}

                    <div className="pt-2 border-t border-dotted border-[#303030]/40 space-y-2">
                      <label className="block text-xs font-bold uppercase text-[#182747]">
                        Mentor Feedback
                      </label>
                      <textarea
                        rows={2}
                        value={draftFeedback}
                        onChange={(e) =>
                          setFeedbackMap((prev) => ({ ...prev, [sub.id]: e.target.value }))
                        }
                        placeholder="Add review notes for the intern..."
                        className="w-full px-3 py-2 bg-white border-2 border-[#303030] text-sm text-[#182747]"
                      />
                      <div className="flex flex-wrap justify-end gap-2">
                        <RetroButton
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            reviewTaskSubmission(
                              sub.id,
                              'NEEDS REVISION',
                              draftFeedback || 'Please revise and resubmit according to task guidelines.'
                            );
                            setToastMsg(`Requested revision for ${student.fullName}.`);
                          }}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Request Revision</span>
                        </RetroButton>
                        <RetroButton
                          size="sm"
                          variant="success"
                          onClick={() => {
                            reviewTaskSubmission(
                              sub.id,
                              'APPROVED',
                              draftFeedback || 'Task deliverable approved!'
                            );
                            setToastMsg(`Approved task submission for ${student.fullName}.`);
                          }}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Task</span>
                        </RetroButton>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </RetroWindow>

      {/* Create / Edit Task Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#182747]/70 flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <RetroWindow
            title={editingTask ? 'EDIT_TASK.EXE' : 'CREATE_NEW_TASK.EXE'}
            headerColor="blue"
            onClose={() => setModalOpen(false)}
            className="w-full max-w-2xl my-6"
          >
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                    Internship Domain *
                  </label>
                  <select
                    value={formDomain}
                    onChange={(e) => {
                      setFormDomain(e.target.value as InternshipDomain);
                      setSelectedStudentIds([]);
                    }}
                    className="w-full px-3 py-2 bg-white border-2 border-[#303030] text-sm text-[#182747]"
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
                    Submission Deadline *
                  </label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-[#303030] text-sm text-[#182747] font-mono-data"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Enter concise quest title"
                  className="w-full px-3 py-2 bg-white border-2 border-[#303030] text-sm text-[#182747]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                  Task Description *
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Describe the objective and expected outcome..."
                  className="w-full px-3 py-2 bg-white border-2 border-[#303030] text-sm text-[#182747]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                  Detailed Guidelines (one per line)
                </label>
                <textarea
                  rows={3}
                  value={formGuidelines}
                  onChange={(e) => setFormGuidelines(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-[#303030] text-sm text-[#182747]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                  Assign to Specific Students in {formDomain} (leave all unchecked to assign to
                  entire domain)
                </label>
                <div className="max-h-32 overflow-y-auto p-2.5 bg-white border-2 border-[#303030] space-y-1.5">
                  {domainStudents.length === 0 ? (
                    <p className="text-xs text-[#303030]">
                      No students enrolled in {formDomain} yet — task will auto-assign when they
                      register.
                    </p>
                  ) : (
                    domainStudents.map((stu) => (
                      <label
                        key={stu.id}
                        className="flex items-center gap-2 text-xs text-[#182747] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(stu.id)}
                          onChange={() => toggleStudentAssignment(stu.id)}
                          className="accent-[#4169E1]"
                        />
                        <span className="font-mono-data font-bold">{stu.id}</span>
                        <span>{stu.fullName}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {formError && <p className="text-xs font-bold text-[#C94C4C]">{formError}</p>}

              <div className="flex justify-end gap-2.5 pt-2">
                <RetroButton
                  type="button"
                  variant="neutral"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </RetroButton>
                <RetroButton type="submit" variant="success">
                  {editingTask ? 'Save Task Updates' : 'Create & Assign Task'}
                </RetroButton>
              </div>
            </form>
          </RetroWindow>
        </div>
      )}

      {/* Assigned Students Modal */}
      {viewingAssignedTask && (
        <div
          className="fixed inset-0 z-50 bg-[#182747]/70 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <RetroWindow
            title={`ASSIGNED_STUDENTS_${viewingAssignedTask.id}.EXE`}
            headerColor="navy"
            onClose={() => setViewingAssignedTask(null)}
            className="w-full max-w-lg"
          >
            <h4 className="text-sm font-bold text-[#182747] mb-3">
              {viewingAssignedTask.title} ({viewingAssignedTask.domain})
            </h4>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {state.students
                .filter(
                  (s) =>
                    s.domain === viewingAssignedTask.domain &&
                    (viewingAssignedTask.assignedStudentIds.length === 0 ||
                      viewingAssignedTask.assignedStudentIds.includes(s.id))
                )
                .map((s) => {
                  const sub = state.taskSubmissions.find(
                    (ts) => ts.studentId === s.id && ts.taskId === viewingAssignedTask.id
                  );
                  return (
                    <div
                      key={s.id}
                      className="p-2.5 bg-[#F4EBD0] border-2 border-[#303030] flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#182747]">{s.fullName}</span>
                        <span className="font-mono-data text-[#303030] ml-2">{s.id}</span>
                      </div>
                      <StatusBadge status={sub?.status || 'NOT STARTED'} />
                    </div>
                  );
                })}
            </div>
          </RetroWindow>
        </div>
      )}

      <NotificationDialog
        open={Boolean(toastMsg)}
        title="QUEST_MANAGER_LOG.EXE"
        message={toastMsg || ''}
        type="success"
        confirmLabel="OK"
        onConfirm={() => setToastMsg(null)}
      />
    </div>
  );
};
