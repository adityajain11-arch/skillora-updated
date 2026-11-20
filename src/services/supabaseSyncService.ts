import {
  CertificateRecord,
  DocumentTemplateConfig,
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
import { supabase } from './supabaseClient';

interface StudentRow {
  id: string;
  full_name: string;
  email: string;
  mobile: string;
  college: string;
  course: string;
  semester: string;
  domain: string;
  password: string;
  registration_date: string;
  internship_start_date: string;
  internship_end_date: string;
  internship_duration: string;
  project_deadline: string;
  offer_letter_date: string;
  offer_letter_number: string;
  offer_letter_status: string;
  internship_status: string;
}

interface OfferLetterRow {
  id: string;
  offer_letter_number: string;
  version: number;
  student_id: string;
  student_name: string;
  domain: string;
  issue_date: string;
  created_at: string;
  is_current: boolean;
  note: string | null;
}

interface ChangeLogRow {
  id: string;
  student_id: string;
  field_changed: string;
  previous_value: string;
  new_value: string;
  changed_at: string;
  action_description: string;
}

interface NotificationRow {
  id: string;
  student_id: string;
  message: string;
  created_at: string;
  read: boolean;
  category: string;
}

interface TaskRow {
  id: string;
  task_number: number;
  domain: string;
  title: string;
  description: string;
  guidelines: string[];
  deadline: string;
  created_at: string;
  assigned_student_ids: string[];
}

interface TaskSubmissionRow {
  id: string;
  task_id: string;
  student_id: string;
  status: string;
  project_description: string;
  file_name: string | null;
  file_size: string | null;
  file_type: string | null;
  project_url: string | null;
  started_at: string | null;
  submitted_at: string | null;
  admin_feedback: string | null;
  reviewed_at: string | null;
}

interface ProjectSubmissionRow {
  id: string;
  student_id: string;
  student_name: string;
  domain: string;
  project_title: string;
  project_description: string;
  file_name: string;
  file_size: string;
  file_type: string;
  project_url: string | null;
  submission_date: string;
  status: string;
  admin_feedback: string | null;
  reviewed_at: string | null;
}

interface CertificateRow {
  id: string;
  certificate_id: string;
  student_id: string;
  student_name: string;
  domain: string;
  completion_date: string;
  issued_at: string;
  status: string;
}

interface LORRow {
  id: string;
  lor_id: string;
  student_id: string;
  student_name: string;
  domain: string;
  completion_date: string;
  issued_at: string;
  status: string;
}

interface DocumentTemplateRow {
  id: string;
  title: string;
  heading: string;
  body_text: string;
  primary_color: string;
  secondary_color: string;
  font_size: string;
  font_family: string;
  text_align: string;
  logo_url: string | null;
  signature_name: string;
  signature_title: string;
  footer_text: string;
  updated_at: string;
}

function toStudentRow(s: Student): StudentRow {
  return {
    id: s.id,
    full_name: s.fullName,
    email: s.email,
    mobile: s.mobile,
    college: s.college,
    course: s.course,
    semester: s.semester,
    domain: s.domain,
    password: s.password,
    registration_date: s.registrationDate,
    internship_start_date: s.internshipStartDate,
    internship_end_date: s.internshipEndDate,
    internship_duration: s.internshipDuration,
    project_deadline: s.projectDeadline,
    offer_letter_date: s.offerLetterDate,
    offer_letter_number: s.offerLetterNumber,
    offer_letter_status: s.offerLetterStatus,
    internship_status: s.internshipStatus,
  };
}

function fromStudentRow(r: StudentRow): Student {
  return {
    id: r.id,
    fullName: r.full_name,
    email: r.email,
    mobile: r.mobile,
    college: r.college,
    course: r.course,
    semester: r.semester,
    domain: r.domain as InternshipDomain,
    password: r.password,
    registrationDate: r.registration_date,
    internshipStartDate: r.internship_start_date,
    internshipEndDate: r.internship_end_date,
    internshipDuration: r.internship_duration,
    projectDeadline: r.project_deadline,
    offerLetterDate: r.offer_letter_date,
    offerLetterNumber: r.offer_letter_number,
    offerLetterStatus: 'GENERATED',
    internshipStatus: r.internship_status as InternshipStatus,
  };
}

function toOfferLetterRow(o: OfferLetterRecord): OfferLetterRow {
  return {
    id: o.id,
    offer_letter_number: o.offerLetterNumber,
    version: o.version,
    student_id: o.studentId,
    student_name: o.studentName,
    domain: o.domain,
    issue_date: o.issueDate,
    created_at: o.createdAt,
    is_current: o.isCurrent,
    note: o.note ?? null,
  };
}

function fromOfferLetterRow(r: OfferLetterRow): OfferLetterRecord {
  return {
    id: r.id,
    offerLetterNumber: r.offer_letter_number,
    version: r.version,
    studentId: r.student_id,
    studentName: r.student_name,
    domain: r.domain as InternshipDomain,
    issueDate: r.issue_date,
    createdAt: r.created_at,
    isCurrent: r.is_current,
    note: r.note ?? undefined,
  };
}

function toChangeLogRow(c: InternshipChangeLogEntry): ChangeLogRow {
  return {
    id: c.id,
    student_id: c.studentId,
    field_changed: c.fieldChanged,
    previous_value: c.previousValue,
    new_value: c.newValue,
    changed_at: c.changedAt,
    action_description: c.actionDescription,
  };
}

function fromChangeLogRow(r: ChangeLogRow): InternshipChangeLogEntry {
  return {
    id: r.id,
    studentId: r.student_id,
    fieldChanged: r.field_changed,
    previousValue: r.previous_value,
    newValue: r.new_value,
    changedAt: r.changed_at,
    actionDescription: r.action_description,
  };
}

function toNotificationRow(n: StudentNotification): NotificationRow {
  return {
    id: n.id,
    student_id: n.studentId,
    message: n.message,
    created_at: n.createdAt,
    read: n.read,
    category: n.category,
  };
}

function fromNotificationRow(r: NotificationRow): StudentNotification {
  return {
    id: r.id,
    studentId: r.student_id,
    message: r.message,
    createdAt: r.created_at,
    read: r.read,
    category: r.category as StudentNotification['category'],
  };
}

function toTaskRow(t: InternshipTask): TaskRow {
  return {
    id: t.id,
    task_number: t.taskNumber,
    domain: t.domain,
    title: t.title,
    description: t.description,
    guidelines: t.guidelines,
    deadline: t.deadline,
    created_at: t.createdAt,
    assigned_student_ids: t.assignedStudentIds,
  };
}

function fromTaskRow(r: TaskRow): InternshipTask {
  return {
    id: r.id,
    taskNumber: r.task_number,
    domain: r.domain as InternshipDomain,
    title: r.title,
    description: r.description,
    guidelines: Array.isArray(r.guidelines) ? r.guidelines : [],
    deadline: r.deadline,
    createdAt: r.created_at,
    assignedStudentIds: Array.isArray(r.assigned_student_ids) ? r.assigned_student_ids : [],
  };
}

function toTaskSubmissionRow(s: TaskSubmissionRecord): TaskSubmissionRow {
  return {
    id: s.id,
    task_id: s.taskId,
    student_id: s.studentId,
    status: s.status,
    project_description: s.projectDescription,
    file_name: s.fileName ?? null,
    file_size: s.fileSize ?? null,
    file_type: s.fileType ?? null,
    project_url: s.projectUrl ?? null,
    started_at: s.startedAt ?? null,
    submitted_at: s.submittedAt ?? null,
    admin_feedback: s.adminFeedback ?? null,
    reviewed_at: s.reviewedAt ?? null,
  };
}

function fromTaskSubmissionRow(r: TaskSubmissionRow): TaskSubmissionRecord {
  return {
    id: r.id,
    taskId: r.task_id,
    studentId: r.student_id,
    status: r.status as TaskStatus,
    projectDescription: r.project_description,
    fileName: r.file_name ?? undefined,
    fileSize: r.file_size ?? undefined,
    fileType: r.file_type ?? undefined,
    projectUrl: r.project_url ?? undefined,
    startedAt: r.started_at ?? undefined,
    submittedAt: r.submitted_at ?? undefined,
    adminFeedback: r.admin_feedback ?? undefined,
    reviewedAt: r.reviewed_at ?? undefined,
  };
}

function toProjectSubmissionRow(p: ProjectSubmission): ProjectSubmissionRow {
  return {
    id: p.id,
    student_id: p.studentId,
    student_name: p.studentName,
    domain: p.domain,
    project_title: p.projectTitle,
    project_description: p.projectDescription,
    file_name: p.fileName,
    file_size: p.fileSize,
    file_type: p.fileType,
    project_url: p.projectUrl ?? null,
    submission_date: p.submissionDate,
    status: p.status,
    admin_feedback: p.adminFeedback ?? null,
    reviewed_at: p.reviewedAt ?? null,
  };
}

function fromProjectSubmissionRow(r: ProjectSubmissionRow): ProjectSubmission {
  return {
    id: r.id,
    studentId: r.student_id,
    studentName: r.student_name,
    domain: r.domain as InternshipDomain,
    projectTitle: r.project_title,
    projectDescription: r.project_description,
    fileName: r.file_name,
    fileSize: r.file_size,
    fileType: r.file_type,
    projectUrl: r.project_url ?? undefined,
    submissionDate: r.submission_date,
    status: r.status as SubmissionStatus,
    adminFeedback: r.admin_feedback ?? undefined,
    reviewedAt: r.reviewed_at ?? undefined,
  };
}

function toCertificateRow(c: CertificateRecord): CertificateRow {
  return {
    id: c.id,
    certificate_id: c.certificateId,
    student_id: c.studentId,
    student_name: c.studentName,
    domain: c.domain,
    completion_date: c.completionDate,
    issued_at: c.issuedAt,
    status: c.status,
  };
}

function fromCertificateRow(r: CertificateRow): CertificateRecord {
  return {
    id: r.id,
    certificateId: r.certificate_id,
    studentId: r.student_id,
    studentName: r.student_name,
    domain: r.domain as InternshipDomain,
    completionDate: r.completion_date,
    issuedAt: r.issued_at,
    status: 'ISSUED',
  };
}

function toLORRow(l: LORRecord): LORRow {
  return {
    id: l.id,
    lor_id: l.lorId,
    student_id: l.studentId,
    student_name: l.studentName,
    domain: l.domain,
    completion_date: l.completionDate,
    issued_at: l.issuedAt,
    status: l.status,
  };
}

function fromLORRow(r: LORRow): LORRecord {
  return {
    id: r.id,
    lorId: r.lor_id,
    studentId: r.student_id,
    studentName: r.student_name,
    domain: r.domain as InternshipDomain,
    completionDate: r.completion_date,
    issuedAt: r.issued_at,
    status: 'ISSUED',
  };
}

function toDocumentTemplateRow(d: DocumentTemplateConfig): DocumentTemplateRow {
  return {
    id: d.id,
    title: d.title,
    heading: d.heading,
    body_text: d.bodyText,
    primary_color: d.primaryColor,
    secondary_color: d.secondaryColor,
    font_size: d.fontSize,
    font_family: d.fontFamily,
    text_align: d.textAlign,
    logo_url: d.logoUrl || null,
    signature_name: d.signatureName,
    signature_title: d.signatureTitle,
    footer_text: d.footerText,
    updated_at: d.updatedAt,
  };
}

function fromDocumentTemplateRow(r: DocumentTemplateRow): DocumentTemplateConfig {
  return {
    id: r.id as DocumentTemplateConfig['id'],
    title: r.title,
    heading: r.heading,
    bodyText: r.body_text,
    primaryColor: r.primary_color,
    secondaryColor: r.secondary_color,
    fontSize: r.font_size,
    fontFamily: r.font_family,
    textAlign: r.text_align as DocumentTemplateConfig['textAlign'],
    logoUrl: r.logo_url ?? '',
    signatureName: r.signature_name,
    signatureTitle: r.signature_title,
    footerText: r.footer_text,
    updatedAt: r.updated_at,
  };
}

export interface SupabaseHealthResult {
  connected: boolean;
  tablesReady: boolean;
  studentCount?: number;
  errorMessage?: string;
}

export async function checkSupabaseHealth(): Promise<SupabaseHealthResult> {
  const { data, error } = await supabase.from('students').select('id');
  if (error) {
    return {
      connected: true,
      tablesReady: false,
      errorMessage: error.message,
    };
  }
  return {
    connected: true,
    tablesReady: true,
    studentCount: data?.length ?? 0,
  };
}

export async function fetchExistingSupabaseStudentIdsAndEmails(): Promise<{
  ok: boolean;
  ids: string[];
  emails: string[];
}> {
  const { data, error } = await supabase.from('students').select('id, email');
  if (error || !data) {
    return { ok: false, ids: [], emails: [] };
  }
  return {
    ok: true,
    ids: data.map((row) => String(row.id)),
    emails: data.map((row) => String(row.email).trim().toLowerCase()),
  };
}

export async function fetchStudentByCredentialsFromSupabase(
  email: string,
  password: string
): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .eq('password', password)
    .maybeSingle();

  if (error || !data) return null;
  return fromStudentRow(data as StudentRow);
}

export async function loadPortalStateFromSupabase(): Promise<Partial<PortalState> | null> {
  const studentsRes = await supabase
    .from('students')
    .select('*')
    .order('registration_date', { ascending: false });

  if (studentsRes.error) {
    return null;
  }

  const [
    offerRes,
    logsRes,
    notifsRes,
    tasksRes,
    taskSubsRes,
    projSubsRes,
    certsRes,
    lorsRes,
    templatesRes,
  ] = await Promise.all([
    supabase.from('offer_letters').select('*').order('version', { ascending: false }),
    supabase.from('internship_change_logs').select('*').order('changed_at', { ascending: false }),
    supabase.from('student_notifications').select('*').order('created_at', { ascending: false }),
    supabase.from('internship_tasks').select('*').order('task_number', { ascending: true }),
    supabase.from('task_submissions').select('*'),
    supabase.from('project_submissions').select('*').order('submission_date', { ascending: false }),
    supabase.from('certificates').select('*').order('issued_at', { ascending: false }),
    supabase.from('lors').select('*').order('issued_at', { ascending: false }),
    supabase.from('document_templates').select('*'),
  ]);

  return {
    students: (studentsRes.data as StudentRow[]).map(fromStudentRow),
    offerLetters: offerRes.data ? (offerRes.data as OfferLetterRow[]).map(fromOfferLetterRow) : [],
    changeLogs: logsRes.data ? (logsRes.data as ChangeLogRow[]).map(fromChangeLogRow) : [],
    notifications: notifsRes.data
      ? (notifsRes.data as NotificationRow[]).map(fromNotificationRow)
      : [],
    tasks: tasksRes.data ? (tasksRes.data as TaskRow[]).map(fromTaskRow) : [],
    taskSubmissions: taskSubsRes.data
      ? (taskSubsRes.data as TaskSubmissionRow[]).map(fromTaskSubmissionRow)
      : [],
    projectSubmissions: projSubsRes.data
      ? (projSubsRes.data as ProjectSubmissionRow[]).map(fromProjectSubmissionRow)
      : [],
    certificates: certsRes.data
      ? (certsRes.data as CertificateRow[]).map(fromCertificateRow)
      : [],
    lors: lorsRes.data ? (lorsRes.data as LORRow[]).map(fromLORRow) : [],
    documentTemplates: templatesRes.data
      ? (templatesRes.data as DocumentTemplateRow[]).map(fromDocumentTemplateRow)
      : [],
  };
}

export async function insertStudentRegistrationToSupabase(
  student: Student,
  initialOffer: OfferLetterRecord,
  welcomeNotif: StudentNotification
): Promise<{ ok: boolean; duplicateEmail?: boolean; error?: string }> {
  const { error: stuErr } = await supabase.from('students').insert(toStudentRow(student));
  if (stuErr) {
    if (stuErr.code === '23505') {
      return {
        ok: false,
        duplicateEmail: true,
        error: 'An account with this email address is already registered in Skillora.',
      };
    }
    return { ok: false, error: stuErr.message };
  }

  const [offerRes, notifRes] = await Promise.all([
    supabase.from('offer_letters').insert(toOfferLetterRow(initialOffer)),
    supabase.from('student_notifications').insert(toNotificationRow(welcomeNotif)),
  ]);

  if (offerRes.error || notifRes.error) {
    return {
      ok: false,
      error: offerRes.error?.message || notifRes.error?.message,
    };
  }

  return { ok: true };
}

export async function saveDocumentTemplateToSupabase(
  template: DocumentTemplateConfig
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('document_templates')
    .upsert(toDocumentTemplateRow(template));
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function seedFullStateToSupabase(portalState: PortalState): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (portalState.students.length > 0) {
    const res = await supabase.from('students').upsert(portalState.students.map(toStudentRow));
    if (res.error) return { ok: false, error: res.error.message };
  }
  if (portalState.tasks.length > 0) {
    const res = await supabase
      .from('internship_tasks')
      .upsert(portalState.tasks.map(toTaskRow));
    if (res.error) return { ok: false, error: res.error.message };
  }

  const secondaryOps: PromiseLike<{ error: { message: string } | null }>[] = [];
  if (portalState.offerLetters.length > 0) {
    secondaryOps.push(
      supabase.from('offer_letters').upsert(portalState.offerLetters.map(toOfferLetterRow))
    );
  }
  if (portalState.changeLogs.length > 0) {
    secondaryOps.push(
      supabase
        .from('internship_change_logs')
        .upsert(portalState.changeLogs.map(toChangeLogRow))
    );
  }
  if (portalState.notifications.length > 0) {
    secondaryOps.push(
      supabase
        .from('student_notifications')
        .upsert(portalState.notifications.map(toNotificationRow))
    );
  }
  if (portalState.taskSubmissions.length > 0) {
    secondaryOps.push(
      supabase
        .from('task_submissions')
        .upsert(portalState.taskSubmissions.map(toTaskSubmissionRow))
    );
  }
  if (portalState.projectSubmissions.length > 0) {
    secondaryOps.push(
      supabase
        .from('project_submissions')
        .upsert(portalState.projectSubmissions.map(toProjectSubmissionRow))
    );
  }
  if (portalState.certificates.length > 0) {
    secondaryOps.push(
      supabase.from('certificates').upsert(portalState.certificates.map(toCertificateRow))
    );
  }
  if (portalState.lors.length > 0) {
    secondaryOps.push(supabase.from('lors').upsert(portalState.lors.map(toLORRow)));
  }
  if (portalState.documentTemplates.length > 0) {
    secondaryOps.push(
      supabase
        .from('document_templates')
        .upsert(portalState.documentTemplates.map(toDocumentTemplateRow))
    );
  }

  const results = await Promise.all(secondaryOps);
  const firstErr = results.find((r) => r.error);
  if (firstErr?.error) return { ok: false, error: firstErr.error.message };
  return { ok: true };
}
