import React, { useState } from 'react';
import {
  CheckCircle2,
  FileUp,
  Gamepad2,
  MessageSquare,
  Play,
  Send,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { InternshipTask, TaskStatus } from '../../types';
import { RetroWindow } from '../../components/RetroWindow';
import { RetroButton } from '../../components/RetroButton';
import { StatusBadge } from '../../components/StatusBadge';
import { NotificationDialog } from '../../components/NotificationDialog';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const Tasks: React.FC = () => {
  const { session } = useAuth();
  const {
    state,
    getTasksForStudent,
    getTaskSubmissionForStudent,
    startTask,
    submitTaskWork,
  } = useApp();

  const student = state.students.find((s) => s.id === session.studentId);
  const [selectedTask, setSelectedTask] = useState<InternshipTask | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');

  // Task submission modal form state
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(null);
  const [formError, setFormError] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!student) return null;

  const tasks = getTasksForStudent(student);
  const filteredTasks = tasks.filter((task) => {
    if (statusFilter === 'ALL') return true;
    const sub = getTaskSubmissionForStudent(student.id, task.id);
    const st: TaskStatus = sub?.status || 'NOT STARTED';
    return st === statusFilter;
  });

  const openTaskModal = (task: InternshipTask) => {
    const existing = getTaskSubmissionForStudent(student.id, task.id);
    setSelectedTask(task);
    setDescription(existing?.projectDescription || '');
    setSelectedFile(
      existing?.fileName
        ? {
            name: existing.fileName,
            size: existing.fileSize || 'Unknown size',
            type: existing.fileType || 'application/octet-stream',
          }
        : null
    );
    setFormError('');
  };

  const handleStartQuest = (task: InternshipTask) => {
    startTask(student.id, task.id);
    setToastMsg(`Quest #${task.taskNumber} "${task.title}" started!`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile({
      name: file.name,
      size: formatBytes(file.size),
      type: file.type || 'application/octet-stream',
    });
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    if (!description.trim() || description.trim().length < 10) {
      setFormError('Please provide a project description (at least 10 characters).');
      return;
    }
    if (!selectedFile) {
      setFormError('Please select a project file to upload (simulated metadata upload).');
      return;
    }

    submitTaskWork(student.id, selectedTask.id, {
      projectDescription: description.trim(),
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
    });
    setSelectedTask(null);
    setToastMsg(`Task #${selectedTask.taskNumber} submitted for Skillora mentor review!`);
  };

  const filterOptions: ('ALL' | TaskStatus)[] = [
    'ALL',
    'NOT STARTED',
    'IN PROGRESS',
    'SUBMITTED',
    'APPROVED',
    'NEEDS REVISION',
  ];

  return (
    <div className="space-y-6">
      <RetroWindow title="QUEST_BOARD.EXE" headerColor="navy">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b-2 border-dotted border-[#303030]/40">
          <div>
            <div className="flex items-center gap-2 text-[#4169E1]">
              <Gamepad2 className="w-5 h-5" />
              <span className="font-pixel text-[11px] sm:text-xs text-[#182747]">
                INTERNSHIP QUEST BOARD · {student.domain.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-[#303030] mt-1.5">
              Select a mission below to read guidelines, start working, and submit your task files.
            </p>
          </div>

          <div className="font-mono-data text-xs font-bold bg-[#F4EBD0] border-2 border-[#303030] px-3 py-2 shrink-0">
            TOTAL QUESTS: {tasks.length}
          </div>
        </div>

        {/* Interactive Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setStatusFilter(opt)}
              className={`px-3 py-1.5 text-xs font-mono-data font-bold border-2 border-[#303030] cursor-pointer transition-colors whitespace-nowrap ${
                statusFilter === opt
                  ? 'bg-[#4169E1] text-[#FFF8E7]'
                  : 'bg-[#F4EBD0] text-[#182747] hover:bg-[#e8dcc0]'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Quest Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {filteredTasks.length === 0 ? (
            <div className="md:col-span-2 p-8 text-center border-2 border-dashed border-[#303030]/40 bg-[#F4EBD0]/40">
              <p className="text-sm font-bold text-[#182747]">
                No quests match the &quot;{statusFilter}&quot; filter.
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const sub = getTaskSubmissionForStudent(student.id, task.id);
              const status: TaskStatus = sub?.status || 'NOT STARTED';

              return (
                <article
                  key={task.id}
                  className="bg-[#FFF8E7] border-2 border-[#303030] retro-shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="px-4 py-2 bg-[#182747] text-[#FFF8E7] border-b-2 border-[#303030] flex items-center justify-between gap-2">
                      <span className="font-pixel text-[10px] text-[#F4C542]">
                        QUEST #{String(task.taskNumber).padStart(2, '0')}
                      </span>
                      <span className="font-mono-data text-[11px] text-[#F4EBD0]">
                        DUE: {task.deadline}
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-[#182747] leading-snug">
                          {task.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={status} />
                        <span className="font-mono-data text-xs text-[#303030]">
                          {task.domain}
                        </span>
                      </div>

                      <p className="text-sm text-[#303030] leading-relaxed">
                        {task.description}
                      </p>

                      {sub?.adminFeedback && (
                        <div className="p-2.5 bg-[#F4C542]/20 border-2 border-[#303030] text-xs">
                          <div className="font-bold text-[#182747] flex items-center gap-1.5 mb-1">
                            <MessageSquare className="w-3.5 h-3.5 text-[#4169E1]" />
                            <span>Mentor Feedback:</span>
                          </div>
                          <p className="text-[#303030]">{sub.adminFeedback}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-[#F4EBD0] border-t-2 border-[#303030] flex flex-wrap items-center justify-between gap-2">
                    {status === 'NOT STARTED' && (
                      <RetroButton
                        size="sm"
                        variant="warning"
                        onClick={() => handleStartQuest(task)}
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Quest</span>
                      </RetroButton>
                    )}

                    <RetroButton
                      size="sm"
                      variant={status === 'APPROVED' ? 'success' : 'primary'}
                      onClick={() => openTaskModal(task)}
                      className="ml-auto"
                    >
                      {status === 'APPROVED' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Open &amp; Submit</span>
                        </>
                      )}
                    </RetroButton>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </RetroWindow>

      {/* Task Detail & Submission Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#182747]/70 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <RetroWindow
            title={`QUEST_#${String(selectedTask.taskNumber).padStart(2, '0')}_DETAILS.EXE`}
            headerColor="blue"
            onClose={() => setSelectedTask(null)}
            className="w-full max-w-2xl my-8"
          >
            {(() => {
              const currentSub = getTaskSubmissionForStudent(student.id, selectedTask.id);
              const currentStatus: TaskStatus = currentSub?.status || 'NOT STARTED';

              return (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#182747]">{selectedTask.title}</h3>
                      <p className="font-mono-data text-xs text-[#303030] mt-1">
                        Domain: {selectedTask.domain} · Deadline: {selectedTask.deadline}
                      </p>
                    </div>
                    <StatusBadge status={currentStatus} />
                  </div>

                  <div className="p-3.5 bg-[#F4EBD0] border-2 border-[#303030] space-y-2">
                    <h4 className="text-xs font-bold uppercase text-[#182747]">
                      Mission Brief &amp; Guidelines
                    </h4>
                    <p className="text-sm text-[#303030] leading-relaxed">
                      {selectedTask.description}
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[#182747] pt-1">
                      {selectedTask.guidelines.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>

                  {currentSub?.adminFeedback && (
                    <div className="p-3.5 bg-[#F4C542]/25 border-2 border-[#303030]">
                      <div className="text-xs font-bold uppercase text-[#182747] mb-1">
                        Admin Review Feedback
                      </div>
                      <p className="text-sm text-[#182747]">{currentSub.adminFeedback}</p>
                    </div>
                  )}

                  {currentStatus !== 'APPROVED' ? (
                    <form onSubmit={handleSubmitTask} className="space-y-4">
                      <div>
                        <label
                          htmlFor="task-desc"
                          className="block text-xs font-bold uppercase text-[#182747] mb-1.5"
                        >
                          Work Summary / Project Description *
                        </label>
                        <textarea
                          id="task-desc"
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe your implementation, tools used, and key outcomes..."
                          className="w-full px-3 py-2 bg-white border-2 border-[#303030] text-sm text-[#182747] focus:outline-none focus:border-[#4169E1]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="task-file"
                          className="block text-xs font-bold uppercase text-[#182747] mb-1.5"
                        >
                          Upload Deliverable File (Demo Metadata Simulation) *
                        </label>
                        <div className="p-3 bg-white border-2 border-dashed border-[#303030]">
                          <input
                            id="task-file"
                            type="file"
                            onChange={handleFileChange}
                            className="block w-full text-xs text-[#182747] file:mr-3 file:py-2 file:px-3 file:border-2 file:border-[#303030] file:bg-[#F4EBD0] file:text-xs file:font-bold file:text-[#182747] hover:file:bg-[#e7dbc0] cursor-pointer"
                          />
                          {selectedFile && (
                            <p className="font-mono-data text-xs text-[#4E8B62] font-bold mt-2 flex items-center gap-1.5">
                              <FileUp className="w-4 h-4" />
                              <span>
                                Ready: {selectedFile.name} ({selectedFile.size})
                              </span>
                            </p>
                          )}
                          <p className="text-[11px] text-[#303030]/80 mt-1.5">
                            Note: Frontend demo mode — file metadata is persisted locally in
                            browser storage (no remote server upload).
                          </p>
                        </div>
                      </div>

                      {formError && (
                        <p className="text-xs font-bold text-[#C94C4C]">{formError}</p>
                      )}

                      <div className="flex flex-wrap justify-end gap-3 pt-2">
                        <RetroButton
                          type="button"
                          variant="neutral"
                          onClick={() => setSelectedTask(null)}
                        >
                          Close
                        </RetroButton>
                        <RetroButton type="submit" variant="success">
                          <Send className="w-4 h-4" />
                          <span>
                            {currentStatus === 'SUBMITTED' || currentStatus === 'NEEDS REVISION'
                              ? 'Resubmit Task Work'
                              : 'Submit Task Work'}
                          </span>
                        </RetroButton>
                      </div>
                    </form>
                  ) : (
                    <div className="p-4 bg-[#4E8B62]/15 border-2 border-[#4E8B62] text-sm text-[#182747]">
                      <p className="font-bold">Task Approved!</p>
                      <p className="mt-1">
                        Submitted file:{' '}
                        <span className="font-mono-data font-bold">{currentSub?.fileName}</span> (
                        {currentSub?.fileSize})
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </RetroWindow>
        </div>
      )}

      <NotificationDialog
        open={Boolean(toastMsg)}
        title="QUEST_SYSTEM.EXE"
        message={toastMsg || ''}
        type="success"
        confirmLabel="OK"
        onConfirm={() => setToastMsg(null)}
      />
    </div>
  );
};
