import { Student, CertificateRecord, LORRecord } from '../types';

export function generateStudentId(existingStudents: Student[]): string {
  const year = new Date().getFullYear();
  let maxNum = 1000;
  for (const s of existingStudents) {
    const parts = s.id.split('-');
    const num = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  }
  return `SKL-${year}-${maxNum + 1}`;
}

export function generateOfferLetterNumber(studentId: string): string {
  return `OL-${studentId}`;
}

export function generateCertificateId(existingCerts: CertificateRecord[]): string {
  const year = new Date().getFullYear();
  let maxNum = 0;
  for (const c of existingCerts) {
    const parts = c.certificateId.split('-');
    const num = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  }
  const next = String(maxNum + 1).padStart(4, '0');
  return `CERT-SKL-${year}-${next}`;
}

export function generateLORId(existingLors: LORRecord[]): string {
  const year = new Date().getFullYear();
  let maxNum = 0;
  for (const l of existingLors) {
    const parts = l.lorId.split('-');
    const num = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  }
  const next = String(maxNum + 1).padStart(4, '0');
  return `LOR-SKL-${year}-${next}`;
}

export function formatReadableDate(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatShortDate(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function sanitizeFilename(name: string): string {
  return name.trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}
