import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Bell,
  Calendar,
  Check,
  CheckSquare,
  ClipboardCheck,
  Clock,
  FileText,
  Gamepad2,
  Layers,
  TrendingUp,
  UploadCloud,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Logo } from '../../components/Logo';
import { RetroWindow } from '../../components/RetroWindow';
import { RetroButton } from '../../components/RetroButton';
import { DashboardCard } from '../../components/DashboardCard';
import { ProgressTracker } from '../../components/ProgressTracker';
import { StatusBadge } from '../../components/StatusBadge';
import { formatShortDate } from '../../utils/idGenerators';

export const Dashboard: React.FC = () => {
  const { session } = useAuth();
  const {
    state,
    getTasksForStudent,
    getTaskSubmissionForStudent,
    getNotificationsForStudent,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();
  const navigate = useNavigate();

  const student = state.students.find((s) => s.id === session.studentId);
  if (!student) return null;

  const tasks = getTasksForStudent(student);
  const taskRecords = tasks.map((t) => ({
    task: t,
    submission: getTaskSubmissionForStudent(student.id, t.id),
  }));

  const totalTasks = tasks.length;
  const completedTasks = taskRecords.filter(
    (r) => r.submission?.status === 'APPROVED'
  ).length;
  const submittedTasks = taskRecords.filter(
    (r) => r.submission?.status === 'SUBMITTED' || r.submission?.status === 'APPROVED'
  ).length;
  const pendingTasks = totalTasks - completedTasks;

  const projectSub = state.projectSubmissions.find((p) => p.studentId === student.id);
  const certificate = state.certificates.find((c) => c.studentId === student.id);
  const lor = state.lors.find((l) => l.studentId === student.id);
  const notifications = getNotificationsForStudent(student.id);
  const unreadNotifs = notifications.filter((n) => !n.read);

  let overallProgress = 60;
  if (certificate || lor) {
    overallProgress = 100;
  } else if (projectSub?.status === 'APPROVED') {
    overallProgress = 90;
  } else {
    const taskFactor =
      totalTasks > 0
        ? Math.round(
            ((completedTasks + (submittedTasks - completedTasks) * 0.5) / totalTasks) * 18
          )
        : 0;
    const projectFactor =
      projectSub?.status === 'SUBMITTED' ? 10 : projectSub?.status === 'NEEDS REVISION' ? 5 : 0;
    overallProgress = Math.min(88, 60 + taskFactor + projectFactor);
  }

  return (
    <div className="space-y-6">
      {/* Welcome Window */}
      <RetroWindow title="INTERNSHIP_BRIEFING.EXE" headerColor="blue">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <Logo size="md" />
            <h1 className="font-pixel text-xs sm:text-sm text-[#182747] pt-1 leading-relaxed">
              YOUR INTERNSHIP JOURNEY STARTS HERE!
            </h1>
            <p className="text-sm text-[#303030] max-w-2xl leading-relaxed">
              Complete your assigned tasks, submit your projects and unlock your Skillora
              achievement.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono-data text-[#182747] pt-1">
              <span className="inline-flex items-center gap-1.5 font-bold">
                <Calendar className="w-3.5 h-3.5 text-[#4169E1]" />
                Start: {student.internshipStartDate}
              </span>
              <span>·</span>
              <span className="font-bold">End: {student.internshipEndDate}</span>
              <span>·</span>
              <span className="font-bold">Duration: {student.internshipDuration}</span>
              <span>·</span>
              <span className="font-bold text-[#C94C4C]">
                Project Due: {student.projectDeadline}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <RetroButton variant="primary" onClick={() => navigate('/student/tasks')}>
              <Gamepad2 className="w-4 h-4" />
              <span>Open Quest Board</span>
            </RetroButton>
            <RetroButton variant="neutral" onClick={() => navigate('/student/offer-letter')}>
              <FileText className="w-4 h-4" />
              <span>My Offer Letter</span>
            </RetroButton>
          </div>
        </div>
      </RetroWindow>

      {/* Admin Updates & Student Notifications */}
      {notifications.length > 0 && (
        <RetroWindow
          title={`STUDENT_NOTIFICATIONS.EXE (${unreadNotifs.length} UNREAD)`}
          headerColor={unreadNotifs.length > 0 ? 'green' : 'navy'}
          rightSlot={
            unreadNotifs.length > 0 ? (
              <button
                type="button"
                onClick={() => markAllNotificationsRead(student.id)}
                className="px-2 py-0.5 bg-[#F4C542] text-[#182747] border border-[#303030] text-[10px] font-bold cursor-pointer hover:brightness-105"
              >
                Mark All Read
              </button>
            ) : undefined
          }
        >
          <div className="space-y-2">
            {notifications.slice(0, 6).map((notif) => (
              <div
                key={notif.id}
                className={`p-3 border-2 border-[#303030] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                  notif.read ? 'bg-[#F4EBD0]/40 text-[#303030]' : 'bg-[#F4C542]/20 text-[#182747]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <Bell
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      notif.read ? 'text-[#303030]' : 'text-[#4169E1]'
                    }`}
                  />
                  <div>
                    <p className={notif.read ? 'font-medium' : 'font-bold'}>{notif.message}</p>
                    <p className="font-mono-data text-[10px] text-[#303030]/80 mt-0.5">
                      {formatShortDate(notif.createdAt)}{' '}
                      {new Date(notif.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                {!notif.read ? (
                  <RetroButton
                    size="sm"
                    variant="neutral"
                    onClick={() => markNotificationRead(notif.id)}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Read</span>
                  </RetroButton>
                ) : (
                  <span className="font-mono-data text-[10px] uppercase text-[#4E8B62] font-bold">
                    READ
                  </span>
                )}
              </div>
            ))}
          </div>
        </RetroWindow>
      )}

      {/* 5-Step Journey Tracker */}
      <ProgressTracker
        hasOfferLetter={student.offerLetterStatus === 'GENERATED'}
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        submittedTasks={submittedTasks}
        projectStatus={projectSub?.status || 'NONE'}
        certificateIssued={Boolean(certificate)}
        lorIssued={Boolean(lor)}
      />

      {/* 9 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Internship Status"
          value={student.internshipStatus}
          subtitle={`ID: ${student.id}`}
          accent="green"
          icon={<CheckSquare className="w-4 h-4" />}
        />
        <DashboardCard
          title="Offer Letter Status"
          value={student.offerLetterStatus}
          subtitle={`Ref: ${student.offerLetterNumber}`}
          accent="blue"
          icon={<FileText className="w-4 h-4" />}
        />
        <DashboardCard
          title="Selected Domain"
          value={student.domain}
          subtitle={`${student.internshipDuration} · Ends ${student.internshipEndDate}`}
          accent="navy"
          icon={<Layers className="w-4 h-4" />}
        />
        <DashboardCard
          title="Total Assigned Tasks"
          value={totalTasks}
          subtitle="Domain quest modules"
          accent="navy"
          icon={<Gamepad2 className="w-4 h-4" />}
        />
        <DashboardCard
          title="Completed Tasks"
          value={completedTasks}
          subtitle="Approved by Skillora mentor"
          accent="green"
          icon={<ClipboardCheck className="w-4 h-4" />}
        />
        <DashboardCard
          title="Pending Tasks"
          value={pendingTasks}
          subtitle="Remaining tasks to finish"
          accent={pendingTasks > 0 ? 'yellow' : 'green'}
          icon={<Clock className="w-4 h-4" />}
        />
        <DashboardCard
          title="Overall Progress"
          value={`${overallProgress}%`}
          subtitle="Journey completion meter"
          accent="blue"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <DashboardCard
          title="Project Submission Status"
          value={projectSub ? projectSub.status : 'NOT SUBMITTED'}
          subtitle={
            projectSub
              ? projectSub.projectTitle
              : `Deadline: ${student.projectDeadline}`
          }
          accent={
            projectSub?.status === 'APPROVED'
              ? 'green'
              : projectSub?.status === 'NEEDS REVISION'
              ? 'red'
              : 'yellow'
          }
          icon={<UploadCloud className="w-4 h-4" />}
        />
        <DashboardCard
          title="Certificate Status"
          value={certificate ? 'ISSUED' : 'LOCKED'}
          subtitle={
            certificate
              ? `ID: ${certificate.certificateId}`
              : 'Unlocks after project approval'
          }
          accent={certificate ? 'green' : 'navy'}
          icon={<Award className="w-4 h-4" />}
        />
      </div>

      {/* Assigned Quests Preview */}
      <RetroWindow title="ASSIGNED_DOMAIN_QUESTS.EXE" headerColor="navy">
        <div className="space-y-3">
          {taskRecords.length === 0 ? (
            <p className="text-sm text-[#303030]">
              No tasks assigned yet for {student.domain}.
            </p>
          ) : (
            <div className="divide-y-2 divide-dotted divide-[#303030]/30">
              {taskRecords.map(({ task, submission }) => {
                const status = submission?.status || 'NOT STARTED';
                return (
                  <div
                    key={task.id}
                    className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-mono-data text-xs font-bold text-[#4169E1]">
                        QUEST #{String(task.taskNumber).padStart(2, '0')} · DEADLINE: {task.deadline}
                      </div>
                      <h4 className="text-sm font-bold text-[#182747] mt-0.5">{task.title}</h4>
                      <p className="text-xs text-[#303030] mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={status} />
                      <RetroButton
                        size="sm"
                        variant="neutral"
                        onClick={() => navigate('/student/tasks')}
                      >
                        Open
                      </RetroButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </RetroWindow>
    </div>
  );
};
