import React, { useState, useEffect } from 'react';
import { ExternalLink, FileUp, FolderGit2, MessageSquare, UploadCloud } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { RetroWindow } from '../../components/RetroWindow';
import { RetroButton } from '../../components/RetroButton';
import { StatusBadge } from '../../components/StatusBadge';
import { NotificationDialog } from '../../components/NotificationDialog';
import { formatReadableDate } from '../../utils/idGenerators';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const ProjectSubmission: React.FC = () => {
  const { session } = useAuth();
  const { state, submitCapstoneProject } = useApp();

  const student = state.students.find((s) => s.id === session.studentId);
  const existing = state.projectSubmissions.find((p) => p.studentId === student?.id);

  const [projectTitle, setProjectTitle] = useState(existing?.projectTitle || '');
  const [projectDescription, setProjectDescription] = useState(
    existing?.projectDescription || ''
  );
  const [projectUrl, setProjectUrl] = useState(existing?.projectUrl || '');
  const [fileMeta, setFileMeta] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(
    existing
      ? { name: existing.fileName, size: existing.fileSize, type: existing.fileType }
      : null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (existing) {
      setProjectTitle(existing.projectTitle);
      setProjectDescription(existing.projectDescription);
      setProjectUrl(existing.projectUrl || '');
      setFileMeta({
        name: existing.fileName,
        size: existing.fileSize,
        type: existing.fileType,
      });
    }
  }, [existing]);

  if (!student) return null;

  const todayFormatted = formatReadableDate(new Date());
  const isApproved = existing?.status === 'APPROVED';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileMeta({
      name: file.name,
      size: formatBytes(file.size),
      type: file.type || 'application/octet-stream',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};

    if (!projectTitle.trim()) {
      next.projectTitle = 'Project title is required.';
    }
    if (!projectDescription.trim() || projectDescription.trim().length < 20) {
      next.projectDescription = 'Please provide a detailed project description (min 20 characters).';
    }
    if (!fileMeta) {
      next.file = 'Please choose a project archive or report file to upload.';
    }
    if (projectUrl.trim() && !/^https?:\/\/.+/i.test(projectUrl.trim())) {
      next.projectUrl = 'Please enter a valid URL starting with http:// or https://';
    }

    setErrors(next);
    if (Object.keys(next).length > 0 || !fileMeta) return;

    submitCapstoneProject({
      studentId: student.id,
      projectTitle,
      projectDescription,
      fileName: fileMeta.name,
      fileSize: fileMeta.size,
      fileType: fileMeta.type,
      projectUrl,
    });
    setDialogOpen(true);
  };

  const inputClass =
    'w-full px-3 py-2.5 bg-white border-2 border-[#303030] text-sm text-[#182747] focus:outline-none focus:border-[#4169E1]';
  const readonlyClass =
    'w-full px-3 py-2.5 bg-[#F4EBD0] border-2 border-[#303030] text-sm font-semibold text-[#182747] cursor-not-allowed';

  return (
    <div className="space-y-6">
      {/* Submission Form Window */}
      <RetroWindow title="PROJECT_UPLOAD.EXE" headerColor="navy">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-dotted border-[#303030]/40">
          <div>
            <h1 className="font-pixel text-xs sm:text-sm text-[#182747]">
              FINAL CAPSTONE PROJECT SUBMISSION
            </h1>
            <p className="text-sm text-[#303030] mt-1.5">
              Submit your completed domain project for Skillora Admin evaluation and certification.
            </p>
          </div>
          {existing && <StatusBadge status={existing.status} />}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                Student Name
              </label>
              <input type="text" value={student.fullName} readOnly className={readonlyClass} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                Student ID
              </label>
              <input
                type="text"
                value={student.id}
                readOnly
                className={`${readonlyClass} font-mono-data`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                Internship Domain
              </label>
              <input type="text" value={student.domain} readOnly className={readonlyClass} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                Submission Date
              </label>
              <input
                type="text"
                value={
                  existing
                    ? formatReadableDate(existing.submissionDate)
                    : todayFormatted
                }
                readOnly
                className={`${readonlyClass} font-mono-data`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="proj-title"
                className="block text-xs font-bold uppercase text-[#182747] mb-1.5"
              >
                Project Title *
              </label>
              <input
                id="proj-title"
                type="text"
                disabled={isApproved}
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. Skillora Portfolio & Analytics App"
                className={inputClass}
              />
              {errors.projectTitle && (
                <p className="text-xs font-bold text-[#C94C4C] mt-1">{errors.projectTitle}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="proj-url"
                className="block text-xs font-bold uppercase text-[#182747] mb-1.5"
              >
                GitHub / Live Project URL (Optional)
              </label>
              <input
                id="proj-url"
                type="url"
                disabled={isApproved}
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://github.com/username/project"
                className={inputClass}
              />
              {errors.projectUrl && (
                <p className="text-xs font-bold text-[#C94C4C] mt-1">{errors.projectUrl}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="proj-desc"
              className="block text-xs font-bold uppercase text-[#182747] mb-1.5"
            >
              Project Description *
            </label>
            <textarea
              id="proj-desc"
              rows={4}
              disabled={isApproved}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Summarize your project architecture, features implemented, and testing outcomes..."
              className={inputClass}
            />
            {errors.projectDescription && (
              <p className="text-xs font-bold text-[#C94C4C] mt-1">{errors.projectDescription}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="proj-file"
              className="block text-xs font-bold uppercase text-[#182747] mb-1.5"
            >
              Project File Upload *
            </label>
            <div className="p-4 bg-white border-2 border-dashed border-[#303030]">
              {!isApproved && (
                <input
                  id="proj-file"
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-[#182747] file:mr-3 file:py-2 file:px-4 file:border-2 file:border-[#303030] file:bg-[#F4EBD0] file:text-xs file:font-bold file:text-[#182747] hover:file:bg-[#e5d9b8] cursor-pointer"
                />
              )}
              {fileMeta && (
                <div className="mt-2.5 flex items-center gap-2 font-mono-data text-xs font-bold text-[#4E8B62]">
                  <FileUp className="w-4 h-4 shrink-0" />
                  <span>
                    Selected File: {fileMeta.name} ({fileMeta.size})
                  </span>
                </div>
              )}
              <p className="text-[11px] text-[#303030]/80 mt-2">
                Demo Notice: File upload is simulated in this frontend application. File metadata
                is saved locally in browser storage rather than uploaded to a remote server.
              </p>
            </div>
            {errors.file && (
              <p className="text-xs font-bold text-[#C94C4C] mt-1">{errors.file}</p>
            )}
          </div>

          {!isApproved && (
            <div className="flex justify-end pt-2">
              <RetroButton type="submit" variant="success" size="lg">
                <UploadCloud className="w-4 h-4" />
                <span>{existing ? '[ RESUBMIT PROJECT ]' : '[ SUBMIT PROJECT ]'}</span>
              </RetroButton>
            </div>
          )}
        </form>
      </RetroWindow>

      {/* Current Submission & Review Status Card */}
      {existing && (
        <RetroWindow title="SUBMISSION_REVIEW_STATUS.EXE" headerColor="blue">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <FolderGit2 className="w-5 h-5 text-[#4169E1]" />
                <h3 className="text-base font-bold text-[#182747]">{existing.projectTitle}</h3>
              </div>
              <StatusBadge status={existing.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#F4EBD0] border-2 border-[#303030] p-3.5">
              <div>
                <span className="font-bold uppercase text-[#303030]">Submitted File</span>
                <p className="font-mono-data font-bold text-[#182747] mt-0.5 break-all">
                  {existing.fileName} ({existing.fileSize})
                </p>
              </div>
              <div>
                <span className="font-bold uppercase text-[#303030]">Submission Date</span>
                <p className="font-mono-data font-bold text-[#182747] mt-0.5">
                  {formatReadableDate(existing.submissionDate)}
                </p>
              </div>
              <div>
                <span className="font-bold uppercase text-[#303030]">Repository / Demo Link</span>
                {existing.projectUrl ? (
                  <a
                    href={existing.projectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-[#4169E1] hover:underline mt-0.5 break-all"
                  >
                    <span>Open URL</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                ) : (
                  <p className="text-[#303030] mt-0.5">Not provided</p>
                )}
              </div>
            </div>

            {existing.adminFeedback && (
              <div className="p-4 bg-[#F4C542]/20 border-2 border-[#303030]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#182747] mb-1.5">
                  <MessageSquare className="w-4 h-4 text-[#4169E1]" />
                  <span>Admin Review Feedback</span>
                </div>
                <p className="text-sm text-[#182747] leading-relaxed">
                  {existing.adminFeedback}
                </p>
              </div>
            )}
          </div>
        </RetroWindow>
      )}

      <NotificationDialog
        open={dialogOpen}
        title="PROJECT_UPLOAD_SUCCESS.EXE"
        message="Your project submission metadata has been saved and queued for Skillora Admin review."
        type="success"
        confirmLabel="OK"
        onConfirm={() => setDialogOpen(false)}
      />
    </div>
  );
};
