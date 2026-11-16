import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckSquare, KeyRound, Shield, UserPlus } from 'lucide-react';
import { INTERNSHIP_DOMAINS, InternshipDomain } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/Logo';
import { RetroWindow } from '../../components/RetroWindow';
import { RetroButton } from '../../components/RetroButton';
import { NotificationDialog } from '../../components/NotificationDialog';
import { RetroFooter } from '../../components/RetroFooter';

export const Registration: React.FC = () => {
  const { state, registerStudent } = useApp();
  const { loginAsStudent } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'register' | 'login'>('register');

  // Registration form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [domain, setDomain] = useState<InternshipDomain | ''>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [registeredStudentId, setRegisteredStudentId] = useState<string | null>(null);
  const [errorDialogMsg, setErrorDialogMsg] = useState<string | null>(null);

  // Returning student login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      next.fullName = 'Please enter your full name.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      next.email = 'Please enter a valid email address.';
    }
    const mobileDigits = mobile.replace(/\D/g, '');
    if (mobileDigits.length < 10 || mobileDigits.length > 13) {
      next.mobile = 'Please enter a valid 10-digit mobile number.';
    }
    if (!college.trim()) {
      next.college = 'Please enter your college or university name.';
    }
    if (!course.trim()) {
      next.course = 'Please enter your current course.';
    }
    if (!semester.trim()) {
      next.semester = 'Please enter your current year or semester.';
    }
    if (!domain) {
      next.domain = 'Please select your preferred internship domain.';
    }
    if (!password || password.length < 6) {
      next.password = 'Password must be at least 6 characters long.';
    }
    if (confirmPassword !== password) {
      next.confirmPassword = 'Passwords do not match.';
    }
    if (!termsAccepted) {
      next.termsAccepted = 'You must accept the internship terms and conditions.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const result = registerStudent({
      fullName,
      email,
      mobile: mobile.replace(/\D/g, ''),
      college,
      course,
      semester,
      domain: domain as InternshipDomain,
      password,
    });

    if (result.ok === false) {
      setErrorDialogMsg(result.error);
      return;
    }

    setRegisteredStudentId(result.student.id);
    loginAsStudent(result.student.id);
    setSuccessDialogOpen(true);
  };

  const handleContinueToOfferLetter = () => {
    setSuccessDialogOpen(false);
    if (registeredStudentId) {
      navigate('/student/offer-letter');
    }
  };

  const handleReturningLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const normalized = loginEmail.trim().toLowerCase();
    const matched = state.students.find(
      (s) => s.email.toLowerCase() === normalized && s.password === loginPassword
    );
    if (!matched) {
      setLoginError('Invalid student email or password. Please check your credentials.');
      return;
    }
    loginAsStudent(matched.id);
    navigate('/student/dashboard');
  };

  const inputClass =
    'w-full px-3 py-2.5 bg-white border-2 border-[#303030] text-sm text-[#182747] focus:outline-none focus:border-[#4169E1] retro-bevel-in';

  return (
    <div className="min-h-screen flex flex-col retro-desktop-bg overflow-x-hidden">
      {/* Top Portal Navigation Bar */}
      <header className="bg-[#FFF8E7] border-b-2 border-[#303030] px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <Link to="/student/register" className="shrink-0" aria-label="Skillora Home">
            <Logo size="md" />
          </Link>

          <nav
            aria-label="Portal Access Navigation"
            className="flex flex-wrap items-center gap-3 sm:gap-4"
          >
            {/* Student Portal Group */}
            <div className="flex flex-wrap items-center gap-2 pr-0 sm:pr-4 sm:border-r-2 sm:border-[#303030]/30">
              <span className="hidden md:inline font-pixel text-[8px] text-[#4169E1] mr-1">
                STUDENT PORTAL:
              </span>
              <RetroButton
                type="button"
                size="sm"
                variant={mode === 'login' ? 'primary' : 'neutral'}
                onClick={() => setMode('login')}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Student Login</span>
              </RetroButton>
              <RetroButton
                type="button"
                size="sm"
                variant={mode === 'register' ? 'primary' : 'neutral'}
                onClick={() => setMode('register')}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register for Internship</span>
              </RetroButton>
            </div>

            {/* Separate Admin Portal Access Button */}
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#182747] text-[#F4C542] border-2 border-[#303030] font-mono-data font-bold text-xs uppercase tracking-wider retro-shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#F4C542] hover:text-[#182747] active:translate-y-0"
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>ADMIN LOGIN</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-5">
          {/* Separated Portal Selection Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-[#FFF8E7] border-2 border-[#303030] p-4 retro-shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-pixel text-[9px] text-[#4169E1] uppercase">
                  STUDENT PORTAL
                </div>
                <p className="text-xs text-[#303030] mt-1">
                  Enroll in an internship domain or sign in to access your tasks &amp; offer letter.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <RetroButton
                  type="button"
                  size="sm"
                  variant={mode === 'login' ? 'primary' : 'neutral'}
                  onClick={() => setMode('login')}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Student Login</span>
                </RetroButton>
                <RetroButton
                  type="button"
                  size="sm"
                  variant={mode === 'register' ? 'success' : 'neutral'}
                  onClick={() => setMode('register')}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register for Internship</span>
                </RetroButton>
              </div>
            </div>

            <div className="bg-[#182747] text-[#FFF8E7] border-2 border-[#303030] p-4 retro-shadow-sm flex items-center justify-between gap-3">
              <div>
                <div className="font-pixel text-[9px] text-[#F4C542] uppercase">
                  ADMIN PORTAL
                </div>
                <p className="text-xs text-[#F4EBD0] mt-1">
                  Authorized control panel
                </p>
              </div>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 px-3 py-2 bg-[#F4C542] text-[#182747] border-2 border-[#303030] font-mono-data font-bold text-xs uppercase tracking-wider shrink-0 transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#FFF8E7] active:translate-y-0"
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>ADMIN LOGIN</span>
              </Link>
            </div>
          </div>

          {mode === 'register' ? (
            <RetroWindow
              title="SKILLORA_INTERNSHIP_REGISTRATION.EXE"
              headerColor="navy"
            >
              {/* Brand Banner Inside Window */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-dotted border-[#303030]/40">
                <div className="space-y-2 max-w-2xl">
                  <Logo size="lg" />
                  <p className="text-sm sm:text-base text-[#182747] font-medium leading-relaxed pt-1">
                    Welcome to Skillora! Start your professional journey by registering for your
                    preferred internship domain.
                  </p>
                </div>
                <div className="bg-[#F4EBD0] border-2 border-[#303030] p-3 shrink-0 text-xs">
                  <div className="font-pixel text-[9px] text-[#4169E1] mb-1.5">
                    INSTANT ENROLLMENT
                  </div>
                  <p className="text-[#182747] font-semibold">Auto Student ID &amp; Offer Letter</p>
                  <p className="text-[#303030] mt-0.5">10 Industry Domains Available</p>
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-5" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="reg-fullname"
                      className="block text-xs font-bold uppercase tracking-wide text-[#182747] mb-1.5"
                    >
                      1. Full Name *
                    </label>
                    <input
                      id="reg-fullname"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className={inputClass}
                    />
                    {errors.fullName && (
                      <p className="text-xs font-semibold text-[#C94C4C] mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="reg-email"
                      className="block text-xs font-bold uppercase tracking-wide text-[#182747] mb-1.5"
                    >
                      2. Email Address *
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rahul.sharma@college.edu"
                      className={inputClass}
                    />
                    {errors.email && (
                      <p className="text-xs font-semibold text-[#C94C4C] mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label
                      htmlFor="reg-mobile"
                      className="block text-xs font-bold uppercase tracking-wide text-[#182747] mb-1.5"
                    >
                      3. Mobile Number *
                    </label>
                    <input
                      id="reg-mobile"
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="10-digit mobile number"
                      className={`${inputClass} font-mono-data`}
                    />
                    {errors.mobile && (
                      <p className="text-xs font-semibold text-[#C94C4C] mt-1">{errors.mobile}</p>
                    )}
                  </div>

                  {/* College */}
                  <div>
                    <label
                      htmlFor="reg-college"
                      className="block text-xs font-bold uppercase tracking-wide text-[#182747] mb-1.5"
                    >
                      4. College / University Name *
                    </label>
                    <input
                      id="reg-college"
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="Enter your institution name"
                      className={inputClass}
                    />
                    {errors.college && (
                      <p className="text-xs font-semibold text-[#C94C4C] mt-1">{errors.college}</p>
                    )}
                  </div>

                  {/* Current Course */}
                  <div>
                    <label
                      htmlFor="reg-course"
                      className="block text-xs font-bold uppercase tracking-wide text-[#182747] mb-1.5"
                    >
                      5. Current Course *
                    </label>
                    <input
                      id="reg-course"
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="e.g. B.Tech Computer Science / BCA / MBA"
                      className={inputClass}
                    />
                    {errors.course && (
                      <p className="text-xs font-semibold text-[#C94C4C] mt-1">{errors.course}</p>
                    )}
                  </div>

                  {/* Year / Semester */}
                  <div>
                    <label
                      htmlFor="reg-semester"
                      className="block text-xs font-bold uppercase tracking-wide text-[#182747] mb-1.5"
                    >
                      6. Year / Semester *
                    </label>
                    <input
                      id="reg-semester"
                      type="text"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      placeholder="e.g. 3rd Year / 6th Semester"
                      className={inputClass}
                    />
                    {errors.semester && (
                      <p className="text-xs font-semibold text-[#C94C4C] mt-1">{errors.semester}</p>
                    )}
                  </div>
                </div>

                {/* Internship Domain */}
                <div>
                  <label
                    htmlFor="reg-domain"
                    className="block text-xs font-bold uppercase tracking-wide text-[#182747] mb-1.5"
                  >
                    7. Internship Domain *
                  </label>
                  <select
                    id="reg-domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value as InternshipDomain)}
                    className={inputClass}
                  >
                    <option value="">-- Select Your Preferred Internship Domain --</option>
                    {INTERNSHIP_DOMAINS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {errors.domain && (
                    <p className="text-xs font-semibold text-[#C94C4C] mt-1">{errors.domain}</p>
                  )}
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="reg-password"
                      className="block text-xs font-bold uppercase tracking-wide text-[#182747] mb-1.5"
                    >
                      8. Password *
                    </label>
                    <input
                      id="reg-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className={inputClass}
                    />
                    {errors.password && (
                      <p className="text-xs font-semibold text-[#C94C4C] mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="reg-confirm-password"
                      className="block text-xs font-bold uppercase tracking-wide text-[#182747] mb-1.5"
                    >
                      9. Confirm Password *
                    </label>
                    <input
                      id="reg-confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className={inputClass}
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs font-semibold text-[#C94C4C] mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="p-3.5 bg-[#F4EBD0] border-2 border-[#303030]">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 w-5 h-5 accent-[#4169E1] border-2 border-[#303030] shrink-0 cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm text-[#182747] leading-relaxed">
                      <strong>10. Terms and Conditions:</strong> I confirm that the information
                      provided is accurate and I agree to complete my Skillora internship tasks and
                      project work with originality and integrity.
                    </span>
                  </label>
                  {errors.termsAccepted && (
                    <p className="text-xs font-semibold text-[#C94C4C] mt-2">
                      {errors.termsAccepted}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs font-bold text-[#4169E1] hover:underline text-left cursor-pointer"
                  >
                    Already registered? Sign in to your Student Terminal
                  </button>

                  <RetroButton type="submit" variant="success" size="lg">
                    <CheckSquare className="w-4 h-4" />
                    <span>[ REGISTER NOW ]</span>
                  </RetroButton>
                </div>
              </form>
            </RetroWindow>
          ) : (
            <RetroWindow
              title="SKILLORA_STUDENT_LOGIN.EXE"
              headerColor="blue"
            >
              <div className="max-w-md mx-auto py-4">
                <div className="flex justify-center mb-4">
                  <Logo size="md" />
                </div>
                <p className="text-sm text-center text-[#182747] mb-6">
                  Sign in with your registered student email and password to continue your
                  internship quests.
                </p>

                <form onSubmit={handleReturningLogin} className="space-y-4">
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block text-xs font-bold uppercase text-[#182747] mb-1.5"
                    >
                      Registered Email Address
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="student@example.edu"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-bold uppercase text-[#182747] mb-1.5"
                    >
                      Password
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={inputClass}
                    />
                  </div>

                  {loginError && (
                    <div className="p-3 bg-[#C94C4C]/15 border-2 border-[#C94C4C] text-xs font-bold text-[#8a2323]">
                      {loginError}
                    </div>
                  )}

                  <RetroButton type="submit" variant="primary" size="lg" className="w-full">
                    <KeyRound className="w-4 h-4" />
                    <span>SIGN IN TO DASHBOARD</span>
                  </RetroButton>
                </form>

                <div className="mt-5 pt-4 border-t-2 border-dotted border-[#303030]/40 text-center">
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-xs font-bold text-[#4169E1] hover:underline cursor-pointer"
                  >
                    New to Skillora? Create a Student Internship Account
                  </button>
                </div>
              </div>
            </RetroWindow>
          )}
        </div>
      </main>

      <RetroFooter portalLabel="Skillora Student Registration" showAdminLogin />

      {/* Registration Success Dialog */}
      <NotificationDialog
        open={successDialogOpen}
        title="SYSTEM_NOTIFICATION.EXE"
        message="REGISTRATION SUCCESSFUL! YOUR INTERNSHIP JOURNEY HAS STARTED."
        type="success"
        confirmLabel="[ CONTINUE TO OFFER LETTER ]"
        onConfirm={handleContinueToOfferLetter}
      />

      {/* Duplicate Email / Error Dialog */}
      <NotificationDialog
        open={Boolean(errorDialogMsg)}
        title="REGISTRATION_ERROR.EXE"
        message={errorDialogMsg || ''}
        type="error"
        confirmLabel="OK"
        onConfirm={() => setErrorDialogMsg(null)}
      />
    </div>
  );
};
