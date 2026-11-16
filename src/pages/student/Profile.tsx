import React, { useState } from 'react';
import { Lock, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { RetroWindow } from '../../components/RetroWindow';
import { RetroButton } from '../../components/RetroButton';
import { StatusBadge } from '../../components/StatusBadge';
import { NotificationDialog } from '../../components/NotificationDialog';
import { formatReadableDate } from '../../utils/idGenerators';

export const Profile: React.FC = () => {
  const { session } = useAuth();
  const { state, updateStudentProfile } = useApp();

  const student = state.students.find((s) => s.id === session.studentId);

  const [fullName, setFullName] = useState(student?.fullName || '');
  const [mobile, setMobile] = useState(student?.mobile || '');
  const [college, setCollege] = useState(student?.college || '');
  const [course, setCourse] = useState(student?.course || '');
  const [semester, setSemester] = useState(student?.semester || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [savedOpen, setSavedOpen] = useState(false);

  if (!student) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !college.trim() || !course.trim() || !semester.trim()) {
      setErrorMsg('Please fill out all editable profile fields.');
      return;
    }
    const digits = mobile.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    updateStudentProfile(student.id, {
      fullName: fullName.trim(),
      mobile: digits,
      college: college.trim(),
      course: course.trim(),
      semester: semester.trim(),
    });
    setSavedOpen(true);
  };

  const inputClass =
    'w-full px-3 py-2.5 bg-white border-2 border-[#303030] text-sm text-[#182747] focus:outline-none focus:border-[#4169E1]';
  const lockedClass =
    'w-full px-3 py-2.5 bg-[#F4EBD0] border-2 border-[#303030] text-sm text-[#303030] font-semibold cursor-not-allowed';

  return (
    <div className="space-y-6">
      <RetroWindow title="STUDENT_PROFILE.EXE" headerColor="navy">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-dotted border-[#303030]/40">
          <div>
            <h1 className="font-pixel text-xs sm:text-sm text-[#182747]">
              PERSONAL PROFILE &amp; OFFICIAL RECORD
            </h1>
            <p className="text-sm text-[#303030] mt-1.5">
              Update your contact and academic details. Official internship identifiers remain
              locked.
            </p>
          </div>
          <StatusBadge status={student.internshipStatus} />
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-5">
          {/* Locked Official Records */}
          <div className="p-4 bg-[#F4EBD0]/70 border-2 border-[#303030] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#182747]">
              <Lock className="w-3.5 h-3.5 text-[#4169E1]" />
              <span>Locked Official Internship Records</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#303030] mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  value={student.id}
                  readOnly
                  className={`${lockedClass} font-mono-data`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#303030] mb-1">
                  Email Address
                </label>
                <input type="text" value={student.email} readOnly className={lockedClass} />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#303030] mb-1">
                  Internship Domain
                </label>
                <input type="text" value={student.domain} readOnly className={lockedClass} />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#303030] mb-1">
                  Registration Date
                </label>
                <input
                  type="text"
                  value={formatReadableDate(student.registrationDate)}
                  readOnly
                  className={`${lockedClass} font-mono-data`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#303030] mb-1">
                  Internship Start Date
                </label>
                <input
                  type="text"
                  value={student.internshipStartDate}
                  readOnly
                  className={`${lockedClass} font-mono-data`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#303030] mb-1">
                  Internship End Date
                </label>
                <input
                  type="text"
                  value={student.internshipEndDate}
                  readOnly
                  className={`${lockedClass} font-mono-data`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#303030] mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={student.internshipDuration}
                  readOnly
                  className={lockedClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#303030] mb-1">
                  Project Deadline
                </label>
                <input
                  type="text"
                  value={student.projectDeadline}
                  readOnly
                  className={`${lockedClass} font-mono-data`}
                />
              </div>
            </div>
          </div>

          {/* Editable Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="prof-name"
                className="block text-xs font-bold uppercase text-[#182747] mb-1.5"
              >
                Student Name
              </label>
              <input
                id="prof-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="prof-mobile"
                className="block text-xs font-bold uppercase text-[#182747] mb-1.5"
              >
                Mobile Number
              </label>
              <input
                id="prof-mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className={`${inputClass} font-mono-data`}
              />
            </div>

            <div>
              <label
                htmlFor="prof-college"
                className="block text-xs font-bold uppercase text-[#182747] mb-1.5"
              >
                College / University
              </label>
              <input
                id="prof-college"
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="prof-course"
                className="block text-xs font-bold uppercase text-[#182747] mb-1.5"
              >
                Current Course
              </label>
              <input
                id="prof-course"
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="prof-semester"
                className="block text-xs font-bold uppercase text-[#182747] mb-1.5"
              >
                Year / Semester
              </label>
              <input
                id="prof-semester"
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {errorMsg && <p className="text-xs font-bold text-[#C94C4C]">{errorMsg}</p>}

          <div className="flex justify-end pt-2">
            <RetroButton type="submit" variant="success">
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </RetroButton>
          </div>
        </form>
      </RetroWindow>

      <NotificationDialog
        open={savedOpen}
        title="PROFILE_SAVED.EXE"
        message="Your profile changes have been persisted to local browser storage."
        type="success"
        confirmLabel="OK"
        onConfirm={() => setSavedOpen(false)}
      />
    </div>
  );
};
