import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { ReportPageHeader, KpiCard, SectionCard, GLOBAL_STYLES } from '../components/ReportShared.jsx';
import {
  AlertCircle, FileText, Search, List, Inbox, CheckCircle2, Clock, ShieldAlert,
  ArrowRight, Award, UserCheck, Layers, FileCheck, RefreshCw, AlertTriangle, Filter, Check
} from 'lucide-react';

const OFFICER_DEPT_MAP = {
  john: 'Health Department',
  mark: 'Revenue Department',
  ryan: 'Municipal Corporation',
  chris: 'Water Department',
  ethan: 'Roads Department',
  jack: 'Electricity Department',
  david: 'Social Welfare Department',
  will: 'Urban Planning Department',
  emily: 'Education Department'
};

function certStatusVariant(status) {
  if (['SUBMITTED', 'RESUBMITTED'].includes(status)) return { bg: '#fff7ed', color: '#c2410c', border: '#ffedd5' };
  if (status === 'UNDER_VERIFICATION') return { bg: '#eff6ff', color: '#1d4ed8', border: '#dbeafe' };
  if (['APPROVED', 'CERTIFICATE_GENERATED', 'DOWNLOADED'].includes(status)) return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
  return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };
}

function compStatusVariant(status) {
  if (['NEW', 'ASSIGNED'].includes(status)) return { bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
  if (status === 'IN_PROGRESS') return { bg: '#eff6ff', color: '#1d4ed8', border: '#dbeafe' };
  if (status === 'CLOSED') return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
  return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
}

function OfficerDashboard() {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';
  const location = useLocation();
  const navigate = useNavigate();

  const isComplaintsPage = location.pathname === '/officer';
  const isCertificatesPage = location.pathname.includes('/services/officer/dashboard');

  const [certStats, setCertStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [officerDept, setOfficerDept] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Filter Tabs
  const [complaintTab, setComplaintTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'RESOLVED'
  const [certTab, setCertTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

  let username = keycloak.tokenParsed?.preferred_username || 'Officer';
  if (!keycloak.tokenParsed && localStorage.getItem('kc_token')) {
    try {
      const parsed = JSON.parse(atob(localStorage.getItem('kc_token').split('.')[1]));
      if (parsed.preferred_username) username = parsed.preferred_username;
    } catch (e) {}
  }
  const name = keycloak.tokenParsed?.name || username;

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, recentRes, complaintsRes] = await Promise.allSettled([
        api.get('/service-management-service/api/services/officer/stats'),
        api.get('/service-management-service/api/services/officer/recent'),
        api.get('/grievance-service/api/complaints/officer?size=50')
      ]);
      
      if (statsRes.status === 'fulfilled') setCertStats(statsRes.value.data);
      if (recentRes.status === 'fulfilled') setRecentApps(recentRes.value.data || []);
      if (complaintsRes.status === 'fulfilled') {
        setComplaints(complaintsRes.value.data.content || complaintsRes.value.data || []);
      }
      
      let u = username.toLowerCase();
      let dept = keycloak.tokenParsed?.department;
      if (!dept) {
        for (const [key, deptName] of Object.entries(OFFICER_DEPT_MAP)) {
          if (u.includes(key)) {
            dept = deptName;
            break;
          }
        }
        if (!dept) {
          const deptKeywords = {
            health: 'Health Department',
            revenue: 'Revenue Department',
            municipal: 'Municipal Corporation',
            water: 'Water Department',
            roads: 'Roads Department',
            electricity: 'Electricity Department',
            socialwelfare: 'Social Welfare Department',
            welfare: 'Social Welfare Department',
            urban: 'Urban Planning Department',
            education: 'Education Department',
            sanitation: 'Sanitation Department'
          };
          for (const [kw, deptName] of Object.entries(deptKeywords)) {
            if (u.includes(kw)) {
              dept = deptName;
              break;
            }
          }
        }
      }
      setOfficerDept(dept || 'Municipal Department');
      
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const pendingApps = recentApps.filter(app => ['SUBMITTED', 'RESUBMITTED', 'UNDER_VERIFICATION'].includes(app.status));
  const approvedApps = recentApps.filter(app => ['APPROVED', 'CERTIFICATE_GENERATED', 'DOWNLOADED'].includes(app.status));
  const rejectedApps = recentApps.filter(app => app.status === 'REJECTED');

  const pendingComplaints = complaints.filter(c => !['RESOLVED', 'CLOSED'].includes(c.status));
  const resolvedComplaints = complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status));

  const totalCases = complaints.length + recentApps.length;
  const totalResolved = resolvedComplaints.length + approvedApps.length;
  const resolutionRate = totalCases > 0 ? Math.round((totalResolved / totalCases) * 100) : 100;

  const complaintResolutionRate = complaints.length > 0 ? Math.round((resolvedComplaints.length / complaints.length) * 100) : 100;
  const certApprovalRate = recentApps.length > 0 ? Math.round((approvedApps.length / recentApps.length) * 100) : 100;

  // Filtered Lists
  const filteredComplaints = complaints.filter(c => {
    if (complaintTab === 'ACTIVE') return !['RESOLVED', 'CLOSED'].includes(c.status);
    if (complaintTab === 'RESOLVED') return ['RESOLVED', 'CLOSED'].includes(c.status);
    return true;
  });

  const filteredCerts = recentApps.filter(app => {
    if (certTab === 'PENDING') return ['SUBMITTED', 'RESUBMITTED', 'UNDER_VERIFICATION'].includes(app.status);
    if (certTab === 'APPROVED') return ['APPROVED', 'CERTIFICATE_GENERATED', 'DOWNLOADED'].includes(app.status);
    if (certTab === 'REJECTED') return app.status === 'REJECTED';
    return true;
  });

  const shellTitle = isComplaintsPage
    ? "Assigned Complaints Workspace"
    : isCertificatesPage
    ? "Assigned Certificates Workspace"
    : "Officer Operations Command";

  const pageTitle = isComplaintsPage
    ? `${officerDept || 'Department'} Assigned Grievances Operations`
    : isCertificatesPage
    ? `${officerDept || 'Department'} Certificate Verification Command`
    : `${officerDept || 'Department'} Operations Command`;

  const pageSubtitle = isComplaintsPage
    ? `Officer: ${name} (@${username}) — Grievance resolution queue & field inspection SLA`
    : isCertificatesPage
    ? `Officer: ${name} (@${username}) — Real-time certificate application verification & approval queue`
    : `Officer: ${name} (@${username}) — Real-time verification queue and escalation dispatch`;

  if (isLoading && !recentApps.length && !complaints.length) {
    return <AppShell title={shellTitle}><PageLoader message="Loading Officer Workspace..." /></AppShell>;
  }

  return (
    <AppShell title={shellTitle}>
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '12px 0 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <ReportPageHeader
          title={pageTitle}
          subtitle={pageSubtitle}
          icon={isComplaintsPage ? AlertTriangle : isCertificatesPage ? FileCheck : UserCheck}
          iconBg={isComplaintsPage ? "linear-gradient(135deg, #7c2d12, #c2410c)" : isCertificatesPage ? "linear-gradient(135deg, #1e3a8a, #2563eb)" : "linear-gradient(135deg, #0f172a, #334155)"}
          iconColor="#ffffff"
          isDark={isDark}
          lastRefresh={lastRefresh}
          onRefresh={fetchDashboardData}
          refreshing={isLoading}
        />

        {/* ── KPI Stat Cards ────────────────────────────────────────────────── */}
        {isComplaintsPage ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <KpiCard icon={AlertTriangle} label="Active Complaints" value={pendingComplaints.length} subtitle="Grievance SLA queue" color="#f59e0b" bg="#fff7ed" isDark={isDark} />
            <KpiCard icon={CheckCircle2} label="Resolved Grievances" value={resolvedComplaints.length} subtitle="Closed & resolved cases" color="#10b981" bg="#f0fdf4" isDark={isDark} />
            <KpiCard icon={List} label="Total Assigned Cases" value={complaints.length} subtitle="Complaints assigned to officer" color="#3b82f6" bg="#eff6ff" isDark={isDark} />
            <KpiCard icon={Award} label="Grievance SLA Compliance" value={`${complaintResolutionRate}%`} subtitle="Resolution performance" color="#8b5cf6" bg="#f5f3ff" isDark={isDark} />
          </div>
        ) : isCertificatesPage ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <KpiCard icon={FileText} label="Pending Verification" value={pendingApps.length} subtitle="Requires officer approval" color="#3b82f6" bg="#eff6ff" isDark={isDark} />
            <KpiCard icon={CheckCircle2} label="Approved Certificates" value={approvedApps.length} subtitle="Cleared & generated" color="#10b981" bg="#f0fdf4" isDark={isDark} />
            <KpiCard icon={FileCheck} label="Total Applications" value={recentApps.length} subtitle="Processed by department" color="#8b5cf6" bg="#f5f3ff" isDark={isDark} />
            <KpiCard icon={Award} label="Verification Approval Rate" value={`${certApprovalRate}%`} subtitle="Certificate clearance metric" color="#06b6d4" bg="#ecfeff" isDark={isDark} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <KpiCard icon={FileText} label="Pending Applications" value={pendingApps.length} subtitle="Requires officer verification" color="#3b82f6" bg="#eff6ff" isDark={isDark} />
            <KpiCard icon={AlertTriangle} label="Active Complaints" value={pendingComplaints.length} subtitle="Grievance SLA queue" color="#f59e0b" bg="#fff7ed" isDark={isDark} />
            <KpiCard icon={CheckCircle2} label="Cases Resolved" value={totalResolved} subtitle="Certificates & complaints" color="#10b981" bg="#f0fdf4" isDark={isDark} />
            <KpiCard icon={Award} label="Overall Resolution Rate" value={`${resolutionRate}%`} subtitle="Performance compliance" color="#8b5cf6" bg="#f5f3ff" isDark={isDark} />
          </div>
        )}

        {/* ── Quick Navigation Pill ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={() => navigate('/services/officer/dashboard')}
            style={{
              padding: '10px 18px', borderRadius: 12, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s ease',
              background: isCertificatesPage ? '#2563eb' : (isDark ? '#1e293b' : '#f1f5f9'),
              color: isCertificatesPage ? '#ffffff' : (isDark ? '#94a3b8' : '#475569'),
              boxShadow: isCertificatesPage ? '0 4px 12px rgba(37,99,235,0.25)' : 'none'
            }}
          >
            <FileCheck size={16} /> Assigned Certificates ({pendingApps.length})
          </button>

          <button
            onClick={() => navigate('/officer')}
            style={{
              padding: '10px 18px', borderRadius: 12, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s ease',
              background: isComplaintsPage ? '#d97706' : (isDark ? '#1e293b' : '#f1f5f9'),
              color: isComplaintsPage ? '#ffffff' : (isDark ? '#94a3b8' : '#475569'),
              boxShadow: isComplaintsPage ? '0 4px 12px rgba(217,119,6,0.25)' : 'none'
            }}
          >
            <AlertTriangle size={16} /> Assigned Complaints ({pendingComplaints.length})
          </button>

          <button
            onClick={() => navigate('/welfare/department-dashboard')}
            style={{
              padding: '10px 18px', borderRadius: 12, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s ease',
              background: isDark ? '#1e293b' : '#f1f5f9',
              color: isDark ? '#94a3b8' : '#475569'
            }}
          >
            <Layers size={16} /> Welfare Verification Dashboard
          </button>
        </div>

        {/* ── WORKSPACE CONTENT ────────────────────────────────────────────── */}

        {/* MODE 1: ASSIGNED COMPLAINTS WORKSPACE */}
        {isComplaintsPage && (
          <SectionCard
            title="Active Grievances Queue"
            subtitle="Citizen complaints assigned to your department field officer queue"
            icon={List}
            isDark={isDark}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Filter Sub-Tabs */}
              <div style={{ display: 'flex', gap: 8, borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, paddingBottom: 10 }}>
                {[
                  { id: 'ALL', label: `All Grievances (${complaints.length})` },
                  { id: 'ACTIVE', label: `Active SLA Queue (${pendingComplaints.length})` },
                  { id: 'RESOLVED', label: `Resolved & Closed (${resolvedComplaints.length})` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setComplaintTab(tab.id)}
                    style={{
                      padding: '6px 14px', borderRadius: 8, border: 'none',
                      fontWeight: 800, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                      background: complaintTab === tab.id ? '#d97706' : 'transparent',
                      color: complaintTab === tab.id ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b')
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {filteredComplaints.length === 0 ? (
                <div style={{
                  padding: '48px 24px', textAlign: 'center', background: isDark ? '#0f172a' : '#f8fafc',
                  borderRadius: 16, border: `1.5px solid ${isDark ? '#334155' : '#e2e8f0'}`
                }}>
                  <div style={{ width: 54, height: 54, borderRadius: 16, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a' }}>No Assigned Complaints Found</h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', maxWidth: 420, margin: '0 auto' }}>
                    There are currently no citizen complaints matching filter <strong>"{complaintTab}"</strong> assigned to your department queue.
                  </p>
                </div>
              ) : (
                filteredComplaints.map(c => {
                  const badgeStyle = compStatusVariant(c.status);
                  return (
                    <div
                      key={c.complaintId}
                      style={{
                        padding: '18px 20px', borderRadius: 14,
                        background: isDark ? '#0f172a' : '#ffffff',
                        border: `1.5px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 260 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 800, color: '#d97706', background: '#fff7ed', padding: '2px 8px', borderRadius: 6, border: '1px solid #fed7aa' }}>
                            #COMP-{c.complaintId}
                          </span>
                          <span style={{
                            fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 12,
                            background: badgeStyle.bg, color: badgeStyle.color, border: `1px solid ${badgeStyle.border}`
                          }}>
                            {c.status}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: c.priority === 'HIGH' ? '#dc2626' : '#d97706', background: c.priority === 'HIGH' ? '#fef2f2' : '#fff7ed', padding: '2px 8px', borderRadius: 10 }}>
                            Priority: {c.priority || 'NORMAL'}
                          </span>
                        </div>

                        <h3 style={{ margin: '8px 0 4px', fontSize: 16, fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a' }}>
                          {c.title}
                        </h3>

                        <div style={{ fontSize: 12.5, color: '#64748b', display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 4 }}>
                          <span>Department: <strong style={{ color: isDark ? '#cbd5e1' : '#334155' }}>{c.department || officerDept}</strong></span>
                          {c.category && <span>Category: <strong>{c.category}</strong></span>}
                          {c.createdAt && <span>Submitted: <strong>{new Date(c.createdAt).toLocaleDateString('en-IN')}</strong></span>}
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/complaints/${c.complaintId}`)}
                        style={{
                          padding: '10px 18px', borderRadius: 10,
                          border: `1.5px solid ${isDark ? '#475569' : '#cbd5e1'}`,
                          background: isDark ? '#1e293b' : '#ffffff',
                          color: isDark ? '#f1f5f9' : '#0f172a',
                          fontSize: 13, fontWeight: 800, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s'
                        }}
                      >
                        Inspect Case <ArrowRight size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </SectionCard>
        )}

        {/* MODE 2: ASSIGNED CERTIFICATES WORKSPACE */}
        {isCertificatesPage && (
          <SectionCard
            title="Certificate Verification Queue"
            subtitle="Service certificate applications awaiting officer verification and digital signature approval"
            icon={FileCheck}
            isDark={isDark}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Filter Sub-Tabs */}
              <div style={{ display: 'flex', gap: 8, borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, paddingBottom: 10 }}>
                {[
                  { id: 'ALL', label: `All Applications (${recentApps.length})` },
                  { id: 'PENDING', label: `Pending Approval (${pendingApps.length})` },
                  { id: 'APPROVED', label: `Approved (${approvedApps.length})` },
                  { id: 'REJECTED', label: `Rejected (${rejectedApps.length})` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setCertTab(tab.id)}
                    style={{
                      padding: '6px 14px', borderRadius: 8, border: 'none',
                      fontWeight: 800, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                      background: certTab === tab.id ? '#2563eb' : 'transparent',
                      color: certTab === tab.id ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b')
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {filteredCerts.length === 0 ? (
                <div style={{
                  padding: '48px 24px', textAlign: 'center', background: isDark ? '#0f172a' : '#f8fafc',
                  borderRadius: 16, border: `1.5px solid ${isDark ? '#334155' : '#e2e8f0'}`
                }}>
                  <div style={{ width: 54, height: 54, borderRadius: 16, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Inbox size={28} />
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a' }}>No Assigned Certificate Applications Found</h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', maxWidth: 420, margin: '0 auto' }}>
                    There are currently no service certificate applications matching filter <strong>"{certTab}"</strong> assigned to your department queue.
                  </p>
                </div>
              ) : (
                filteredCerts.map(app => {
                  const badgeStyle = certStatusVariant(app.status);
                  const isPending = ['SUBMITTED', 'RESUBMITTED', 'UNDER_VERIFICATION'].includes(app.status);

                  return (
                    <div
                      key={app.applicationId}
                      style={{
                        padding: '18px 20px', borderRadius: 14,
                        background: isDark ? '#0f172a' : '#ffffff',
                        border: `1.5px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 260 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: 6, border: '1px solid #bfdbfe' }}>
                            {app.applicationNumber}
                          </span>
                          <span style={{
                            fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 12,
                            background: badgeStyle.bg, color: badgeStyle.color, border: `1px solid ${badgeStyle.border}`
                          }}>
                            {app.status}
                          </span>
                        </div>

                        <h3 style={{ margin: '8px 0 4px', fontSize: 16, fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a' }}>
                          {app.applicantName}
                        </h3>

                        <div style={{ fontSize: 12.5, color: '#64748b', display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 4 }}>
                          <span>Service: <strong style={{ color: isDark ? '#cbd5e1' : '#334155' }}>{app.serviceType?.replace(/_/g, ' ')}</strong></span>
                          <span>Applied: <strong>{new Date(app.appliedDate).toLocaleDateString('en-IN')}</strong></span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/services/officer/verify/${app.applicationId}`)}
                        style={{
                          padding: '10px 18px', borderRadius: 10, border: 'none',
                          background: isPending ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : (isDark ? '#334155' : '#e2e8f0'),
                          color: isPending ? '#fff' : (isDark ? '#f1f5f9' : '#475569'),
                          fontSize: 13, fontWeight: 800, cursor: 'pointer',
                          boxShadow: isPending ? '0 4px 12px rgba(59,130,246,0.3)' : 'none',
                          display: 'flex', alignItems: 'center', gap: 6
                        }}
                      >
                        {isPending ? 'Verify / Approve' : 'View Application'} <ArrowRight size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </SectionCard>
        )}

        {/* FALLBACK MODE: COMBINED WORKSTATION (If accessed outside the 2 main routes) */}
        {!isComplaintsPage && !isCertificatesPage && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            
            {/* LEFT: Pending Certificate Verifications */}
            <SectionCard
              title="Certificate Verification Queue"
              subtitle="Applications awaiting digital signature clearance"
              icon={FileText}
              isDark={isDark}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentApps.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    No certificate applications assigned to your department.
                  </div>
                ) : (
                  recentApps.slice(0, 5).map(app => {
                    const badgeStyle = certStatusVariant(app.status);
                    const isPending = ['SUBMITTED', 'RESUBMITTED', 'UNDER_VERIFICATION'].includes(app.status);

                    return (
                      <div
                        key={app.applicationId}
                        style={{
                          padding: '16px 18px', borderRadius: 12,
                          background: isDark ? '#0f172a' : '#f8fafc',
                          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 800, color: '#3b82f6' }}>{app.applicationNumber}</span>
                            <span style={{
                              fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 12,
                              background: badgeStyle.bg, color: badgeStyle.color, border: `1px solid ${badgeStyle.border}`
                            }}>
                              {app.status}
                            </span>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a', marginTop: 4 }}>
                            {app.applicantName}
                          </div>
                          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                            {app.serviceType?.replace(/_/g, ' ')} · Applied: {new Date(app.appliedDate).toLocaleDateString('en-IN')}
                          </div>
                        </div>

                        <button
                          onClick={() => navigate(`/services/officer/verify/${app.applicationId}`)}
                          style={{
                            padding: '8px 14px', borderRadius: 8, border: 'none',
                            background: isPending ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : (isDark ? '#334155' : '#e2e8f0'),
                            color: isPending ? '#fff' : (isDark ? '#f1f5f9' : '#475569'),
                            fontSize: 12, fontWeight: 800, cursor: 'pointer',
                            boxShadow: isPending ? '0 2px 8px rgba(59,130,246,0.3)' : 'none'
                          }}
                        >
                          {isPending ? 'Verify / Approve' : 'View'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </SectionCard>

            {/* RIGHT: Active Grievances Queue */}
            <SectionCard
              title="Active Grievances Queue"
              subtitle="Citizen complaints assigned to field officer"
              icon={List}
              isDark={isDark}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {complaints.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    No complaints currently assigned to your queue.
                  </div>
                ) : (
                  complaints.slice(0, 5).map(c => {
                    const badgeStyle = compStatusVariant(c.status);
                    return (
                      <div
                        key={c.complaintId}
                        style={{
                          padding: '16px 18px', borderRadius: 12,
                          background: isDark ? '#0f172a' : '#f8fafc',
                          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a' }}>{c.title}</span>
                            <span style={{
                              fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 12,
                              background: badgeStyle.bg, color: badgeStyle.color, border: `1px solid ${badgeStyle.border}`
                            }}>
                              {c.status}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                            Dept: <strong>{c.department || officerDept}</strong> · Priority: <strong style={{ color: c.priority === 'HIGH' ? '#ef4444' : '#f59e0b' }}>{c.priority || 'NORMAL'}</strong>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate(`/complaints/${c.complaintId}`)}
                          style={{
                            padding: '8px 14px', borderRadius: 8,
                            border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`,
                            background: isDark ? '#334155' : '#fff',
                            color: isDark ? '#f1f5f9' : '#0f172a',
                            fontSize: 12, fontWeight: 800, cursor: 'pointer'
                          }}
                        >
                          Inspect Case
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </SectionCard>

          </div>
        )}

      </div>
      <style>{`${GLOBAL_STYLES}`}</style>
    </AppShell>
  );
}

export default OfficerDashboard;

