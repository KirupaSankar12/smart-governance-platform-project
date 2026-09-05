import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext.jsx';
import axios from 'axios';
import api from '../api.js';

import keycloak from '../keycloak.js';
import LanguageSelector from '../components/LanguageSelector.jsx';
import heroImg from '../assets/hero_governance.png';
import { 
  Landmark, AlertTriangle, Info, ShieldAlert, BadgeCheck,
  Droplets, Route, Zap, Trash2, HeartPulse, FileText, FileSignature, Building2,
  PenSquare, Search, LogIn, Activity, ShieldCheck, Smartphone, CheckCircle, Bell,
  PhoneCall, BookOpen, HelpCircle, ArrowRight, CheckCircle2, Award, Sparkles, ChevronRight,
  Users, User, Clock, MessageSquare, Send, ThumbsUp, Heart, Flame, Share2,
  QrCode, ExternalLink, RefreshCw, Filter, Sparkle, Bot, Shield, CheckCheck, Play, Eye,
  X, MessageCircle, ChevronUp, ChevronDown, Check, CornerDownRight, Lock, Compass,
  BarChart3, Wallet, CircleDollarSign, Star, TrendingUp, Globe, Server, Cpu, Zap as ZapIcon
} from 'lucide-react';

// ── Quick Access Hero Action Cards ──
const heroQuickActions = [
  {
    icon: PenSquare,
    title: 'File Civic Grievance',
    desc: 'Report road damage, water leaks, or power outages with instant officer dispatch.',
    tag: '12h–24h SLA',
    tagColor: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.02))',
    borderColor: 'rgba(239,68,68,0.22)',
    to: '/login',
    tourKey: 'grievance'
  },
  {
    icon: FileText,
    title: 'Apply e-Certificates',
    desc: 'Birth, Income, Residence & Caste certificates with digital cryptographic signature.',
    tag: '100% Paperless',
    tagColor: '#2563eb',
    bgGradient: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(37,99,235,0.02))',
    borderColor: 'rgba(37,99,235,0.22)',
    to: '/login',
    tourKey: 'certificates'
  },
  {
    icon: Sparkles,
    title: 'State Welfare Schemes',
    desc: 'Check Aadhaar eligibility for Direct Benefit Transfer (DBT) and farmer pensions.',
    tag: 'Direct DBT',
    tagColor: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.02))',
    borderColor: 'rgba(245,158,11,0.22)',
    to: '/login',
    tourKey: 'welfare'
  },
  {
    icon: Search,
    title: 'Live SLA Ticket Tracker',
    desc: 'Real-time timeline tracking on the Apache Kafka Event Bus with escalation timers.',
    tag: 'Real-Time Sync',
    tagColor: '#10b981',
    bgGradient: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02))',
    borderColor: 'rgba(16,185,129,0.22)',
    to: '#tracker',
    tourKey: 'tracker-card'
  }
];

// ── Official Broadcast Notices ──
const initialNotices = [
  {
    id: 'n1',
    category: 'WATER SUPPLY',
    badgeColor: '#0284c7',
    badgeBg: 'rgba(2, 132, 199, 0.12)',
    title: 'Scheduled Water Supply Maintenance in Ward 7–12',
    desc: 'Pipeline rejuvenation work scheduled on 10th July between 06:00 AM – 02:00 PM. Clean water tankers are pre-stationed at public junctions.',
    date: 'Today at 09:30 AM',
    author: 'Municipal Water Board',
    icon: Droplets,
    likes: 342,
    hearts: 128,
    fires: 45,
    views: '4.8k'
  },
  {
    id: 'n2',
    category: 'ROADS & INFRA',
    badgeColor: '#d97706',
    badgeBg: 'rgba(217, 119, 6, 0.12)',
    title: 'NH-48 Elevated Corridor Smart Resurfacing',
    desc: 'Flyover maintenance underway. Heavy vehicles rerouted via Outer Ring Road. Live traffic updates broadcasted via Smart Governance GPS map.',
    date: 'Yesterday at 04:15 PM',
    author: 'Roads & Infrastructure Directorate',
    icon: Route,
    likes: 512,
    hearts: 94,
    fires: 73,
    views: '7.2k'
  },
  {
    id: 'n3',
    category: 'EMERGENCY ADVISORY',
    badgeColor: '#ef4444',
    badgeBg: 'rgba(239, 68, 68, 0.12)',
    title: '24×7 Central Disaster Helpline 1800-11-2026 Active',
    desc: 'Dedicated round-the-clock emergency response teams on standby for monsoon waterlogging, fallen trees, and electrical line repairs.',
    date: '04 July 2026',
    author: 'Disaster Management Authority',
    icon: ShieldAlert,
    likes: 890,
    hearts: 412,
    fires: 201,
    views: '12.4k'
  },
  {
    id: 'n4',
    category: 'NEW E-SERVICE',
    badgeColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    title: 'Online Residence & Solvency Certificates Launched',
    desc: 'Zero-visit digital application now available with auto-verification of electricity bills and Aadhaar. Delivered with authentic QR code.',
    date: '01 July 2026',
    author: 'Revenue & e-Governance Cell',
    icon: BadgeCheck,
    likes: 620,
    hearts: 280,
    fires: 110,
    views: '9.1k'
  }
];

// ── Interactive Service Directory Catalog ──
const servicesCatalog = [
  { id: 'water', icon: Droplets, name: 'Water Supply & Quality', desc: 'Report leakages, low pressure, contamination, or book a free tanker.', dept: 'Water Department', sla: '24 Hrs SLA', category: 'Grievance', color: '#0284c7' },
  { id: 'roads', icon: Route, name: 'Roads, Potholes & Signals', desc: 'Instant photo upload for damaged roads, broken dividers, and signals.', dept: 'Roads Department', sla: '48 Hrs SLA', category: 'Grievance', color: '#d97706' },
  { id: 'electricity', icon: Zap, name: 'Electricity & Streetlights', desc: 'Resolve street light blackout, phase fluctuations, and dangling wires.', dept: 'Power Board', sla: '12 Hrs SLA', category: 'Grievance', color: '#8b5cf6' },
  { id: 'sanitation', icon: Trash2, name: 'Sanitation & Solid Waste', desc: 'Garbage pickup delays, overflow bins, and drain cleaning requests.', dept: 'Sanitation Dept', sla: '24 Hrs SLA', category: 'Grievance', color: '#10b981' },
  { id: 'health', icon: HeartPulse, name: 'Public Health & Fogging', desc: 'Dengue vector fogging, stray animal vaccination, and clinic queries.', dept: 'Health Department', sla: '36 Hrs SLA', category: 'Grievance', color: '#ef4444' },
  { id: 'birth', icon: FileText, name: 'Birth Certificate Issuance', desc: 'Apply with hospital discharge summary and download QR-signed e-certificate.', dept: 'Health & Vital Stats', sla: '3 Days SLA', category: 'Certificates', color: '#2563eb' },
  { id: 'death', icon: FileSignature, name: 'Death Certificate Registration', desc: 'Official digital death certificate registration with instant DigiLocker sync.', dept: 'Civil Registration', sla: '3 Days SLA', category: 'Certificates', color: '#64748b' },
  { id: 'trade', icon: Building2, name: 'Trade & Commercial License', desc: 'Apply or renew shop establishment licenses with digital payment gateway.', dept: 'Municipal Corporation', sla: '7 Days SLA', category: 'Permits', color: '#6366f1' },
  { id: 'income', icon: Award, name: 'Income & Caste Certificate', desc: 'Revenue department certificate generation for education and welfare quotas.', dept: 'Revenue Department', sla: '5 Days SLA', category: 'Certificates', color: '#059669' },
  { id: 'welfare', icon: Sparkles, name: 'State Welfare Schemes', desc: 'Apply for DBT pensions, student scholarships, and healthcare support.', dept: 'Social Welfare', sla: 'Direct DBT', category: 'Welfare', color: '#f59e0b' }
];

// ── Sample Live Grievance Tracking Simulator Data ──
const demoTrackingData = {
  'CP-2026-8941': {
    id: 'CP-2026-8941',
    type: 'Street Light Blackout',
    dept: 'Electricity Department',
    status: 'IN_PROGRESS',
    assignedOfficer: 'Er. Rajesh Varma (Lead Electrical Inspector)',
    steps: [
      { label: 'Grievance Filed & Logged on Kafka Bus', time: '08 Aug 11:20 AM', done: true },
      { label: 'Auto-Triaged & Assigned to Ward 9 Lead Officer', time: '08 Aug 11:22 AM', done: true },
      { label: 'Field Technician Dispatched with Utility Van', time: '08 Aug 01:45 PM', done: true },
      { label: 'Transformer Phase Inspection & Lamp Replacement', time: 'In Progress Now', active: true },
      { label: 'Citizen Resolution Verification & Close OTP', time: 'Estimated 04:30 PM', done: false }
    ]
  },
  'CERT-2026-3392': {
    id: 'CERT-2026-3392',
    type: 'Residence Certificate (e-Signed)',
    dept: 'Revenue & Land Records',
    status: 'APPROVED',
    assignedOfficer: 'Smt. Deepa Nair (Tahsildar)',
    steps: [
      { label: 'Application Submitted with Electricity Bill', time: '07 Aug 04:10 PM', done: true },
      { label: 'Aadhaar e-KYC Verified Instantly', time: '07 Aug 04:11 PM', done: true },
      { label: 'Village Administrative Officer (VAO) Endorsed', time: '08 Aug 10:00 AM', done: true },
      { label: 'Tahsildar Digital Cryptographic Signature Attached', time: '08 Aug 01:15 PM', done: true },
      { label: 'Certificate Issued & Synced to DigiLocker', time: '08 Aug 01:16 PM', done: true }
    ]
  }
};

// ── 9-Step Citizen Onboarding Tour Configurations ──
const TOUR_STEPS = [
  {
    step: 1,
    targetKey: 'hero-section',
    title: 'Welcome to Smart Governance',
    subtitle: 'Digital Public Services Portal',
    desc: 'Welcome to your digital gateway for accessing citizen services, reporting civic issues, tracking complaints, applying for certificates, and accessing welfare services.',
    icon: Landmark,
    accentColor: '#2563eb'
  },
  {
    step: 2,
    targetKey: 'auth-actions',
    title: 'Start Your Citizen Journey',
    subtitle: 'Account & Single Sign-On Access',
    desc: 'Create your citizen account to access digital services, submit complaints, track requests, and manage your applications. Already registered? Sign in to continue.',
    icon: LogIn,
    accentColor: '#8b5cf6'
  },
  {
    step: 3,
    targetKey: 'grievance',
    title: 'Report Civic Issues',
    subtitle: 'Direct Municipal Department Dispatch',
    desc: 'Report problems such as water leaks, road damage, street-light failures, power outages, sanitation issues, and other civic concerns directly through the platform.',
    additionalDesc: 'Your complaint can be assigned to the appropriate department and tracked until resolution. Similar complaints can be identified to help reduce duplicate reports.',
    icon: PenSquare,
    accentColor: '#ef4444'
  },
  {
    step: 4,
    targetKey: 'certificates',
    title: 'Apply for Certificates Online',
    subtitle: 'Instant e-Services',
    desc: 'Apply for services such as Birth, Income, Residence, and other eligible certificates digitally without unnecessary office visits.',
    badge: '100% Paperless',
    icon: FileText,
    accentColor: '#2563eb'
  },
  {
    step: 5,
    targetKey: 'welfare',
    title: 'Access Welfare Services',
    subtitle: 'Direct Benefit Transfer (DBT)',
    desc: 'Explore eligible welfare schemes, pensions, scholarships, and other support services available through the digital platform.',
    icon: Award,
    accentColor: '#f59e0b'
  },
  {
    step: 6,
    targetKey: 'sla-tracker',
    title: 'Track Your Complaint',
    subtitle: 'Transparent Resolution Timeline',
    desc: 'Once you submit a complaint, you can follow its progress, see its current status, view the assigned department or officer, and monitor the expected resolution timeline.',
    icon: Clock,
    accentColor: '#10b981'
  },
  {
    step: 7,
    targetKey: 'services',
    title: 'Explore All Services',
    subtitle: 'Centralized Municipal Catalog',
    desc: 'Find municipal services in one place. Search or browse services by category such as Grievances, Certificates, Permits, and Welfare.',
    additionalDesc: 'You can quickly find the service you need without searching through multiple government websites.',
    icon: Sparkles,
    accentColor: '#38bdf8'
  },
  {
    step: 8,
    targetKey: 'broadcasts',
    title: 'Track Your Application',
    subtitle: 'Citizen Service Tracker',
    desc: 'Enter your Complaint ID or Application ID to check the latest status, assigned officer, department, SLA progress, certificate status, welfare approval, or payment information.',
    icon: Search,
    accentColor: '#2563eb'
  },
  {
    step: 9,
    targetKey: 'guided-tour',
    title: 'Need Help?',
    subtitle: 'Restart Tour & Help Resources',
    desc: 'You can restart this guided tour whenever you need help understanding the platform. If an AI Assistant is available, you can also use it to ask questions about available services and navigation.',
    icon: HelpCircle,
    accentColor: '#8b5cf6'
  }
];

export default function LandingPage() {
  const { theme: themeMode, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const isDark = themeMode === 'dark';

  // State Management
  const [tourStep, setTourStep] = useState(null);
  const [tourBounds, setTourBounds] = useState(null);
  const [showFirstTimeInvitation, setShowFirstTimeInvitation] = useState(false);
  const [noticesList, setNoticesList] = useState(initialNotices);
  const [userReactions, setUserReactions] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [serviceSearch, setServiceSearch] = useState('');
  const [trackingIdInput, setTrackingIdInput] = useState('CP-2026-8941');
  const [activeTrackingResult, setActiveTrackingResult] = useState(demoTrackingData['CP-2026-8941']);
  const [selectedTrackerCategory, setSelectedTrackerCategory] = useState('All');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);

  const handleTrackSubmit = async (e) => {
    if (e) e.preventDefault();
    const queryId = trackingIdInput.trim();
    if (!queryId) return;

    setTrackingLoading(true);
    setTrackingError(null);

    try {
      // 1. Check if ID matches sample demo dataset
      if (demoTrackingData[queryId]) {
        setActiveTrackingResult(demoTrackingData[queryId]);
        setTrackingLoading(false);
        return;
      }

      // 2. Smart pattern detection to route to the correct endpoint
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(queryId);
      const isBeneficiaryCode = /^BEN-\d{4}-\d+$/i.test(queryId);
      const isCertificateNumber = /^(IC|BC|RC|DC|CC|SC|LC|CERT)-\d{4}-\d+$/i.test(queryId);

      // Use a no-auth axios for public tracker calls (no token needed, avoids 401 if not logged in)
      const publicApi = axios.create({ baseURL: 'http://localhost:8080' });
      console.log(`[Tracker] queryId="${queryId}" isUUID=${isUUID} isCert=${isCertificateNumber} isBen=${isBeneficiaryCode}`);

      // --- GRIEVANCE: UUID format ---
      if (isUUID || (!isBeneficiaryCode && !isCertificateNumber)) {
        const url = `/grievance-service/api/complaints/${queryId}`;
        console.log(`[Tracker] Trying grievance: ${url}`);
        const complaintRes = await publicApi.get(url).catch(e => { console.warn('[Tracker] Grievance error:', e.response?.status, e.message); return null; });
        console.log('[Tracker] Grievance response:', complaintRes?.status, complaintRes?.data);
        if (complaintRes?.data?.id || complaintRes?.data?.complaintId) {
          const compData = complaintRes.data;
          const historyRes = await api.get(`/grievance-service/api/complaints/${queryId}/history`).catch(() => null);
          setActiveTrackingResult({
            type: 'GRIEVANCE',
            id: compData.complaintId || compData.id,
            title: compData.title || compData.subject || compData.category || 'Civic Complaint',
            status: compData.status || 'NEW',
            department: compData.department || 'Municipal Department',
            category: compData.category || 'General',
            priority: compData.priority || 'MEDIUM',
            assignedOfficer: compData.assignedOfficerName || compData.assignedOfficer || null,
            slaStatus: compData.slaStatus || 'ON_TIME',
            deadline: compData.slaDeadline ? new Date(compData.slaDeadline).toLocaleString() : null,
            timeline: historyRes?.data?.length > 0 ? historyRes.data.map(h => ({
              label: h.statusChange || h.remarks || 'Status Updated',
              time: new Date(h.timestamp || h.createdAt).toLocaleString(),
              done: true
            })) : [
              { label: 'Grievance Filed & Logged', done: true, time: new Date(compData.createdAt || Date.now()).toLocaleDateString() },
              { label: compData.assignedOfficer ? 'Auto-Triaged & Assigned to Officer' : 'Awaiting Officer Assignment', done: Boolean(compData.assignedOfficer) },
              { label: 'Field Investigation & Maintenance', done: compData.status === 'IN_PROGRESS' || compData.status === 'RESOLVED' },
              { label: 'Resolution Verification & OTP Close', done: compData.status === 'RESOLVED' || compData.status === 'CLOSED' }
            ]
          });
          setTrackingLoading(false);
          return;
        }
      }

      // --- CERTIFICATE: IC-/BC-/CERT- prefix OR UUID ---
      if (isCertificateNumber || isUUID || (!isBeneficiaryCode)) {
        const url = `/service-management-service/api/services/track/${queryId}`;
        console.log(`[Tracker] Trying certificate track: ${url}`);
        const certRes = await publicApi.get(url).catch(e => { console.warn('[Tracker] Certificate error:', e.response?.status, e.message); return null; });
        console.log('[Tracker] Certificate response:', certRes?.status, certRes?.data);
        if (certRes?.data?.id) {
          const cert = certRes.data;
          const historyRes = await api.get(`/service-management-service/api/services/${cert.id}/history`).catch(() => null);
          setActiveTrackingResult({
            type: 'E-SERVICE',
            id: cert.certificateNumber || cert.id,
            title: cert.serviceType?.replace(/_/g, ' ') || 'Digital Certificate Application',
            status: cert.status || 'UNDER_VERIFICATION',
            department: cert.department || 'Revenue Department',
            applicantName: cert.applicantName || null,
            assignedOfficer: cert.assignedOfficer || cert.digitallySignedBy || null,
            certificateNumber: cert.certificateNumber || null,
            timeline: historyRes?.data?.length > 0 ? historyRes.data.map(h => ({
              label: h.statusChange || h.action || 'Status Updated',
              time: h.timestamp ? new Date(h.timestamp).toLocaleString() : '',
              done: true
            })) : [
              { label: 'Application Submitted', done: true, time: cert.appliedDate ? new Date(cert.appliedDate).toLocaleDateString() : '' },
              { label: 'Documents Received & Verified', done: ['UNDER_VERIFICATION','CERTIFICATE_GENERATED','APPROVED','REJECTED'].includes(cert.status) },
              { label: 'Department Officer Approval', done: ['CERTIFICATE_GENERATED','APPROVED'].includes(cert.status) },
              { label: 'Certificate Generated & Download Ready', done: cert.status === 'CERTIFICATE_GENERATED' }
            ]
          });
          setTrackingLoading(false);
          return;
        }
      }

      // --- WELFARE: BEN- prefix OR UUID ---
      if (isBeneficiaryCode || isUUID) {
        const url = `/welfare-service/api/welfare/beneficiaries/track/${queryId}`;
        console.log(`[Tracker] Trying welfare track: ${url}`);
        const welfareRes = await publicApi.get(url).catch(e => { console.warn('[Tracker] Welfare error:', e.response?.status, e.message); return null; });
        console.log('[Tracker] Welfare response:', welfareRes?.status, welfareRes?.data);
        if (welfareRes?.data?.beneficiaryId || welfareRes?.data?.id) {
          const wel = welfareRes.data;
          const historyRes = await api.get(`/welfare-service/api/welfare/beneficiaries/${wel.beneficiaryId || wel.id}/history`).catch(() => null);
          setActiveTrackingResult({
            type: 'WELFARE',
            id: wel.beneficiaryCode || wel.beneficiaryId,
            title: wel.schemeName || 'State Welfare Support Scheme',
            status: wel.status || 'APPROVED',
            department: wel.assignedDepartment || 'Social Welfare Department',
            applicantName: wel.applicantName || null,
            appliedDate: wel.createdAt || wel.appliedDate || null,
            eligibility: wel.eligibilityStatus || 'APPROVED',
            paymentStatus: wel.paymentStatus || 'PROCESSING',
            amount: wel.monthlyAmount ? `₹${Number(wel.monthlyAmount).toLocaleString()}` : (wel.amount ? `₹${Number(wel.amount).toLocaleString()}` : null),
            timeline: historyRes?.data?.length > 0 ? historyRes.data.map(h => ({
              label: h.action || h.remarks || 'Status Updated',
              time: h.timestamp ? new Date(h.timestamp).toLocaleString() : '',
              done: true
            })) : [
              { label: 'Application Submitted', done: true },
              { label: 'Eligibility Verified via Aadhaar', done: !['DRAFT','SUBMITTED'].includes(wel.status) },
              { label: 'Officer Recommended & Admin Approved', done: ['APPROVED','FUNDS_DISBURSED','COMPLETED'].includes(wel.status) },
              { label: 'Direct Benefit Transfer (DBT) Initiated', done: ['FUNDS_DISBURSED','COMPLETED'].includes(wel.status) },
              { label: 'Payment Credited to Bank Account', done: wel.paymentStatus === 'CREDITED' || wel.status === 'COMPLETED' }
            ]
          });
          setTrackingLoading(false);
          return;
        }
      }

      setActiveTrackingResult(null);
      setTrackingError('NOT_FOUND');
      setTrackingLoading(false);

    } catch (err) {
      console.error('Service tracker error:', err);
      setActiveTrackingResult(null);
      setTrackingError('API_ERROR');
      setTrackingLoading(false);
    }
  };


  // Real Citizen Data State for Authenticated Users
  const [userComplaints, setUserComplaints] = useState([]);
  const [userCertificates, setUserCertificates] = useState([]);
  const [userWelfareApps, setUserWelfareApps] = useState([]);
  const [isUserDataLoading, setIsUserDataLoading] = useState(false);

  const isAuthenticated = Boolean(keycloak?.authenticated || localStorage.getItem('kc_token'));
  const citizenId = keycloak?.tokenParsed?.sub;
  const citizenName = keycloak?.tokenParsed?.name || keycloak?.tokenParsed?.preferred_username || '';

  useEffect(() => {
    if (isAuthenticated && citizenId) {
      setIsUserDataLoading(true);
      Promise.all([
        api.get('/grievance-service/api/complaints').catch(() => ({ data: [] })),
        api.get(`/service-management-service/api/services/citizen/${citizenId}`).catch(() => ({ data: [] })),
        api.get(`/welfare-service/api/welfare/beneficiaries/citizen/${citizenId}`).catch(() => ({ data: [] }))
      ]).then(([cRes, certRes, wRes]) => {
        setUserComplaints(cRes.data || []);
        setUserCertificates(certRes.data || []);
        setUserWelfareApps(wRes.data || []);
        setIsUserDataLoading(false);
      });
    }
  }, [isAuthenticated, citizenId]);

  // Tour Target Highlight Elevation & Bounds Hook
  useEffect(() => {
    if (typeof tourStep !== 'number') {
      setTourBounds(null);
      return;
    }
    const stepConfig = TOUR_STEPS.find(s => s.step === tourStep);
    if (!stepConfig) return;

    const el = document.querySelector(`[data-tour="${stepConfig.targetKey}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Save original styles
      const origPos = el.style.position;
      const origZIndex = el.style.zIndex;
      const origBoxShadow = el.style.boxShadow;
      const origTransition = el.style.transition;
      const origRadius = el.style.borderRadius;
      const origBg = el.style.background;
      const origPadding = el.style.padding;

      // ILLUMINATED WHITE / HIGH-CONTRAST CONTAINER HIGHLIGHT STYLING
      el.style.position = 'relative';
      el.style.zIndex = '10000';
      
      // Ensure target element has a crisp, bright white/slate container background during the tour
      if (!origBg || origBg === 'transparent' || origBg.includes('radial-gradient')) {
        el.style.background = isDark ? '#0f172a' : '#ffffff';
      }
      
      el.style.boxShadow = isDark 
        ? '0 0 0 4px #38bdf8, 0 16px 50px rgba(56,189,248,0.35), 0 0 80px rgba(255,255,255,0.15)' 
        : '0 0 0 4px #2563eb, 0 16px 50px rgba(37,99,235,0.35), 0 0 60px rgba(255,255,255,0.9)';
      
      if (!origRadius) el.style.borderRadius = '20px';
      if (!origPadding && stepConfig.targetKey === 'auth-actions') el.style.padding = '12px 18px';
      el.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';

      const timer = setTimeout(() => {
        const rect = el.getBoundingClientRect();
        setTourBounds({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom,
          right: rect.right
        });
      }, 300);

      return () => {
        clearTimeout(timer);
        // Restore exact previous styles
        el.style.position = origPos;
        el.style.zIndex = origZIndex;
        el.style.boxShadow = origBoxShadow;
        el.style.transition = origTransition;
        el.style.borderRadius = origRadius;
        el.style.background = origBg;
        el.style.padding = origPadding;
      };
    } else {
      setTourBounds(null);
    }
  }, [tourStep]);

  // First-time visitor toast check
  useEffect(() => {
    const status = localStorage.getItem('civicpulse_guided_tour_completed');
    if (!status) {
      const timer = setTimeout(() => setShowFirstTimeInvitation(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Keyboard navigation (Esc, ArrowRight, ArrowLeft, Enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (tourStep === null) return;
      if (e.key === 'Escape') {
        localStorage.setItem('civicpulse_guided_tour_completed', 'skipped');
        setTourStep(null);
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (typeof tourStep === 'number') {
          if (tourStep < 9) setTourStep(prev => prev + 1);
          else {
            localStorage.setItem('civicpulse_guided_tour_completed', 'completed');
            setTourStep('completed');
          }
        }
      } else if (e.key === 'ArrowLeft') {
        if (typeof tourStep === 'number' && tourStep > 1) {
          setTourStep(prev => prev - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tourStep]);

  const handleSkipTour = () => {
    localStorage.setItem('civicpulse_guided_tour_completed', 'skipped');
    setTourStep(null);
  };

  const handleFinishTour = () => {
    localStorage.setItem('civicpulse_guided_tour_completed', 'completed');
    setTourStep('completed');
  };
  
  // Floating AI Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Namaste! 🙏 Welcome to Smart Governance Platform Citizen Desk. How may I assist your governance request today?',
      time: 'Just now',
      chips: ['Track Complaint', 'Apply Certificate', 'Sanitation Issue', 'Welfare Schemes']
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [liveCitizens, setLiveCitizens] = useState(4280);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCitizens(prev => prev + (Math.random() > 0.4 ? 1 : -1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleReaction = (noticeId, type) => {
    const key = `${noticeId}-${type}`;
    const hasReacted = userReactions[key];

    setNoticesList(prev => prev.map(item => {
      if (item.id === noticeId) {
        return {
          ...item,
          [type]: hasReacted ? item[type] - 1 : item[type] + 1
        };
      }
      return item;
    }));

    setUserReactions(prev => ({
      ...prev,
      [key]: !hasReacted
    }));
  };

  const handleSendChat = (customText) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: 'Just now'
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!customText) setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let botResponse = '';
      let actionButtons = null;

      const lower = textToSend.toLowerCase();
      if (lower.includes('track') || lower.includes('complaint') || lower.includes('status')) {
        botResponse = `🔍 Found active ticket #CP-2026-8941: Street Light Outage in Sector 9. Field technician is currently on-site. SLA deadline is within 4 hours.`;
        actionButtons = ['View Full Live Timeline', 'File Another Grievance'];
      } else if (lower.includes('cert') || lower.includes('birth') || lower.includes('income') || lower.includes('residence')) {
        botResponse = `📄 Certificates are issued 100% digitally with DigiLocker QR verification. No physical office visit needed.`;
        actionButtons = ['Apply Residence Certificate', 'Apply Birth Certificate', 'Check Required Documents'];
      } else if (lower.includes('welfare') || lower.includes('scheme') || lower.includes('kisan')) {
        botResponse = `🌾 Over 18 State & Central Welfare Schemes are active! Direct Benefit Transfers (DBT) are credited directly to your Aadhaar-linked bank account.`;
        actionButtons = ['Check Scheme Eligibility', 'View Pension Schemes'];
      } else if (lower.includes('sanitation') || lower.includes('water') || lower.includes('pothole') || lower.includes('road')) {
        botResponse = `🚨 Civic issue noted! You can upload a photo geotagged to your GPS location for instant automated dispatch to the ward engineer.`;
        actionButtons = ['Report Incident Now', 'View Helplines'];
      } else {
        botResponse = `✅ Thank you for reaching out. You can access all 24+ municipal services directly from the citizen portal with secure Keycloak SSO login.`;
        actionButtons = ['Sign In to Portal', 'Track Grievance', 'Apply Certificate'];
      }

      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        time: 'Just now',
        chips: actionButtons
      }]);
    }, 850);
  };

  const filteredServices = servicesCatalog.filter(svc => {
    const matchesCategory = activeCategory === 'All' || svc.category === activeCategory;
    const matchesSearch = svc.name.toLowerCase().includes(serviceSearch.toLowerCase()) || 
                          svc.desc.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                          svc.dept.toLowerCase().includes(serviceSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', 'Grievance', 'Certificates', 'Permits', 'Welfare'];

  // ── Core Modules Data (matching reference image) ──
  const coreModules = [
    { icon: MessageSquare, title: 'Grievance Management', desc: 'Register, track and resolve citizen grievances efficiently.', color: '#ef4444', bgLight: '#fef2f2', to: '/login' },
    { icon: FileText, title: 'Certificates & Permits', desc: 'Apply and download digital certificates and permits online.', color: '#2563eb', bgLight: '#eff6ff', to: '/login' },
    { icon: Heart, title: 'Welfare Management', desc: 'Manage schemes, beneficiaries and direct benefit transfers.', color: '#f59e0b', bgLight: '#fffbeb', to: '/login' },
    { icon: Wallet, title: 'Budget & Finance', desc: 'Transparent budget allocation, expenses and fund utilization.', color: '#10b981', bgLight: '#f0fdf4', to: '/login' },
    { icon: BarChart3, title: 'Governance Analytics', desc: 'Real-time analytics, reports and data-driven governance.', color: '#8b5cf6', bgLight: '#f5f3ff', to: '/login' }
  ];

  // ═══════════════════════════════════════════════════════════════
  // ██  REDESIGNED JSX RENDER — MATCHING REFERENCE IMAGE        ██
  // ═══════════════════════════════════════════════════════════════

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: isDark ? '#090d16' : '#f4f6fb', 
      color: isDark ? '#f1f5f9' : '#0f172a', 
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      transition: 'background 0.3s ease, color 0.3s ease'
    }}>

      {/* ════════════════════════════════════════════════════════ */}
      {/* ██  1. HEADER / NAVIGATION BAR (Reference Match)     ██ */}
      {/* ════════════════════════════════════════════════════════ */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: isDark ? 'rgba(5, 8, 17, 0.95)' : '#ffffff',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
        padding: '0 64px',
        height: 90,
        boxShadow: isDark ? '0 4px 25px rgba(0,0,0,0.4)' : '0 2px 15px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          maxWidth: 1600,
          margin: '0 auto',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 64
        }}>
          {/* Left: Brand Logo */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', minWidth: 200 }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(37,99,235,0.4)'
              }}>
                <Landmark size={26} color="#ffffff" />
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                Smart Governance <span style={{ color: isDark ? '#60a5fa' : '#2563eb', fontWeight: 700 }}>Platform</span>
              </div>
            </Link>
          </div>

          {/* Center: Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {[
              { label: 'Home', href: '#' },
              { label: 'About', href: '#about' },
              { label: 'Services', href: '#services' },
              { label: 'Dashboard', href: '/dashboard', isLink: true },
              { label: 'Reports', href: '/reports', isLink: true },
              { label: 'Contact', href: '#contact' }
            ].map(nav => {
              const normalColor = isDark ? '#cbd5e1' : '#334155';
              const activeHoverColor = isDark ? '#ffffff' : '#2563eb';
              return nav.isLink ? (
                <Link key={nav.label} to={nav.href} style={{ color: normalColor, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseOver={e => e.target.style.color = activeHoverColor}
                  onMouseOut={e => e.target.style.color = normalColor}
                >{nav.label}</Link>
              ) : (
                <a key={nav.label} href={nav.href} style={{ color: normalColor, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseOver={e => e.target.style.color = activeHoverColor}
                  onMouseOut={e => e.target.style.color = normalColor}
                >{nav.label}</a>
              );
            })}
          </div>

          {/* Right: Nav Actions */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14, flexShrink: 0, whiteSpace: 'nowrap' }}>
            <LanguageSelector />
            <button onClick={toggleTheme} style={{
              height: 44, padding: '0 18px', borderRadius: 12,
              background: isDark ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #fef3c7 0%, #fee2e2 100%)',
              color: isDark ? '#fbbf24' : '#d97706',
              border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #fde68a',
              fontWeight: 700, fontSize: 15,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: isDark ? 'none' : '0 2px 10px rgba(245, 158, 11, 0.2)',
              transition: 'all 0.25s ease',
              flexShrink: 0, whiteSpace: 'nowrap'
            }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = isDark ? '0 2px 10px rgba(255,255,255,0.1)' : '0 4px 14px rgba(245, 158, 11, 0.35)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isDark ? 'none' : '0 2px 10px rgba(245, 158, 11, 0.2)';
              }}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* SEPARATE Citizen Login Button */}
            <Link to="/login?role=citizen" style={{ textDecoration: 'none', flexShrink: 0, display: 'inline-block' }}>
              <button style={{
                height: 44, padding: '0 22px', borderRadius: 12,
                background: isDark ? 'rgba(37,99,235,0.15)' : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                color: isDark ? '#60a5fa' : '#1d4ed8',
                border: isDark ? '1.5px solid rgba(96,165,250,0.4)' : '1.5px solid #93c5fd',
                fontWeight: 700, fontSize: 14,
                cursor: 'pointer', transition: 'all 0.2s ease',
                boxShadow: isDark ? '0 2px 10px rgba(37,99,235,0.2)' : '0 4px 14px rgba(37,99,235,0.15)',
                display: 'flex', alignItems: 'center', gap: 7,
                whiteSpace: 'nowrap', flexShrink: 0
              }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.background = isDark ? 'rgba(37,99,235,0.28)' : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)';
                  e.currentTarget.style.color = isDark ? '#93c5fd' : '#1e40af';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(37,99,235,0.25)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(96,165,250,0.4)' : '#93c5fd';
                  e.currentTarget.style.background = isDark ? 'rgba(37,99,235,0.15)' : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)';
                  e.currentTarget.style.color = isDark ? '#60a5fa' : '#1d4ed8';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isDark ? '0 2px 10px rgba(37,99,235,0.2)' : '0 4px 14px rgba(37,99,235,0.15)';
                }}
              >
                <User size={16} style={{ color: isDark ? '#60a5fa' : '#2563eb', flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap' }}>Citizen Login</span>
              </button>
            </Link>

            {/* SEPARATE Admin Login Button (Premium Emerald Green) */}
            <Link to="/login?role=admin" style={{ textDecoration: 'none', flexShrink: 0, display: 'inline-block' }}>
              <button style={{
                height: 44, padding: '0 24px', borderRadius: 12,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                fontWeight: 800, fontSize: 14,
                cursor: 'pointer',
                letterSpacing: '0.01em',
                boxShadow: '0 4px 18px rgba(16, 185, 129, 0.45)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex', alignItems: 'center', gap: 7,
                position: 'relative',
                overflow: 'hidden',
                whiteSpace: 'nowrap', flexShrink: 0
              }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(16, 185, 129, 0.65)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(16, 185, 129, 0.45)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)';
                }}
              >
                <ShieldCheck size={17} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))', flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap' }}>Admin Login</span>
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════ */}
      {/* ██  2. HERO SECTION (Reference Match)                ██ */}
      {/* ════════════════════════════════════════════════════════ */}
      <section data-tour="hero-section" style={{
        padding: '36px 24px 60px', // Compact padding so stats card and core sections sit higher up
        position: 'relative',
        overflow: 'hidden',
        background: isDark 
          ? 'linear-gradient(135deg, #0c1425 0%, #0f172a 50%, #0c1225 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
      }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: isDark ? 0.08 : 0.05, background: 'radial-gradient(ellipse at 30% 50%, #2563eb, transparent 60%), radial-gradient(ellipse at 70% 50%, #10b981, transparent 60%)', pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 32, position: 'relative', zIndex: 2, flexWrap: 'wrap' }}>
          {/* Left Column */}
          <div style={{ flex: '1 1 500px', minWidth: 320, maxWidth: 640 }}>
            {/* Premium Top Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
              border: isDark ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid #bfdbfe',
              padding: '6px 16px', borderRadius: 100, marginBottom: 20
            }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#60a5fa' : '#2563eb', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Building Transparent Governance
              </span>
            </div>

            {/* Premium Gradient Heading */}
            <h1 style={{ margin: '0 0 12px', fontSize: 58, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.04em', color: isDark ? '#ffffff' : '#0f172a' }}>
              Smart Governance <br />
              <span style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Platform</span>
            </h1>

            <h2 style={{ margin: '0 0 16px', fontSize: 21, fontWeight: 500, color: isDark ? '#94a3b8' : '#475569', lineHeight: 1.45, letterSpacing: '-0.01em' }}>
              for Administrative Operations with Citizen Assistance
            </h2>
            
            <p style={{ margin: '0 0 28px', fontSize: 16, color: isDark ? '#cbd5e1' : '#64748b', lineHeight: 1.6, maxWidth: 540 }}>
              A unified digital ecosystem that connects citizens, government departments, and administration through technology, transparency, and efficiency.
            </p>

            {/* Minimalist Feature List (Premium Style) */}
            <div data-tour="auth-actions" style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32, maxWidth: 580 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14.5, fontWeight: 500, color: isDark ? '#e2e8f0' : '#334155' }}>
                  <CheckCircle2 size={17} color="#3b82f6" /> Citizen-Centric Services
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14.5, fontWeight: 500, color: isDark ? '#e2e8f0' : '#334155' }}>
                  <CheckCircle2 size={17} color="#3b82f6" /> Transparent Governance
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14.5, fontWeight: 500, color: isDark ? '#e2e8f0' : '#334155' }}>
                  <CheckCircle2 size={17} color="#3b82f6" /> Real-time Operations
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14.5, fontWeight: 500, color: isDark ? '#e2e8f0' : '#334155' }}>
                  <CheckCircle2 size={17} color="#3b82f6" /> Data-driven Decisions
                </div>
              </div>
            </div>

            {/* Premium Pill CTA Buttons */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button style={{
                  height: 50, padding: '0 30px', borderRadius: 100, // Pill shape
                  background: '#2563eb', color: '#ffffff',
                  border: 'none', fontWeight: 600, fontSize: 15,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 8px 24px rgba(37,99,235,0.3)', transition: 'all 0.2s'
                }}>
                  Explore Services <ArrowRight size={18} />
                </button>
              </Link>
              <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <button style={{
                  height: 50, padding: '0 30px', borderRadius: 100, // Pill shape
                  background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', fontWeight: 600, fontSize: 15,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s'
                }}>
                  View Dashboard
                </button>
              </Link>
            </div>
          </div>

          {/* Right Column — Hero Image */}
          <div style={{ flex: '1 1 480px', minWidth: 320, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* Hero Illustration */}
            <img 
              src={heroImg} 
              alt="Smart Governance Platform" 
              style={{ 
                width: '100%', maxWidth: 640, height: 'auto', 
                position: 'relative', zIndex: 2,
                mixBlendMode: isDark ? 'normal' : 'multiply',
                filter: isDark ? 'drop-shadow(0 24px 48px rgba(0,0,0,0.3))' : 'none',
                objectFit: 'contain'
              }} 
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════ */}
      {/* ██  3. STATISTICS STRIP (Ultra-Clean Docked Grid)     ██ */}
      {/* ════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        zIndex: 30,
        maxWidth: 1380,
        margin: '20px auto 48px', // Positioned lower below hero fold for spacious presentation
        padding: '0 24px'
      }}>
        <div style={{
          background: isDark ? '#0b1120' : '#ffffff',
          borderRadius: 24,
          padding: '20px 28px',
          border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0',
          boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.7)' : '0 20px 50px rgba(37,99,235,0.09)',
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', 
          gap: 16, 
          alignItems: 'center'
        }}>
          {[
            { icon: Users, value: '2.4M+', label: 'Registered Citizens', color: '#2563eb' },
            { icon: FileText, value: '24.7K+', label: 'Applications Processed', color: '#10b981' },
            { icon: CheckCircle2, value: '94%', label: 'SLA Compliance', color: '#f59e0b' },
            { icon: CircleDollarSign, value: '₹12.4M+', label: 'Revenue Collected', color: '#8b5cf6' },
            { icon: Star, value: '4.7/5', label: 'Citizen Satisfaction', color: '#ef4444' }
          ].map((stat, i) => (
            <div key={i} style={{ 
              display: 'flex', alignItems: 'center', gap: 16, padding: '8px 12px', borderRadius: 16,
              borderRight: i < 4 ? (isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9') : 'none',
              transition: 'all 0.2s', cursor: 'default'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: `${stat.color}12`, border: `1px solid ${stat.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <stat.icon size={20} color={stat.color} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{stat.value}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginTop: 3 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════ */}
      {/* ██  4. CORE MODULES SECTION (Ultra-Premium Redesign)   ██ */}
      {/* ════════════════════════════════════════════════════════ */}
      <section id="about" style={{
        padding: '48px 32px 60px', // Reduced top padding to position section higher up
        background: isDark ? '#090e1a' : '#f8fafc',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          {/* Section Title Header */}
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 36px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
              border: isDark ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid #bfdbfe',
              padding: '5px 14px', borderRadius: 100, marginBottom: 16
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#60a5fa' : '#2563eb', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Core Ecosystem
              </span>
            </div>
            <h2 style={{ margin: '0 0 12px', fontSize: 36, fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.03em' }}>
              Our Core Modules
            </h2>
            <p style={{ margin: 0, fontSize: 16, color: '#64748b', lineHeight: 1.6 }}>
              Comprehensive digital infrastructure built to streamline municipal administration and public service delivery.
            </p>
          </div>

          {/* Module Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
            {coreModules.map((mod, i) => {
              const ModIcon = mod.icon;
              return (
                <Link key={i} to={mod.to} style={{ textDecoration: 'none' }}>
                  <div data-tour={i === 0 ? 'grievance' : i === 1 ? 'certificates' : i === 2 ? 'welfare' : undefined} style={{
                    background: isDark ? '#0f172a' : '#ffffff',
                    borderRadius: 20, padding: '28px 24px',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                    boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.03)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer',
                    height: '100%', boxSizing: 'border-box',
                    display: 'flex', flexDirection: 'column', gap: 16
                  }}
                    onMouseOver={e => { 
                      e.currentTarget.style.transform = 'translateY(-6px)'; 
                      e.currentTarget.style.borderColor = mod.color;
                      e.currentTarget.style.boxShadow = isDark ? `0 16px 36px ${mod.color}20` : `0 16px 36px ${mod.color}15`; 
                    }}
                    onMouseOut={e => { 
                      e.currentTarget.style.transform = 'none'; 
                      e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
                      e.currentTarget.style.boxShadow = isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.03)'; 
                    }}
                  >
                    <div style={{
                      width: 50, height: 50, borderRadius: 14,
                      background: mod.bgLight, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <ModIcon size={24} color={mod.color} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.01em' }}>
                      {mod.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: 14, color: '#64748b', lineHeight: 1.6, flex: 1 }}>
                      {mod.desc}
                    </p>
                    <div style={{ fontSize: 14, fontWeight: 700, color: mod.color, display: 'flex', alignItems: 'center', gap: 6, paddingTop: 4 }}>
                      Learn More <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════ */}
      {/* ██  5. SERVICE TRACKER SECTION (Ultra-Premium Redesign)██ */}
      {/* ════════════════════════════════════════════════════════ */}
      <section id="feed" data-tour="broadcasts" style={{
        padding: '48px 32px 56px',
        background: isDark ? '#070b14' : '#ffffff',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ color: '#2563eb', fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {t('tracker.title')}
                </span>
                <span style={{
                  background: 'rgba(34,197,94,0.12)', color: '#16a34a', padding: '3px 12px',
                  borderRadius: 100, fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid rgba(34,197,94,0.25)'
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  {t('quickActions.live')}
                </span>
              </div>
              <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.03em' }}>
                {t('tracker.subtitle')}
              </h2>
            </div>
            {isAuthenticated && (
              <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: 6, background: isDark ? '#0f172a' : '#f8fafc', padding: '8px 16px', borderRadius: 100, border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
                <ShieldCheck size={18} style={{ color: '#10b981' }} /> {t('quickActions.verifiedProfile')}
              </div>
            )}
          </div>

          {/* Tracking Input */}
          <div style={{
            background: isDark ? '#0f172a' : '#ffffff', borderRadius: 24, padding: '32px',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
            boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.5)' : '0 12px 36px rgba(37,99,235,0.06)',
            display: 'flex', flexDirection: 'column', gap: 24
          }}>
            <form onSubmit={handleTrackSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
              <div style={{ flex: '1 1 340px', position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="text" value={trackingIdInput} onChange={e => setTrackingIdInput(e.target.value)}
                  placeholder={t('tracker.inputPlaceholder')}
                  style={{
                    width: '100%', height: 52, paddingLeft: 52, paddingRight: 18, borderRadius: 14,
                    background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', color: isDark ? '#ffffff' : '#0f172a',
                    border: isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid #cbd5e1',
                    fontSize: 15, fontWeight: 600, outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>
              <button type="submit" disabled={trackingLoading} style={{
                height: 52, padding: '0 32px', borderRadius: 14,
                background: '#2563eb', color: '#ffffff', fontWeight: 800, fontSize: 15,
                border: 'none', cursor: trackingLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 20px rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all 0.2s'
              }}>
                {trackingLoading ? <><RefreshCw size={18} className="animate-spin" /> Checking...</> : <><Search size={18} /> {t('tracker.trackBtn')}</>}
              </button>
            </form>

            {/* Tracking Results */}
            {trackingLoading && (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <RefreshCw size={28} className="animate-spin" style={{ color: '#2563eb', margin: '0 auto' }} />
                <div style={{ marginTop: 12, fontSize: 14, fontWeight: 700, color: '#64748b' }}>{t('tracker.loadingMsg')}</div>
              </div>
            )}

            {!trackingLoading && trackingError && (
              <div style={{ background: isDark ? 'rgba(239,68,68,0.08)' : '#fef2f2', borderRadius: 16, padding: '24px', textAlign: 'center', border: isDark ? '1px solid rgba(239,68,68,0.2)' : '1px solid #fecaca' }}>
                <AlertTriangle size={32} style={{ color: '#ef4444', margin: '0 auto 10px' }} />
                <h4 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: isDark ? '#fff' : '#0f172a' }}>{t('tracker.notFoundTitle')}</h4>
                <p style={{ margin: '0 0 16px', fontSize: 14, color: isDark ? '#fca5a5' : '#b91c1c' }}>{t('tracker.notFoundDesc')}</p>
                <button onClick={() => { setTrackingError(null); setTrackingIdInput(''); }} style={{ padding: '10px 24px', borderRadius: 10, background: '#2563eb', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 13 }}>
                  {t('tracker.tryAgain')}
                </button>
              </div>
            )}

            {!trackingLoading && !trackingError && activeTrackingResult && (
              <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius: 18, padding: '24px', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                  <div>
                    <span style={{ background: 'rgba(37,99,235,0.14)', color: '#2563eb', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 800 }}>
                      {activeTrackingResult.type || 'GRIEVANCE'}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#64748b', marginLeft: 12 }}>ID: {activeTrackingResult.id}</span>
                    <h3 style={{ margin: '10px 0 0', fontSize: 20, fontWeight: 800, color: isDark ? '#fff' : '#0f172a' }}>{activeTrackingResult.title}</h3>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10, fontSize: 13, color: '#64748b' }}>
                      {activeTrackingResult.applicantName && <span><strong>Applicant:</strong> {activeTrackingResult.applicantName}</span>}
                      {activeTrackingResult.applicantName && activeTrackingResult.department && <span>•</span>}
                      {activeTrackingResult.department && <span><strong>Department:</strong> {activeTrackingResult.department}</span>}
                      {activeTrackingResult.department && activeTrackingResult.appliedDate && <span>•</span>}
                      {activeTrackingResult.appliedDate && <span><strong>Applied Date:</strong> {new Date(activeTrackingResult.appliedDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <span style={{
                    background: activeTrackingResult.status === 'RESOLVED' || activeTrackingResult.status === 'APPROVED' ? 'rgba(34,197,94,0.14)' : 'rgba(59,130,246,0.14)',
                    color: activeTrackingResult.status === 'RESOLVED' || activeTrackingResult.status === 'APPROVED' ? '#16a34a' : '#2563eb',
                    padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 800
                  }}>
                    ● {t('status.' + activeTrackingResult.status, { defaultValue: activeTrackingResult.status?.replace(/_/g, ' ') })}
                  </span>
                </div>

                {activeTrackingResult.timeline && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {activeTrackingResult.timeline.map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: step.done ? 'rgba(34,197,94,0.14)' : '#f1f5f9',
                          color: step.done ? '#16a34a' : '#94a3b8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 900, border: step.done ? '1px solid rgba(34,197,94,0.3)' : '1px solid #e2e8f0'
                        }}>
                          {step.done ? '✓' : idx + 1}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: step.done ? 700 : 500, color: step.done ? (isDark ? '#fff' : '#0f172a') : '#94a3b8' }}>{step.label}</div>
                          {step.time && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{step.time}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isAuthenticated && userComplaints.length > 0 && (
              <div style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', paddingTop: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 12 }}>{t('tracker.myRecent')}</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {userComplaints.slice(0, 3).map(c => {
                    const cId = String(c.complaintId || c.id || '');
                    const cTitle = c.title || c.subject || '';
                    const displayTitle = cTitle ? (cTitle.length > 18 ? cTitle.substring(0, 18) + '...' : cTitle) : (cId ? (cId.length > 8 ? cId.substring(0, 8) : cId) : 'Grievance');
                    return (
                      <button key={cId || Math.random()} onClick={() => {
                        setTrackingIdInput(cId);
                        setActiveTrackingResult({ type: 'GRIEVANCE', id: cId, title: cTitle || c.category || 'Grievance', status: c.status || 'IN_PROGRESS', department: c.department || 'Municipal Board', assignedOfficer: c.assignedOfficerName || c.assignedOfficer || null, slaStatus: c.slaStatus || 'ON_TIME', deadline: c.slaDeadline ? new Date(c.slaDeadline).toLocaleString() : '18 Aug 2026' });
                        setTrackingError(null);
                      }} style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: isDark ? '#fff' : '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                        📋 {displayTitle} <span style={{ color: '#2563eb', fontWeight: 800 }}>● {c.status || 'NEW'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════ */}
      {/* ██  6. SERVICES DIRECTORY (Ultra-Premium Redesign)   ██ */}
      {/* ════════════════════════════════════════════════════════ */}
      <section id="services" data-tour="services" style={{
        padding: '48px 32px 60px',
        background: isDark ? '#090e1a' : '#f8fafc',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <span style={{ color: '#8b5cf6', fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>CITIZEN SERVICES HUB</span>
              <h2 style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.03em' }}>Explore 24+ Digital Municipal Services</h2>
            </div>
            <div style={{ background: isDark ? '#0f172a' : '#ffffff', borderRadius: 14, padding: '8px 16px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: 10, width: 280, boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.03)' }}>
              <Search size={18} style={{ color: '#94a3b8' }} />
              <input type="text" placeholder="Search services..." value={serviceSearch} onChange={e => setServiceSearch(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: isDark ? '#fff' : '#0f172a', width: '100%' }} />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none',
                background: activeCategory === cat ? '#2563eb' : (isDark ? 'rgba(255,255,255,0.05)' : '#ffffff'),
                color: activeCategory === cat ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569'), 
                boxShadow: activeCategory === cat ? '0 4px 14px rgba(37,99,235,0.3)' : (isDark ? 'none' : '0 2px 6px rgba(0,0,0,0.04)'),
                transition: 'all 0.2s'
              }}>{cat}</button>
            ))}
          </div>

          {/* Service Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {filteredServices.map(svc => {
              const SvcIcon = svc.icon;
              return (
                <Link key={svc.id} to="/login" style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: isDark ? '#0f172a' : '#ffffff', borderRadius: 18, padding: '24px',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                    boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.03)',
                    height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 16,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                    onMouseOver={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = isDark ? `0 14px 32px ${svc.color}20` : `0 14px 32px ${svc.color}15`;
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.03)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${svc.color}14`, color: svc.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SvcIcon size={22} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: svc.color, background: `${svc.color}14`, padding: '4px 10px', borderRadius: 8 }}>{svc.sla}</span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: isDark ? '#fff' : '#0f172a' }}>{svc.name}</h3>
                    <p style={{ margin: 0, fontSize: 13.5, color: '#64748b', lineHeight: 1.6, flex: 1 }}>{svc.desc}</p>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 6, borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f1f5f9', paddingTop: 14 }}>
                      Launch <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════ */}
      {/* ██  7. FOOTER (Ultra-Premium Redesign)                ██ */}
      {/* ════════════════════════════════════════════════════════ */}
      <footer id="contact" style={{
        background: isDark ? '#050811' : '#0f172a',
        color: '#94a3b8',
        padding: '60px 32px 32px'
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
          {/* Top Row — Trust Badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap', paddingBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { icon: Shield, label: 'Secure & Scalable', color: '#10b981' },
              { icon: Server, label: 'Cloud-Native Platform', color: '#38bdf8' },
              { icon: Cpu, label: 'Real-time Processing', color: '#f59e0b' },
              { icon: Sparkles, label: 'AI-Powered Insights', color: '#8b5cf6' }
            ].map((badge, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${badge.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <badge.icon size={16} color={badge.color} />
                </div>
                <span>{badge.label}</span>
              </div>
            ))}
          </div>

          {/* Middle Row — Brand info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
            <div style={{ maxWidth: 500 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: 6 }}>
                Smart Governance <span style={{ color: '#60a5fa' }}>Platform</span>
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                Smart Governance Platform for Administrative Operations with Citizen Assistance
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                Empowering Citizens. Enabling Governance. Building a Better Tomorrow.
              </div>
            </div>

            <div style={{ fontSize: 12, color: '#64748b', textAlign: 'right' }}>
              © 2026 Smart Governance Platform.<br />All rights reserved.
            </div>
          </div>

          {/* Bottom Row — Legal / Status Grid */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: '#475569' }}>
            <span>Government Digital Grid • Administrative & Citizen Portal</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.1)', padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(34,197,94,0.2)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ color: '#22c55e', fontWeight: 600 }}>All Governance Nodes Operational</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ════════════════════════════════════════════════════════ */}
      {/* ██  PRESERVED: Floating AI Chat Widget               ██ */}
      {/* ════════════════════════════════════════════════════════ */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {isChatOpen && (
          <div style={{
            width: 380, maxWidth: 'calc(100vw - 32px)', height: 520, maxHeight: 'calc(100vh - 100px)',
            background: isDark ? '#0c111d' : '#ffffff', borderRadius: 22,
            border: isDark ? '1.5px solid rgba(255,255,255,0.14)' : '1.5px solid #cbd5e1',
            boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.7)' : '0 20px 45px rgba(37,99,235,0.18)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: 14
          }}>
            {/* Chat Header */}
            <div style={{ background: isDark ? '#111827' : '#f8fafc', borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Bot size={18} /></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isDark ? '#fff' : '#0f172a' }}>Smart Governance AI Desk</div>
                  <div style={{ fontSize: 10, color: '#22c55e', fontWeight: 600 }}>● Online</div>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} style={{ width: 28, height: 28, borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>✕</button>
            </div>
            {/* Chat Body */}
            <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {chatMessages.map(msg => (
                <div key={msg.id} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
                  <div style={{ padding: '10px 14px', borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px', background: msg.sender === 'user' ? '#2563eb' : (isDark ? '#1e293b' : '#f1f5f9'), color: msg.sender === 'user' ? '#fff' : (isDark ? '#f8fafc' : '#0f172a'), fontSize: 13, lineHeight: 1.45 }}>
                    <div>{msg.text}</div>
                    <div style={{ fontSize: 9, textAlign: 'right', marginTop: 4, opacity: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                      <span>{msg.time}</span>
                      {msg.sender === 'user' && <CheckCheck size={12} style={{ color: '#93c5fd' }} />}
                    </div>
                  </div>
                  {msg.chips && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {msg.chips.map((chip, idx) => (
                        <button key={idx} onClick={() => handleSendChat(chip)} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{chip} →</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div style={{ alignSelf: 'flex-start', background: isDark ? '#1e293b' : '#f1f5f9', padding: '8px 12px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8', animation: 'civicPulseGlow 1s infinite' }} />
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8', animation: 'civicPulseGlow 1s infinite 0.2s' }} />
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8', animation: 'civicPulseGlow 1s infinite 0.4s' }} />
                  <span style={{ fontSize: 10, color: '#64748b', marginLeft: 4 }}>Typing...</span>
                </div>
              )}
            </div>
            {/* Chat Input */}
            <form onSubmit={e => { e.preventDefault(); handleSendChat(); }} style={{ background: isDark ? '#111827' : '#f8fafc', borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask about grievances or certificates..." style={{ flex: 1, background: isDark ? '#1e293b' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0', borderRadius: 10, padding: '8px 12px', fontSize: 12.5, color: isDark ? '#fff' : '#0f172a', outline: 'none', height: 36 }} />
              <button type="submit" style={{ width: 36, height: 36, borderRadius: 10, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Send size={15} /></button>
            </form>
          </div>
        )}

        {/* Chat Toggle Button */}
        <button onClick={() => setIsChatOpen(prev => !prev)} style={{
          height: 50, padding: isChatOpen ? '0 16px' : '0 18px', borderRadius: 28,
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff', border: 'none',
          boxShadow: '0 8px 24px rgba(37,99,235,0.45)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800
        }}>
          <Bot size={20} />
          <span>{isChatOpen ? 'Close AI Desk' : 'Civic AI Desk'}</span>
          {!isChatOpen && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 8, fontSize: 10 }}>Online</span>}
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* ██  PRESERVED: Tour Overlay System                    ██ */}
      {/* ════════════════════════════════════════════════════════ */}
      {typeof tourStep === 'number' && (
        <>
          <div onClick={handleSkipTour} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 13, 22, 0.72)', zIndex: 9999 }} />
          {(() => {
            const currentStepConfig = TOUR_STEPS.find(s => s.step === tourStep);
            if (!currentStepConfig) return null;
            const StepIcon = currentStepConfig.icon;
            const isMobile = window.innerWidth < 640;
            let tooltipStyle = {};
            if (isMobile) {
              tooltipStyle = { position: 'fixed', bottom: 20, left: 16, right: 16, maxWidth: 'calc(100vw - 32px)', zIndex: 10001 };
            } else if (tourBounds) {
              const cardEstHeight = 330;
              const canPlaceBelow = (tourBounds.bottom + 16 + cardEstHeight) <= (window.innerHeight - 30);
              let topPos;
              if (canPlaceBelow) topPos = tourBounds.bottom + 16;
              else if (tourBounds.top - 16 - cardEstHeight >= 20) topPos = tourBounds.top - 16 - cardEstHeight;
              else topPos = Math.max(20, (window.innerHeight - cardEstHeight) / 2);
              topPos = Math.max(20, Math.min(topPos, window.innerHeight - cardEstHeight - 40));
              const leftPos = Math.max(20, Math.min(window.innerWidth - 480, tourBounds.left));
              tooltipStyle = { position: 'fixed', top: topPos, left: leftPos, width: 460, maxHeight: 'calc(100vh - 60px)', overflowY: 'auto', zIndex: 10001 };
            } else {
              tooltipStyle = { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 480, zIndex: 10001 };
            }
            return (
              <div style={{ ...tooltipStyle, background: isDark ? '#0f172a' : '#ffffff', borderRadius: 22, padding: '24px 28px', border: isDark ? '1.5px solid rgba(255,255,255,0.16)' : '1.5px solid #cbd5e1', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ background: `linear-gradient(135deg, ${currentStepConfig.accentColor}, #7c3aed)`, color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 900 }}>
                      {t('tour.stepCounter', { current: tourStep, total: 9 })}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>{currentStepConfig.subtitle}</span>
                  </div>
                  <button onClick={handleSkipTour} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}>{t('tour.skip')}</button>
                </div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
                  {TOUR_STEPS.map(s => (<div key={s.step} style={{ flex: 1, height: 4, borderRadius: 2, background: s.step <= tourStep ? currentStepConfig.accentColor : '#e2e8f0' }} />))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${currentStepConfig.accentColor}, #1d4ed8)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><StepIcon size={20} /></div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: isDark ? '#fff' : '#0f172a' }}>{t(`tour.steps.${tourStep}.title`, { defaultValue: currentStepConfig.title })}</h3>
                    {currentStepConfig.badge && <span style={{ fontSize: 10, fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: 4, marginTop: 2, display: 'inline-block' }}>{currentStepConfig.badge}</span>}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.6 }}>{t(`tour.steps.${tourStep}.desc`, { defaultValue: currentStepConfig.desc })}</p>
                {currentStepConfig.additionalDesc && (
                  <p style={{ margin: '10px 0 0', fontSize: 12.5, color: '#64748b', lineHeight: 1.5, background: '#f8fafc', padding: 10, borderRadius: 10, border: '1px solid #e2e8f0' }}>💡 {currentStepConfig.additionalDesc}</p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                  <button disabled={tourStep === 1} onClick={() => setTourStep(prev => Math.max(1, prev - 1))} style={{ background: '#f1f5f9', border: 'none', color: tourStep === 1 ? '#cbd5e1' : '#0f172a', padding: '8px 16px', borderRadius: 10, fontWeight: 800, fontSize: 12.5, cursor: tourStep === 1 ? 'not-allowed' : 'pointer' }}>{t('tour.back')}</button>
                  {tourStep < 9 ? (
                    <button onClick={() => setTourStep(prev => Math.min(9, prev + 1))} style={{ height: 38, padding: '0 20px', borderRadius: 10, background: '#2563eb', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>{t('tour.next')}</button>
                  ) : (
                    <button onClick={handleFinishTour} style={{ height: 38, padding: '0 20px', borderRadius: 10, background: '#10b981', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>{t('tour.finish')}</button>
                  )}
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* Tour Completion Modal */}
      {tourStep === 'completed' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 13, 22, 0.84)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setTourStep(null)}>
          <div style={{ width: '100%', maxWidth: 520, background: isDark ? '#0f172a' : '#ffffff', borderRadius: 24, padding: 32, border: isDark ? '1.5px solid rgba(255,255,255,0.16)' : '1.5px solid #cbd5e1', boxShadow: '0 30px 70px rgba(0,0,0,0.65)', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><CheckCircle2 size={28} /></div>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: isDark ? '#fff' : '#0f172a' }}>You're Ready to Get Started</h3>
            <p style={{ margin: '8px 0 24px', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>You now know the main features of the Smart Governance Platform. Create an account or sign in to start using digital citizen services.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link to="/register" onClick={() => setTourStep(null)} style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', height: 48, borderRadius: 12, background: '#2563eb', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><PenSquare size={16} /> Register as Citizen <ArrowRight size={16} /></button>
              </Link>
              <Link to="/login" onClick={() => setTourStep(null)} style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', height: 46, borderRadius: 12, background: '#ffffff', color: '#0f172a', fontWeight: 800, border: '1.5px solid #cbd5e1', cursor: 'pointer', fontSize: 13.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><LogIn size={16} /> Citizen Sign In</button>
              </Link>
              <button onClick={() => setTourStep(null)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 8 }}>Close & Return to Landing Page</button>
            </div>
          </div>
        </div>
      )}

      {/* First-Time Visitor Toast */}
      {showFirstTimeInvitation && tourStep === null && (
        <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 9998, maxWidth: 380, background: isDark ? '#0f172a' : '#ffffff', borderRadius: 18, padding: '16px 20px', border: isDark ? '1.5px solid rgba(56,189,248,0.35)' : '1.5px solid #93c5fd', boxShadow: '0 12px 36px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: isDark ? '#fff' : '#0f172a' }}><Compass size={16} style={{ color: '#2563eb' }} /> First time visiting?</div>
            <button onClick={() => { localStorage.setItem('civicpulse_guided_tour_completed', 'dismissed'); setShowFirstTimeInvitation(false); }} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 800, fontSize: 13 }}>✕</button>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: '#475569', lineHeight: 1.45 }}>Take a 1-minute guided tour to learn how to report civic problems, apply for certificates, and track complaints.</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
            <button onClick={() => { setShowFirstTimeInvitation(false); setTourStep(1); }} style={{ flex: 1, height: 36, borderRadius: 10, background: '#2563eb', color: '#fff', border: 'none', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>Start Guided Tour</button>
            <button onClick={() => { localStorage.setItem('civicpulse_guided_tour_completed', 'dismissed'); setShowFirstTimeInvitation(false); }} style={{ height: 36, padding: '0 12px', borderRadius: 10, background: '#f1f5f9', color: '#475569', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Later</button>
          </div>
        </div>
      )}

    </div>
  );
}
