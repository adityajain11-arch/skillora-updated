import { AuthSession, PortalState } from '../types';
import { initialSeedState } from '../data/seedData';

export const PORTAL_STORAGE_KEY = 'skillora_portal_state_v2';
export const AUTH_STORAGE_KEY = 'skillora_auth_session_v1';
export const STUDENT_AUTH_STORAGE_KEY = 'skillora_student_session_v1';
export const ADMIN_AUTH_STORAGE_KEY = 'skillora_admin_session_v1';
export const ADMIN_REMEMBER_EMAIL_KEY = 'skillora_admin_remember_email_v1';

export function loadPortalState(): PortalState {
  try {
    const raw = localStorage.getItem(PORTAL_STORAGE_KEY);
    if (!raw) {
      const cloned = structuredClone(initialSeedState);
      localStorage.setItem(PORTAL_STORAGE_KEY, JSON.stringify(cloned));
      return cloned;
    }
    const parsed = JSON.parse(raw) as PortalState;
    if (
      !parsed ||
      !Array.isArray(parsed.students) ||
      !Array.isArray(parsed.tasks) ||
      !Array.isArray(parsed.offerLetters) ||
      !Array.isArray(parsed.changeLogs) ||
      !Array.isArray(parsed.notifications)
    ) {
      throw new Error('Invalid state shape');
    }
    return {
      ...parsed,
      documentTemplates: Array.isArray(parsed.documentTemplates)
        ? parsed.documentTemplates
        : initialSeedState.documentTemplates,
      certificates: Array.isArray(parsed.certificates) ? parsed.certificates : [],
      lors: Array.isArray(parsed.lors) ? parsed.lors : [],
      taskSubmissions: Array.isArray(parsed.taskSubmissions) ? parsed.taskSubmissions : [],
      projectSubmissions: Array.isArray(parsed.projectSubmissions) ? parsed.projectSubmissions : [],
    };
  } catch {
    const cloned = structuredClone(initialSeedState);
    localStorage.setItem(PORTAL_STORAGE_KEY, JSON.stringify(cloned));
    return cloned;
  }
}

export function savePortalState(state: PortalState): void {
  localStorage.setItem(PORTAL_STORAGE_KEY, JSON.stringify(state));
}

export function resetPortalState(): PortalState {
  const cloned = structuredClone(initialSeedState);
  localStorage.setItem(PORTAL_STORAGE_KEY, JSON.stringify(cloned));
  return cloned;
}

export function loadStudentSessionId(): string | undefined {
  try {
    const raw = localStorage.getItem(STUDENT_AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { studentId?: string };
      if (parsed?.studentId) return parsed.studentId;
    }
    // Migrate legacy combined auth key if present
    const legacyRaw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as AuthSession;
      if (legacy?.role === 'student' && legacy.studentId) {
        return legacy.studentId;
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export function saveStudentSessionId(studentId: string): void {
  localStorage.setItem(STUDENT_AUTH_STORAGE_KEY, JSON.stringify({ studentId }));
}

export function clearStudentSessionId(): void {
  localStorage.removeItem(STUDENT_AUTH_STORAGE_KEY);
  try {
    const legacyRaw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as AuthSession;
      if (legacy?.role === 'student') localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export function loadAdminSessionEmail(): string | undefined {
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { adminEmail?: string };
      if (parsed?.adminEmail) return parsed.adminEmail;
    }
    const legacyRaw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as AuthSession;
      if (legacy?.role === 'admin' && legacy.adminEmail) {
        return legacy.adminEmail;
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export function saveAdminSessionEmail(adminEmail: string): void {
  localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify({ adminEmail }));
}

export function clearAdminSessionEmail(): void {
  localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
  try {
    const legacyRaw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as AuthSession;
      if (legacy?.role === 'admin') localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export function loadAuthSession(): AuthSession {
  const studentId = loadStudentSessionId();
  const adminEmail = loadAdminSessionEmail();
  const role: AuthSession['role'] = adminEmail ? 'admin' : studentId ? 'student' : null;
  return { role, studentId, adminEmail };
}

export function loadRememberedAdminEmail(): string {
  try {
    return localStorage.getItem(ADMIN_REMEMBER_EMAIL_KEY) || '';
  } catch {
    return '';
  }
}

export function saveRememberedAdminEmail(email: string | null): void {
  try {
    if (email) {
      localStorage.setItem(ADMIN_REMEMBER_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(ADMIN_REMEMBER_EMAIL_KEY);
    }
  } catch {
    // ignore
  }
}
