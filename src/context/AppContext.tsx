import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CertificateRecord,
  InternshipChangeLogEntry,
  InternshipDomain,
  InternshipStatus,
  InternshipTask,
  LORRecord,
  OfferLetterRecord,
  PortalState,
  ProjectSubmission,
  Student,
  StudentNotification,
  SubmissionStatus,
  TaskStatus,
  TaskSubmissionRecord,
} from '../types';
import {
  PORTAL_STORAGE_KEY,
  loadPortalState,
  resetPortalState,
  savePortalState,
} from '../services/storageService';
import {
  formatReadableDate,
  generateCertificateId,
  generateLORId,
  generateOfferLetterNumber,
  generateStudentId,
} from '../utils/idGenerators';
import { initialSeedState } from '../data/seedData';
import {
  fetchExistingSupabaseStudentIdsAndEmails,
  fetchStudentByCredentialsFromSupabase,
  insertStudentRegistrationToSupabase,
  loadPortalStateFromSupabase,
  seedFullStateToSupabase,
} from '../services/supabaseSyncService';

export interface RegisterStudentInput {
  fullName: string;
  email: string;
  mobile: string;
  college: string;
  course: string;
  semester: string;
  domain: InternshipDomain;
  password: string;
}

export interface InternshipEditPayload {
  domain?: InternshipDomain;
  internshipStartDate?: string;
  internshipEndDate?: string;
  internshipDuration?: string;
  projectDeadline?: string;
  internshipStatus?: InternshipStatus;
}

export type RegisterStudentResult =
  | { ok: true; student: Student; supabaseSynced: boolean; syncError?: string }
  | { ok: false; error: string };

interface AppContextValue {
  state: PortalState;
  registerStudent: (input: RegisterStudentInput) => Promise<RegisterStudentResult>;
  authenticateStudent: (email: string, password: string) => Promise<Student | null>;
  refreshFromSupabase: () => Promise<boolean>;
  syncDemoDataToSupabase: () => Promise<{ ok: boolean; error?: string }>;
  updateStudentProfile: (
    studentId: string,
    updates: Partial<Pick<Student, 'fullName' | 'mobile' | 'college' | 'course' | 'semester'>>
  ) => void;
  updateStudentStatus: (studentId: string, status: InternshipStatus) => void;
  updateStudentInternshipDetails: (
    studentId: string,
    updates: InternshipEditPayload,
    actionDescription?: string
  ) => void;
  regenerateOfferLetter: (studentId: string, customIssueDate?: string) => OfferLetterRecord | null;
  getOfferLettersForStudent: (studentId: string) => OfferLetterRecord[];
  getActiveOfferLetterForStudent: (studentId: string) => OfferLetterRecord | undefined;
  getChangeLogsForStudent: (studentId: string) => InternshipChangeLogEntry[];
  getNotificationsForStudent: (studentId: string) => StudentNotification[];
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: (studentId: string) => void;
  getTasksForStudent: (student: Student) => InternshipTask[];
  getTaskSubmissionForStudent: (
    studentId: string,
    taskId: string
  ) => TaskSubmissionRecord | undefined;
  startTask: (studentId: string, taskId: string) => void;
  submitTaskWork: (
    studentId: string,
    taskId: string,
    payload: {
      projectDescription: string;
      fileName: string;
      fileSize: string;
      fileType: string;
    }
  ) => void;
  reviewTaskSubmission: (
    submissionId: string,
    status: 'APPROVED' | 'NEEDS REVISION',
    feedback: string
  ) => void;
  createTask: (input: {
    domain: InternshipDomain;
    title: string;
    description: string;
    guidelines: string[];
    deadline: string;
    assignedStudentIds?: string[];
  }) => void;
  updateTask: (
    taskId: string,
    updates: Partial<Omit<InternshipTask, 'id' | 'createdAt'>>,
    affectedStudentId?: string
  ) => void;
  deleteTask: (taskId: string, affectedStudentId?: string) => void;
  submitCapstoneProject: (payload: {
    studentId: string;
    projectTitle: string;
    projectDescription: string;
    fileName: string;
    fileSize: string;
    fileType: string;
    projectUrl?: string;
  }) => ProjectSubmission;
  reviewCapstoneProject: (
    projectId: string,
    status: SubmissionStatus,
    feedback: string
  ) => void;
  issueCertificate: (studentId: string) => CertificateRecord | null;
  issueLOR: (studentId: string) => LORRecord | null;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(base: Date, days: number): Date {
  const copy = new Date(base);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PortalState>(() => loadPortalState());

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === PORTAL_STORAGE_KEY) {
        setState(loadPortalState());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const commit = useCallback((updater: (prev: PortalState) => PortalState) => {
    setState((prev) => {
      const next = updater(prev);
      savePortalState(next);
      return next;
    });
  }, []);

  const refreshFromSupabase = useCallback(async (): Promise<boolean> => {
    try {
      const remote = await loadPortalStateFromSupabase();
      if (!remote) return false;

      const hasRemoteStudents = (remote.students?.length ?? 0) > 0;
      const hasRemoteTasks = (remote.tasks?.length ?? 0) > 0;

      if (!hasRemoteStudents && !hasRemoteTasks) {
        return true;
      }

      commit((prev) => ({
        students: hasRemoteStudents ? remote.students! : prev.students,
        offerLetters:
          (remote.offerLetters?.length ?? 0) > 0
            ? remote.offerLetters!
            : hasRemoteStudents
            ? []
            : prev.offerLetters,
        changeLogs:
          (remote.changeLogs?.length ?? 0) > 0
            ? remote.changeLogs!
            : hasRemoteStudents
            ? []
            : prev.changeLogs,
        notifications:
          (remote.notifications?.length ?? 0) > 0
            ? remote.notifications!
            : hasRemoteStudents
            ? []
            : prev.notifications,
        tasks: hasRemoteTasks
          ? remote.tasks!
          : prev.tasks.length > 0
          ? prev.tasks
          : initialSeedState.tasks,
        taskSubmissions:
          (remote.taskSubmissions?.length ?? 0) > 0
            ? remote.taskSubmissions!
            : hasRemoteStudents
            ? []
            : prev.taskSubmissions,
        projectSubmissions:
          (remote.projectSubmissions?.length ?? 0) > 0
            ? remote.projectSubmissions!
            : hasRemoteStudents
            ? []
            : prev.projectSubmissions,
        certificates:
          (remote.certificates?.length ?? 0) > 0
            ? remote.certificates!
            : hasRemoteStudents
            ? []
            : prev.certificates,
        lors:
          (remote.lors?.length ?? 0) > 0
            ? remote.lors!
            : hasRemoteStudents
            ? []
            : prev.lors,
      }));
      return true;
    } catch {
      return false;
    }
  }, [commit]);

  useEffect(() => {
    void refreshFromSupabase();
  }, [refreshFromSupabase]);

  const registerStudent = useCallback(
    async (input: RegisterStudentInput): Promise<RegisterStudentResult> => {
      const normalizedEmail = input.email.trim().toLowerCase();

      const remoteCheck = await fetchExistingSupabaseStudentIdsAndEmails().catch(() => ({
        ok: false,
        ids: [] as string[],
        emails: [] as string[],
      }));

      const duplicateLocal = state.students.some(
        (s) => s.email.trim().toLowerCase() === normalizedEmail
      );
      const duplicateRemote = remoteCheck.ok && remoteCheck.emails.includes(normalizedEmail);

      if (duplicateLocal || duplicateRemote) {
        return {
          ok: false,
          error: 'An account with this email address is already registered in Skillora.',
        };
      }

      const idPool: Student[] = [
        ...state.students,
        ...remoteCheck.ids.map((rid) => ({ id: rid } as Student)),
      ];

      const now = new Date();
      const id = generateStudentId(idPool);
      const offerNumber = generateOfferLetterNumber(id);
      const formattedOfferDate = now.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      const newStudent: Student = {
        id,
        fullName: input.fullName.trim(),
        email: normalizedEmail,
        mobile: input.mobile.trim(),
        college: input.college.trim(),
        course: input.course.trim(),
        semester: input.semester.trim(),
        domain: input.domain,
        password: input.password,
        registrationDate: now.toISOString(),
        internshipStartDate: toIsoDate(now),
        internshipEndDate: toIsoDate(addDays(now, 42)),
        internshipDuration: '6 Weeks',
        projectDeadline: toIsoDate(addDays(now, 38)),
        offerLetterDate: formattedOfferDate,
        offerLetterNumber: offerNumber,
        offerLetterStatus: 'GENERATED',
        internshipStatus: 'Offer Letter Issued',
      };

      const initialOffer: OfferLetterRecord = {
        id: `OLR-${Date.now()}`,
        offerLetterNumber: offerNumber,
        version: 1,
        studentId: id,
        studentName: newStudent.fullName,
        domain: newStudent.domain,
        issueDate: formattedOfferDate,
        createdAt: now.toISOString(),
        isCurrent: true,
        note: 'Initial automatic offer letter generated upon registration.',
      };

      const welcomeNotif: StudentNotification = {
        id: `NTF-${Date.now()}`,
        studentId: id,
        message: `Welcome to Skillora! Your official Offer Letter for ${newStudent.domain} has been generated.`,
        createdAt: now.toISOString(),
        read: false,
        category: 'offer-letter',
      };

      const supaRes = await insertStudentRegistrationToSupabase(
        newStudent,
        initialOffer,
        welcomeNotif
      ).catch((err: unknown) => ({
        ok: false,
        duplicateEmail: false,
        error: err instanceof Error ? err.message : 'Supabase request failed',
      }));

      if (!supaRes.ok && supaRes.duplicateEmail) {
        return {
          ok: false,
          error:
            supaRes.error ||
            'An account with this email address is already registered in Skillora.',
        };
      }

      commit((prev) => ({
        ...prev,
        students: [newStudent, ...prev.students],
        offerLetters: [initialOffer, ...prev.offerLetters],
        notifications: [welcomeNotif, ...prev.notifications],
      }));

      return {
        ok: true,
        student: newStudent,
        supabaseSynced: supaRes.ok,
        syncError: supaRes.ok ? undefined : supaRes.error,
      };
    },
    [state.students, commit]
  );

  const authenticateStudent = useCallback(
    async (email: string, password: string): Promise<Student | null> => {
      const normalized = email.trim().toLowerCase();
      const localMatch = state.students.find(
        (s) => s.email.toLowerCase() === normalized && s.password === password
      );
      if (localMatch) return localMatch;

      try {
        const remoteStudent = await fetchStudentByCredentialsFromSupabase(normalized, password);
        if (remoteStudent) {
          commit((prev) => ({
            ...prev,
            students: prev.students.some((s) => s.id === remoteStudent.id)
              ? prev.students.map((s) => (s.id === remoteStudent.id ? remoteStudent : s))
              : [remoteStudent, ...prev.students],
          }));
          return remoteStudent;
        }
      } catch {
        // fallback to null
      }
      return null;
    },
    [state.students, commit]
  );

  const syncDemoDataToSupabase = useCallback(async (): Promise<{
    ok: boolean;
    error?: string;
  }> => {
    try {
      return await seedFullStateToSupabase(state);
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Failed to sync dataset to Supabase.',
      };
    }
  }, [state]);

  const updateStudentProfile = useCallback(
    (
      studentId: string,
      updates: Partial<Pick<Student, 'fullName' | 'mobile' | 'college' | 'course' | 'semester'>>
    ) => {
      commit((prev) => ({
        ...prev,
        students: prev.students.map((s) => (s.id === studentId ? { ...s, ...updates } : s)),
      }));
    },
    [commit]
  );

  const updateStudentInternshipDetails = useCallback(
    (studentId: string, updates: InternshipEditPayload, actionDescription?: string) => {
      commit((prev) => {
        const student = prev.students.find((s) => s.id === studentId);
        if (!student) return prev;

        const now = new Date().toISOString();
        const newLogs: InternshipChangeLogEntry[] = [];
        const newNotifications: StudentNotification[] = [];

        const pushChange = (
          fieldChanged: string,
          previousValue: string,
          newValue: string,
          notifMessage: string,
          category: StudentNotification['category']
        ) => {
          newLogs.push({
            id: `LOG-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            studentId,
            fieldChanged,
            previousValue,
            newValue,
            changedAt: now,
            actionDescription:
              actionDescription || `Admin updated ${fieldChanged} for ${student.fullName}.`,
          });
          newNotifications.push({
            id: `NTF-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            studentId,
            message: notifMessage,
            createdAt: now,
            read: false,
            category,
          });
        };

        if (updates.domain && updates.domain !== student.domain) {
          pushChange(
            'Internship Domain',
            student.domain,
            updates.domain,
            `Your internship domain has been updated to ${updates.domain}.`,
            'domain'
          );
        }
        if (
          updates.internshipStartDate &&
          updates.internshipStartDate !== student.internshipStartDate
        ) {
          pushChange(
            'Internship Start Date',
            student.internshipStartDate,
            updates.internshipStartDate,
            `Your internship start date has been revised to ${updates.internshipStartDate}.`,
            'dates'
          );
        }
        if (updates.internshipEndDate && updates.internshipEndDate !== student.internshipEndDate) {
          pushChange(
            'Internship End Date',
            student.internshipEndDate,
            updates.internshipEndDate,
            `Your internship end date has been updated to ${updates.internshipEndDate}.`,
            'dates'
          );
        }
        if (updates.internshipDuration && updates.internshipDuration !== student.internshipDuration) {
          pushChange(
            'Internship Duration',
            student.internshipDuration,
            updates.internshipDuration,
            `Your internship duration has been updated to ${updates.internshipDuration}.`,
            'dates'
          );
        }
        if (updates.projectDeadline && updates.projectDeadline !== student.projectDeadline) {
          pushChange(
            'Project Submission Deadline',
            student.projectDeadline,
            updates.projectDeadline,
            `Your project submission deadline has been updated to ${updates.projectDeadline}.`,
            'deadline'
          );
        }
        if (updates.internshipStatus && updates.internshipStatus !== student.internshipStatus) {
          pushChange(
            'Internship Status',
            student.internshipStatus,
            updates.internshipStatus,
            `Your internship status has been changed to ${updates.internshipStatus}.`,
            'status'
          );
        }

        if (newLogs.length === 0) return prev;

        return {
          ...prev,
          students: prev.students.map((s) =>
            s.id === studentId ? { ...s, ...updates } : s
          ),
          changeLogs: [...newLogs, ...prev.changeLogs],
          notifications: [...newNotifications, ...prev.notifications],
        };
      });
    },
    [commit]
  );

  const updateStudentStatus = useCallback(
    (studentId: string, internshipStatus: InternshipStatus) => {
      updateStudentInternshipDetails(
        studentId,
        { internshipStatus },
        'Admin updated internship status from Student Database.'
      );
    },
    [updateStudentInternshipDetails]
  );

  const regenerateOfferLetter = useCallback(
    (studentId: string, customIssueDate?: string): OfferLetterRecord | null => {
      const student = state.students.find((s) => s.id === studentId);
      if (!student) return null;

      const existingLetters = state.offerLetters.filter((ol) => ol.studentId === studentId);
      const nextVersion =
        existingLetters.reduce((max, item) => Math.max(max, item.version), 0) + 1;
      const prevCurrent = existingLetters.find((ol) => ol.isCurrent);

      const now = new Date();
      const issueDate =
        customIssueDate?.trim() ||
        now.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });

      const newRef = `OL-${student.id}-V${nextVersion}`;
      const regenerated: OfferLetterRecord = {
        id: `OLR-${Date.now()}`,
        offerLetterNumber: newRef,
        version: nextVersion,
        studentId: student.id,
        studentName: student.fullName,
        domain: student.domain,
        issueDate,
        createdAt: now.toISOString(),
        isCurrent: true,
        note: `Regenerated by Admin for domain "${student.domain}".`,
      };

      const logEntry: InternshipChangeLogEntry = {
        id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        studentId: student.id,
        fieldChanged: 'Offer Letter',
        previousValue: prevCurrent
          ? `v${prevCurrent.version} (${prevCurrent.domain} · ${prevCurrent.issueDate})`
          : student.offerLetterNumber,
        newValue: `v${nextVersion} (${student.domain} · ${issueDate})`,
        changedAt: now.toISOString(),
        actionDescription: `Admin regenerated official Offer Letter (v${nextVersion}) for ${student.domain}.`,
      };

      const notif: StudentNotification = {
        id: `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        studentId: student.id,
        message: `A regenerated Offer Letter (v${nextVersion}) for ${student.domain} is now available in My Offer Letter.`,
        createdAt: now.toISOString(),
        read: false,
        category: 'offer-letter',
      };

      commit((prev) => ({
        ...prev,
        students: prev.students.map((s) =>
          s.id === studentId
            ? {
                ...s,
                offerLetterDate: issueDate,
                offerLetterNumber: newRef,
                offerLetterStatus: 'GENERATED',
              }
            : s
        ),
        offerLetters: [
          regenerated,
          ...prev.offerLetters.map((ol) =>
            ol.studentId === studentId ? { ...ol, isCurrent: false } : ol
          ),
        ],
        changeLogs: [logEntry, ...prev.changeLogs],
        notifications: [notif, ...prev.notifications],
      }));

      return regenerated;
    },
    [state.students, state.offerLetters, commit]
  );

  const getOfferLettersForStudent = useCallback(
    (studentId: string): OfferLetterRecord[] => {
      return state.offerLetters
        .filter((ol) => ol.studentId === studentId)
        .sort((a, b) => b.version - a.version);
    },
    [state.offerLetters]
  );

  const getActiveOfferLetterForStudent = useCallback(
    (studentId: string): OfferLetterRecord | undefined => {
      const list = getOfferLettersForStudent(studentId);
      return list.find((ol) => ol.isCurrent) || list[0];
    },
    [getOfferLettersForStudent]
  );

  const getChangeLogsForStudent = useCallback(
    (studentId: string): InternshipChangeLogEntry[] => {
      return state.changeLogs
        .filter((log) => log.studentId === studentId)
        .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
    },
    [state.changeLogs]
  );

  const getNotificationsForStudent = useCallback(
    (studentId: string): StudentNotification[] => {
      return state.notifications
        .filter((n) => n.studentId === studentId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    [state.notifications]
  );

  const markNotificationRead = useCallback(
    (notificationId: string) => {
      commit((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
      }));
    },
    [commit]
  );

  const markAllNotificationsRead = useCallback(
    (studentId: string) => {
      commit((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.studentId === studentId ? { ...n, read: true } : n
        ),
      }));
    },
    [commit]
  );

  const getTasksForStudent = useCallback(
    (student: Student): InternshipTask[] => {
      return state.tasks
        .filter(
          (t) =>
            t.domain === student.domain &&
            (t.assignedStudentIds.length === 0 || t.assignedStudentIds.includes(student.id))
        )
        .sort((a, b) => a.taskNumber - b.taskNumber);
    },
    [state.tasks]
  );

  const getTaskSubmissionForStudent = useCallback(
    (studentId: string, taskId: string): TaskSubmissionRecord | undefined => {
      return state.taskSubmissions.find(
        (sub) => sub.studentId === studentId && sub.taskId === taskId
      );
    },
    [state.taskSubmissions]
  );

  const startTask = useCallback(
    (studentId: string, taskId: string) => {
      commit((prev) => {
        const exists = prev.taskSubmissions.find(
          (s) => s.studentId === studentId && s.taskId === taskId
        );
        const updatedStudents = prev.students.map((stu) =>
          stu.id === studentId &&
          (stu.internshipStatus === 'Registered' || stu.internshipStatus === 'Offer Letter Issued')
            ? { ...stu, internshipStatus: 'Internship Active' as InternshipStatus }
            : stu
        );
        if (exists) {
          return {
            ...prev,
            students: updatedStudents,
            taskSubmissions: prev.taskSubmissions.map((s) =>
              s.id === exists.id && s.status === 'NOT STARTED'
                ? { ...s, status: 'IN PROGRESS' as TaskStatus, startedAt: new Date().toISOString() }
                : s
            ),
          };
        }
        const record: TaskSubmissionRecord = {
          id: `TSUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          taskId,
          studentId,
          status: 'IN PROGRESS',
          projectDescription: '',
          startedAt: new Date().toISOString(),
        };
        return {
          ...prev,
          students: updatedStudents,
          taskSubmissions: [...prev.taskSubmissions, record],
        };
      });
    },
    [commit]
  );

  const submitTaskWork = useCallback(
    (
      studentId: string,
      taskId: string,
      payload: {
        projectDescription: string;
        fileName: string;
        fileSize: string;
        fileType: string;
      }
    ) => {
      commit((prev) => {
        const exists = prev.taskSubmissions.find(
          (s) => s.studentId === studentId && s.taskId === taskId
        );
        const now = new Date().toISOString();
        const updatedStudents = prev.students.map((stu) =>
          stu.id === studentId && stu.internshipStatus !== 'Internship Completed'
            ? { ...stu, internshipStatus: 'Internship Active' as InternshipStatus }
            : stu
        );
        if (exists) {
          return {
            ...prev,
            students: updatedStudents,
            taskSubmissions: prev.taskSubmissions.map((s) =>
              s.id === exists.id
                ? {
                    ...s,
                    status: 'SUBMITTED' as TaskStatus,
                    projectDescription: payload.projectDescription,
                    fileName: payload.fileName,
                    fileSize: payload.fileSize,
                    fileType: payload.fileType,
                    submittedAt: now,
                  }
                : s
            ),
          };
        }
        const newSub: TaskSubmissionRecord = {
          id: `TSUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          taskId,
          studentId,
          status: 'SUBMITTED',
          projectDescription: payload.projectDescription,
          fileName: payload.fileName,
          fileSize: payload.fileSize,
          fileType: payload.fileType,
          startedAt: now,
          submittedAt: now,
        };
        return {
          ...prev,
          students: updatedStudents,
          taskSubmissions: [...prev.taskSubmissions, newSub],
        };
      });
    },
    [commit]
  );

  const reviewTaskSubmission = useCallback(
    (submissionId: string, status: 'APPROVED' | 'NEEDS REVISION', feedback: string) => {
      commit((prev) => {
        const target = prev.taskSubmissions.find((s) => s.id === submissionId);
        const task = target ? prev.tasks.find((t) => t.id === target.taskId) : undefined;
        const now = new Date().toISOString();
        const notif: StudentNotification[] = target
          ? [
              {
                id: `NTF-${Date.now()}`,
                studentId: target.studentId,
                message: `Your task "${task?.title || 'Assignment'}" was marked ${status} by Admin.`,
                createdAt: now,
                read: false,
                category: 'task',
              },
            ]
          : [];
        return {
          ...prev,
          taskSubmissions: prev.taskSubmissions.map((s) =>
            s.id === submissionId
              ? {
                  ...s,
                  status,
                  adminFeedback: feedback.trim(),
                  reviewedAt: now,
                }
              : s
          ),
          notifications: [...notif, ...prev.notifications],
        };
      });
    },
    [commit]
  );

  const createTask = useCallback(
    (input: {
      domain: InternshipDomain;
      title: string;
      description: string;
      guidelines: string[];
      deadline: string;
      assignedStudentIds?: string[];
    }) => {
      commit((prev) => {
        const now = new Date().toISOString();
        const domainTasks = prev.tasks.filter((t) => t.domain === input.domain);
        const nextNum =
          domainTasks.reduce((max, t) => Math.max(max, t.taskNumber), 0) + 1;
        const newTask: InternshipTask = {
          id: `TSK-${Date.now()}`,
          taskNumber: nextNum,
          domain: input.domain,
          title: input.title.trim(),
          description: input.description.trim(),
          guidelines: input.guidelines.filter((g) => g.trim().length > 0),
          deadline: input.deadline,
          createdAt: now,
          assignedStudentIds: input.assignedStudentIds ?? [],
        };

        const targetStudents = prev.students.filter(
          (s) =>
            s.domain === input.domain &&
            ((input.assignedStudentIds ?? []).length === 0 ||
              (input.assignedStudentIds ?? []).includes(s.id))
        );

        const newNotifs: StudentNotification[] = targetStudents.map((stu, idx) => ({
          id: `NTF-${Date.now()}-${idx}`,
          studentId: stu.id,
          message: `A new project task "${newTask.title}" has been assigned (Deadline: ${newTask.deadline}).`,
          createdAt: now,
          read: false,
          category: 'task',
        }));

        const newLogs: InternshipChangeLogEntry[] =
          (input.assignedStudentIds ?? []).length > 0
            ? targetStudents.map((stu, idx) => ({
                id: `LOG-${Date.now()}-${idx}`,
                studentId: stu.id,
                fieldChanged: 'Assigned Tasks',
                previousValue: '—',
                newValue: newTask.title,
                changedAt: now,
                actionDescription: `Admin created & assigned task "${newTask.title}" (Due ${newTask.deadline}).`,
              }))
            : [];

        return {
          ...prev,
          tasks: [...prev.tasks, newTask],
          notifications: [...newNotifs, ...prev.notifications],
          changeLogs: [...newLogs, ...prev.changeLogs],
        };
      });
    },
    [commit]
  );

  const updateTask = useCallback(
    (
      taskId: string,
      updates: Partial<Omit<InternshipTask, 'id' | 'createdAt'>>,
      affectedStudentId?: string
    ) => {
      commit((prev) => {
        const existing = prev.tasks.find((t) => t.id === taskId);
        if (!existing) return prev;
        const now = new Date().toISOString();
        const extraLogs: InternshipChangeLogEntry[] = [];
        const extraNotifs: StudentNotification[] = [];

        if (affectedStudentId && updates.deadline && updates.deadline !== existing.deadline) {
          extraLogs.push({
            id: `LOG-${Date.now()}`,
            studentId: affectedStudentId,
            fieldChanged: `Task Deadline (${existing.title})`,
            previousValue: existing.deadline,
            newValue: updates.deadline,
            changedAt: now,
            actionDescription: `Admin updated task deadline for "${existing.title}".`,
          });
          extraNotifs.push({
            id: `NTF-${Date.now()}`,
            studentId: affectedStudentId,
            message: `Deadline for task "${existing.title}" has been updated to ${updates.deadline}.`,
            createdAt: now,
            read: false,
            category: 'deadline',
          });
        } else if (affectedStudentId && updates.title && updates.title !== existing.title) {
          extraLogs.push({
            id: `LOG-${Date.now()}`,
            studentId: affectedStudentId,
            fieldChanged: 'Task Details',
            previousValue: existing.title,
            newValue: updates.title,
            changedAt: now,
            actionDescription: `Admin edited task "${existing.title}".`,
          });
        }

        return {
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
          changeLogs: [...extraLogs, ...prev.changeLogs],
          notifications: [...extraNotifs, ...prev.notifications],
        };
      });
    },
    [commit]
  );

  const deleteTask = useCallback(
    (taskId: string, affectedStudentId?: string) => {
      commit((prev) => {
        const existing = prev.tasks.find((t) => t.id === taskId);
        const now = new Date().toISOString();
        const extraLogs: InternshipChangeLogEntry[] =
          affectedStudentId && existing
            ? [
                {
                  id: `LOG-${Date.now()}`,
                  studentId: affectedStudentId,
                  fieldChanged: 'Assigned Tasks',
                  previousValue: existing.title,
                  newValue: 'Removed',
                  changedAt: now,
                  actionDescription: `Admin removed task "${existing.title}".`,
                },
              ]
            : [];
        return {
          ...prev,
          tasks: prev.tasks.filter((t) => t.id !== taskId),
          taskSubmissions: prev.taskSubmissions.filter((s) => s.taskId !== taskId),
          changeLogs: [...extraLogs, ...prev.changeLogs],
        };
      });
    },
    [commit]
  );

  const submitCapstoneProject = useCallback(
    (payload: {
      studentId: string;
      projectTitle: string;
      projectDescription: string;
      fileName: string;
      fileSize: string;
      fileType: string;
      projectUrl?: string;
    }): ProjectSubmission => {
      const student = state.students.find((s) => s.id === payload.studentId);
      const now = new Date().toISOString();
      const existing = state.projectSubmissions.find(
        (p) => p.studentId === payload.studentId
      );

      const submission: ProjectSubmission = {
        id: existing ? existing.id : `PROJ-${Date.now()}`,
        studentId: payload.studentId,
        studentName: student?.fullName || 'Student',
        domain: student?.domain || 'Web Development',
        projectTitle: payload.projectTitle.trim(),
        projectDescription: payload.projectDescription.trim(),
        fileName: payload.fileName,
        fileSize: payload.fileSize,
        fileType: payload.fileType,
        projectUrl: payload.projectUrl?.trim() || undefined,
        submissionDate: now,
        status: 'SUBMITTED',
        adminFeedback: existing?.adminFeedback,
      };

      commit((prev) => ({
        ...prev,
        students: prev.students.map((s) =>
          s.id === payload.studentId && s.internshipStatus !== 'Internship Completed'
            ? { ...s, internshipStatus: 'Internship Active' as InternshipStatus }
            : s
        ),
        projectSubmissions: existing
          ? prev.projectSubmissions.map((p) => (p.id === existing.id ? submission : p))
          : [submission, ...prev.projectSubmissions],
      }));

      return submission;
    },
    [state.students, state.projectSubmissions, commit]
  );

  const reviewCapstoneProject = useCallback(
    (projectId: string, status: SubmissionStatus, feedback: string) => {
      commit((prev) => {
        const target = prev.projectSubmissions.find((p) => p.id === projectId);
        if (!target) return prev;
        const now = new Date().toISOString();
        const nextStudentStatus: InternshipStatus =
          status === 'APPROVED' ? 'Internship Completed' : 'Internship Active';
        const notif: StudentNotification = {
          id: `NTF-${Date.now()}`,
          studentId: target.studentId,
          message:
            status === 'APPROVED'
              ? `Your capstone project "${target.projectTitle}" has been APPROVED!`
              : `Revision requested on your capstone project "${target.projectTitle}".`,
          createdAt: now,
          read: false,
          category: 'task',
        };
        return {
          ...prev,
          students: prev.students.map((s) =>
            s.id === target.studentId ? { ...s, internshipStatus: nextStudentStatus } : s
          ),
          projectSubmissions: prev.projectSubmissions.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  status,
                  adminFeedback: feedback.trim(),
                  reviewedAt: now,
                }
              : p
          ),
          notifications: [notif, ...prev.notifications],
        };
      });
    },
    [commit]
  );

  const issueCertificate = useCallback(
    (studentId: string): CertificateRecord | null => {
      const student = state.students.find((s) => s.id === studentId);
      const project = state.projectSubmissions.find(
        (p) => p.studentId === studentId && p.status === 'APPROVED'
      );
      if (!student || !project) return null;

      const existing = state.certificates.find((c) => c.studentId === studentId);
      if (existing) return existing;

      const now = new Date();
      const newCert: CertificateRecord = {
        id: `C-REC-${Date.now()}`,
        certificateId: generateCertificateId(state.certificates),
        studentId: student.id,
        studentName: student.fullName,
        domain: student.domain,
        completionDate: formatReadableDate(now),
        issuedAt: now.toISOString(),
        status: 'ISSUED',
      };

      const notif: StudentNotification = {
        id: `NTF-${Date.now()}`,
        studentId: student.id,
        message: `Your official Skillora Certificate (${newCert.certificateId}) has been issued!`,
        createdAt: now.toISOString(),
        read: false,
        category: 'status',
      };

      commit((prev) => ({
        ...prev,
        students: prev.students.map((s) =>
          s.id === studentId ? { ...s, internshipStatus: 'Internship Completed' } : s
        ),
        certificates: [newCert, ...prev.certificates],
        notifications: [notif, ...prev.notifications],
      }));

      return newCert;
    },
    [state.students, state.projectSubmissions, state.certificates, commit]
  );

  const issueLOR = useCallback(
    (studentId: string): LORRecord | null => {
      const student = state.students.find((s) => s.id === studentId);
      const project = state.projectSubmissions.find(
        (p) => p.studentId === studentId && p.status === 'APPROVED'
      );
      if (!student || !project) return null;

      const existing = state.lors.find((l) => l.studentId === studentId);
      if (existing) return existing;

      const now = new Date();
      const newLor: LORRecord = {
        id: `L-REC-${Date.now()}`,
        lorId: generateLORId(state.lors),
        studentId: student.id,
        studentName: student.fullName,
        domain: student.domain,
        completionDate: formatReadableDate(now),
        issuedAt: now.toISOString(),
        status: 'ISSUED',
      };

      const notif: StudentNotification = {
        id: `NTF-${Date.now()}`,
        studentId: student.id,
        message: `Your official Skillora Letter of Recommendation (${newLor.lorId}) has been issued!`,
        createdAt: now.toISOString(),
        read: false,
        category: 'status',
      };

      commit((prev) => ({
        ...prev,
        lors: [newLor, ...prev.lors],
        notifications: [notif, ...prev.notifications],
      }));

      return newLor;
    },
    [state.students, state.projectSubmissions, state.lors, commit]
  );

  const resetDemoData = useCallback(() => {
    const fresh = resetPortalState();
    setState(fresh);
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        registerStudent,
        authenticateStudent,
        refreshFromSupabase,
        syncDemoDataToSupabase,
        updateStudentProfile,
        updateStudentStatus,
        updateStudentInternshipDetails,
        regenerateOfferLetter,
        getOfferLettersForStudent,
        getActiveOfferLetterForStudent,
        getChangeLogsForStudent,
        getNotificationsForStudent,
        markNotificationRead,
        markAllNotificationsRead,
        getTasksForStudent,
        getTaskSubmissionForStudent,
        startTask,
        submitTaskWork,
        reviewTaskSubmission,
        createTask,
        updateTask,
        deleteTask,
        submitCapstoneProject,
        reviewCapstoneProject,
        issueCertificate,
        issueLOR,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
