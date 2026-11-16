import React from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  FolderGit2,
  ScrollText,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { INTERNSHIP_DOMAINS } from '../../types';
import { DashboardCard } from '../../components/DashboardCard';
import { RetroWindow } from '../../components/RetroWindow';

const CHART_COLORS = ['#4169E1', '#4E8B62', '#F4C542', '#C94C4C', '#182747'];

export const AdminDashboard: React.FC = () => {
  const { state } = useApp();

  const totalStudents = state.students.length;
  const totalApplications = state.students.length;
  const activeInterns = state.students.filter(
    (s) =>
      s.internshipStatus === 'Registered' ||
      s.internshipStatus === 'Offer Letter Issued' ||
      s.internshipStatus === 'Internship Active'
  ).length;
  const offerLettersGenerated = state.students.filter(
    (s) => s.offerLetterStatus === 'GENERATED'
  ).length;
  const totalProjectsSubmitted = state.projectSubmissions.length;
  const projectsApproved = state.projectSubmissions.filter(
    (p) => p.status === 'APPROVED'
  ).length;
  const projectsPendingReview = state.projectSubmissions.filter(
    (p) => p.status === 'SUBMITTED'
  ).length;
  const certificatesIssued = state.certificates.length;
  const lorsIssued = state.lors.length;

  // Chart 1: Students by Internship Domain
  const domainData = INTERNSHIP_DOMAINS.map((domain) => ({
    domain: domain
      .replace('Artificial Intelligence & Machine Learning', 'AI & ML')
      .replace('Development', 'Dev')
      .replace('Digital Marketing', 'Mktg'),
    students: state.students.filter((s) => s.domain === domain).length,
  })).filter((d) => d.students > 0 || ['Web Dev', 'Python Dev', 'Data Science', 'UI/UX Design', 'AI & ML'].includes(d.domain));

  // Chart 2: Registration Overview by Month/Date
  const regByDateMap = new Map<string, number>();
  const sortedStudents = [...state.students].sort(
    (a, b) => new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime()
  );
  for (const s of sortedStudents) {
    const label = new Date(s.registrationDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
    regByDateMap.set(label, (regByDateMap.get(label) || 0) + 1);
  }
  let cumulative = 0;
  const registrationData = Array.from(regByDateMap.entries()).map(([date, count]) => {
    cumulative += count;
    return { date, registrations: count, cumulative };
  });

  // Chart 3: Project Submission Status
  const submissionStatusData = [
    {
      name: 'Approved',
      value: state.projectSubmissions.filter((p) => p.status === 'APPROVED').length,
      color: '#4E8B62',
    },
    {
      name: 'Pending Review',
      value: state.projectSubmissions.filter((p) => p.status === 'SUBMITTED').length,
      color: '#F4C542',
    },
    {
      name: 'Needs Revision',
      value: state.projectSubmissions.filter((p) => p.status === 'NEEDS REVISION').length,
      color: '#C94C4C',
    },
    {
      name: 'Not Submitted',
      value: Math.max(0, totalStudents - totalProjectsSubmitted),
      color: '#182747',
    },
  ].filter((d) => d.value > 0);

  // Chart 4: Certificate & LOR Issuance Overview
  const eligibleCount = projectsApproved;
  const issuanceData = [
    { metric: 'Eligible Interns', count: eligibleCount },
    { metric: 'Certificates Issued', count: certificatesIssued },
    { metric: 'LORs Issued', count: lorsIssued },
  ];

  return (
    <div className="space-y-6">
      {/* 9 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Total Registered Students"
          value={totalStudents}
          subtitle="All enrolled Skillora interns"
          accent="navy"
          icon={<Users className="w-4 h-4" />}
        />
        <DashboardCard
          title="Total Applications"
          value={totalApplications}
          subtitle="Verified registration intake"
          accent="blue"
          icon={<FileCheck2 className="w-4 h-4" />}
        />
        <DashboardCard
          title="Active Interns"
          value={activeInterns}
          subtitle="Currently working or under review"
          accent="green"
          icon={<UserCheck className="w-4 h-4" />}
        />
        <DashboardCard
          title="Offer Letters Generated"
          value={offerLettersGenerated}
          subtitle="Auto-issued official letters"
          accent="blue"
          icon={<FileText className="w-4 h-4" />}
        />
        <DashboardCard
          title="Total Projects Submitted"
          value={totalProjectsSubmitted}
          subtitle="Capstone deliverables uploaded"
          accent="navy"
          icon={<FolderGit2 className="w-4 h-4" />}
        />
        <DashboardCard
          title="Projects Approved"
          value={projectsApproved}
          subtitle="Cleared for certification"
          accent="green"
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <DashboardCard
          title="Projects Pending Review"
          value={projectsPendingReview}
          subtitle="Awaiting admin evaluation"
          accent={projectsPendingReview > 0 ? 'yellow' : 'navy'}
          icon={<Clock className="w-4 h-4" />}
        />
        <DashboardCard
          title="Certificates Issued"
          value={certificatesIssued}
          subtitle="Verified completion credentials"
          accent="green"
          icon={<Award className="w-4 h-4" />}
        />
        <DashboardCard
          title="LORs Issued"
          value={lorsIssued}
          subtitle="Letters of Recommendation"
          accent="blue"
          icon={<ScrollText className="w-4 h-4" />}
        />
      </div>

      {/* 4 Retro-Inspired Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RetroWindow title="CHART_01_STUDENTS_BY_DOMAIN.EXE" headerColor="navy">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainData} margin={{ top: 10, right: 16, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#303030" opacity={0.2} />
                <XAxis
                  dataKey="domain"
                  tick={{ fill: '#182747', fontSize: 11, fontWeight: 600 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#182747', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8E7',
                    border: '2px solid #303030',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="students" name="Students" fill="#4169E1" stroke="#303030" strokeWidth={1.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </RetroWindow>

        <RetroWindow title="CHART_02_REGISTRATION_OVERVIEW.EXE" headerColor="blue">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationData} margin={{ top: 10, right: 16, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#303030" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fill: '#182747', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#182747', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8E7',
                    border: '2px solid #303030',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="stepAfter"
                  dataKey="cumulative"
                  name="Total Enrolled"
                  stroke="#4E8B62"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#F4C542', stroke: '#303030', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </RetroWindow>

        <RetroWindow title="CHART_03_PROJECT_SUBMISSION_STATUS.EXE" headerColor="green">
          <div className="h-72 w-full flex flex-col sm:flex-row items-center">
            <div className="w-full sm:w-3/5 h-56 sm:h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={submissionStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={82}
                    stroke="#303030"
                    strokeWidth={2}
                  >
                    {submissionStatusData.map((entry, idx) => (
                      <Cell key={entry.name} fill={entry.color || CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF8E7',
                      border: '2px solid #303030',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-2/5 space-y-2 px-2">
              {submissionStatusData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs border-b border-dotted border-[#303030]/30 pb-1"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 border border-[#303030] shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-[#182747]">{item.name}</span>
                  </div>
                  <span className="font-mono-data font-bold text-[#182747]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </RetroWindow>

        <RetroWindow title="CHART_04_CERTIFICATE_ISSUANCE.EXE" headerColor="navy">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issuanceData} margin={{ top: 10, right: 16, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#303030" opacity={0.2} />
                <XAxis dataKey="metric" tick={{ fill: '#182747', fontSize: 11, fontWeight: 600 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#182747', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8E7',
                    border: '2px solid #303030',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Count" fill="#F4C542" stroke="#303030" strokeWidth={1.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </RetroWindow>
      </div>
    </div>
  );
};
