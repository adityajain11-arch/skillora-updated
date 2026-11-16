import React, { useState } from 'react';
import { Check, ExternalLink, FolderGit2, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RetroWindow } from '../../components/RetroWindow';
import { RetroButton } from '../../components/RetroButton';
import { StatusBadge } from '../../components/StatusBadge';
import { NotificationDialog } from '../../components/NotificationDialog';
import { formatReadableDate } from '../../utils/idGenerators';

export const SubmissionManagement: React.FC = () => {
  const { state, reviewCapstoneProject } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'SUBMITTED' | 'APPROVED' | 'NEEDS REVISION'>('ALL');
  const [feedbackDraft, setFeedbackDraft] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const items = state.projectSubmissions.filter(
    (p) => filter === 'ALL' || p.status === filter
  );

  return (
    <div className="space-y-6">
      <RetroWindow title="SUBMISSION_REVIEW.EXE" headerColor="navy">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-dotted border-[#303030]/40">
          <div>
            <h1 className="font-pixel text-xs sm:text-sm text-[#182747]">
              CAPSTONE PROJECT REVIEW CONSOLE
            </h1>
            <p className="text-sm text-[#303030] mt-1">
              Review student project submissions, inspect deliverables, add feedback, and approve
              for certification.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(['ALL', 'SUBMITTED', 'APPROVED', 'NEEDS REVISION'] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFilter(opt)}
                className={`px-3 py-1.5 text-xs font-mono-data font-bold border-2 border-[#303030] cursor-pointer ${
                  filter === opt
                    ? 'bg-[#4169E1] text-[#FFF8E7]'
                    : 'bg-[#F4EBD0] text-[#182747] hover:bg-[#e8dcc0]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 mt-5">
          {items.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-[#303030]/40 bg-[#F4EBD0]/40 text-sm text-[#303030]">
              No capstone project submissions match the selected status.
            </div>
          ) : (
            items.map((proj) => {
              const currentFeedback =
                feedbackDraft[proj.id] !== undefined
                  ? feedbackDraft[proj.id]
                  : proj.adminFeedback || '';

              return (
                <article
                  key={proj.id}
                  className="bg-[#FFF8E7] border-2 border-[#303030] retro-shadow-sm p-4 sm:p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 font-mono-data text-xs text-[#4169E1] font-bold">
                        <FolderGit2 className="w-4 h-4" />
                        <span>
                          {proj.studentId} · {proj.studentName} · {proj.domain}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#182747] mt-1">
                        {proj.projectTitle}
                      </h3>
                    </div>
                    <StatusBadge status={proj.status} />
                  </div>

                  <p className="text-sm text-[#303030] leading-relaxed">
                    {proj.projectDescription}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#F4EBD0] border-2 border-[#303030] text-xs">
                    <div>
                      <span className="font-bold uppercase text-[#303030]">File Metadata</span>
                      <p className="font-mono-data font-bold text-[#182747] mt-0.5 break-all">
                        {proj.fileName} ({proj.fileSize})
                      </p>
                    </div>
                    <div>
                      <span className="font-bold uppercase text-[#303030]">Submitted On</span>
                      <p className="font-mono-data font-bold text-[#182747] mt-0.5">
                        {formatReadableDate(proj.submissionDate)}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold uppercase text-[#303030]">Project URL</span>
                      {proj.projectUrl ? (
                        <a
                          href={proj.projectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-[#4169E1] hover:underline mt-0.5"
                        >
                          <span>Open Repository / Demo</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <p className="text-[#303030] mt-0.5">No external URL provided</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor={`fb-${proj.id}`}
                      className="block text-xs font-bold uppercase text-[#182747]"
                    >
                      Admin Evaluation Feedback
                    </label>
                    <textarea
                      id={`fb-${proj.id}`}
                      rows={2}
                      value={currentFeedback}
                      onChange={(e) =>
                        setFeedbackDraft((prev) => ({ ...prev, [proj.id]: e.target.value }))
                      }
                      placeholder="Write constructive feedback or approval remarks..."
                      className="w-full px-3 py-2 bg-white border-2 border-[#303030] text-sm text-[#182747]"
                    />
                  </div>

                  <div className="flex flex-wrap justify-end gap-3">
                    <RetroButton
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        reviewCapstoneProject(
                          proj.id,
                          'NEEDS REVISION',
                          currentFeedback ||
                            'Please address the mentor notes and resubmit your capstone project.'
                        );
                        setToastMsg(
                          `Marked ${proj.studentName}'s project as NEEDS REVISION.`
                        );
                      }}
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Request Revision</span>
                    </RetroButton>

                    <RetroButton
                      size="sm"
                      variant="success"
                      onClick={() => {
                        reviewCapstoneProject(
                          proj.id,
                          'APPROVED',
                          currentFeedback ||
                            'Project approved! You are now eligible for your Skillora Certificate and LOR.'
                        );
                        setToastMsg(
                          `Approved ${proj.studentName}'s project! They are now eligible for Certificate & LOR.`
                        );
                      }}
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Project</span>
                    </RetroButton>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </RetroWindow>

      <NotificationDialog
        open={Boolean(toastMsg)}
        title="REVIEW_RECORDED.EXE"
        message={toastMsg || ''}
        type="success"
        confirmLabel="OK"
        onConfirm={() => setToastMsg(null)}
      />
    </div>
  );
};
