import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import { toast } from 'sonner';
import { FileUp, Info, MapPin, Building2, AlertTriangle, PenSquare, ArrowLeft, Image as ImageIcon, FileText, X } from 'lucide-react';
import LocalTourOverlay from '../components/LocalTourOverlay.jsx';

const DEPARTMENTS = [
  'Health Department',
  'Water Department',
  'Roads Department',
  'Electricity Department',
  'Sanitation Department',
  'Revenue Department',
  'Municipal Corporation',
  'Urban Planning Department',
  'Social Welfare Department',
  'Education Department'
];
const CATEGORIES = [
  'Water Leakage', 'Water Shortage', 'No Water Supply', 'Water Tanker Request',
  'Pothole', 'Road Damage', 'Traffic Signal Issue', 'Encroachment',
  'Power Outage', 'Street Light Issue', 'Electricity Billing', 
  'Garbage Not Collected', 'Drain Blocked', 'Public Hygiene',
  'Mosquito Breeding', 'Stray Animals', 'Public Clinic / Hospital Inquiry',
  'Property Tax Issue', 'Land Record / Mutation Dispute',
  'Illegal Construction', 'Trade License Issue',
  'Building Plan Violation', 'Park / Public Infrastructure Maintenance',
  'DBT / Pension Payment Delay', 'Welfare Scheme Application Inquiry',
  'School Infrastructure Issue', 'Mid-Day Meal Quality Complaint',
  'Other'
];

function ComplaintForm() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: '', description: '', department: '', category: '', priority: 'LOW', location: '', city: ''
  });
  const [attachments, setAttachments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duplicateData, setDuplicateData] = useState(null);
  const [activeDuplicate, setActiveDuplicate] = useState(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  const [customOtherCategory, setCustomOtherCategory] = useState('');
  const [tourStep, setTourStep] = useState(null);

  const TOUR_STEPS = [
    {
      step: 1,
      targetKey: 'dept-cat',
      title: 'Select Department & Category',
      desc: 'Choose the department responsible for the issue (e.g., Water Department) and select the specific category of the problem.'
    },
    {
      step: 2,
      targetKey: 'title-desc',
      title: 'Describe the Grievance',
      desc: 'Enter a clear summary in the title and provide detailed context in the description to help the department understand the issue.'
    },
    {
      step: 3,
      targetKey: 'location',
      title: 'Pinpoint Location / Ward',
      desc: 'Enter the exact location details and select the town/city. This helps the field officers navigate directly to the spot.'
    },
    {
      step: 4,
      targetKey: 'evidence',
      title: 'Upload Evidence (Optional)',
      desc: 'Drag & drop or click to upload photos or files as evidence. Visual proof helps officers verify and resolve the complaint faster.'
    },
    {
      step: 5,
      targetKey: 'submit-btn',
      title: 'Submit and Route',
      desc: 'Submit your grievance. The platform will automatically route it to the assigned officer and start the SLA countdown timer.'
    }
  ];

  const renderRequiredMarker = (isValid) => (
    <span style={{
      color: isValid ? '#16a34a' : '#ef4444',
      fontWeight: 800,
      marginLeft: 4,
      fontSize: isValid ? '14px' : '15px',
      transition: 'all 0.2s ease',
      display: 'inline-block'
    }}>
      {isValid ? '✓' : '*'}
    </span>
  );

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // Real-time fingerprint duplicate check (debounced)
  const checkActiveDuplicate = useCallback(async (dept, cat, loc) => {
    const citizenId = keycloak.tokenParsed?.sub;
    if (!citizenId || !dept || !cat || !loc?.trim()) {
      setActiveDuplicate(null);
      return;
    }
    setCheckingDuplicate(true);
    try {
      const res = await api.get('/grievance-service/api/complaints/check-active-duplicate', {
        params: { citizenId, department: dept, category: cat, location: loc.trim() }
      });
      if (res.data?.duplicate) {
        setActiveDuplicate(res.data);
      } else {
        setActiveDuplicate(null);
      }
    } catch (e) {
      // Silently ignore — backend check is the final guard
      setActiveDuplicate(null);
    } finally {
      setCheckingDuplicate(false);
    }
  }, []);

  useEffect(() => {
    const finalCat = form.category === 'Other'
      ? (customOtherCategory.trim() ? `Other: ${customOtherCategory.trim()}` : '')
      : form.category;
    const combinedLocation = form.location?.trim() && form.city ? `${form.location.trim()}, ${form.city}` : '';
    const timer = setTimeout(() => {
      checkActiveDuplicate(form.department, finalCat, combinedLocation);
    }, 600);
    return () => clearTimeout(timer);
  }, [form.department, form.category, form.location, form.city, customOtherCategory, checkActiveDuplicate]);

  const processFiles = (files) => {
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds maximum allowed size of 5MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments(prev => [
          ...prev,
          {
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            type: file.type,
            dataUrl: reader.result
          }
        ]);
        toast.success(`Attached ${file.name}`);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    processFiles(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    processFiles(dropped);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const [duplicateResult, setDuplicateResult] = useState(null);
  const [apiErrorState, setApiErrorState] = useState(false);
  const [linkingLoading, setLinkingLoading] = useState(false);
  const [selectedPrimaryId, setSelectedPrimaryId] = useState(null);

  const executeCreateComplaint = async (finalCategory) => {
    setLoading(true);
    setApiErrorState(false);
    setDuplicateResult(null);
    try {
      const combinedLocation = form.location?.trim() && form.city ? `${form.location.trim()}, ${form.city}` : form.location;
      const firstAttachment = attachments.length > 0 ? attachments[0].dataUrl : null;
      const res = await api.post('/grievance-service/api/complaints', {
        ...form,
        location: combinedLocation,
        category: finalCategory,
        attachmentUrl: firstAttachment,
        citizenId: keycloak.tokenParsed?.sub || 'bd5b60cb-9c09-4574-97a3-ad0142a10588',
      });

      // Create instant notification record for Citizen
      try {
        await api.post('/notification-service/api/notifications', {
          recipient: keycloak.tokenParsed?.sub || 'bd5b60cb-9c09-4574-97a3-ad0142a10588',
          recipientRole: 'CITIZEN',
          title: 'Complaint Filed Successfully',
          message: `Your complaint '${form.title}' has been filed with ${form.department}. Track updates in Complaint Tracker.`,
          relatedEntityId: String(res.data?.complaintId || ''),
          relatedEntityType: 'COMPLAINT',
          eventType: 'complaint-submitted',
          readStatus: false
        });
      } catch (notifErr) {
        console.warn('Direct notification post failed:', notifErr);
      }

      // Create instant notification record for Officer
      const OFFICER_MAP = {
        'Health Department': 'john',
        'Education Department': 'emily',
        'Social Welfare Department': 'david',
        'Revenue Department': 'mark',
        'Municipal Corporation': 'ryan',
        'Water Department': 'chris',
        'Roads Department': 'ethan',
        'Electricity Department': 'jack',
        'Urban Planning Department': 'will'
      };
      const officerUser = OFFICER_MAP[form.department] || 'john';

      try {
        await api.post('/notification-service/api/notifications', {
          recipient: officerUser,
          recipientRole: 'OFFICER',
          title: 'New Complaint Assigned',
          message: `Complaint #${res.data?.complaintId || ''} (${form.title}) assigned to your department for investigation by ${keycloak.tokenParsed?.preferred_username || 'citizen'}.`,
          relatedEntityId: String(res.data?.complaintId || ''),
          relatedEntityType: 'COMPLAINT',
          eventType: 'complaint-submitted',
          readStatus: false
        });
      } catch (e) {}

      window.dispatchEvent(new Event('refresh-notifications'));
      toast.success('Complaint submitted successfully!');
      navigate('/complaints');
    } catch (err) {
      console.error('Complaint submission error:', err);
      if (err.response?.status === 409 && err.response?.data?.existingApplication) {
        setDuplicateData(err.response.data.existingApplication);
        toast.error('Duplicate application detected.');
      } else if (err.response?.status === 401) {
        toast.error('Session expired. Please Sign In as a citizen and try again.');
      } else if (err.response?.status === 403) {
        toast.error('Access denied. Please ensure you are logged in with a valid citizen account.');
      } else if (err.response?.data?.fieldErrors) {
        Object.entries(err.response.data.fieldErrors).forEach(([field, msg]) => {
          toast.error(`${field}: ${msg}`);
        });
      } else {
        const errorDetail = err.response?.data?.message || err.response?.data?.error || err.response?.data?.detail || err.message;
        toast.error(errorDetail || 'Submission failed. Please check your details and try again.');
      }
      setLoading(false);
    }
  };

  const handleLinkToComplaint = async (primaryComplaintId) => {
    if (!primaryComplaintId) {
      toast.error('Please select a complaint to link to.');
      return;
    }
    setLinkingLoading(true);
    try {
      const finalCategory = form.category === 'Other' 
        ? (customOtherCategory.trim() ? `Other: ${customOtherCategory.trim()}` : 'Other') 
        : form.category;
      
      await api.post('/grievance-service/api/complaints/link', {
        primaryComplaintId,
        citizenId: keycloak.tokenParsed?.sub,
        title: form.title,
        description: form.description,
        department: form.department,
        category: finalCategory,
        location: form.location
      });
      window.dispatchEvent(new Event('refresh-notifications'));
      toast.success('Your report has been successfully linked to the existing complaint!');
      setDuplicateResult(null);
      navigate('/complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to link report to complaint.');
    } finally {
      setLinkingLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.department || !form.category || !form.location || !form.city) {
      toast.error('Please fill in Title, Description, Department, Category, Location, and City.');
      return;
    }

    const finalCategory = form.category === 'Other' 
      ? (customOtherCategory.trim() ? `Other: ${customOtherCategory.trim()}` : 'Other') 
      : form.category;
    const combinedLocation = `${form.location.trim()}, ${form.city}`;

    setLoading(true);
    setApiErrorState(false);

    try {
      // 1. Trigger duplicate detection API check
      const checkRes = await api.post('/grievance-service/api/complaints/check-duplicate', {
        title: form.title,
        description: form.description,
        department: form.department,
        category: finalCategory,
        location: combinedLocation
      });

      // STATE B: Duplicate API succeeded & duplicate matches found
      if (checkRes.data?.isDuplicate && checkRes.data?.matches?.length > 0) {
        setDuplicateResult(checkRes.data);
        if (checkRes.data.matches[0]?.complaintId) {
          setSelectedPrimaryId(checkRes.data.matches[0].complaintId);
        }
        setLoading(false);
        return;
      }

      // STATE A: Duplicate API succeeded & NO duplicate found -> submit directly
      await executeCreateComplaint(finalCategory);

    } catch (err) {
      // STATE C: Duplicate API call failed / unavailable -> show retry/submit anyway modal
      console.error('Duplicate verification service call failed:', err);
      setLoading(false);
      setApiErrorState(true);
    }
  };

  if (duplicateData) {
    return (
      <AppShell title="Raise Complaint">
        <div style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(15,23,42,0.05)', overflow: 'hidden' }}>
          <div style={{ background: '#fef2f2', padding: '24px', borderBottom: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: '#ef4444', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={24} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#991b1b' }}>Duplicate Complaint Detected</h2>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#b91c1c' }}>You already have an active complaint for this issue.</p>
            </div>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ color: '#64748b', fontSize: 14 }}>Complaint ID</span>
              <span style={{ fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>{duplicateData.complaintId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ color: '#64748b', fontSize: 14 }}>Status</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{duplicateData.status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: 8 }}>
              <span style={{ color: '#64748b', fontSize: 14 }}>Department</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{duplicateData.department}</span>
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button 
                onClick={() => setDuplicateData(null)}
                style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
              >
                Go Back
              </button>
              <button 
                onClick={() => navigate('/complaints')}
                style={{ flex: 1, padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
              >
                Track Existing Complaint
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Raise Complaint">
      <div style={{ width: '100%', maxWidth: '100%', padding: '0 24px 100px 24px', margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* ── Welcome Banner (Executive Navy/Emerald Theme matching Civic Services) ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #065f46 100%)',
          borderRadius: 20, padding: '28px 32px', color: '#ffffff',
          display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 12px 36px rgba(15,23,42,0.25)', border: '1px solid #334155',
          marginBottom: 30, position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, background: 'rgba(16,185,129,0.15)', borderRadius: '50%', filter: 'blur(40px)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ 
              background: 'rgba(255,255,255,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)',
              padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', display: 'inline-block', marginBottom: 8
            }}>
              GRIEVANCE REDRESSAL
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Raise a Complaint
              </h2>
              <button 
                type="button"
                onClick={() => setTourStep(1)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                  background: 'rgba(168,85,247,0.25)', color: '#d8b4fe', border: '1px solid rgba(168,85,247,0.4)',
                  cursor: 'pointer', transition: 'all 0.2s', marginTop: -6
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(168,85,247,0.35)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(168,85,247,0.25)'}
              >
                ❓ Guide Me
              </button>
            </div>
            <p style={{ margin: 0, color: '#94a3b8', maxWidth: 600, fontSize: 14, lineHeight: 1.5 }}>
              Report a civic issue directly to the municipal corporation. Provide accurate details and attach photos for faster resolution by the field officers.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, gridColumn: 'span 2' }}>
            
            {/* Issue Details Card */}
            <div data-tour="title-desc" style={{ background: 'var(--surface, #ffffff)', borderRadius: 16, border: '1px solid var(--border, #e2e8f0)', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border, #e2e8f0)', background: 'var(--bg, #f8fafc)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <PenSquare size={20} color="var(--text, #0f172a)" />
                <h3 style={{ margin: 0, color: 'var(--text, #0f172a)', fontSize: '16px', fontWeight: '700' }}>Issue Details</h3>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text, #334155)' }}>Complaint Title {renderRequiredMarker(Boolean(form.title?.trim()))}</label>
                  <input 
                    value={form.title} 
                    onChange={e => setField('title', e.target.value)} 
                    placeholder="e.g., Unresolved water leakage on Main Street" 
                    style={{ padding: '12px 16px', borderRadius: 10, border: '1.5px solid var(--border, #e2e8f0)', fontSize: 15, outline: 'none', transition: 'border-color 0.2s', width: '100%', boxSizing: 'border-box', background: 'var(--surface, #ffffff)', color: 'var(--text, #0f172a)' }}
                    onFocus={e => e.target.style.borderColor = '#ef4444'}
                    onBlur={e => e.target.style.borderColor = 'var(--border, #e2e8f0)'}
                    required 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text, #334155)' }}>Detailed Description {renderRequiredMarker(Boolean(form.description?.trim()))}</label>
                  <textarea 
                    value={form.description} 
                    onChange={e => setField('description', e.target.value)} 
                    placeholder="Please describe the exact issue, how long it has been occurring, and any other relevant information that will assist the field officer..." 
                    style={{ padding: '12px 16px', borderRadius: 10, border: '1.5px solid var(--border, #e2e8f0)', fontSize: 15, outline: 'none', transition: 'border-color 0.2s', minHeight: 140, resize: 'vertical', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--surface, #ffffff)', color: 'var(--text, #0f172a)' }}
                    onFocus={e => e.target.style.borderColor = '#ef4444'}
                    onBlur={e => e.target.style.borderColor = 'var(--border, #e2e8f0)'}
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Classification Card */}
            <div data-tour="dept-cat" style={{ background: 'var(--surface, #ffffff)', borderRadius: 16, border: '1px solid var(--border, #e2e8f0)', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border, #e2e8f0)', background: 'var(--bg, #f8fafc)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={20} color="var(--text, #0f172a)" />
                <h3 style={{ margin: 0, color: 'var(--text, #0f172a)', fontSize: '16px', fontWeight: '700' }}>Classification</h3>
              </div>
              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text, #334155)' }}>Target Department {renderRequiredMarker(Boolean(form.department?.trim()))}</label>
                  <select 
                    value={form.department} 
                    onChange={e => setField('department', e.target.value)}
                    style={{ padding: '12px 16px', borderRadius: 10, border: '1.5px solid var(--border, #e2e8f0)', fontSize: 15, outline: 'none', transition: 'border-color 0.2s', width: '100%', boxSizing: 'border-box', background: 'var(--surface, #ffffff)', color: 'var(--text, #0f172a)', appearance: 'none', cursor: 'pointer' }}
                    onFocus={e => e.target.style.borderColor = '#ef4444'}
                    onBlur={e => e.target.style.borderColor = 'var(--border, #e2e8f0)'}
                    required
                  >
                    <option value="" disabled>Select Department...</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text, #334155)' }}>Issue Category {renderRequiredMarker(Boolean(form.category?.trim()))}</label>
                  <select 
                    value={form.category} 
                    onChange={e => setField('category', e.target.value)}
                    style={{ padding: '12px 16px', borderRadius: 10, border: '1.5px solid var(--border, #e2e8f0)', fontSize: 15, outline: 'none', transition: 'border-color 0.2s', width: '100%', boxSizing: 'border-box', background: 'var(--surface, #ffffff)', color: 'var(--text, #0f172a)', appearance: 'none', cursor: 'pointer' }}
                    onFocus={e => e.target.style.borderColor = '#ef4444'}
                    onBlur={e => e.target.style.borderColor = 'var(--border, #e2e8f0)'}
                  >
                    <option value="" disabled>Select Category...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  {form.category === 'Other' && (
                    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary, #64748b)' }}>Specify Your Problem Details {renderRequiredMarker(Boolean(customOtherCategory?.trim()))}</label>
                      <input
                        type="text"
                        placeholder="Please describe the specific issue category..."
                        value={customOtherCategory}
                        onChange={e => setCustomOtherCategory(e.target.value)}
                        style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid #ef4444', fontSize: 14, outline: 'none', background: 'var(--surface, #ffffff)', color: 'var(--text, #0f172a)', width: '100%', boxSizing: 'border-box' }}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Media Attachments Card */}
            <div data-tour="evidence" style={{ background: 'var(--surface, #ffffff)', borderRadius: 16, border: '1px solid var(--border, #e2e8f0)', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border, #e2e8f0)', background: 'var(--bg, #f8fafc)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileUp size={20} color="var(--text, #0f172a)" />
                <h3 style={{ margin: 0, color: 'var(--text, #0f172a)', fontSize: '16px', fontWeight: '700' }}>Attachments</h3>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input
                  type="file"
                  id="complaint-file-input"
                  accept="image/svg+xml,image/png,image/jpeg,image/jpg,application/pdf"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                
                <div 
                  onClick={() => document.getElementById('complaint-file-input').click()}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  style={{ 
                    border: isDragging ? '2px dashed #ef4444' : '2px dashed var(--border, #cbd5e1)', 
                    borderRadius: 14, padding: '36px 20px', 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                    background: isDragging ? 'rgba(239,68,68,0.05)' : 'var(--bg, #f8fafc)', 
                    cursor: 'pointer', transition: 'all 0.2s ease' 
                  }} 
                >
                  <FileUp size={36} color="var(--text-secondary, #94a3b8)" style={{ marginBottom: 12 }} />
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text, #1e293b)' }}>Click to upload or drag and drop</p>
                  <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-secondary, #64748b)' }}>SVG, PNG, JPG or PDF (max. 5MB per file)</p>
                </div>

                {/* Selected File Previews */}
                {attachments.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Uploaded Attachments ({attachments.length})
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                      {attachments.map((att, idx) => (
                        <div key={idx} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                          padding: '10px 14px', background: 'var(--bg, #f8fafc)', borderRadius: 12, border: '1px solid var(--border, #e2e8f0)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                            {att.type.startsWith('image/') ? (
                              <img src={att.dataUrl} alt={att.name} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                            ) : (
                              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <FileText size={20} />
                              </div>
                            )}
                            <div style={{ minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text, #0f172a)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</p>
                              <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{att.size}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeAttachment(idx); }}
                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4, borderRadius: 6 }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, gridColumn: 'span 1' }}>
            
            {/* Location & Priority Card */}
            <div data-tour="location" style={{ background: 'var(--surface, #ffffff)', borderRadius: 16, border: '1px solid var(--border, #e2e8f0)', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border, #e2e8f0)', background: 'var(--bg, #f8fafc)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={20} color="var(--text, #0f172a)" />
                <h3 style={{ margin: 0, color: 'var(--text, #0f172a)', fontSize: '16px', fontWeight: '700' }}>Location & Impact</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text, #334155)' }}>Area / Locality {renderRequiredMarker(Boolean(form.location?.trim()))}</label>
                  <input 
                    value={form.location} 
                    onChange={e => setField('location', e.target.value)} 
                    placeholder="E.g., Anna Nagar, Near City Mall, Ward 12" 
                    style={{ padding: '12px 16px', borderRadius: 10, border: '1.5px solid var(--border, #e2e8f0)', fontSize: 15, outline: 'none', transition: 'border-color 0.2s', width: '100%', boxSizing: 'border-box', background: 'var(--surface, #ffffff)', color: 'var(--text, #0f172a)' }}
                    onFocus={e => e.target.style.borderColor = '#ef4444'}
                    onBlur={e => e.target.style.borderColor = 'var(--border, #e2e8f0)'}
                    required 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text, #334155)' }}>City / District {renderRequiredMarker(Boolean(form.city?.trim()))}</label>
                  <input 
                    value={form.city} 
                    onChange={e => setField('city', e.target.value)} 
                    placeholder="E.g., Chennai, Coimbatore, Madurai" 
                    style={{ padding: '12px 16px', borderRadius: 10, border: '1.5px solid var(--border, #e2e8f0)', fontSize: 15, outline: 'none', transition: 'border-color 0.2s', width: '100%', boxSizing: 'border-box', background: 'var(--surface, #ffffff)', color: 'var(--text, #0f172a)' }}
                    onFocus={e => e.target.style.borderColor = '#ef4444'}
                    onBlur={e => e.target.style.borderColor = 'var(--border, #e2e8f0)'}
                    required 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text, #334155)' }}>Priority Level</label>
                  <select 
                    value={form.priority} 
                    onChange={e => setField('priority', e.target.value)}
                    style={{ padding: '12px 16px', borderRadius: 10, border: '1.5px solid var(--border, #e2e8f0)', fontSize: 15, outline: 'none', transition: 'border-color 0.2s', width: '100%', boxSizing: 'border-box', background: 'var(--surface, #ffffff)', color: 'var(--text, #0f172a)', appearance: 'none', cursor: 'pointer' }}
                    onFocus={e => e.target.style.borderColor = '#ef4444'}
                    onBlur={e => e.target.style.borderColor = 'var(--border, #e2e8f0)'}
                  >
                    <option value="LOW">Low (No immediate danger)</option>
                    <option value="MEDIUM">Medium (Urgent)</option>
                    <option value="HIGH">High (Safety Risk)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Information Cards */}
            <div style={{ background: '#eff6ff', borderRadius: 16, border: '1px solid #bfdbfe', overflow: 'hidden' }}>
              <div style={{ padding: '20px', display: 'flex', gap: 12 }}>
                <Info size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#1e3a8a' }}>SLA Guidelines</h4>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
                    <li><strong style={{ color: '#dc2626' }}>High:</strong> Resolved within 24 hours</li>
                    <li><strong style={{ color: '#d97706' }}>Medium:</strong> Resolved within 48 hours</li>
                    <li><strong style={{ color: '#16a34a' }}>Low:</strong> Resolved within 72 hours</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>

          {/* Active Duplicate Warning Banner */}
          {activeDuplicate && (
            <div style={{
              background: '#fef2f2', borderRadius: 16, border: '1.5px solid #fecaca',
              padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start',
              gridColumn: '1 / -1', marginTop: 4
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: '#ef4444', color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <AlertTriangle size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: '#991b1b' }}>
                  Active Complaint Already Exists
                </h4>
                <p style={{ margin: '0 0 12px', fontSize: 13.5, color: '#b91c1c', lineHeight: 1.5 }}>
                  You have already submitted a complaint for <strong>{activeDuplicate.category}</strong> under the <strong>{activeDuplicate.department}</strong> at <strong>{activeDuplicate.location}</strong>.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                    <span style={{ color: '#991b1b', fontWeight: 600, minWidth: 100 }}>Complaint ID:</span>
                    <span style={{ color: '#0f172a', fontFamily: 'monospace', fontWeight: 700 }}>#{String(activeDuplicate.complaintId).slice(0, 8)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                    <span style={{ color: '#991b1b', fontWeight: 600, minWidth: 100 }}>Current Status:</span>
                    <span style={{ color: '#2563eb', fontWeight: 700 }}>{activeDuplicate.status}</span>
                  </div>
                  {activeDuplicate.createdAt && (
                    <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                      <span style={{ color: '#991b1b', fontWeight: 600, minWidth: 100 }}>Submitted:</span>
                      <span style={{ color: '#0f172a', fontWeight: 600 }}>{new Date(activeDuplicate.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>
                <p style={{ margin: '0 0 12px', fontSize: 12.5, color: '#b91c1c', lineHeight: 1.5 }}>
                  You can submit a new complaint for this issue after the existing complaint is <strong>Resolved</strong> or <strong>Rejected</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/complaints/${activeDuplicate.complaintId}`)}
                  style={{
                    background: '#ffffff', color: '#dc2626', border: '1.5px solid #fecaca',
                    padding: '8px 16px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 6
                  }}
                >
                  View Existing Complaint →
                </button>
              </div>
            </div>
          )}

          {/* Sticky Bottom Action Bar */}
          <div style={{ 
            position: 'sticky', bottom: 16, 
            background: '#ffffff', borderRadius: 16,
            border: '1.5px solid #cbd5e1', padding: '16px 24px',
            boxShadow: '0 8px 30px rgba(15, 23, 42, 0.12)', display: 'flex', justifyContent: 'flex-end', gap: 12, zIndex: 30,
            marginTop: 20
          }}>
            <button 
              type="button" 
              onClick={() => navigate('/complaints')}
              style={{
                background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '12px 24px',
                borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              <ArrowLeft size={16} /> Cancel
            </button>
            <button 
              type="submit" 
              data-tour="submit-btn"
              disabled={loading || !!activeDuplicate}
              style={{
                background: activeDuplicate ? '#94a3b8' : '#ef4444', color: '#fff', border: 'none', padding: '12px 24px',
                borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: (loading || activeDuplicate) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                opacity: (loading || activeDuplicate) ? 0.7 : 1, boxShadow: activeDuplicate ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            >
              <AlertTriangle size={16} /> {loading ? 'Submitting...' : (activeDuplicate ? 'Duplicate Detected — Blocked' : 'Submit Complaint')}
            </button>
          </div>
        </form>

        {/* STATE B: Duplicate Detection Modal Dialog (Multi-Match Support) */}
        {duplicateResult && duplicateResult.matches && duplicateResult.matches.length > 0 && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 20
          }}>
            <div style={{
              background: '#ffffff', borderRadius: 20, maxWidth: 620, width: '100%',
              border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden', animation: 'fadeIn 0.2s ease-out', maxHeight: '90vh', display: 'flex', flexDirection: 'column'
            }}>
              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', padding: '20px 24px',
                borderBottom: '1px solid #fed7aa', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: '#f97316', color: '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#9a3412' }}>
                    Similar Active Complaint{duplicateResult.matches.length > 1 ? 's' : ''} Found
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: '#c2410c' }}>
                    We found {duplicateResult.matches.length} active issue{duplicateResult.matches.length > 1 ? 's' : ''} in your locality that may refer to the same grievance.
                  </p>
                </div>
              </div>

              {/* Match Details List (Scrollable) */}
              <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                  {duplicateResult.matches.map((match, index) => {
                    const isSelected = selectedPrimaryId === match.complaintId;
                    const matchPercent = Math.round(match.confidence * 100);

                    return (
                      <div 
                        key={match.complaintId}
                        onClick={() => setSelectedPrimaryId(match.complaintId)}
                        style={{
                          background: isSelected ? '#eff6ff' : '#f8fafc',
                          borderRadius: 14,
                          border: isSelected ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                          padding: 16,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input 
                              type="radio" 
                              name="selectedComplaint" 
                              checked={isSelected} 
                              onChange={() => setSelectedPrimaryId(match.complaintId)}
                              style={{ cursor: 'pointer', accentColor: '#2563eb', width: 16, height: 16 }}
                            />
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#475569', background: '#e2e8f0', padding: '2px 8px', borderRadius: 6 }}>
                              #{index + 1} • CMP-{match.complaintId.substring(0, 8).toUpperCase()}
                            </span>
                          </div>
                          <span style={{
                            fontSize: 12, fontWeight: 800,
                            color: matchPercent >= 85 ? '#15803d' : '#c2410c',
                            background: matchPercent >= 85 ? '#dcfce7' : '#ffedd5',
                            border: matchPercent >= 85 ? '1px solid #bbf7d0' : '1px solid #fed7aa',
                            padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4
                          }}>
                            ⚡ {matchPercent}% Match Confidence
                          </span>
                        </div>

                        <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                          {match.title}
                        </h4>

                        <div style={{ fontSize: 13, color: '#475569', display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <div><strong>Department:</strong> {match.department} {match.category ? `• ${match.category}` : ''}</div>
                          {match.location && <div><strong>Location:</strong> {match.location}</div>}
                          <div><strong>Status:</strong> <span style={{ color: '#2563eb', fontWeight: 700 }}>{match.status}</span></div>
                        </div>

                        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/complaints/${match.complaintId}`, '_blank');
                            }}
                            style={{
                              background: '#ffffff', color: '#2563eb', border: '1px solid #bfdbfe',
                              padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            👁️ {t('duplicateDetection.viewComplaint')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p style={{ margin: '0 0 20px', fontSize: 13.5, color: '#475569', lineHeight: 1.5 }}>
                  Select an active complaint to <strong>link your report</strong> or choose to <strong>submit as a new complaint</strong>.
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    type="button"
                    disabled={linkingLoading || !selectedPrimaryId}
                    onClick={() => handleLinkToComplaint(selectedPrimaryId)}
                    style={{
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#ffffff',
                      border: 'none', padding: '14px 20px', borderRadius: 12, fontWeight: 800, fontSize: 14,
                      cursor: (linkingLoading || !selectedPrimaryId) ? 'not-allowed' : 'pointer',
                      opacity: (linkingLoading || !selectedPrimaryId) ? 0.7 : 1,
                      boxShadow: '0 4px 12px rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}
                  >
                    {linkingLoading ? 'Linking Report...' : `🔗 ${t('duplicateDetection.linkComplaint')}`}
                  </button>

                  <button
                    type="button"
                    disabled={linkingLoading}
                    onClick={() => {
                      const finalCategory = form.category === 'Other' 
                        ? (customOtherCategory.trim() ? `Other: ${customOtherCategory.trim()}` : 'Other') 
                        : form.category;
                      setDuplicateResult(null);
                      executeCreateComplaint(finalCategory);
                    }}
                    style={{
                      background: '#ffffff', color: '#475569', border: '1.5px solid #cbd5e1',
                      padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}
                  >
                    {t('duplicateDetection.submitAsNew')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATE C: Duplicate Detection API Unavailable / Error Modal Dialog */}
        {apiErrorState && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 20
          }}>
            <div style={{
              background: '#ffffff', borderRadius: 20, maxWidth: 500, width: '100%',
              border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden', animation: 'fadeIn 0.2s ease-out', padding: 24
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: '#fef3c7', color: '#d97706',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <AlertTriangle size={26} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#92400e' }}>
                    {t('duplicateDetection.unableToCheck')}
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#b45309' }}>
                    Duplicate verification service is temporarily unavailable.
                  </p>
                </div>
              </div>

              <p style={{ margin: '0 0 20px', fontSize: 14, color: '#475569', lineHeight: 1.5 }}>
                You can retry checking for existing complaints or continue submitting your complaint directly.
              </p>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={(e) => {
                    setApiErrorState(false);
                    handleSubmit(e);
                  }}
                  style={{
                    flex: 1, background: '#2563eb', color: '#ffffff', border: 'none',
                    padding: '12px 16px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer'
                  }}
                >
                  🔄 {t('duplicateDetection.retryCheck')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const finalCategory = form.category === 'Other' 
                      ? (customOtherCategory.trim() ? `Other: ${customOtherCategory.trim()}` : 'Other') 
                      : form.category;
                    setApiErrorState(false);
                    executeCreateComplaint(finalCategory);
                  }}
                  style={{
                    flex: 1, background: '#ffffff', color: '#475569', border: '1.5px solid #cbd5e1',
                    padding: '12px 16px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer'
                  }}
                >
                  {t('duplicateDetection.submitAnyway')}
                </button>
              </div>
            </div>
          </div>
        )}
        {tourStep !== null && (
          <LocalTourOverlay 
            steps={TOUR_STEPS}
            activeStep={tourStep}
            setActiveStep={setTourStep}
            onClose={() => setTourStep(null)}
          />
        )}
      </div>
    </AppShell>
  );
}

export default ComplaintForm;
