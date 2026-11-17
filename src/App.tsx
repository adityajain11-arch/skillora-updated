import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { LoadingScreen } from './components/LoadingScreen';
import { StudentLayout } from './layouts/StudentLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Student Pages
import { Registration } from './pages/student/Registration';
import { OfferLetter } from './pages/student/OfferLetter';
import { Dashboard } from './pages/student/Dashboard';
import { Tasks } from './pages/student/Tasks';
import { ProjectSubmission } from './pages/student/ProjectSubmission';
import { Certificate } from './pages/student/Certificate';
import { Profile } from './pages/student/Profile';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentManagement } from './pages/admin/StudentManagement';
import { InternshipManagement } from './pages/admin/InternshipManagement';
import { OfferLetterManagement } from './pages/admin/OfferLetterManagement';
import { DocumentCustomization } from './pages/admin/DocumentCustomization';
import { IssuedDocuments } from './pages/admin/IssuedDocuments';
import { TaskManagement } from './pages/admin/TaskManagement';
import { SubmissionManagement } from './pages/admin/SubmissionManagement';
import { CertificateManagement } from './pages/admin/CertificateManagement';
import { InternshipChangeLog } from './pages/admin/InternshipChangeLog';
import { AdminSettings } from './pages/admin/AdminSettings';

const RootRedirect: React.FC = () => {
  const { session } = useAuth();
  if (session.role === 'student' && session.studentId) {
    return <Navigate to="/student/dashboard" replace />;
  }
  if (session.role === 'admin' && session.adminEmail) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/student/register" replace />;
};

const PortalRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* Public Student Registration / Sign In Landing */}
      <Route path="/student/register" element={<Registration />} />

      {/* Protected Student Portal Routes */}
      <Route element={<StudentLayout />}>
        <Route path="/student/offer-letter" element={<OfferLetter />} />
        <Route path="/student/dashboard" element={<Dashboard />} />
        <Route path="/student/tasks" element={<Tasks />} />
        <Route path="/student/submission" element={<ProjectSubmission />} />
        <Route path="/student/certificate" element={<Certificate />} />
        <Route path="/student/profile" element={<Profile />} />
      </Route>

      {/* Separate Admin Login */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Control Room Routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<StudentManagement />} />
        <Route path="/admin/internships" element={<InternshipManagement />} />
        <Route path="/admin/offer-letters" element={<OfferLetterManagement />} />
        <Route path="/admin/documents" element={<DocumentCustomization />} />
        <Route path="/admin/documents/:docType" element={<DocumentCustomization />} />
        <Route path="/admin/issued-documents" element={<IssuedDocuments />} />
        <Route path="/admin/tasks" element={<TaskManagement />} />
        <Route path="/admin/submissions" element={<SubmissionManagement />} />
        <Route path="/admin/certificates" element={<CertificateManagement />} />
        <Route path="/admin/change-log" element={<InternshipChangeLog />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};

export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 450);
    return () => clearTimeout(timer);
  }, []);

  if (booting) {
    return <LoadingScreen progress={92} />;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <PortalRoutes />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
