import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext.jsx';
import api from '../api.js';
import keycloak from '../keycloak.js';
import LanguageSelector from '../components/LanguageSelector.jsx';
import { 
  Landmark, AlertTriangle, Info, ShieldAlert, BadgeCheck,
  Droplets, Route, Zap, Trash2, HeartPulse, FileText, FileSignature, Building2,
  PenSquare, Search, LogIn, Activity, ShieldCheck, Smartphone, CheckCircle, Bell,
  PhoneCall, BookOpen, HelpCircle, ArrowRight, CheckCircle2, Award, Sparkles, ChevronRight,
  Users, Clock, MessageSquare, Send, ThumbsUp, Heart, Flame, Share2,
  QrCode, ExternalLink, RefreshCw, Filter, Sparkle, Bot, Shield, CheckCheck, Play, Eye,
  X, MessageCircle, ChevronUp, ChevronDown, Check, CornerDownRight, Lock, Compass
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
      // 1. Check if ID matches sample demo dataset (CP-2026-8941, CERT-2026-3392, WEL-2026-1032)
      if (demoTrackingData[queryId]) {
        setActiveTrackingResult(demoTrackingData[queryId]);
        setTrackingLoading(false);
        return;
      }

      // 2. Query real Backend APIs
      const complaintRes = await api.get(`/grievance-service/api/complaints/${queryId}`).catch(() => null);
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
          deadline: compData.slaDeadline ? new Date(compData.slaDeadline).toLocaleString() : '18 Aug 2026, 10:18 PM',
          timeline: historyRes?.data?.length > 0 ? historyRes.data.map(h => ({
            label: h.statusChange || h.remarks || 'Status Updated',
            time: new Date(h.timestamp || h.createdAt).toLocaleString(),
            done: true
          })) : [
            { label: 'Grievance Filed & Logged on Kafka Bus', done: true, time: new Date(compData.createdAt || Date.now()).toLocaleDateString() },
            { label: compData.assignedOfficer ? 'Auto-Triaged & Assigned to Officer' : 'Awaiting Officer Assignment', done: Boolean(compData.assignedOfficer) },
            { label: 'Field Investigation & Maintenance', done: compData.status === 'IN_PROGRESS' || compData.status === 'RESOLVED' },
            { label: 'Resolution Verification & OTP Close', done: compData.status === 'RESOLVED' || compData.status === 'CLOSED' }
          ]
        });
        setTrackingLoading(false);
        return;
      }

      const certRes = await api.get(`/service-management-service/api/services/${queryId}`).catch(() => null);
      if (certRes?.data?.id) {
        const cert = certRes.data;
        setActiveTrackingResult({
          type: 'E-SERVICE',
          id: cert.id,
          title: cert.serviceType?.replace(/_/g, ' ') || 'Digital Certificate Application',
          status: cert.status || 'UNDER VERIFICATION',
          department: cert.department || 'Revenue Department',
          assignedOfficer: cert.assignedOfficer || 'Assigned Officer',
          timeline: [
            { label: 'Application Submitted', done: true },
            { label: 'Documents Received & DigiLocker Sync', done: true },
            { label: 'Department Verification', done: cert.status === 'CERTIFICATE_GENERATED' || cert.status === 'APPROVED' },
            { label: 'Certificate Approved & Download Ready', done: cert.status === 'CERTIFICATE_GENERATED' }
          ]
        });
        setTrackingLoading(false);
        return;
      }

      const welfareRes = await api.get(`/welfare-service/api/welfare/beneficiaries/${queryId}`).catch(() => null);
      if (welfareRes?.data?.id) {
        const wel = welfareRes.data;
        setActiveTrackingResult({
          type: 'WELFARE',
          id: wel.id,
          title: wel.schemeName || 'State Welfare Support Scheme',
          status: wel.status || 'APPROVED',
          department: 'Social Welfare Department',
          eligibility: wel.eligibilityStatus || 'APPROVED',
          applicationStatus: wel.applicationStatus || 'APPROVED',
          paymentStatus: wel.paymentStatus || 'PROCESSING',
          amount: wel.amount ? `₹${wel.amount.toLocaleString()}` : '₹2,000',
          timeline: [
            { label: 'Application Submitted', done: true },
            { label: 'Eligibility Verified via Aadhaar', done: true },
            { label: 'Application Approved by Admin', done: true },
            { label: 'Direct Benefit Transfer (DBT) Processing', done: true },
            { label: 'Payment Credited to Bank Account', done: wel.paymentStatus === 'CREDITED' }
          ]
        });
        setTrackingLoading(false);
        return;
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

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: isDark ? '#090d16' : '#f4f6fb', 
      color: isDark ? '#f1f5f9' : '#0f172a', 
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      transition: 'background 0.3s ease, color 0.3s ease'
    }}>

      {/* ── 1. Top Government & Real-Time Network Ticker Bar ── */}
      <div style={{
        background: isDark ? '#050811' : '#0f172a',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '8px 20px',
        fontSize: 12,
        fontWeight: 600,
        color: '#94a3b8'
      }}>
        <div style={{
          maxWidth: 1720,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 6, color: '#f8fafc', fontWeight: 700 }}>
            <span>🇮🇳</span>
            <span>GOVERNMENT OF INDIA</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ color: '#cbd5e1' }}>National Smart Governance Digital Grid</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8' }}>
            <Activity size={13} className="civic-pulse-badge" />
            <span>Kafka Event Bus: <strong style={{ color: '#4ade80' }}>Online (12ms)</strong></span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1' }}>
            <Users size={13} style={{ color: '#a855f7' }} />
            <span>Active Citizens: <strong style={{ color: '#ffffff' }}>{liveCitizens.toLocaleString()}</strong></span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24' }}>
            <PhoneCall size={12} />
            <span>24×7 Toll-Free: <strong>1800-11-2026</strong></span>
          </div>
        </div>
        </div>
      </div>

      {/* ── 2. Floating App-Style Glass Navigation Bar ── */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: isDark ? 'rgba(9, 13, 22, 0.92)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.9)',
        padding: '0 20px',
        height: 68,
        boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.04)'
      }}>
        <div style={{
          maxWidth: 1720,
          margin: '0 auto',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
        {/* Brand Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(37,99,235,0.35)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Landmark size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ 
              fontSize: 19, 
              fontWeight: 900, 
              letterSpacing: '-0.02em', 
              color: isDark ? '#ffffff' : '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              lineHeight: 1.2
            }}>
              Smart Governance <span style={{ color: '#2563eb' }}>Platform</span>
              <span style={{ 
                fontSize: 9, 
                fontWeight: 800, 
                background: isDark ? 'rgba(37,99,235,0.25)' : '#eff6ff', 
                color: '#2563eb', 
                padding: '2px 6px', 
                borderRadius: 6, 
                border: '1px solid rgba(37,99,235,0.3)' 
              }}>PRO</span>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Unified Citizen Services Gateway
            </div>
          </div>
        </Link>

        {/* Center Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 13, fontWeight: 700 }}>
          <a href="#feed" style={{ color: isDark ? '#cbd5e1' : '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}>
            <Bell size={15} style={{ color: '#38bdf8' }} /> {t('nav.bulletins')}
          </a>
          <a href="#tracker" style={{ color: isDark ? '#cbd5e1' : '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}>
            <Search size={15} style={{ color: '#10b981' }} /> {t('nav.slaTracker')}
          </a>
          <a href="#services" style={{ color: isDark ? '#cbd5e1' : '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}>
            <Sparkles size={15} style={{ color: '#f59e0b' }} /> {t('nav.serviceHub')}
          </a>
          <button
            onClick={() => setTourStep(1)}
            style={{ 
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isDark ? '#cbd5e1' : '#475569', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              fontSize: 13, 
              fontWeight: 700 
            }}
          >
            <Compass size={15} style={{ color: '#a855f7' }} /> {t('nav.guidedTour')}
          </button>
        </div>

        {/* Right Nav Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Language Selector Dropdown */}
          <LanguageSelector />

          <button
            onClick={toggleTheme}
            style={{
              height: 38,
              padding: '0 14px',
              borderRadius: 10,
              background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
              color: isDark ? '#f8fafc' : '#0f172a',
              border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>

          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              height: 38,
              padding: '0 18px',
              borderRadius: 10,
              background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
              color: isDark ? '#ffffff' : '#0f172a',
              border: isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid #cbd5e1',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7
            }}>
              <LogIn size={15} /> {t('nav.signIn')}
            </button>
          </Link>

          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button style={{
              height: 38,
              padding: '0 18px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: 13,
              boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7
            }}>
              <PenSquare size={15} /> {t('nav.register')}
            </button>
          </Link>
        </div>
        </div>
      </nav>

      {/* ── 4. Extended Full-Width Hero Section ── */}
      <section data-tour="hero-section" style={{
        padding: '44px 24px 60px',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
        background: isDark 
          ? 'radial-gradient(ellipse at 25% 20%, rgba(37,99,235,0.18), transparent 60%), radial-gradient(ellipse at 75% 80%, rgba(139,92,246,0.12), transparent 60%), #090d16'
          : 'radial-gradient(ellipse at 25% 20%, rgba(219,234,254,0.8), transparent 60%), radial-gradient(ellipse at 75% 80%, rgba(237,233,254,0.6), transparent 60%), #f8fafc'
      }}>
        <div style={{ 
          maxWidth: 1680, 
          margin: '0 auto', 
          display: 'flex',
          flexDirection: 'column',
          gap: 40
        }}>
          
          {/* Hero Main Header & Digital Citizen Pass Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)',
            gap: 48,
            alignItems: 'stretch'
          }}>
            
            {/* Left Column: Headline, Description & Call to Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
              <div>
                <span style={{
                  background: isDark ? 'rgba(37,99,235,0.16)' : '#eff6ff',
                  color: isDark ? '#60a5fa' : '#2563eb',
                  border: isDark ? '1px solid rgba(37,99,235,0.35)' : '1px solid #bfdbfe',
                  padding: '7px 16px',
                  borderRadius: 30,
                  fontSize: 12.5,
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 2px 10px rgba(37,99,235,0.1)'
                }}>
                  <Sparkles size={14} style={{ color: '#38bdf8' }} />
                  <span>{t('hero.title')}</span>
                </span>
              </div>

              <h1 style={{ 
                margin: 0, 
                fontSize: 46, 
                fontWeight: 900, 
                lineHeight: 1.14, 
                letterSpacing: '-0.035em', 
                color: isDark ? '#ffffff' : '#0f172a' 
              }}>
                {t('hero.subtitlePrefix')} <br />
                <span style={{
                  background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 40%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block'
                }}>
                  {t('hero.subtitleHighlight')}
                </span> <br />
                {t('hero.subtitleSuffix')}
              </h1>

              <p style={{ 
                margin: 0, 
                fontSize: 16, 
                color: isDark ? '#94a3b8' : '#475569', 
                lineHeight: 1.65, 
                maxWidth: 640 
              }}>
                {t('hero.desc')}
              </p>

              {/* Action Buttons */}
              <div data-tour="auth-actions" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', paddingTop: 10, alignItems: 'center' }}>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <button style={{
                    height: 50,
                    padding: '0 28px',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: 14.5,
                    boxShadow: '0 10px 25px rgba(37,99,235,0.35)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'all 0.2s ease'
                  }}>
                    <PenSquare size={17} /> {t('hero.registerBtn')} <ArrowRight size={16} />
                  </button>
                </Link>

                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <button style={{
                    height: 50,
                    padding: '0 24px',
                    borderRadius: 14,
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                    color: isDark ? '#ffffff' : '#0f172a',
                    border: isDark ? '1.5px solid rgba(255,255,255,0.16)' : '1.5px solid #cbd5e1',
                    fontWeight: 800,
                    fontSize: 14.5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease'
                  }}>
                    <LogIn size={17} /> {t('hero.signInBtn')}
                  </button>
                </Link>

                <button
                  onClick={() => setTourStep(1)}
                  style={{
                    height: 50,
                    padding: '0 20px',
                    borderRadius: 14,
                    background: isDark ? 'rgba(168,85,247,0.14)' : '#f3e8ff',
                    color: isDark ? '#c084fc' : '#7e22ce',
                    border: isDark ? '1.5px solid rgba(168,85,247,0.35)' : '1.5px solid #e9d5ff',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Compass size={17} style={{ color: '#a855f7' }} /> {t('hero.tourBtn')}
                </button>
              </div>
            </div>

            {/* Right Column — Premium Digital Citizen Pass Hologram Card */}
            <div style={{
              background: isDark 
                ? 'linear-gradient(145deg, rgba(30,58,138,0.35) 0%, rgba(15,23,42,0.95) 100%)' 
                : 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)',
              borderRadius: 24,
              padding: '32px',
              border: isDark ? '1.5px solid rgba(56,189,248,0.3)' : '1.5px solid #bfdbfe',
              boxShadow: isDark ? '0 25px 50px rgba(0,0,0,0.6)' : '0 20px 40px rgba(37,99,235,0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 22,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Subtle Background Pattern */}
              <div style={{
                position: 'absolute', top: -60, right: -60, width: 220, height: 220,
                background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              {/* Top Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 6px 16px rgba(37,99,235,0.4)',
                    flexShrink: 0
                  }}>
                    <Landmark size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '0.04em' }}>
                      DIGITAL CITIZEN PASS
                    </div>
                    <div style={{ fontSize: 11, color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 700 }}>
                      Verified Gov-Tech SSO Gateway
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(34,197,94,0.15)',
                  color: '#16a34a',
                  border: '1.5px solid rgba(34,197,94,0.3)',
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} className="civic-pulse-badge" />
                  AUTHENTICATED
                </div>
              </div>

              {/* 4 Interactive Feature Highlight Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                  borderRadius: 16,
                  padding: '14px 16px',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8', fontSize: 11.5, fontWeight: 800 }}>
                    <ShieldCheck size={15} /> DigiLocker
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginTop: 4 }}>QR Signed Certs</div>
                  <div style={{ fontSize: 10.5, color: isDark ? '#94a3b8' : '#64748b', marginTop: 2 }}>Zero physical office visits</div>
                </div>

                <div style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                  borderRadius: 16,
                  padding: '14px 16px',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontSize: 11.5, fontWeight: 800 }}>
                    <Clock size={15} /> SLA Engine
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginTop: 4 }}>Auto Escalations</div>
                  <div style={{ fontSize: 10.5, color: isDark ? '#94a3b8' : '#64748b', marginTop: 2 }}>Guaranteed response time</div>
                </div>

                <div style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                  borderRadius: 16,
                  padding: '14px 16px',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 11.5, fontWeight: 800 }}>
                    <Award size={15} /> Direct DBT
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginTop: 4 }}>Welfare Payouts</div>
                  <div style={{ fontSize: 10.5, color: isDark ? '#94a3b8' : '#64748b', marginTop: 2 }}>Direct Aadhaar bank credit</div>
                </div>

                <div style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                  borderRadius: 16,
                  padding: '14px 16px',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a855f7', fontSize: 11.5, fontWeight: 800 }}>
                    <Lock size={15} /> Keycloak SSO
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginTop: 4 }}>256-Bit Security</div>
                  <div style={{ fontSize: 10.5, color: isDark ? '#94a3b8' : '#64748b', marginTop: 2 }}>Multi-factor identity</div>
                </div>
              </div>

              {/* Bottom Security Stamp */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: isDark ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid #e2e8f0',
                paddingTop: 16,
                fontSize: 12,
                color: isDark ? '#cbd5e1' : '#475569',
                fontWeight: 700
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  🇮🇳 National Informatics Grid
                </span>
                <span style={{ color: '#16a34a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} className="civic-pulse-badge" />
                  99.98% System Uptime
                </span>
              </div>
            </div>

          </div>

          {/* ── Extended 4-Column Stats Showcase Row ── */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: 16 
          }}>
            {/* Stat 1 */}
            <div style={{
              background: isDark ? '#111827' : '#ffffff',
              borderRadius: 16,
              padding: '18px 20px',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 104,
              boxSizing: 'border-box',
              boxShadow: isDark ? 'none' : '0 4px 14px rgba(0,0,0,0.03)'
            }} className="civic-glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#0284c7', lineHeight: 1 }}>12,847</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', background: 'rgba(22,163,74,0.12)', padding: '2px 8px', borderRadius: 6 }}>+12% week</span>
              </div>
              <div style={{ fontSize: 13, color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 800, marginTop: 4 }}>
                Complaints Resolved
              </div>
              <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <CheckCircle2 size={12} /> Avg. 18h turnaround
              </div>
            </div>

            {/* Stat 2 */}
            <div style={{
              background: isDark ? '#111827' : '#ffffff',
              borderRadius: 16,
              padding: '18px 20px',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 104,
              boxSizing: 'border-box',
              boxShadow: isDark ? 'none' : '0 4px 14px rgba(0,0,0,0.03)'
            }} className="civic-glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#16a34a', lineHeight: 1 }}>4,200+</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', background: 'rgba(37,99,235,0.12)', padding: '2px 8px', borderRadius: 6 }}>Verified</span>
              </div>
              <div style={{ fontSize: 13, color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 800, marginTop: 4 }}>
                Citizens Registered
              </div>
              <div style={{ fontSize: 11, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <ShieldCheck size={12} /> 100% Aadhaar Verified
              </div>
            </div>

            {/* Stat 3 */}
            <div style={{
              background: isDark ? '#111827' : '#ffffff',
              borderRadius: 16,
              padding: '18px 20px',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 104,
              boxSizing: 'border-box',
              boxShadow: isDark ? 'none' : '0 4px 14px rgba(0,0,0,0.03)'
            }} className="civic-glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#d97706', lineHeight: 1 }}>98.5%</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#d97706', background: 'rgba(217,119,6,0.12)', padding: '2px 8px', borderRadius: 6 }}>⭐ High</span>
              </div>
              <div style={{ fontSize: 13, color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 800, marginTop: 4 }}>
                SLA Compliance
              </div>
              <div style={{ fontSize: 11, color: '#d97706', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Clock size={12} /> Auto Escalation Live
              </div>
            </div>

            {/* Stat 4 */}
            <div style={{
              background: isDark ? '#111827' : '#ffffff',
              borderRadius: 16,
              padding: '18px 20px',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 104,
              boxSizing: 'border-box',
              boxShadow: isDark ? 'none' : '0 4px 14px rgba(0,0,0,0.03)'
            }} className="civic-glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#8b5cf6', lineHeight: 1 }}>₹42.8 Cr</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#8b5cf6', background: 'rgba(139,92,246,0.12)', padding: '2px 8px', borderRadius: 6 }}>DBT</span>
              </div>
              <div style={{ fontSize: 13, color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 800, marginTop: 4 }}>
                Welfare Disbursed
              </div>
              <div style={{ fontSize: 11, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Check size={12} /> Direct Bank Transfer
              </div>
            </div>
          </div>

          {/* ── Extended 4-Grid Quick Action Portals ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16
          }}>
            {heroQuickActions.map((act, i) => {
              const ActIcon = act.icon;
              return (
                <Link
                  key={i}
                  to={act.to}
                  style={{ textDecoration: 'none' }}
                >
                  <div data-tour={act.tourKey} style={{
                    background: act.bgGradient,
                    borderRadius: 16,
                    padding: '20px',
                    border: `1px solid ${act.borderColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    boxSizing: 'border-box',
                    gap: 12
                  }} className="civic-glass-card">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                          color: act.tagColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        }}>
                          <ActIcon size={20} />
                        </div>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: act.tagColor,
                          background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                          padding: '3px 8px',
                          borderRadius: 8
                        }}>
                          {act.tag}
                        </span>
                      </div>

                      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                        {act.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: 12.5, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.5 }}>
                        {act.desc}
                      </p>
                    </div>

                    <div style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: act.tagColor,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      Open Portal <ArrowRight size={13} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 5. CITIZEN SERVICE TRACKER SECTION ── */}
      <section id="feed" data-tour="broadcasts" style={{
        padding: '50px 20px',
        background: isDark ? '#0c111c' : '#ffffff',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: 1720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#2563eb', fontSize: 12, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {t('tracker.title')}
                </span>
                <span style={{
                  background: 'rgba(34,197,94,0.14)', color: '#16a34a', padding: '3px 10px',
                  borderRadius: 20, fontSize: 11, fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px solid rgba(34,197,94,0.3)'
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  {t('quickActions.live')}
                </span>
              </div>
              
              <h2 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.02em' }}>
                {t('tracker.subtitle')}
              </h2>
            </div>

            {isAuthenticated && (
              <div style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} style={{ color: '#10b981' }} /> {t('quickActions.verifiedProfile')}
              </div>
            )}
          </div>

          {/* MAIN PROMINENT TRACKING INPUT CARD */}
          <div style={{
            background: isDark ? '#111827' : '#ffffff',
            borderRadius: 24,
            padding: '32px 28px',
            border: isDark ? '1.5px solid rgba(255,255,255,0.12)' : '1.5px solid #cbd5e1',
            boxShadow: isDark ? '0 15px 40px rgba(0,0,0,0.4)' : '0 10px 30px rgba(37,99,235,0.06)',
            display: 'flex', flexDirection: 'column', gap: 20
          }} className="civic-glass-card">
            
            <form onSubmit={handleTrackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                
                {/* Search Input Box */}
                <div style={{ flex: '1 1 320px', position: 'relative' }}>
                  <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: isDark ? '#94a3b8' : '#64748b' }} />
                  <input
                    type="text"
                    value={trackingIdInput}
                    onChange={e => setTrackingIdInput(e.target.value)}
                    placeholder={t('tracker.inputPlaceholder')}
                    style={{
                      width: '100%',
                      height: 52,
                      paddingLeft: 48,
                      paddingRight: 16,
                      borderRadius: 14,
                      background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                      color: isDark ? '#ffffff' : '#0f172a',
                      border: isDark ? '1.5px solid rgba(255,255,255,0.16)' : '1.5px solid #cbd5e1',
                      fontSize: 15,
                      fontWeight: 700,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Track Status Button */}
                <button
                  type="submit"
                  disabled={trackingLoading}
                  style={{
                    height: 52,
                    padding: '0 28px',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: 15,
                    border: 'none',
                    cursor: trackingLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 6px 20px rgba(37,99,235,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexShrink: 0
                  }}
                >
                  {trackingLoading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      <span>{t('tracker.trackBtn')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Category Filter Pills & Sample Shortcuts */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b' }}>
                    Trackable Services:
                  </span>
                  {[
                    { key: 'Complaints', label: t('tracker.categories.complaints') },
                    { key: 'Certificates', label: t('tracker.categories.certificates') },
                    { key: 'Welfare', label: t('tracker.categories.welfare') },
                    { key: 'Service Requests', label: t('tracker.categories.services') }
                  ].map(cat => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setSelectedTrackerCategory(cat.key)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 800,
                        border: selectedTrackerCategory === cat.key ? '1.5px solid #2563eb' : (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0'),
                        background: selectedTrackerCategory === cat.key ? (isDark ? 'rgba(37,99,235,0.2)' : '#eff6ff') : 'transparent',
                        color: selectedTrackerCategory === cat.key ? '#2563eb' : (isDark ? '#cbd5e1' : '#475569'),
                        cursor: 'pointer'
                      }}
                    >
                      ● {cat.label}
                    </button>
                  ))}
                </div>

                {/* Sample Tickets Try Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b' }}>
                  <span>Try sample ID:</span>
                  {['CP-2026-8941', 'CERT-2026-3392', 'WEL-2026-1032'].map(sampleId => (
                    <button
                      key={sampleId}
                      type="button"
                      onClick={() => {
                        setTrackingIdInput(sampleId);
                        setActiveTrackingResult(demoTrackingData[sampleId]);
                        setTrackingError(null);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#2563eb',
                        fontWeight: 800,
                        fontSize: 11,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {sampleId}
                    </button>
                  ))}
                </div>
              </div>
            </form>

            {/* DYNAMIC RESULTS EXPANSION PANEL */}
            {trackingLoading && (
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <RefreshCw size={28} className="animate-spin" style={{ color: '#2563eb', margin: '0 auto' }} />
                <div style={{ marginTop: 12, fontSize: 14, fontWeight: 800, color: isDark ? '#cbd5e1' : '#475569' }}>
                  {t('tracker.loadingMsg')}
                </div>
              </div>
            )}

            {!trackingLoading && trackingError && (
              <div style={{
                background: isDark ? 'rgba(239,68,68,0.08)' : '#fef2f2',
                borderRadius: 16, padding: '24px', textAlign: 'center',
                border: isDark ? '1px solid rgba(239,68,68,0.2)' : '1px solid #fecaca'
              }}>
                <AlertTriangle size={32} style={{ color: '#ef4444', margin: '0 auto 10px' }} />
                <h4 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 900, color: isDark ? '#fff' : '#0f172a' }}>
                  {t('tracker.notFoundTitle')}
                </h4>
                <p style={{ margin: '0 0 16px', fontSize: 13.5, color: isDark ? '#fca5a5' : '#b91c1c' }}>
                  {t('tracker.notFoundDesc')}
                </p>
                <button
                  onClick={() => { setTrackingError(null); setTrackingIdInput(''); }}
                  style={{
                    padding: '8px 20px', borderRadius: 10, background: '#2563eb', color: '#fff',
                    fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: 13
                  }}
                >
                  {t('tracker.tryAgain')}
                </button>
              </div>
            )}

            {!trackingLoading && !trackingError && activeTrackingResult && (
              <div style={{
                background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                borderRadius: 20,
                padding: '24px',
                border: isDark ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid #e2e8f0',
                display: 'flex', flexDirection: 'column', gap: 20
              }}>
                {/* Result Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{
                        background: 'rgba(37,99,235,0.14)', color: '#2563eb',
                        padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 900, letterSpacing: '0.06em'
                      }}>
                        {activeTrackingResult.type || 'GRIEVANCE'}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b' }}>
                        ID: {activeTrackingResult.id}
                      </span>
                    </div>
                    <h3 style={{ margin: '6px 0 0', fontSize: 20, fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a' }}>
                      {activeTrackingResult.title}
                    </h3>
                  </div>

                  <span style={{
                    background: activeTrackingResult.status === 'RESOLVED' || activeTrackingResult.status === 'APPROVED' ? 'rgba(34,197,94,0.14)' : 'rgba(59,130,246,0.14)',
                    color: activeTrackingResult.status === 'RESOLVED' || activeTrackingResult.status === 'APPROVED' ? '#16a34a' : '#2563eb',
                    border: activeTrackingResult.status === 'RESOLVED' || activeTrackingResult.status === 'APPROVED' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(59,130,246,0.3)',
                    padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 6
                  }}>
                    ● {t('status.' + activeTrackingResult.status, { defaultValue: activeTrackingResult.status?.replace(/_/g, ' ') })}
                  </span>
                </div>

                {/* Grid Details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 14,
                  background: isDark ? '#111827' : '#ffffff',
                  padding: 16,
                  borderRadius: 16,
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0'
                }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase' }}>
                      {t('tracker.department')}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: isDark ? '#fff' : '#0f172a', marginTop: 2 }}>
                      {activeTrackingResult.department || 'Electricity Department'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase' }}>
                      {t('tracker.assignedOfficer')}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: activeTrackingResult.assignedOfficer ? (isDark ? '#fff' : '#0f172a') : '#d97706', marginTop: 2 }}>
                      {activeTrackingResult.assignedOfficer || `⚠️ ${t('tracker.notAssigned')}`}
                    </div>
                  </div>

                  {activeTrackingResult.priority && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase' }}>
                        {t('tracker.priority')}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#ef4444', marginTop: 2 }}>
                        {activeTrackingResult.priority}
                      </div>
                    </div>
                  )}

                  {activeTrackingResult.slaStatus && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase' }}>
                        {t('tracker.slaStatus')}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#16a34a', marginTop: 2 }}>
                        ✓ {activeTrackingResult.slaStatus.replace(/_/g, ' ')}
                      </div>
                    </div>
                  )}

                  {activeTrackingResult.deadline && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase' }}>
                        {t('tracker.deadline')}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: isDark ? '#fff' : '#0f172a', marginTop: 2 }}>
                        {activeTrackingResult.deadline}
                      </div>
                    </div>
                  )}
                </div>

                {/* Real Application Timeline */}
                {activeTrackingResult.timeline && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.04em' }}>
                      {t('tracker.timeline')}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {activeTrackingResult.timeline.map((step, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: step.done ? 'rgba(34,197,94,0.14)' : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                            color: step.done ? '#16a34a' : (isDark ? '#64748b' : '#94a3b8'),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 900, border: step.done ? '1px solid rgba(34,197,94,0.3)' : '1px solid #cbd5e1'
                          }}>
                            {step.done ? '✓' : idx + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13.5, fontWeight: step.done ? 800 : 600, color: step.done ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#94a3b8' : '#64748b') }}>
                              {step.label}
                            </div>
                            {step.time && (
                              <div style={{ fontSize: 11, color: isDark ? '#64748b' : '#94a3b8', marginTop: 2 }}>
                                {step.time}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contextual Action Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                  <Link to={activeTrackingResult.type === 'E-SERVICE' ? '/my-certificates' : activeTrackingResult.type === 'WELFARE' ? '/my-welfare' : '/complaints'} style={{ textDecoration: 'none' }}>
                    <button style={{
                      padding: '10px 24px', borderRadius: 12,
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#ffffff',
                      fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      {t('tracker.viewDetails')} <ArrowRight size={15} />
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* Authenticated Recent Applications Shortcut List */}
            {isAuthenticated && userComplaints.length > 0 && (
              <div style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', paddingTop: 16, marginTop: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  {t('tracker.myRecent')}
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {userComplaints.slice(0, 3).map(c => {
                    const cId = String(c.complaintId || c.id || '');
                    const cTitle = c.title || c.subject || '';
                    const displayTitle = cTitle
                      ? (cTitle.length > 18 ? cTitle.substring(0, 18) + '...' : cTitle)
                      : (cId ? (cId.length > 8 ? cId.substring(0, 8) : cId) : 'Grievance');
                    return (
                      <button
                        key={cId || Math.random()}
                        onClick={() => {
                          setTrackingIdInput(cId);
                          setActiveTrackingResult({
                            type: 'GRIEVANCE',
                            id: cId,
                            title: cTitle || c.category || 'Grievance',
                            status: c.status || 'IN_PROGRESS',
                            department: c.department || 'Municipal Board',
                            assignedOfficer: c.assignedOfficerName || c.assignedOfficer || null,
                            slaStatus: c.slaStatus || 'ON_TIME',
                            deadline: c.slaDeadline ? new Date(c.slaDeadline).toLocaleString() : '18 Aug 2026'
                          });
                          setTrackingError(null);
                        }}
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                          borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700,
                          color: isDark ? '#fff' : '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                        }}
                      >
                        <span>📋 Grievance: {displayTitle}</span>
                        <span style={{ color: '#2563eb', fontWeight: 900 }}>● {c.status || 'NEW'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* ── 6. Interactive Live SLA Tracker Simulator ── */}
      <section id="tracker" data-tour="sla-tracker" style={{
        padding: '50px 24px',
        background: isDark ? '#090d16' : '#f8fafc',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: 1680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.25fr)',
            gap: 40,
            alignItems: 'stretch'
          }}>
            
            {/* Left Control Column: Section Title, Search, Sample Pills & Live Telemetry Metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24 }}>
              <div>
                <span style={{ color: '#16a34a', fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  ⚡ TRANSPARENT DISPATCH GRID
                </span>
                <h2 style={{ margin: '8px 0 10px', fontSize: 32, fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.02em' }}>
                  Interactive Live SLA Tracker
                </h2>
                <p style={{ margin: 0, fontSize: 15, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6 }}>
                  Every citizen grievance is timestamped on the Kafka Event Bus, auto-assigned to field officers, and monitored against SLA breach timers.
                </p>
              </div>

              {/* Search Box */}
              <div style={{
                width: '100%',
                background: isDark ? '#111827' : '#ffffff',
                padding: 6,
                borderRadius: 16,
                border: isDark ? '1.5px solid rgba(255,255,255,0.14)' : '1.5px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 6px 20px rgba(0,0,0,0.04)'
              }}>
                <div style={{ paddingLeft: 12, color: '#3b82f6' }}>
                  <Search size={20} />
                </div>
                <input 
                  type="text"
                  value={trackingIdInput}
                  onChange={e => setTrackingIdInput(e.target.value)}
                  placeholder="Enter Ticket ID (e.g. CP-2026-8941 or CERT-2026-3392)"
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: 14,
                    fontWeight: 700,
                    color: isDark ? '#ffffff' : '#0f172a'
                  }}
                />
                <button
                  onClick={() => {
                    if (demoTrackingData[trackingIdInput.trim()]) {
                      setActiveTrackingResult(demoTrackingData[trackingIdInput.trim()]);
                    } else {
                      setActiveTrackingResult(demoTrackingData['CP-2026-8941']);
                    }
                  }}
                  style={{
                    height: 44,
                    padding: '0 24px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#fff',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13.5,
                    boxShadow: '0 4px 14px rgba(37,99,235,0.3)'
                  }}
                >
                  Track Live
                </button>
              </div>

              {/* Quick Select Sample Ticket Pills */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', marginBottom: 8 }}>
                  Try sample tickets:
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => { setTrackingIdInput('CP-2026-8941'); setActiveTrackingResult(demoTrackingData['CP-2026-8941']); }}
                    style={{
                      background: isDark ? 'rgba(56,189,248,0.12)' : '#eff6ff',
                      border: '1px solid #bae6fd',
                      color: '#0284c7',
                      padding: '7px 14px',
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    ⚡ CP-2026-8941 (Streetlight)
                  </button>
                  <button 
                    onClick={() => { setTrackingIdInput('CERT-2026-3392'); setActiveTrackingResult(demoTrackingData['CERT-2026-3392']); }}
                    style={{
                      background: isDark ? 'rgba(34,197,94,0.12)' : '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      color: '#16a34a',
                      padding: '7px 14px',
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    📜 CERT-2026-3392 (Residence Cert)
                  </button>
                </div>
              </div>

              {/* Kafka Grid Live Health Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff', padding: '12px 14px', borderRadius: 14, border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 800 }}>KAFKA LATENCY</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: isDark ? '#fff' : '#0f172a', marginTop: 2 }}>12 ms</div>
                </div>
                <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff', padding: '12px 14px', borderRadius: 14, border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#10b981', fontWeight: 800 }}>SLA COMPLIANCE</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: isDark ? '#fff' : '#0f172a', marginTop: 2 }}>98.5%</div>
                </div>
                <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff', padding: '12px 14px', borderRadius: 14, border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#a855f7', fontWeight: 800 }}>DISPATCHED</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: isDark ? '#fff' : '#0f172a', marginTop: 2 }}>1,420 Active</div>
                </div>
              </div>
            </div>

            {/* Right Column: Live SLA Timeline Display Card */}
            {activeTrackingResult && (
              <div style={{
                width: '100%',
                background: isDark ? '#111827' : '#ffffff',
                borderRadius: 22,
                padding: '28px',
                border: isDark ? '1.5px solid rgba(255,255,255,0.12)' : '1.5px solid #e2e8f0',
                boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.5)' : '0 12px 32px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 20
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, paddingBottom: 18, borderBottom: isDark ? '1.5px solid rgba(255,255,255,0.08)' : '1.5px solid #e2e8f0' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20, fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a' }}>{activeTrackingResult.id}</span>
                      <span style={{ 
                        fontSize: 11, 
                        fontWeight: 900, 
                        padding: '3px 10px', 
                        borderRadius: 8,
                        background: activeTrackingResult.status === 'APPROVED' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)',
                        color: activeTrackingResult.status === 'APPROVED' ? '#22c55e' : '#3b82f6',
                        border: activeTrackingResult.status === 'APPROVED' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(59,130,246,0.3)'
                      }}>
                        ● {activeTrackingResult.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, marginTop: 4 }}>
                      {activeTrackingResult.type} • {activeTrackingResult.dept}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Assigned Officer</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginTop: 2 }}>{activeTrackingResult.assignedOfficer}</div>
                  </div>
                </div>

                {/* Step Timeline */}
                <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {activeTrackingResult.steps.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: step.done ? '#16a34a' : (step.active ? '#3b82f6' : (isDark ? '#334155' : '#cbd5e1')),
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 900,
                          boxShadow: step.active ? '0 0 12px rgba(59,130,246,0.5)' : 'none'
                        }}>
                          {step.done ? '✓' : (step.active ? '●' : idx + 1)}
                        </div>
                        {idx !== activeTrackingResult.steps.length - 1 && (
                          <div style={{ width: 2, height: 32, background: step.done ? '#16a34a' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'), marginTop: 4 }} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: step.active ? 800 : 700, color: step.active ? '#38bdf8' : (isDark ? '#f8fafc' : '#0f172a'), lineHeight: 1.3 }}>
                          {step.label}
                        </div>
                        <div style={{ fontSize: 11.5, color: isDark ? '#94a3b8' : '#64748b', marginTop: 3, fontWeight: 600 }}>{step.time}</div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>

        </div>
      </section>

      {/* ── 7. Modern Services Directory & App Hub ── */}
      <section id="services" data-tour="services" style={{
        padding: '50px 20px',
        background: isDark ? '#0c111c' : '#ffffff',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: 1720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ color: '#8b5cf6', fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                CITIZEN SERVICES HUB
              </span>
              <h2 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.02em' }}>
                Explore 24+ Digital Municipal Services
              </h2>
            </div>

            {/* Search Filter */}
            <div style={{
              background: isDark ? '#111827' : '#f8fafc',
              borderRadius: 10,
              padding: '6px 12px',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: 260
            }}>
              <Search size={15} style={{ color: '#94a3b8' }} />
              <input 
                type="text"
                placeholder="Search services..."
                value={serviceSearch}
                onChange={e => setServiceSearch(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: 12.5,
                  color: isDark ? '#fff' : '#0f172a',
                  width: '100%'
                }}
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: activeCategory === cat 
                    ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' 
                    : (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                  color: activeCategory === cat ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569'),
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Service Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
            {filteredServices.map(svc => {
              const SvcIcon = svc.icon;
              return (
                <Link 
                  key={svc.id} 
                  to="/login"
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    background: isDark ? '#111827' : '#f8fafc',
                    borderRadius: 16,
                    padding: '20px',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    boxSizing: 'border-box',
                    gap: 14
                  }} className="civic-glass-card">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                          color: svc.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0'
                        }}>
                          <SvcIcon size={20} />
                        </div>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: svc.color,
                          background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                          padding: '3px 8px',
                          borderRadius: 8,
                          border: `1px solid ${svc.color}30`
                        }}>
                          {svc.sla}
                        </span>
                      </div>

                      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                        {svc.name}
                      </h3>
                      <p style={{ margin: 0, fontSize: 12.5, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.45 }}>
                        {svc.desc}
                      </p>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
                      paddingTop: 10
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: svc.color }}>{svc.dept}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 3 }}>
                        Launch <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 8. Omni-Channel Access (WhatsApp & Telegram Bot Integration) ── */}
      <section style={{
        padding: '45px 20px',
        background: isDark ? '#090d16' : '#f8fafc',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: 1720, margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 50%, #0f172a 100%)',
            borderRadius: 24,
            padding: '36px',
            color: '#ffffff',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
            gap: 32,
            alignItems: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 16, fontSize: 11, fontWeight: 800, marginBottom: 14 }}>
                <Smartphone size={14} style={{ color: '#38bdf8' }} /> Mobile & Messaging Bot Gateway
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 10px', lineHeight: 1.25 }}>
                Access Smart Governance Platform Directly on WhatsApp & Telegram
              </h2>
              <p style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 20px' }}>
                File complaints simply by sending a photo and location on WhatsApp or Telegram. Receive instant SLA status alerts right on your phone without opening a browser.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href="https://wa.me/911800112026" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <button style={{
                    height: 42,
                    padding: '0 18px',
                    borderRadius: 10,
                    background: '#22c55e',
                    color: '#fff',
                    fontWeight: 800,
                    border: 'none',
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <MessageSquare size={15} /> Open WhatsApp Desk
                  </button>
                </a>

                <a href="https://t.me/SmartGovernanceOfficialBot" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <button style={{
                    height: 42,
                    padding: '0 18px',
                    borderRadius: 10,
                    background: '#0284c7',
                    color: '#fff',
                    fontWeight: 800,
                    border: 'none',
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <Send size={15} /> Telegram Bot Channel
                  </button>
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                background: 'rgba(255,255,255,0.08)',
                padding: '20px',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.15)',
                textAlign: 'center',
                maxWidth: 220
              }}>
                <div style={{
                  background: '#ffffff',
                  padding: 10,
                  borderRadius: 10,
                  display: 'inline-block',
                  marginBottom: 8
                }}>
                  <QrCode size={110} color="#0f172a" />
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#ffffff' }}>Scan QR to Chat</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Instant bot onboarding</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Footer ── */}
      <footer style={{
        background: isDark ? '#050811' : '#0f172a',
        color: '#cbd5e1',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '40px 20px 25px'
      }}>
        <div style={{
          maxWidth: 1720,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 36,
          paddingBottom: 36,
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Landmark size={18} />
              </div>
              <span style={{ fontSize: 17, fontWeight: 900, color: '#ffffff' }}>Smart Governance Platform</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              A Cloud-Native Smart Governance Infrastructure built on Apache Kafka, Keycloak Single Sign-On, and DigiLocker APIs.
            </p>
          </div>

          <div>
            <h5 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Citizen Portals
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#94a3b8' }}>
              <a href="#services" style={{ color: 'inherit', textDecoration: 'none' }}>Municipal Grievances</a>
              <a href="#services" style={{ color: 'inherit', textDecoration: 'none' }}>e-Certificates & Permits</a>
              <a href="#services" style={{ color: 'inherit', textDecoration: 'none' }}>State Welfare Schemes</a>
              <a href="#tracker" style={{ color: 'inherit', textDecoration: 'none' }}>Live SLA Tracking</a>
            </div>
          </div>

          <div>
            <h5 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Compliance & Security
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#94a3b8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Shield size={13} style={{ color: '#22c55e' }} /> 256-Bit SSL Encryption</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BadgeCheck size={13} style={{ color: '#38bdf8' }} /> Keycloak SSO MFA</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={13} style={{ color: '#f59e0b' }} /> RTI Disclosures</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Award size={13} style={{ color: '#a855f7' }} /> ISO 27001 Certified</span>
            </div>
          </div>

          <div>
            <h5 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Emergency Hotlines
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#94a3b8' }}>
              <span>🚨 National Emergency: <strong style={{ color: '#ffffff' }}>112</strong></span>
              <span>📞 Citizen Toll-Free: <strong style={{ color: '#38bdf8' }}>1800-11-2026</strong></span>
              <span>🚑 Health & Ambulance: <strong style={{ color: '#ffffff' }}>108</strong></span>
              <span>✉️ Official Email: <strong style={{ color: '#ffffff' }}>support@smartgovernance.gov.in</strong></span>
            </div>
          </div>
        </div>

        <div style={{
          maxWidth: 1720,
          margin: '20px auto 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          fontSize: 11,
          color: '#64748b'
        }}>
          <div>© 2026 Government of India • Smart Governance Platform for Administrative Operations with Citizen Assistance.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span style={{ color: '#94a3b8' }}>All Governance Nodes Operational</span>
          </div>
        </div>
      </footer>

      {/* ── 10. Floating AI Assistant Widget Trigger (Bottom Right) ── */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}>
        
        {/* Expanded Floating Chat Window */}
        {isChatOpen && (
          <div style={{
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            height: 520,
            maxHeight: 'calc(100vh - 100px)',
            background: isDark ? '#0c111d' : '#ffffff',
            borderRadius: 22,
            border: isDark ? '1.5px solid rgba(255,255,255,0.14)' : '1.5px solid #cbd5e1',
            boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.7)' : '0 20px 45px rgba(37,99,235,0.18)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            marginBottom: 14,
            animation: 'chatBubbleSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}>
            {/* Header */}
            <div style={{
              background: isDark ? '#111827' : '#f8fafc',
              borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #0284c7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}>
                    <Bot size={18} />
                  </div>
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#22c55e',
                    border: isDark ? '2px solid #111827' : '2px solid #ffffff'
                  }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', display: 'flex', alignItems: 'center', gap: 5 }}>
                    Smart Governance AI Desk
                    <BadgeCheck size={14} style={{ color: '#38bdf8' }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#22c55e', fontWeight: 600 }}>
                    ● Online • Connected to Kafka Bus
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsChatOpen(false)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                  border: 'none',
                  color: isDark ? '#94a3b8' : '#64748b',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Chat Body */}
            <div style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background: isDark 
                ? 'radial-gradient(circle at center, rgba(37,99,235,0.03), transparent 70%), #0c111d'
                : 'radial-gradient(circle at center, rgba(239,246,255,0.7), transparent 70%), #fbfcfe'
            }} className="civic-scrollbar">
              {chatMessages.map(msg => (
                <div 
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%'
                  }}
                  className="civic-chat-bubble"
                >
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: msg.sender === 'user' 
                      ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' 
                      : (isDark ? '#1e293b' : '#ffffff'),
                    color: msg.sender === 'user' ? '#ffffff' : (isDark ? '#f8fafc' : '#0f172a'),
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
                    border: msg.sender === 'user' ? 'none' : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0'),
                    fontSize: 13,
                    lineHeight: 1.45
                  }}>
                    <div>{msg.text}</div>
                    <div style={{ 
                      fontSize: 9, 
                      textAlign: 'right', 
                      marginTop: 4, 
                      opacity: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 4
                    }}>
                      <span>{msg.time}</span>
                      {msg.sender === 'user' && <CheckCheck size={12} style={{ color: '#93c5fd' }} />}
                    </div>
                  </div>

                  {msg.chips && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {msg.chips.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendChat(chip)}
                          style={{
                            background: isDark ? 'rgba(56,189,248,0.12)' : '#eff6ff',
                            color: isDark ? '#38bdf8' : '#2563eb',
                            border: isDark ? '1px solid rgba(56,189,248,0.3)' : '1px solid #bfdbfe',
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {chip} →
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div style={{ alignSelf: 'flex-start', background: isDark ? '#1e293b' : '#ffffff', padding: '8px 12px', borderRadius: 14, border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8', animation: 'civicPulseGlow 1s infinite' }} />
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8', animation: 'civicPulseGlow 1s infinite 0.2s' }} />
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8', animation: 'civicPulseGlow 1s infinite 0.4s' }} />
                  <span style={{ fontSize: 10, color: isDark ? '#94a3b8' : '#64748b', marginLeft: 4 }}>Typing...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
              style={{
                background: isDark ? '#111827' : '#f8fafc',
                borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <input 
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask about grievances or certificates..."
                style={{
                  flex: 1,
                  background: isDark ? '#1e293b' : '#ffffff',
                  border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #cbd5e1',
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontSize: 12.5,
                  color: isDark ? '#ffffff' : '#0f172a',
                  outline: 'none',
                  height: 36
                }}
              />
              <button
                type="submit"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        )}

        {/* Floating Trigger Button */}
        <button
          onClick={() => setIsChatOpen(prev => !prev)}
          style={{
            height: 54,
            padding: isChatOpen ? '0 18px' : '0 20px',
            borderRadius: 30,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 8px 24px rgba(37,99,235,0.45)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13.5,
            fontWeight: 800,
            transition: 'all 0.25s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ position: 'relative' }}>
            <Bot size={22} />
            <span style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#22c55e',
              border: '1.5px solid #2563eb'
            }} />
          </div>
          <span>{isChatOpen ? 'Close AI Desk' : 'Civic AI Desk'}</span>
          {!isChatOpen && (
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 8, fontSize: 10 }}>
              Online
            </span>
          )}
        </button>

      </div>

      {/* ── 9-Step Citizen Guided Tour Overlay System ── */}
      {typeof tourStep === 'number' && (
        <>
          {/* Dimmed Background Overlay */}
          <div 
            onClick={handleSkipTour}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(9, 13, 22, 0.72)',
              zIndex: 9999,
              transition: 'opacity 0.3s ease'
            }}
          />

          {/* Floating Responsive Tooltip Card */}
          {(() => {
            const currentStepConfig = TOUR_STEPS.find(s => s.step === tourStep);
            if (!currentStepConfig) return null;
            const StepIcon = currentStepConfig.icon;
            
            // Positioning math
            const isMobile = window.innerWidth < 640;
            let tooltipStyle = {};

            if (isMobile) {
              tooltipStyle = {
                position: 'fixed',
                bottom: 20,
                left: 16,
                right: 16,
                maxWidth: 'calc(100vw - 32px)',
                zIndex: 10001
              };
            } else if (tourBounds) {
              const cardEstHeight = 330;
              const canPlaceBelow = (tourBounds.bottom + 16 + cardEstHeight) <= (window.innerHeight - 30);
              let topPos;

              if (canPlaceBelow) {
                topPos = tourBounds.bottom + 16;
              } else if (tourBounds.top - 16 - cardEstHeight >= 20) {
                topPos = tourBounds.top - 16 - cardEstHeight;
              } else {
                topPos = Math.max(20, (window.innerHeight - cardEstHeight) / 2);
              }

              // Strict safety clamping to ensure Back/Next buttons stay well above taskbar
              topPos = Math.max(20, Math.min(topPos, window.innerHeight - cardEstHeight - 40));
              const leftPos = Math.max(20, Math.min(window.innerWidth - 480, tourBounds.left));

              tooltipStyle = {
                position: 'fixed',
                top: topPos,
                left: leftPos,
                width: 460,
                maxHeight: 'calc(100vh - 60px)',
                overflowY: 'auto',
                zIndex: 10001
              };
            } else {
              tooltipStyle = {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 480,
                zIndex: 10001
              };
            }

            return (
              <div style={{
                ...tooltipStyle,
                background: isDark ? '#0f172a' : '#ffffff',
                borderRadius: 22,
                padding: '24px 28px',
                border: isDark ? '1.5px solid rgba(255,255,255,0.16)' : '1.5px solid #cbd5e1',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                {/* Tooltip Header: Step Counter & Skip */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      background: `linear-gradient(135deg, ${currentStepConfig.accentColor}, #7c3aed)`,
                      color: '#ffffff',
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: '0.04em'
                    }}>
                      {t('tour.stepCounter', { current: tourStep, total: 9 })}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b' }}>
                      {currentStepConfig.subtitle}
                    </span>
                  </div>

                  <button
                    onClick={handleSkipTour}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: isDark ? '#94a3b8' : '#64748b',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 6
                    }}
                  >
                    {t('tour.skip')}
                  </button>
                </div>

                {/* Progress Dots Track */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
                  {TOUR_STEPS.map(s => (
                    <div 
                      key={s.step} 
                      style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        background: s.step <= tourStep ? currentStepConfig.accentColor : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </div>

                {/* Step Title & Icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${currentStepConfig.accentColor}, #1d4ed8)`,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <StepIcon size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a' }}>
                      {t(`tour.steps.${tourStep}.title`, { defaultValue: currentStepConfig.title })}
                    </h3>
                    {currentStepConfig.badge && (
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: 4, marginTop: 2, display: 'inline-block' }}>
                        {currentStepConfig.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Step Description */}
                <p style={{ margin: 0, fontSize: 13.5, color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.6 }}>
                  {t(`tour.steps.${tourStep}.desc`, { defaultValue: currentStepConfig.desc })}
                </p>

                {currentStepConfig.additionalDesc && (
                  <p style={{ margin: '10px 0 0', fontSize: 12.5, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.5, background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc', padding: 10, borderRadius: 10, border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
                    💡 {currentStepConfig.additionalDesc}
                  </p>
                )}

                {/* Tooltip Controls (Back / Next / Finish) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
                  <button
                    disabled={tourStep === 1}
                    onClick={() => setTourStep(prev => Math.max(1, prev - 1))}
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                      border: 'none',
                      color: tourStep === 1 ? (isDark ? '#475569' : '#cbd5e1') : (isDark ? '#ffffff' : '#0f172a'),
                      padding: '8px 16px',
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: 12.5,
                      cursor: tourStep === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {t('tour.back')}
                  </button>

                  <div style={{ display: 'flex', gap: 10 }}>
                    {tourStep < 9 ? (
                      <button
                        onClick={() => setTourStep(prev => Math.min(9, prev + 1))}
                        style={{
                          height: 38,
                          padding: '0 20px',
                          borderRadius: 10,
                          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                          color: '#ffffff',
                          fontWeight: 800,
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 13,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 4px 14px rgba(37,99,235,0.35)'
                        }}
                      >
                        {t('tour.next')}
                      </button>
                    ) : (
                      <button
                        onClick={handleFinishTour}
                        style={{
                          height: 38,
                          padding: '0 20px',
                          borderRadius: 10,
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#ffffff',
                          fontWeight: 800,
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 13,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 4px 14px rgba(16,185,129,0.35)'
                        }}
                      >
                        {t('tour.finish')}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })()}
        </>
      )}

      {/* ── Tour Completion Modal ── */}
      {tourStep === 'completed' && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(9, 13, 22, 0.84)',
          backdropFilter: 'blur(8px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }} onClick={() => setTourStep(null)}>
          <div style={{
            width: '100%',
            maxWidth: 520,
            background: isDark ? '#0f172a' : '#ffffff',
            borderRadius: 24,
            padding: 32,
            border: isDark ? '1.5px solid rgba(255,255,255,0.16)' : '1.5px solid #cbd5e1',
            boxShadow: '0 30px 70px rgba(0,0,0,0.65)',
            textAlign: 'center'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={28} />
            </div>

            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a' }}>
              You're Ready to Get Started
            </h3>
            <p style={{ margin: '8px 0 24px', fontSize: 14, color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.6 }}>
              You now know the main features of the Smart Governance Platform. Create an account or sign in to start using digital citizen services.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link to="/register" onClick={() => setTourStep(null)} style={{ textDecoration: 'none' }}>
                <button style={{
                  width: '100%', height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 6px 20px rgba(37,99,235,0.35)'
                }}>
                  <PenSquare size={16} /> Register as Citizen <ArrowRight size={16} />
                </button>
              </Link>

              <Link to="/login" onClick={() => setTourStep(null)} style={{ textDecoration: 'none' }}>
                <button style={{
                  width: '100%', height: 46, borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                  color: isDark ? '#ffffff' : '#0f172a', fontWeight: 800, border: isDark ? '1.5px solid rgba(255,255,255,0.16)' : '1.5px solid #cbd5e1',
                  cursor: 'pointer', fontSize: 13.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}>
                  <LogIn size={16} /> Citizen Sign In
                </button>
              </Link>

              <button
                onClick={() => setTourStep(null)}
                style={{
                  background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 8
                }}
              >
                Close & Return to Landing Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Persistent First-Time Visitor Toast Banner ── */}
      {showFirstTimeInvitation && tourStep === null && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          zIndex: 9998,
          maxWidth: 380,
          background: isDark ? '#0f172a' : '#ffffff',
          borderRadius: 18,
          padding: '16px 20px',
          border: isDark ? '1.5px solid rgba(56,189,248,0.35)' : '1.5px solid #93c5fd',
          boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          animation: 'fadeInUp 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
              <Compass size={16} style={{ color: '#2563eb' }} /> First time visiting?
            </div>
            <button 
              onClick={() => {
                localStorage.setItem('civicpulse_guided_tour_completed', 'dismissed');
                setShowFirstTimeInvitation(false);
              }}
              style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer', fontWeight: 800, fontSize: 13 }}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.45 }}>
            Take a 1-minute guided tour to learn how to report civic problems, apply for certificates, and track complaints.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
            <button
              onClick={() => {
                setShowFirstTimeInvitation(false);
                setTourStep(1);
              }}
              style={{
                flex: 1,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: 12.5,
                cursor: 'pointer'
              }}
            >
              Start Guided Tour
            </button>
            <button
              onClick={() => {
                localStorage.setItem('civicpulse_guided_tour_completed', 'dismissed');
                setShowFirstTimeInvitation(false);
              }}
              style={{
                height: 36,
                padding: '0 12px',
                borderRadius: 10,
                background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                color: isDark ? '#cbd5e1' : '#475569',
                border: 'none',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Later
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
