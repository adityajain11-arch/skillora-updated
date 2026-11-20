export const INTERNSHIP_DOMAINS = [
  'Web Development',
  'Python Development',
  'Data Science',
  'Artificial Intelligence & Machine Learning',
  'UI/UX Design',
  'Digital Marketing',
  'Finance',
  'Java Development',
  'App Development',
  'Graphic Design',
] as const;

export type InternshipDomain = (typeof INTERNSHIP_DOMAINS)[number];

export const INTERNSHIP_STATUSES = [
  'Registered',
  'Offer Letter Issued',
  'Internship Active',
  'On Hold',
  'Internship Completed',
  'Internship Cancelled',
] as const;

export type InternshipStatus = (typeof INTERNSHIP_STATUSES)[number];

export type TaskStatus =
  | 'NOT STARTED'
  | 'IN PROGRESS'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'NEEDS REVISION';

export type SubmissionStatus = 'SUBMITTED' | 'APPROVED' | 'NEEDS REVISION';

export interface Student {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  college: string;
  course: string;
  semester: string;
  domain: InternshipDomain;
  password: string;
  registrationDate: string; // ISO string
  internshipStartDate: string; // YYYY-MM-DD
  internshipEndDate: string; // YYYY-MM-DD
  internshipDuration: string; // e.g. "6 Weeks"
  projectDeadline: string; // YYYY-MM-DD
  offerLetterDate: string; // Formatted readable date of active letter
  offerLetterNumber: string; // Active offer letter ref
  offerLetterStatus: 'GENERATED';
  internshipStatus: InternshipStatus;
}

export interface OfferLetterRecord {
  id: string;
  offerLetterNumber: string;
  version: number;
  studentId: string;
  studentName: string;
  domain: InternshipDomain;
  issueDate: string;
  createdAt: string;
  isCurrent: boolean;
  note?: string;
}

export interface InternshipChangeLogEntry {
  id: string;
  studentId: string;
  fieldChanged: string;
  previousValue: string;
  newValue: string;
  changedAt: string;
  actionDescription: string;
}

export interface StudentNotification {
  id: string;
  studentId: string;
  message: string;
  createdAt: string;
  read: boolean;
  category: 'domain' | 'dates' | 'task' | 'deadline' | 'status' | 'offer-letter';
}

export interface InternshipTask {
  id: string;
  taskNumber: number;
  domain: InternshipDomain;
  title: string;
  description: string;
  guidelines: string[];
  deadline: string; // YYYY-MM-DD
  createdAt: string;
  assignedStudentIds: string[]; // Empty array means assigned to all students in the domain
}

export interface TaskSubmissionRecord {
  id: string;
  taskId: string;
  studentId: string;
  status: TaskStatus;
  projectDescription: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  projectUrl?: string;
  startedAt?: string;
  submittedAt?: string;
  adminFeedback?: string;
  reviewedAt?: string;
}

export interface ProjectSubmission {
  id: string;
  studentId: string;
  studentName: string;
  domain: InternshipDomain;
  projectTitle: string;
  projectDescription: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  projectUrl?: string;
  submissionDate: string;
  status: SubmissionStatus;
  adminFeedback?: string;
  reviewedAt?: string;
}

export interface CertificateRecord {
  id: string;
  certificateId: string;
  studentId: string;
  studentName: string;
  domain: InternshipDomain;
  completionDate: string;
  issuedAt: string;
  status: 'ISSUED';
}

export interface LORRecord {
  id: string;
  lorId: string;
  studentId: string;
  studentName: string;
  domain: InternshipDomain;
  completionDate: string;
  issuedAt: string;
  status: 'ISSUED';
}

export interface DocumentTemplateConfig {
  id: 'offer_letter' | 'certificate' | 'lor';
  title: string;
  heading: string;
  bodyText: string;
  primaryColor: string;
  secondaryColor: string;
  fontSize: string;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  logoUrl: string;
  signatureName: string;
  signatureTitle: string;
  footerText: string;
  updatedAt: string;
}

export interface PortalState {
  students: Student[];
  offerLetters: OfferLetterRecord[];
  changeLogs: InternshipChangeLogEntry[];
  notifications: StudentNotification[];
  tasks: InternshipTask[];
  taskSubmissions: TaskSubmissionRecord[];
  projectSubmissions: ProjectSubmission[];
  certificates: CertificateRecord[];
  lors: LORRecord[];
  documentTemplates: DocumentTemplateConfig[];
}

export interface AuthSession {
  role: 'student' | 'admin' | null;
  studentId?: string;
  adminEmail?: string;
}
