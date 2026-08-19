import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import StepIndicator from '../components/StepIndicator.jsx';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ShieldCheck, Clock, Lock, Search, Building2, Filter, Award, FileCheck, FileText, CheckCircle2, ArrowRight, Zap, Shield, User, CreditCard, Phone, Mail, Users, Calendar, Sparkles, Check, UploadCloud, FileUp, Trash2, Eye, Download, ShieldAlert, UserPlus, HeartHandshake } from 'lucide-react';
import FamilyMembersModal from '../components/FamilyMembersModal.jsx';
import LocalTourOverlay from '../components/LocalTourOverlay.jsx';

const CERTIFICATE_CONFIG = {
  BIRTH_CERTIFICATE: {
    label: 'Birth Certificate',
    icon: '👶',
    iconBg: 'bg-blue-100',
    badge: 'POPULAR',
    description: 'Official record of birth for school admission, passport, and legal purposes.',
    department: 'Health Department',
    approvalTime: '2 Working Days',
    fee: '₹0',
    fields: [
      { name: 'childName', label: 'Child Name', type: 'text', required: true },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
      { name: 'dateOfBirth', label: "Child's Date of Birth", type: 'date', required: true },
      { name: 'fatherName', label: 'Father Name', type: 'text', required: true },
      { name: 'motherName', label: 'Mother Name', type: 'text', required: true },
      { name: 'hospitalName', label: 'Hospital Name', type: 'text', required: true },
      { name: 'placeOfBirth', label: 'Place of Birth', type: 'text', required: true },
      { name: 'address', label: 'Address', type: 'text', required: true }
    ],
    documents: [
      { id: 'Hospital Birth Record', label: 'Hospital Birth Record', required: true },
      { id: 'Parent Aadhaar Card', label: 'Parent Aadhaar Card', required: true },
      { id: 'Address Proof', label: 'Address Proof', required: true },
      { id: 'Child Photograph', label: 'Child Photograph', required: false }
    ]
  },
  DEATH_CERTIFICATE: {
    label: 'Death Certificate',
    icon: '📋',
    iconBg: 'bg-purple-100',
    description: 'Legal document certifying death for insurance, property, and legal proceedings.',
    department: 'Health Department',
    approvalTime: '2 Working Days',
    fee: '₹0',
    fields: [
      { name: 'deceasedName', label: 'Deceased Name', type: 'text', required: true },
      { name: 'deceasedRelationship', label: 'Relationship with Deceased', type: 'text', required: true },
      { name: 'dateOfDeath', label: 'Date of Death', type: 'date', required: true },
      { name: 'placeOfDeath', label: 'Place of Death', type: 'text', required: true },
      { name: 'causeOfDeath', label: 'Cause of Death', type: 'text', required: true },
      { name: 'hospitalName', label: 'Hospital Name', type: 'text', required: false },
      { name: 'address', label: 'Address', type: 'text', required: true }
    ],
    documents: [
      { id: 'Hospital Death Certificate', label: 'Hospital Death Certificate', required: true },
      { id: 'Applicant Aadhaar', label: 'Applicant Aadhaar', required: true },
      { id: 'Address Proof', label: 'Address Proof', required: true }
    ]
  },
  INCOME_CERTIFICATE: {
    label: 'Income Certificate',
    icon: '💰',
    iconBg: 'bg-green-100',
    description: 'Proof of income for scholarships, subsidies, and government schemes.',
    department: 'Revenue Department',
    approvalTime: '5 Working Days',
    fee: '₹50',
    fields: [
      { name: 'occupation', label: 'Occupation', type: 'text', required: true },
      { name: 'employerName', label: 'Employer Name', type: 'text', required: false },
      { name: 'monthlyIncome', label: 'Monthly Income (₹)', type: 'number', required: true },
      { name: 'annualIncome', label: 'Annual Income (₹)', type: 'number', required: true },
      { name: 'familyMembers', label: 'Family Members Count', type: 'number', required: true },
      { name: 'purpose', label: 'Purpose', type: 'text', required: true },
      { name: 'address', label: 'Address', type: 'text', required: true }
    ],
    documents: [
      { id: 'Aadhaar Card', label: 'Aadhaar Card', required: true },
      { id: 'Salary Slip OR Income Proof', label: 'Salary Slip OR Income Proof', required: true },
      { id: 'Bank Statement', label: 'Bank Statement', required: true },
      { id: 'Ration Card', label: 'Ration Card', required: true }
    ]
  },
  RESIDENCE_CERTIFICATE: {
    label: 'Residence Certificate',
    icon: '🏠',
    iconBg: 'bg-rose-100',
    description: 'Proof of residence for ration card, voter ID, and local services.',
    department: 'Revenue Department',
    approvalTime: '3 Working Days',
    fee: '₹20',
    fields: [
      { name: 'currentAddress', label: 'Current Address', type: 'text', required: true },
      { name: 'ward', label: 'Ward', type: 'text', required: true },
      { name: 'city', label: 'City', type: 'text', required: true },
      { name: 'pincode', label: 'Pincode', type: 'text', required: true },
      { name: 'yearsOfResidence', label: 'Years of Residence', type: 'number', required: true }
    ],
    documents: [
      { id: 'Aadhaar Card', label: 'Aadhaar Card', required: true },
      { id: 'Electricity Bill', label: 'Electricity Bill', required: true },
      { id: 'Rental Agreement OR Property Tax Receipt', label: 'Rental Agreement OR Property Tax Receipt', required: true }
    ]
  },
  TRADE_LICENSE: {
    label: 'Trade License',
    icon: '💼',
    iconBg: 'bg-amber-100',
    description: 'License to operate a commercial business within municipal limits.',
    department: 'Municipal Corporation',
    approvalTime: '7 Working Days',
    fee: '₹500',
    fields: [
      { name: 'businessName', label: 'Business Name', type: 'text', required: true },
      { name: 'ownerName', label: 'Owner Name', type: 'text', required: true },
      { name: 'businessType', label: 'Business Type', type: 'text', required: true },
      { name: 'gstNumber', label: 'GST Number', type: 'text', required: false },
      { name: 'businessAddress', label: 'Business Address', type: 'text', required: true },
      { name: 'ward', label: 'Ward', type: 'text', required: true },
      { name: 'phoneNumber', label: 'Business Phone Number', type: 'text', required: true },
      { name: 'email', label: 'Business Email', type: 'email', required: true }
    ],
    documents: [
      { id: 'GST Certificate', label: 'GST Certificate', required: true },
      { id: 'Shop Photograph', label: 'Shop Photograph', required: true },
      { id: 'Owner Aadhaar', label: 'Owner Aadhaar', required: true },
      { id: 'Address Proof', label: 'Address Proof', required: true }
    ]
  },
  PERMIT_APPROVAL: {
    label: 'Permit Approval',
    icon: '🏗️',
    iconBg: 'bg-slate-100',
    description: 'Official permit for construction, event organization, or temporary commercial activities.',
    department: 'Urban Planning Department',
    approvalTime: '10 Working Days',
    fee: '₹1000',
    fields: [
      { name: 'permitType', label: 'Permit Type', type: 'select', options: ['Construction', 'Event', 'Commercial', 'Other'], required: true },
      { name: 'location', label: 'Location/Address', type: 'text', required: true },
      { name: 'duration', label: 'Duration (in days)', type: 'number', required: true },
      { name: 'purpose', label: 'Purpose', type: 'text', required: true }
    ],
    documents: [
      { id: 'Aadhaar Card', label: 'Aadhaar Card', required: true },
      { id: 'Property/Location Proof', label: 'Property/Location Proof', required: true },
      { id: 'Site Plan or Layout', label: 'Site Plan or Layout', required: false }
    ]
  }
};

const SERVICE_ACCENTS = {
  BIRTH_CERTIFICATE: {
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.08)',
    border: 'rgba(59, 130, 246, 0.2)',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    glow: 'rgba(59, 130, 246, 0.15)'
  },
  DEATH_CERTIFICATE: {
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.08)',
    border: 'rgba(99, 102, 241, 0.2)',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
    glow: 'rgba(99, 102, 241, 0.15)'
  },
  INCOME_CERTIFICATE: {
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.2)',
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    glow: 'rgba(16, 185, 129, 0.15)'
  },
  RESIDENCE_CERTIFICATE: {
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.2)',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    glow: 'rgba(245, 158, 11, 0.15)'
  },
  TRADE_LICENSE: {
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.08)',
    border: 'rgba(139, 92, 246, 0.2)',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    glow: 'rgba(139, 92, 246, 0.15)'
  },
  PERMIT_APPROVAL: {
    color: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.08)',
    border: 'rgba(244, 63, 94, 0.2)',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
    glow: 'rgba(244, 63, 94, 0.15)'
  }
};

const FORM_STEPS = ['Fill Details', 'Upload Documents', 'Review', 'Submit'];

function UploadCard({ doc, isUploaded, isUploading, uploadErr, fileInfo, onUpload, onPreview, dragOver, onDragOver, onDragLeave, onDrop }) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        background: isUploaded ? '#f0fdf4' : dragOver ? '#eff6ff' : '#ffffff',
        border: isUploaded
          ? '2px solid #22c55e'
          : dragOver
          ? '2px dashed #2563eb'
          : doc.required
          ? '1.5px solid #cbd5e1'
          : '1px dashed #cbd5e1',
        borderRadius: 18,
        padding: '20px 24px',
        transition: 'all 0.2s ease-in-out',
        boxShadow: dragOver ? '0 12px 28px rgba(37,99,235,0.15)' : '0 2px 8px rgba(15,23,42,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        
        {/* Left Info Column */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 260 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: isUploaded ? '#dcfce7' : isUploading ? '#eff6ff' : doc.required ? '#f1f5f9' : '#f8fafc',
            color: isUploaded ? '#15803d' : isUploading ? '#2563eb' : doc.required ? '#0f172a' : '#64748b',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: isUploaded ? '0 4px 12px rgba(34,197,94,0.15)' : 'none'
          }}>
            {isUploaded ? <CheckCircle2 size={24} color="#16a34a" /> : <FileUp size={24} />}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                {doc.label}
              </h4>
              {doc.required ? (
                <span style={{ fontSize: 10, fontWeight: 800, color: '#dc2626', background: '#fef2f2', padding: '2px 8px', borderRadius: 6, border: '1px solid #fca5a5' }}>
                  MANDATORY *
                </span>
              ) : (
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 6 }}>
                  OPTIONAL
                </span>
              )}
              {isUploaded && (
                <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '2px 10px', borderRadius: 20 }}>
                  ✓ Uploaded
                </span>
              )}
            </div>

            {isUploaded ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#15803d', fontWeight: 600 }}>
                <span>📄 {fileInfo.name}</span>
                <span style={{ color: '#86efac' }}>•</span>
                <span style={{ color: '#166534', background: '#bbf7d0', padding: '1px 8px', borderRadius: 6, fontSize: 11 }}>
                  {fileInfo.size}
                </span>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                Drag & drop file here or click Browse • PDF, JPG, PNG under 5MB
              </p>
            )}
          </div>
        </div>

        {/* Right Action Button Column */}
        <div>
          {isUploading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb', fontSize: 13, fontWeight: 700 }}>
              <div style={{ width: 16, height: 16, border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Uploading...
            </div>
          ) : isUploaded ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => onPreview(fileInfo)}
                style={{
                  padding: '9px 16px', borderRadius: 12,
                  background: '#eff6ff', color: '#2563eb',
                  border: '1.5px solid #bfdbfe',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.15s ease'
                }}
              >
                <Eye size={15} /> Preview
              </button>

              <label style={{ cursor: 'pointer' }}>
                <span
                  style={{
                    padding: '9px 16px', borderRadius: 12,
                    background: '#ffffff', color: '#334155',
                    border: '1.5px solid #cbd5e1',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 6
                  }}
                >
                  <FileUp size={15} /> Replace File
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  onChange={(e) => onUpload(e.target.files[0])}
                />
              </label>
            </div>
          ) : (
            <label style={{ cursor: 'pointer' }}>
              <span
                style={{
                  padding: '10px 20px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
                }}
              >
                <FileUp size={15} /> Browse Files
              </span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={(e) => onUpload(e.target.files[0])}
              />
            </label>
          )}
        </div>

      </div>

      {uploadErr && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8,
          padding: '8px 12px', color: '#dc2626', fontSize: 12, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          ⚠️ {uploadErr}
        </div>
      )}
    </div>
  );
}

function ServiceApplicationForm() {
  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [dragOverDoc, setDragOverDoc] = useState(null);
  const [previewModalFile, setPreviewModalFile] = useState(null);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [familyMembersList, setFamilyMembersList] = useState([]);
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState('SELF');
  const [tourStep, setTourStep] = useState(null);

  const TOUR_STEPS = !isStarted ? [
    {
      step: 1,
      targetKey: 'select-service-section',
      title: 'Select a Service',
      desc: 'Browse and select the certificate you wish to apply for, such as Birth, Death, or Trade License Certificate.'
    }
  ] : [
    {
      step: 1,
      targetKey: 'step-indicator-tour',
      title: 'Step Indicator Progress',
      desc: 'This shows your current step. The application process is split into 4 simple steps: Details, Documents, Review, and Submission.'
    },
    {
      step: 2,
      targetKey: 'form-details-tour',
      title: 'Step 1: Fill Details',
      desc: 'Enter the required information. You can also click "+ Add / Manage Family Members" to apply on behalf of a family member.'
    },
    {
      step: 3,
      targetKey: 'step-continue-tour',
      title: 'Continue to Next Step',
      desc: 'Click "Continue" to proceed to the next step. The platform will run real-time checks to prevent duplicate applications.'
    }
  ];

  const renderRequiredMarker = (isValid) => (
    <span style={{
      color: isValid ? '#16a34a' : '#dc2626',
      fontWeight: 800,
      marginLeft: 4,
      fontSize: isValid ? '14px' : '15px',
      transition: 'all 0.2s ease',
      display: 'inline-block'
    }}>
      {isValid ? '✓' : '*'}
    </span>
  );

  const loadFamilyMembers = () => {
    const citizenId = keycloak?.tokenParsed?.sub;
    if (citizenId) {
      api.get(`/api/citizens/family?citizenId=${citizenId}`)
        .then(res => setFamilyMembersList(res.data))
        .catch(err => console.log('Could not fetch family members:', err));
    }
  };

  useEffect(() => {
    if (keycloak?.authenticated) {
      loadFamilyMembers();
    }
  }, []);

  const handleSelectFamilyMember = (member) => {
    const parentName = keycloak?.tokenParsed?.name || formData.applicantName || '';

    if (member === 'SELF') {
      setSelectedFamilyMemberId('SELF');
      setFormData(prev => ({
        ...prev,
        applicantName: parentName || prev.applicantName,
        relationship: 'Self',
        childName: '',
        fatherName: '',
        dateOfBirth: ''
      }));
    } else {
      setSelectedFamilyMemberId(member.memberId);

      let parentRel = 'Father';
      if (member.relationship === 'Son' || member.relationship === 'Daughter' || member.relationship === 'Child') {
        parentRel = 'Father';
      } else if (member.relationship === 'Spouse') {
        parentRel = 'Spouse';
      } else if (member.relationship === 'Father' || member.relationship === 'Mother' || member.relationship === 'Parent') {
        parentRel = 'Child';
      } else {
        parentRel = member.relationship;
      }

      setFormData(prev => ({
        ...prev,
        applicantName: parentName || prev.applicantName,
        relationship: parentRel,
        childName: member.name,
        gender: member.gender || 'Male',
        dateOfBirth: member.dateOfBirth || '',
        fatherName: parentName || prev.applicantName,
        aadhaarNumber: member.aadhar || prev.aadhaarNumber,
        phoneNumber: member.phoneNumber || prev.phoneNumber,
      }));
    }
  };

  const [formData, setFormData] = useState({
    applicantName: '',
    aadhaarNumber: '',
    phoneNumber: '',
    email: '',
    relationship: '',
    applicantDateOfBirth: ''
  });

  const [customOtherRelationship, setCustomOtherRelationship] = useState('');
  const [customOtherFields, setCustomOtherFields] = useState({});

  const [uploadedDocs, setUploadedDocs] = useState({});
  const [uploadingDocs, setUploadingDocs] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [duplicateData, setDuplicateData] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [sortOption, setSortOption] = useState('POPULAR');

  const config = CERTIFICATE_CONFIG[serviceType];

  const filteredServices = Object.entries(CERTIFICATE_CONFIG).filter(([key, svc]) => {
    if (selectedDept !== 'ALL' && svc.department !== selectedDept) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchLabel = svc.label?.toLowerCase().includes(q);
      const matchDesc = svc.description?.toLowerCase().includes(q);
      const matchDept = svc.department?.toLowerCase().includes(q);
      if (!matchLabel && !matchDesc && !matchDept) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortOption === 'AZ') {
      return a[1].label.localeCompare(b[1].label);
    }
    const badgeA = a[1].badge ? 1 : 0;
    const badgeB = b[1].badge ? 1 : 0;
    return badgeB - badgeA;
  });

  const requiredDocs = config ? config.documents.filter(d => d.required) : [];
  const uploadedRequiredCount = requiredDocs.filter(d => uploadedDocs[d.id]).length;
  const progressPercent = requiredDocs.length > 0 ? Math.round((uploadedRequiredCount / requiredDocs.length) * 100) : 100;

  const isDetailsValid = () => {
    if (!formData.applicantName || formData.aadhaarNumber.length < 14) return false;
    if (!formData.phoneNumber || !formData.email) return false;
    if (formData.relationship === 'Other' && !customOtherRelationship.trim()) return false;
    for (const field of config?.fields || []) {
      if (field.required && !formData[field.name]) return false;
      if (field.type === 'select' && formData[field.name] === 'Other' && !customOtherFields[field.name]?.trim()) return false;
    }
    return true;
  };

  const isFormValid = () => isDetailsValid() && uploadedRequiredCount >= requiredDocs.length;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'aadhaarNumber') {
      let val = value.replace(/\D/g, '');
      if (val.length > 12) val = val.slice(0, 12);
      const formatted = val.match(/.{1,4}/g)?.join('-') || '';
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const setFieldValue = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  const processFileUpload = (docId, file) => {
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setUploadErrors(prev => ({ ...prev, [docId]: 'Only PDF, JPG, and PNG formats are allowed' }));
      toast.error('Only PDF, JPG, and PNG formats are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadErrors(prev => ({ ...prev, [docId]: 'File size must be under 5MB' }));
      toast.error('File size must be under 5MB');
      return;
    }

    setUploadErrors(prev => ({ ...prev, [docId]: null }));
    setUploadingDocs(prev => ({ ...prev, [docId]: true }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadingDocs(prev => ({ ...prev, [docId]: false }));
      setUploadedDocs(prev => ({
        ...prev,
        [docId]: { 
          id: docId, 
          name: file.name, 
          type: file.type, 
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          data: reader.result 
        }
      }));
      toast.success(`${docId} uploaded successfully`);
    };
    reader.readAsDataURL(file);
  };

  const handleContinue = async () => {
    if (formStep === 1) {
      if (!isDetailsValid()) {
        toast.error('Please fill all required fields before continuing.');
        return;
      }
      setIsLoading(true);
      try {
        const res = await api.get('/api/services/check-duplicate', {
          params: { serviceType, aadhaarNumber: formData.aadhaarNumber }
        });
        if (res.data?.duplicate) {
          setDuplicateData(res.data.existingApplication);
          toast.error('Duplicate application detected.');
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error('Pre-check for duplicate application failed:', err);
        // Show warning/error to user instead of silently letting them pass
        toast.error('Unable to verify application duplicate status. Please check your network connection.');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    } else if (formStep === 2) {
      if (uploadedRequiredCount < requiredDocs.length) {
        toast.error('Please upload all required documents before continuing.');
        return;
      }
    }
    setFormStep(formStep + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keycloak.authenticated) {
      toast.error('You must be signed in as a citizen to submit a service application. Redirecting to Sign In...');
      setTimeout(() => {
        keycloak.login();
      }, 1500);
      return;
    }

    if (!isFormValid()) return;

    setIsLoading(true);

    const citizenId = keycloak.tokenParsed?.sub;
    const { applicantName, aadhaarNumber, ...dynamicData } = formData;

    const finalRelationship = formData.relationship === 'Other'
      ? (customOtherRelationship.trim() ? `Other: ${customOtherRelationship.trim()}` : 'Other')
      : formData.relationship;

    const dynamicDataProcessed = { ...dynamicData, relationship: finalRelationship };
    for (const field of config?.fields || []) {
      if (formData[field.name] === 'Other') {
        const val = customOtherFields[field.name]?.trim();
        dynamicDataProcessed[field.name] = val ? `Other: ${val}` : 'Other';
      }
    }

    const payload = {
      citizenId,
      serviceType,
      applicantName,
      aadhaarNumber,
      dynamicData: dynamicDataProcessed,
      documentsSubmitted: JSON.stringify(Object.values(uploadedDocs))
    };

    try {
      const res = await api.post('/service-management-service/api/services/apply', payload);

      // Create instant notification record for Citizen
      try {
        await api.post('/notification-service/api/notifications', {
          recipient: citizenId || 'bd5b60cb-9c09-4574-97a3-ad0142a10588',
          recipientRole: 'CITIZEN',
          title: `Application Submitted (${config?.label || serviceType})`,
          message: `Your application (${res.data.applicationNumber}) for ${config?.label || serviceType} has been successfully filed with ${config?.department || 'Municipal Corporation'}.`,
          relatedEntityId: String(res.data.applicationId || res.data.applicationNumber),
          relatedEntityType: 'CERTIFICATE',
          eventType: 'certificate-submitted',
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
      const dept = config?.department || 'Health Department';
      const officerUser = OFFICER_MAP[dept] || 'john';

      try {
        await api.post('/notification-service/api/notifications', {
          recipient: officerUser,
          recipientRole: 'OFFICER',
          title: `New Certificate Application Assigned`,
          message: `Application ${res.data.applicationNumber} (Applicant: ${applicantName}) for ${config?.label || serviceType} waiting for verification.`,
          relatedEntityId: String(res.data.applicationId || res.data.applicationNumber),
          relatedEntityType: 'CERTIFICATE',
          eventType: 'certificate-submitted',
          readStatus: false
        });
      } catch (e) {}

      window.dispatchEvent(new Event('refresh-notifications'));
      toast.success(`Application Submitted Successfully! App No: ${res.data.applicationNumber}`);
      setIsLoading(false);
      setTimeout(() => {
        navigate('/services/tracker');
      }, 2000);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409 && err.response?.data?.existingApplication) {
        setDuplicateData(err.response.data.existingApplication);
        toast.error('Duplicate application detected.');
      } else {
        toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to submit application.');
      }
      setIsLoading(false);
    }
  };

  const resetSelection = () => {
    setServiceType('');
    setIsStarted(false);
    setFormStep(1);
    setFormData({ applicantName: '', aadhaarNumber: '', phoneNumber: '', email: '', relationship: '', applicantDateOfBirth: '' });
    setCustomOtherRelationship('');
    setCustomOtherFields({});
    setUploadedDocs({});
    setUploadErrors({});
  };

  const selectService = (key) => {
    setServiceType(key);
    setIsStarted(false);
    setFormStep(1);
    setDuplicateData(null);
  };

  if (duplicateData) {
    return (
      <AppShell title="Duplicate Application Warning">
        <div style={{ width: '100%', maxWidth: 960, margin: '0 auto', padding: '0 24px 60px 24px', boxSizing: 'border-box' }}>
          
          <div style={{
            background: '#ffffff', borderRadius: 24, border: '1.5px solid #fee2e2',
            boxShadow: '0 20px 40px rgba(220,38,38,0.08)', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', gap: 0
          }}>
            
            {/* Header Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
              padding: '32px 36px', color: '#ffffff', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(30px)' }} />
              
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <ShieldAlert size={30} color="#ffffff" />
                </div>
                <div>
                  <div style={{
                    background: 'rgba(255,255,255,0.15)', color: '#fef2f2', border: '1px solid rgba(255,255,255,0.3)',
                    padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em',
                    display: 'inline-block', marginBottom: 8
                  }}>
                    CIVIC SERVICE REGULATION NOTICE
                  </div>
                  <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                    Duplicate Application Detected
                  </h2>
                  <p style={{ margin: 0, color: '#fca5a5', fontSize: 14, lineHeight: 1.5, maxWidth: 640 }}>
                    An active application for <strong>{config?.label || serviceType || 'this service'}</strong> with matching citizen credentials already exists in the municipal register.
                  </p>
                </div>
              </div>
            </div>

            {/* Details Content Section */}
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Detailed Summary Grid (2 Columns) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                
                {/* Identifier & Status Card */}
                <div style={{ background: '#f8fafc', borderRadius: 18, border: '1.5px solid #e2e8f0', padding: 20 }}>
                  <h4 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    📌 Application Identifiers
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Application Reference Number</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', background: '#e2e8f0', padding: '2px 8px', borderRadius: 6, display: 'inline-block', marginTop: 2 }}>
                        {duplicateData.applicationNumber}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Current Lifecycle Status</span>
                      <span style={{
                        fontSize: 12, fontWeight: 800, color: '#1d4ed8', background: '#dbeafe',
                        padding: '4px 10px', borderRadius: 20, display: 'inline-block', marginTop: 4
                      }}>
                        ● {duplicateData.status || 'SUBMITTED'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Citizen Credentials & Service Info */}
                <div style={{ background: '#f8fafc', borderRadius: 18, border: '1.5px solid #e2e8f0', padding: 20 }}>
                  <h4 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    👤 Citizen & Department Info
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Service & Department</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                        {config?.label || 'Certificate Service'} · {config?.department || 'Municipal Corporation'}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Applicant Aadhaar Number</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                        {duplicateData.aadhaarNumber || formData.aadhaarNumber || 'Registered Citizen'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Municipal Guidelines Box */}
              <div style={{
                background: '#fff7ed', borderRadius: 16, border: '1px solid #fed7aa', padding: 20,
                display: 'flex', alignItems: 'flex-start', gap: 14
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ea580c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#9a3412' }}>
                    Why cannot a duplicate application be raised?
                  </h4>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#c2410c', lineHeight: 1.5 }}>
                    To maintain strict SLA turnaround times and prevent processing backlog, municipal bylaws permit only one active application per service per citizen. You can track your existing application or view officer updates in the service tracker.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', paddingTop: 8 }}>
                <button 
                  onClick={() => setDuplicateData(null)}
                  style={{
                    flex: '1 1 180px', padding: '14px 20px', borderRadius: 12,
                    background: '#ffffff', color: '#334155', border: '1.5px solid #cbd5e1',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  ← Go Back / Change Service
                </button>
                
                <button 
                  onClick={() => navigate('/services/tracker')}
                  style={{
                    flex: '2 1 280px', padding: '14px 24px', borderRadius: 12,
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#ffffff',
                    border: 'none', fontSize: 14, fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 14px rgba(37,99,235,0.25)'
                  }}
                >
                  <Search size={16} /> Track Existing Application ({duplicateData.applicationNumber})
                </button>
              </div>

            </div>

          </div>

        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Apply for Certificates">
      <div style={{ width: '100%', maxWidth: '100%', padding: '0 24px 40px 24px', margin: '0 auto', boxSizing: 'border-box' }}>

        {serviceType && (
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={resetSelection}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 10, background: '#ffffff',
                border: '1.5px solid #cbd5e1', color: '#1e293b', fontSize: 13,
                fontWeight: 700, cursor: 'pointer'
              }}
            >
              ← Change Service
            </button>
          </div>
        )}

        {/* Step 1: Service Selection Cards */}
        {!serviceType && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* ── Page Header (Executive Navy/Emerald Theme matching Civic Services) ── */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #065f46 100%)',
              borderRadius: 20, padding: '28px 32px', color: '#ffffff',
              display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 12px 36px rgba(15,23,42,0.25)', border: '1px solid #334155',
              marginBottom: 16, position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, background: 'rgba(16,185,129,0.15)', borderRadius: '50%', filter: 'blur(40px)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span style={{
                  background: 'rgba(255,255,255,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)',
                  padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', display: 'inline-block', marginBottom: 8
                }}>
                  CIVIC SERVICES
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                    Apply for Government Certificates
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
                <p style={{ margin: 0, color: '#94a3b8', maxWidth: 540, fontSize: 14, lineHeight: 1.5 }}>
                  Choose from digitally verifiable municipal certificate services to start your official application.
                </p>
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <Link to="/services/tracker" style={{ textDecoration: 'none' }}>
                  <button style={{
                    background: '#ffffff', color: '#0f172a', border: 'none', padding: '10px 22px',
                    borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <Search size={16} /> Track My Applications
                  </button>
                </Link>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div style={{
              background: '#ffffff', borderRadius: 14, padding: '16px 20px',
              border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
              display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center'
            }}>
              <div style={{ position: 'relative', flex: '1 1 260px' }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                <input
                  type="text"
                  placeholder="Search certificates by title or department..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px 10px 42px', borderRadius: 10,
                    border: '1px solid #cbd5e1', fontSize: 13, color: '#0f172a', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                style={{
                  padding: '9px 14px', borderRadius: 10, border: '1px solid #cbd5e1',
                  fontSize: 13, fontWeight: 600, color: '#334155', background: '#ffffff', cursor: 'pointer'
                }}
              >
                <option value="ALL">All Departments</option>
                <option value="Health Department">Health Department</option>
                <option value="Revenue Department">Revenue Department</option>
                <option value="Municipal Corporation">Municipal Corporation</option>
                <option value="Urban Planning Department">Urban Planning Department</option>
              </select>

              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                style={{
                  padding: '9px 14px', borderRadius: 10, border: '1px solid #cbd5e1',
                  fontSize: 13, fontWeight: 600, color: '#334155', background: '#ffffff', cursor: 'pointer'
                }}
              >
                <option value="POPULAR">Sort By: Popular</option>
                <option value="AZ">Sort By: Name (A-Z)</option>
              </select>

              <span style={{ marginLeft: 'auto', fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                {filteredServices.length} certificates available
              </span>
            </div>

            {/* Section Header */}
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '8px 0 2px' }}>
                Popular Certificates
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                Select a certificate service to start your official application
              </p>
            </div>

            {/* Certificates Cards Grid */}
            <div data-tour="select-service-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {filteredServices.map(([key, svc]) => {
                const accent = SERVICE_ACCENTS[key] || SERVICE_ACCENTS.BIRTH_CERTIFICATE;
                return (
                  <div
                    key={key}
                    onClick={() => selectService(key)}
                    style={{
                      background: 'var(--surface, #ffffff)', 
                      borderRadius: 20, 
                      border: '1.5px solid var(--border, #e2e8f0)',
                      padding: '24px', 
                      cursor: 'pointer', 
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 12px rgba(15,23,42,0.03)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.borderColor = accent.color;
                      e.currentTarget.style.boxShadow = `0 20px 25px -5px ${accent.glow}, 0 8px 10px -6px ${accent.glow}`;
                      // Scale icon container
                      const iconBox = e.currentTarget.querySelector('.tour-icon-box');
                      if (iconBox) iconBox.style.transform = 'scale(1.1) rotate(4deg)';
                      // Scale button slightly
                      const btn = e.currentTarget.querySelector('.tour-apply-btn');
                      if (btn) {
                        btn.style.boxShadow = `0 6px 20px ${accent.glow}`;
                        btn.style.filter = 'brightness(1.05)';
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(15,23,42,0.03)';
                      // Reset icon container
                      const iconBox = e.currentTarget.querySelector('.tour-icon-box');
                      if (iconBox) iconBox.style.transform = 'scale(1) rotate(0deg)';
                      // Reset button
                      const btn = e.currentTarget.querySelector('.tour-apply-btn');
                      if (btn) {
                        btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)';
                        btn.style.filter = 'brightness(1)';
                      }
                    }}
                  >
                    {/* Subtle top color glow line */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: accent.gradient
                    }} />

                    <div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                        <div 
                          className="tour-icon-box"
                          style={{
                            width: 48, height: 48, borderRadius: 14,
                            background: accent.bg, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: 24, flexShrink: 0,
                            border: `1px solid ${accent.border}`,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        >
                          {svc.icon}
                        </div>
                        {svc.badge && (
                          <span style={{
                            background: 'rgba(16, 185, 129, 0.1)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.2)',
                            fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 20,
                            letterSpacing: '0.05em', textTransform: 'uppercase'
                          }}>
                            {svc.badge}
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text, #0f172a)', margin: '0 0 8px', lineHeight: 1.3 }}>
                        {svc.label}
                      </h3>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary, #64748b)', margin: '0 0 20px', lineHeight: 1.5 }}>
                        {svc.description}
                      </p>
                    </div>

                    <div>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        paddingTop: 14, borderTop: '1px solid var(--border, #f1f5f9)', fontSize: 12, color: 'var(--text, #475569)', fontWeight: 700,
                        marginBottom: 16
                      }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Building2 size={14} color="var(--text-secondary, #94a3b8)" />
                          {svc.department}
                        </span>
                        <span style={{ color: accent.color, fontWeight: 800 }}>
                          ⏳ {svc.approvalTime}
                        </span>
                      </div>

                      <button 
                        className="tour-apply-btn"
                        style={{
                          width: '100%', padding: '12px 14px', borderRadius: 12,
                          background: accent.gradient, color: '#ffffff',
                          border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Apply Now <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Requirements View — Executive Premium UI */}
        {config && !isStarted && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
            
            {/* Service Header Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #065f46 100%)',
              borderRadius: 24, padding: '32px 36px', color: '#ffffff',
              boxShadow: '0 20px 40px rgba(15,23,42,0.3)', border: '1px solid #334155',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: -50, right: -50, width: 260, height: 260, background: 'rgba(16,185,129,0.18)', borderRadius: '50%', filter: 'blur(50px)' }} />
              
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 18,
                  background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, flexShrink: 0, boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                }}>
                  {config.icon}
                </div>

                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span style={{
                      background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)',
                      padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em'
                    }}>
                      OFFICIAL CERTIFICATE SERVICE
                    </span>
                    {config.badge && (
                      <span style={{
                        background: '#dcfce7', color: '#15803d', fontSize: 11,
                        fontWeight: 800, padding: '4px 10px', borderRadius: 20, letterSpacing: '0.05em'
                      }}>
                        {config.badge}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h2 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                      {config.label} Requirements
                    </h2>
                    <button 
                      type="button"
                      onClick={() => setTourStep(1)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                        background: 'rgba(168,85,247,0.25)', color: '#d8b4fe', border: '1px solid rgba(168,85,247,0.4)',
                        cursor: 'pointer', transition: 'all 0.2s', marginTop: -8
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(168,85,247,0.35)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(168,85,247,0.25)'}
                    >
                      ❓ Guide Me
                    </button>
                  </div>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: 15, lineHeight: 1.6, maxWidth: 650 }}>
                    {config.description}
                  </p>
                </div>
              </div>

              {/* Stats Strip */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14,
                marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    Department
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Building2 size={15} color="#34d399" />
                    {config.department}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    Estimated Processing Time
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Zap size={15} color="#38bdf8" />
                    {config.approvalTime}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    Government Fee
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={15} color="#4ade80" />
                    {config.fee === '₹0' ? 'FREE (No Charge)' : config.fee}
                  </div>
                </div>
              </div>
            </div>

            {/* Required Documents Checklist Card */}
            <div style={{
              background: '#ffffff', borderRadius: 20, border: '1.5px solid #e2e8f0',
              padding: '28px 32px', boxShadow: '0 8px 30px rgba(15,23,42,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileCheck size={22} color="#2563eb" /> Required Documents Checklist
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                    Please prepare soft copies (PDF/JPG, max 5MB) before proceeding.
                  </p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '6px 14px', borderRadius: 20, border: '1px solid #bfdbfe' }}>
                  {config.documents.filter(d => d.required).length} Mandatory · {config.documents.filter(d => !d.required).length} Optional
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                {config.documents.map((doc, idx) => (
                  <div
                    key={doc.id}
                    style={{
                      background: doc.required ? '#f8fafc' : '#ffffff',
                      border: doc.required ? '1.5px solid #cbd5e1' : '1px dashed #cbd5e1',
                      borderRadius: 14, padding: 18,
                      display: 'flex', alignItems: 'flex-start', gap: 14,
                      transition: 'all 0.15s ease-in-out'
                    }}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: doc.required ? '#dcfce7' : '#f1f5f9',
                      color: doc.required ? '#15803d' : '#64748b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      fontWeight: 800, fontSize: 14
                    }}>
                      {doc.required ? <CheckCircle2 size={20} color="#16a34a" /> : <FileText size={18} color="#64748b" />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                          {doc.label}
                        </h4>
                        {doc.required ? (
                          <span style={{ fontSize: 10, fontWeight: 800, color: '#dc2626', background: '#fef2f2', padding: '2px 8px', borderRadius: 6, border: '1px solid #fca5a5' }}>
                            REQUIRED
                          </span>
                        ) : (
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 6 }}>
                            OPTIONAL
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                        {doc.required ? 'Scanned original copy (PDF, PNG, JPG under 5MB)' : 'Optional supporting attachment'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Workflow & Security Notice */}
            <div style={{
              background: '#f8fafc', borderRadius: 20, border: '1.5px solid #e2e8f0',
              padding: '24px 32px', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Shield size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1e1b4b' }}>
                    Digitally Verifiable E-Certificate
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: '#475569' }}>
                    Issued certificates contain official QR code verification accepted by all government & private institutions.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14, width: '100%', maxWidth: 420 }}>
                <button
                  onClick={resetSelection}
                  style={{
                    flex: '0 0 auto', padding: '14px 20px', borderRadius: 12,
                    background: '#ffffff', color: '#334155', border: '1.5px solid #cbd5e1',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => setIsStarted(true)}
                  style={{
                    flex: 1, padding: '14px 28px', borderRadius: 12,
                    background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#ffffff',
                    border: 'none', fontSize: 15, fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 6px 20px rgba(22,163,74,0.3)', transition: 'all 0.15s ease'
                  }}
                >
                  Start Application <ArrowRight size={18} />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Multi-step Form — Executive Premium UI */}
        {config && isStarted && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
            
            {/* Step Progress Header */}
            <div data-tour="step-indicator-tour" style={{
              background: '#ffffff', borderRadius: 20, border: '1.5px solid #e2e8f0',
              padding: '20px 24px', boxShadow: '0 4px 16px rgba(15,23,42,0.04)'
            }}>
              <StepIndicator steps={FORM_STEPS} currentStep={formStep} />
            </div>

            {/* Main Form Container Card */}
            <div data-tour="form-details-tour" style={{
              background: '#ffffff', borderRadius: 24, border: '1.5px solid #e2e8f0',
              boxShadow: '0 12px 36px rgba(15,23,42,0.06)', overflow: 'hidden'
            }}>
              
              {/* Form Card Header */}
              <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                padding: '24px 32px', color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
                  }}>
                    {config.icon}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#ffffff' }}>
                      {config.label} Application
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: '#94a3b8' }}>
                      {config.department} · {config.approvalTime} SLA
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    background: 'rgba(37,99,235,0.2)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)',
                    padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800, letterSpacing: '0.05em'
                  }}>
                    STEP {formStep} OF 4: {FORM_STEPS[formStep - 1].toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Form Card Content */}
              <div style={{ padding: '32px' }}>
                
                {/* STEP 1: FILL DETAILS */}
                {formStep === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    
                    {/* Section 1: Applicant Primary Details */}
                    <div style={{
                      background: '#f8fafc', borderRadius: 18, border: '1.5px solid #e2e8f0', padding: 24
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 12, borderBottom: '1.5px solid #e2e8f0' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={18} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                            Applicant Personal Information
                          </h4>
                          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                            Details of the person submitting this certificate application
                          </p>
                        </div>
                      </div>

                      {/* Who are you applying for? Beneficiary Selection Card */}
                      <div style={{ background: '#ffffff', border: '1.5px solid #3b82f6', borderRadius: 14, padding: 18, marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users size={18} color="#2563eb" /> Applying For
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowFamilyModal(true)}
                            style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                          >
                            <UserPlus size={14} /> + Add / Manage Family Members
                          </button>
                        </div>

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => handleSelectFamilyMember('SELF')}
                            style={{
                              padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
                              background: selectedFamilyMemberId === 'SELF' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#f8fafc',
                              color: selectedFamilyMemberId === 'SELF' ? '#ffffff' : '#334155',
                              border: selectedFamilyMemberId === 'SELF' ? 'none' : '1px solid #cbd5e1',
                              fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                              boxShadow: selectedFamilyMemberId === 'SELF' ? '0 4px 12px rgba(37,99,235,0.2)' : 'none'
                            }}
                          >
                            <span>👤 Myself (Account Owner)</span>
                          </button>

                          {familyMembersList.map(m => {
                            const isSel = selectedFamilyMemberId === m.memberId;
                            return (
                              <button
                                key={m.memberId}
                                type="button"
                                onClick={() => handleSelectFamilyMember(m)}
                                style={{
                                  padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
                                  background: isSel ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#f8fafc',
                                  color: isSel ? '#ffffff' : '#334155',
                                  border: isSel ? 'none' : '1px solid #cbd5e1',
                                  fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                                  boxShadow: isSel ? '0 4px 12px rgba(37,99,235,0.2)' : 'none'
                                }}
                              >
                                <span>👦 {m.name} ({m.relationship})</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                        
                        {/* Applicant Name */}
                        <div>
                          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Applicant Name {renderRequiredMarker(Boolean(formData.applicantName?.trim()))}
                          </label>
                          <div style={{ position: 'relative' }}>
                            <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1, pointerEvents: 'none' }} />
                            <input
                              type="text"
                              name="applicantName"
                              value={formData.applicantName}
                              onChange={handleInputChange}
                              required
                              placeholder="Full name as printed on Aadhaar"
                              style={{
                                width: '100%', padding: '11px 14px 11px 44px', borderRadius: 10,
                                border: '1.5px solid #cbd5e1', fontSize: 14, color: '#0f172a',
                                outline: 'none', transition: 'all 0.15s ease', boxSizing: 'border-box',
                                background: '#ffffff'
                              }}
                            />
                          </div>
                        </div>

                        {/* Aadhaar Number */}
                        <div>
                          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Aadhaar Number {renderRequiredMarker(formData.aadhaarNumber?.replace(/\D/g, '').length === 12)}
                          </label>
                          <div style={{ position: 'relative' }}>
                            <CreditCard size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1, pointerEvents: 'none' }} />
                            <input
                              type="text"
                              name="aadhaarNumber"
                              value={formData.aadhaarNumber}
                              onChange={handleInputChange}
                              required
                              placeholder="12-digit Aadhaar (XXXX-XXXX-XXXX)"
                              maxLength={14}
                              style={{
                                width: '100%', padding: '11px 14px 11px 44px', borderRadius: 10,
                                border: '1.5px solid #cbd5e1', fontSize: 14, color: '#0f172a',
                                outline: 'none', transition: 'all 0.15s ease', boxSizing: 'border-box',
                                background: '#ffffff', fontFamily: 'monospace', letterSpacing: '0.05em'
                              }}
                            />
                          </div>
                        </div>

                        {/* Phone Number */}
                        <div>
                          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Mobile Phone Number {renderRequiredMarker(/^[6-9]\d{9}$/.test(formData.phoneNumber?.replace(/\D/g, '') || ''))}
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1, pointerEvents: 'none' }} />
                            <input
                              type="text"
                              name="phoneNumber"
                              maxLength={10}
                              value={formData.phoneNumber}
                              onChange={e => {
                                const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setFormData(prev => ({ ...prev, phoneNumber: digitsOnly }));
                              }}
                              required
                              placeholder="10-digit mobile number (e.g. 9876543210)"
                              style={{
                                width: '100%', padding: '11px 14px 11px 44px', borderRadius: 10,
                                border: '1.5px solid #cbd5e1', fontSize: 14, color: '#0f172a',
                                outline: 'none', transition: 'all 0.15s ease', boxSizing: 'border-box',
                                background: '#ffffff'
                              }}
                            />
                          </div>
                        </div>

                        {/* Email Address */}
                        <div>
                          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Email Address {renderRequiredMarker(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email || ''))}
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1, pointerEvents: 'none' }} />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              placeholder="Email ID for status tracking & certificate copy"
                              style={{
                                width: '100%', padding: '11px 14px 11px 44px', borderRadius: 10,
                                border: '1.5px solid #cbd5e1', fontSize: 14, color: '#0f172a',
                                outline: 'none', transition: 'all 0.15s ease', boxSizing: 'border-box',
                                background: '#ffffff'
                              }}
                            />
                          </div>
                        </div>

                        {/* Relationship Dropdown with 'Other' text box */}
                        <div>
                          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Applying For (Relationship) {renderRequiredMarker(Boolean(formData.relationship?.trim()))}
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Users size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1, pointerEvents: 'none' }} />
                            <select
                              name="relationship"
                              value={formData.relationship}
                              onChange={handleInputChange}
                              style={{
                                width: '100%', padding: '11px 14px 11px 44px', borderRadius: 10,
                                border: '1.5px solid #cbd5e1', fontSize: 14, color: '#0f172a',
                                outline: 'none', transition: 'all 0.15s ease', boxSizing: 'border-box',
                                background: '#ffffff', cursor: 'pointer'
                              }}
                            >
                              <option value="">Select Relationship</option>
                              <option value="Self">Self</option>
                              <option value="Child">Child (Son / Daughter)</option>
                              <option value="Son">Son</option>
                              <option value="Daughter">Daughter</option>
                              <option value="Spouse">Spouse (Husband / Wife)</option>
                              <option value="Spouse (Husband/Wife)">Spouse (Husband/Wife)</option>
                              <option value="Parent">Parent (Father / Mother)</option>
                              <option value="Father">Father</option>
                              <option value="Mother">Mother</option>
                              <option value="Brother">Brother</option>
                              <option value="Sister">Sister</option>
                              <option value="Other Dependent">Other Dependent</option>
                              <option value="Legal Guardian">Legal Guardian</option>
                              <option value="Other">Other (Specify below)</option>
                            </select>
                          </div>

                          {formData.relationship === 'Other' && (
                            <div style={{ marginTop: 10 }}>
                              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#2563eb', marginBottom: 4 }}>
                                Specify Relationship {renderRequiredMarker(Boolean(customOtherRelationship?.trim()))}
                              </label>
                              <input
                                type="text"
                                value={customOtherRelationship}
                                onChange={e => setCustomOtherRelationship(e.target.value)}
                                required
                                placeholder="Type relationship (e.g. Grandfather, Guardian...)"
                                style={{
                                  width: '100%', padding: '10px 14px', borderRadius: 10,
                                  border: '1.5px solid #3b82f6', fontSize: 13, color: '#0f172a',
                                  outline: 'none', background: '#eff6ff', boxSizing: 'border-box'
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Applicant DOB */}
                        <div>
                          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                            Applicant Date of Birth
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Calendar size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1, pointerEvents: 'none' }} />
                            <input
                              type="date"
                              name="applicantDateOfBirth"
                              value={formData.applicantDateOfBirth}
                              onChange={handleInputChange}
                              style={{
                                width: '100%', padding: '11px 14px 11px 44px', borderRadius: 10,
                                border: '1.5px solid #cbd5e1', fontSize: 14, color: '#0f172a',
                                outline: 'none', transition: 'all 0.15s ease', boxSizing: 'border-box',
                                background: '#ffffff'
                              }}
                            />
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Section 2: Service Specific Dynamic Details */}
                    <div style={{
                      background: '#ffffff', borderRadius: 18, border: '1.5px solid #e2e8f0', padding: 24,
                      boxShadow: '0 2px 8px rgba(15,23,42,0.03)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 12, borderBottom: '1.5px solid #e2e8f0' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                            {config.label} Service Specific Details
                          </h4>
                          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                            Please fill in all mandatory fields required by {config.department}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                        {config.fields.map(field => {
                          const val = formData[field.name];
                          const isFieldValid = Boolean(val && val.toString().trim().length > 0);
                          return (
                            <div key={field.name}>
                              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                {field.label} {field.required ? renderRequiredMarker(isFieldValid) : ''}
                              </label>

                            {field.type === 'select' ? (
                              <div>
                                <select
                                  value={formData[field.name] || ''}
                                  onChange={e => setFieldValue(field.name, e.target.value)}
                                  required={field.required}
                                  style={{
                                    width: '100%', padding: '11px 14px', borderRadius: 10,
                                    border: '1.5px solid #cbd5e1', fontSize: 14, color: '#0f172a',
                                    outline: 'none', transition: 'all 0.15s ease', boxSizing: 'border-box',
                                    background: '#ffffff', cursor: 'pointer'
                                  }}
                                >
                                  <option value="">Select {field.label}</option>
                                  {field.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>

                                {formData[field.name] === 'Other' && (
                                  <div style={{ marginTop: 10 }}>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#2563eb', marginBottom: 4 }}>
                                      Specify {field.label} <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <input
                                      type="text"
                                      value={customOtherFields[field.name] || ''}
                                      onChange={e => setCustomOtherFields(prev => ({ ...prev, [field.name]: e.target.value }))}
                                      required
                                      placeholder={`Enter custom ${field.label.toLowerCase()}`}
                                      style={{
                                        width: '100%', padding: '10px 14px', borderRadius: 10,
                                        border: '1.5px solid #3b82f6', fontSize: 13, color: '#0f172a',
                                        outline: 'none', background: '#eff6ff', boxSizing: 'border-box'
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={handleInputChange}
                                required={field.required}
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                style={{
                                  width: '100%', padding: '11px 14px', borderRadius: 10,
                                  border: '1.5px solid #cbd5e1', fontSize: 14, color: '#0f172a',
                                  outline: 'none', transition: 'all 0.15s ease', boxSizing: 'border-box',
                                  background: '#ffffff'
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                      </div>
                    </div>

                  </div>
                )}

                {/* STEP 2: UPLOAD DOCUMENTS — Executive Premium UI */}
                {formStep === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    
                    {/* Progress Bar Header Card */}
                    <div style={{
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      borderRadius: 20, padding: '24px 28px', color: '#ffffff',
                      boxShadow: '0 10px 25px rgba(15,23,42,0.15)', border: '1px solid #334155',
                      display: 'flex', flexDirection: 'column', gap: 14
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(52,211,153,0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileCheck size={20} />
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                              Upload Supporting Documents
                            </h4>
                            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                              Original scanned copies in PDF, JPG, or PNG format (Max 5MB each)
                            </p>
                          </div>
                        </div>

                        <span style={{
                          background: progressPercent === 100 ? '#dcfce7' : 'rgba(255,255,255,0.12)',
                          color: progressPercent === 100 ? '#15803d' : '#60a5fa',
                          border: progressPercent === 100 ? 'none' : '1px solid rgba(96,165,250,0.3)',
                          padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800
                        }}>
                          {uploadedRequiredCount} OF {requiredDocs.length} MANDATORY UPLOADED ({progressPercent}%)
                        </span>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.15)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          width: `${progressPercent}%`, height: '100%',
                          background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
                          borderRadius: 4, transition: 'width 0.3s ease'
                        }} />
                      </div>
                      
                      {progressPercent === 100 && (
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CheckCircle2 size={16} /> All mandatory documents uploaded successfully! Click "Continue →" to review your application.
                        </p>
                      )}
                    </div>

                    {/* Upload Cards Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {config.documents.map(doc => (
                        <UploadCard
                          key={doc.id}
                          doc={doc}
                          isUploaded={!!uploadedDocs[doc.id]}
                          isUploading={uploadingDocs[doc.id]}
                          uploadErr={uploadErrors[doc.id]}
                          fileInfo={uploadedDocs[doc.id]}
                          dragOver={dragOverDoc === doc.id}
                          onDragOver={(e) => { e.preventDefault(); setDragOverDoc(doc.id); }}
                          onDragLeave={() => setDragOverDoc(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragOverDoc(null);
                            processFileUpload(doc.id, e.dataTransfer.files[0]);
                          }}
                          onUpload={(file) => processFileUpload(doc.id, file)}
                          onPreview={(fileInfo) => setPreviewModalFile(fileInfo)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3: REVIEW */}
                {formStep === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{
                      background: '#eff6ff', borderRadius: 16, border: '1px solid #bfdbfe', padding: 20,
                      display: 'flex', alignItems: 'center', gap: 14
                    }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1e3a8a' }}>
                          Review Your Application Summary
                        </h4>
                        <p style={{ margin: '2px 0 0', fontSize: 13, color: '#1d4ed8' }}>
                          Verify all details below before proceeding to final submission.
                        </p>
                      </div>
                    </div>

                    <div style={{
                      background: '#ffffff', borderRadius: 16, border: '1.5px solid #e2e8f0', padding: 24,
                      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, fontSize: 14
                    }}>
                      <div><span style={{ color: '#64748b', fontSize: 12, display: 'block' }}>Service Type</span><strong>{config.label}</strong></div>
                      <div><span style={{ color: '#64748b', fontSize: 12, display: 'block' }}>Department</span><strong>{config.department}</strong></div>
                      <div><span style={{ color: '#64748b', fontSize: 12, display: 'block' }}>Applicant Name</span><strong>{formData.applicantName}</strong></div>
                      <div><span style={{ color: '#64748b', fontSize: 12, display: 'block' }}>Aadhaar Number</span><strong>{formData.aadhaarNumber}</strong></div>
                      <div><span style={{ color: '#64748b', fontSize: 12, display: 'block' }}>Phone / Email</span><strong>{formData.phoneNumber} · {formData.email}</strong></div>
                      <div><span style={{ color: '#64748b', fontSize: 12, display: 'block' }}>Government Fee</span><strong>{config.fee}</strong></div>
                      
                      {config.fields.map(f => (
                        <div key={f.name}>
                          <span style={{ color: '#64748b', fontSize: 12, display: 'block' }}>{f.label}</span>
                          <strong>{formData[f.name] || 'N/A'}</strong>
                        </div>
                      ))}

                      <div style={{ gridColumn: '1 / -1', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#64748b', fontSize: 12, display: 'block' }}>Uploaded Documents</span>
                        <strong style={{ color: '#16a34a' }}>✓ {Object.keys(uploadedDocs).length} document(s) attached</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: SUBMIT CONFIRMATION */}
                {formStep === 4 && (
                  <div style={{ textAlign: 'center', padding: '30px 20px', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', color: '#15803d',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
                      boxShadow: '0 10px 25px rgba(22,163,74,0.2)'
                    }}>
                      📨
                    </div>
                    <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#0f172a' }}>
                      Ready for Submission
                    </h3>
                    <p style={{ margin: 0, fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                      By clicking submit, your application will be instantly routed to the <strong>{config.department}</strong> officer portal for verification.
                    </p>
                  </div>
                )}

              </div>

              {/* Form Action Navigation Footer */}
              <div style={{
                background: '#f8fafc', padding: '20px 32px', borderTop: '1.5px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16
              }}>
                {formStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setFormStep(formStep - 1)}
                    style={{
                      padding: '12px 24px', borderRadius: 12, background: '#ffffff',
                      color: '#475569', border: '1.5px solid #cbd5e1', fontSize: 14,
                      fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    ← Previous Step
                  </button>
                ) : <div />}

                <div style={{ display: 'flex', gap: 12 }}>
                  {formStep < 4 && (
                    <button
                      type="button"
                      data-tour="step-continue-tour"
                      disabled={isLoading}
                      onClick={handleContinue}
                      style={{
                        padding: '12px 28px', borderRadius: 12,
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#ffffff',
                        border: 'none', fontSize: 14, fontWeight: 800, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(37,99,235,0.25)'
                      }}
                    >
                      Continue →
                    </button>
                  )}

                  {formStep === 4 && (
                    <button
                      type="submit"
                      disabled={isLoading || !isFormValid()}
                      style={{
                        padding: '12px 32px', borderRadius: 12,
                        background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#ffffff',
                        border: 'none', fontSize: 14, fontWeight: 800,
                        cursor: (isLoading || !isFormValid()) ? 'not-allowed' : 'pointer',
                        opacity: (isLoading || !isFormValid()) ? 0.7 : 1,
                        display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(22,163,74,0.3)'
                      }}
                    >
                      {isLoading ? 'Submitting Application...' : '✓ Submit Application'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          </form>
        )}

        {/* File Preview Modal Overlay */}
        {previewModalFile && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 20
          }}>
            <div style={{
              background: '#ffffff', borderRadius: 24, maxWidth: 880, width: '100%',
              border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh'
            }}>
              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '18px 24px',
                color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid #334155'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                      {previewModalFile.name}
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>
                      Size: {previewModalFile.size} · Official Document Preview
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setPreviewModalFile(null)}
                  style={{
                    background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: 'none',
                    width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body Preview Content */}
              <div style={{ padding: 24, flex: 1, overflowY: 'auto', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 420 }}>
                {previewModalFile.data ? (
                  (previewModalFile.type?.includes('image') || previewModalFile.data.startsWith('data:image')) ? (
                    <img
                      src={previewModalFile.data}
                      alt={previewModalFile.name}
                      style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: 14, boxShadow: '0 8px 25px rgba(15,23,42,0.15)', border: '1px solid #e2e8f0' }}
                    />
                  ) : (
                    <iframe
                      src={previewModalFile.data}
                      title={previewModalFile.name}
                      style={{ width: '100%', height: '65vh', border: 'none', borderRadius: 14, boxShadow: '0 8px 25px rgba(15,23,42,0.1)' }}
                    />
                  )
                ) : (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>
                    <FileText size={48} style={{ color: '#cbd5e1', marginBottom: 12 }} />
                    <p style={{ margin: 0, fontWeight: 700 }}>Preview unavailable for this document format.</p>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div style={{ padding: '16px 24px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                {previewModalFile.data && (
                  <a
                    href={previewModalFile.data}
                    download={previewModalFile.name}
                    style={{
                      padding: '10px 20px', borderRadius: 10, background: '#f1f5f9',
                      color: '#334155', textDecoration: 'none', fontWeight: 700, fontSize: 13,
                      display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #cbd5e1'
                    }}
                  >
                    <Download size={15} /> Download Document
                  </a>
                )}
                <button
                  onClick={() => setPreviewModalFile(null)}
                  style={{
                    padding: '10px 20px', borderRadius: 10, background: '#2563eb',
                    color: '#ffffff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer'
                  }}
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Family & Dependents Modal */}
        <FamilyMembersModal
          isOpen={showFamilyModal}
          onClose={() => setShowFamilyModal(false)}
          selectedMemberId={selectedFamilyMemberId}
          onSelectMember={(m) => {
            handleSelectFamilyMember(m);
            setShowFamilyModal(false);
          }}
        />
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

export default ServiceApplicationForm;
