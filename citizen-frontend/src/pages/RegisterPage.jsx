import { useState } from 'react';
import { Link } from 'react-router-dom';
import publicApi from '../publicApi.js';
import { 
  Landmark, User, Mail, Phone, Lock, ShieldCheck, MapPin, 
  Building2, Hash, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';

function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({});

  const [form, setForm] = useState({
    name: '', email: '', phoneNumber: '', password: '', confirmPassword: '',
    aadhar: '', address: '', ward: '', city: '', state: 'Tamil Nadu', pincode: ''
  });

  const set = (field) => (e) => {
    let val = e.target.value;
    
    // Auto-format Aadhaar as 1234-5678-9012 if user types numbers only
    if (field === 'aadhar') {
      const clean = val.replace(/\D/g, '').slice(0, 12);
      if (clean.length > 8) {
        val = `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8)}`;
      } else if (clean.length > 4) {
        val = `${clean.slice(0, 4)}-${clean.slice(4)}`;
      } else {
        val = clean;
      }
    }
    
    setForm({ ...form, [field]: val });
    setTouched({ ...touched, [field]: true });
  };

  const markTouched = (field) => () => setTouched({ ...touched, [field]: true });

  // ── Validation Logic ──
  const isNameValid = form.name.trim().length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const isPhoneValid = /^[6-9]\d{9}$/.test(form.phoneNumber.trim());
  const isPasswordValid = form.password.length >= 8;
  const isConfirmPasswordValid = form.confirmPassword.length >= 8 && form.confirmPassword === form.password;

  const isAddressValid = form.address.trim().length >= 5;
  const isWardValid = form.ward.trim().length > 0;
  const isCityValid = form.city.trim().length > 0;
  const isPincodeValid = /^\d{6}$/.test(form.pincode.trim());
  const isAadhaarValid = !form.aadhar.trim() || /^\d{4}-\d{4}-\d{4}$/.test(form.aadhar.trim());

  const isStep1Valid = isNameValid && isEmailValid && isPhoneValid && isPasswordValid && isConfirmPasswordValid;
  const isStep2Valid = isAddressValid && isWardValid && isCityValid && isPincodeValid && isAadhaarValid;

  const validateStep1 = () => {
    if (!isNameValid) return 'Please enter your full name (at least 2 characters).';
    if (!isEmailValid) return 'Please enter a valid email address.';
    if (!isPhoneValid) return 'Phone must be a valid 10-digit Indian number (starting with 6–9).';
    if (!isPasswordValid) return 'Password must be at least 8 characters long.';
    if (!isConfirmPasswordValid) return 'Passwords do not match.';
    return null;
  };

  const validateStep2 = () => {
    if (!isAddressValid) return 'Residential address is required (at least 5 characters).';
    if (!isWardValid) return 'Ward number or name is required.';
    if (!isCityValid) return 'City is required.';
    if (!isPincodeValid) return 'PIN code must be exactly 6 digits.';
    if (!isAadhaarValid) return 'Aadhaar must be 12 digits (format: 1234-5678-9012).';
    return null;
  };

  const handleNext = () => {
    setTouched({
      name: true, email: true, phoneNumber: true, password: true, confirmPassword: true
    });
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      ...touched,
      address: true, ward: true, city: true, pincode: true, aadhar: true
    });
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      password: form.password,
      aadhar: form.aadhar.trim() || null,
      address: form.address.trim(),
      ward: form.ward.trim(),
      city: form.city.trim(),
      state: form.state.trim() || 'India',
      pincode: form.pincode.trim(),
    };

    try {
      await publicApi.post('/api/citizens/auth/register', payload);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f7ff 0%, #e0eefd 100%)', padding: 24,
        fontFamily: "'Inter', system-ui, sans-serif"
      }}>
        <div style={{
          maxWidth: 520, width: '100%', background: '#ffffff', borderRadius: 24,
          padding: '48px 36px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: '#dcfce7', color: '#16a34a',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
          }}>
            <CheckCircle2 size={48} />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>
            Registration Successful!
          </h2>
          <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
            Welcome aboard, <strong style={{ color: '#0f172a' }}>{form.name}</strong>! Your citizen account and Keycloak Single Sign-On credentials are ready.
          </p>
          <Link to="/login" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#ffffff', fontWeight: 800, fontSize: 16, textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(37,99,235,0.3)'
          }}>
            🔐 Proceed to Login <ArrowRight size={18} />
          </Link>
          <div style={{ marginTop: 18 }}>
            <Link to="/" style={{ color: '#64748b', fontSize: 13.5, textDecoration: 'none', fontWeight: 600 }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexWrap: 'wrap', background: '#fafbfe',
      fontFamily: "'Inter', system-ui, sans-serif", color: '#0f172a'
    }}>
      
      {/* Left Hero Panel */}
      <div style={{
        flex: '1 1 42%', minWidth: 340, background: 'linear-gradient(145deg, #f3f6ff 0%, #ebf0fe 50%, #f6f3ff 100%)',
        padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        borderRight: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden'
      }}>
        <div>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(37,99,235,0.3)'
            }}>
              <Landmark size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Smart Governance <span style={{ color: '#2563eb' }}>Platform</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3 }}>
                Government Administration & Citizen Assistance
              </div>
            </div>
          </Link>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 32 }}>
            <div style={{
              background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)',
              padding: '6px 14px', borderRadius: 30, fontSize: 11.5, fontWeight: 800, color: '#1e40af',
              display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start'
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              Official Citizen Portal Onboarding
            </div>

            <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.18, margin: 0, color: '#0f172a' }}>
              Join the Smart <br />
              <span style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Governance Network
              </span>
            </h1>

            <p style={{ margin: 0, fontSize: 14.5, color: '#475569', lineHeight: 1.6 }}>
              Register as a citizen to file grievances, track real-time SLA progress, apply for digital certificates, and access welfare schemes seamlessly.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: 12, fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: '#1e293b' }}>
                <ShieldCheck size={18} color="#16a34a" /> 256-bit SSL
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: 12, fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: '#1e293b' }}>
                <Sparkles size={18} color="#0284c7" /> Instant Keycloak SSO
              </div>
            </div>

            {/* Stepper Display */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px 20px', marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Onboarding Step {step} of 2</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: step === 1 ? '#2563eb' : '#16a34a' }}>
                  {step === 1 ? '50% Completed' : '100% Completed'}
                </span>
              </div>
              <div style={{ height: 6, width: '100%', background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: step === 1 ? '50%' : '100%', background: 'linear-gradient(90deg, #2563eb, #7c3aed)', transition: 'width 0.3s ease' }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 10 }}>
                {step === 1 ? '👤 Step 1: Personal Credentials' : '📍 Step 2: Residential Address'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginTop: 32 }}>
          <Link to="/" style={{ color: '#334155', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>

      {/* Right Form Container */}
      <div style={{ flex: '1 1 58%', minWidth: 360, padding: '48px 8%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
        <div style={{ maxWidth: 520, width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 900, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Citizen Registration Portal
            </div>
            <h2 style={{ margin: '0 0 6px', fontSize: 32, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {step === 1 ? 'Create Your Account' : 'Residential Address'}
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: '#64748b', fontWeight: 500 }}>
              {step === 1 ? 'Fill in your details. Required fields will turn green when valid.' : 'Enter your residential address for ward allocation.'}
            </p>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 16px', color: '#dc2626', fontSize: 13.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          {step === 1 ? (
            /* ── STEP 1: Personal & Login Credentials ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              
              {/* Full Name */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label htmlFor="reg-name" style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Full Name{' '}
                    <span style={{ 
                      color: isNameValid ? '#16a34a' : '#ef4444', 
                      fontSize: 15, fontWeight: 900, transition: 'color 0.2s' 
                    }}>
                      {isNameValid ? '✓' : '*'}
                    </span>
                  </label>
                  {isNameValid ? (
                    <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} /> Valid Name
                    </span>
                  ) : touched.name ? (
                    <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>Min. 2 characters required</span>
                  ) : null}
                </div>
                <div style={{ position: 'relative' }}>
                  <User size={19} style={{ position: 'absolute', left: 16, top: 16, color: isNameValid ? '#16a34a' : '#94a3b8' }} />
                  <input
                    id="reg-name"
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    onBlur={markTouched('name')}
                    placeholder="e.g. Kirupa Sankar"
                    style={{
                      width: '100%', height: 50, paddingLeft: 46, paddingRight: 16, borderRadius: 12,
                      border: isNameValid ? '2px solid #16a34a' : (touched.name ? '2px solid #ef4444' : '1.5px solid #cbd5e1'),
                      fontSize: 15, color: '#0f172a', outline: 'none', background: isNameValid ? '#f0fdf4' : '#f8fafc',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label htmlFor="reg-email" style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Email Address{' '}
                    <span style={{ 
                      color: isEmailValid ? '#16a34a' : '#ef4444', 
                      fontSize: 15, fontWeight: 900, transition: 'color 0.2s' 
                    }}>
                      {isEmailValid ? '✓' : '*'}
                    </span>
                  </label>
                  {isEmailValid ? (
                    <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} /> Valid Email
                    </span>
                  ) : touched.email ? (
                    <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>Enter a valid email address</span>
                  ) : null}
                </div>
                <div style={{ position: 'relative' }}>
                  <Mail size={19} style={{ position: 'absolute', left: 16, top: 16, color: isEmailValid ? '#16a34a' : '#94a3b8' }} />
                  <input
                    id="reg-email"
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    onBlur={markTouched('email')}
                    placeholder="e.g. kirupa@gmail.com"
                    style={{
                      width: '100%', height: 50, paddingLeft: 46, paddingRight: 16, borderRadius: 12,
                      border: isEmailValid ? '2px solid #16a34a' : (touched.email ? '2px solid #ef4444' : '1.5px solid #cbd5e1'),
                      fontSize: 15, color: '#0f172a', outline: 'none', background: isEmailValid ? '#f0fdf4' : '#f8fafc',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 500 }}>
                  This will be your primary login handle
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label htmlFor="reg-phone" style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Phone Number (10 digits){' '}
                    <span style={{ 
                      color: isPhoneValid ? '#16a34a' : '#ef4444', 
                      fontSize: 15, fontWeight: 900, transition: 'color 0.2s' 
                    }}>
                      {isPhoneValid ? '✓' : '*'}
                    </span>
                  </label>
                  {isPhoneValid ? (
                    <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} /> Valid 10-digit Phone
                    </span>
                  ) : touched.phoneNumber ? (
                    <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>Must be 10 digits starting 6–9</span>
                  ) : null}
                </div>
                <div style={{ position: 'relative' }}>
                  <Phone size={19} style={{ position: 'absolute', left: 16, top: 16, color: isPhoneValid ? '#16a34a' : '#94a3b8' }} />
                  <input
                    id="reg-phone"
                    type="text"
                    maxLength={10}
                    value={form.phoneNumber}
                    onChange={set('phoneNumber')}
                    onBlur={markTouched('phoneNumber')}
                    placeholder="e.g. 9876543210"
                    style={{
                      width: '100%', height: 50, paddingLeft: 46, paddingRight: 16, borderRadius: 12,
                      border: isPhoneValid ? '2px solid #16a34a' : (touched.phoneNumber ? '2px solid #ef4444' : '1.5px solid #cbd5e1'),
                      fontSize: 15, color: '#0f172a', outline: 'none', background: isPhoneValid ? '#f0fdf4' : '#f8fafc',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
              </div>

              {/* Password & Confirm Password Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                
                {/* Password */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label htmlFor="reg-pass" style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Password{' '}
                      <span style={{ 
                        color: isPasswordValid ? '#16a34a' : '#ef4444', 
                        fontSize: 15, fontWeight: 900, transition: 'color 0.2s' 
                      }}>
                        {isPasswordValid ? '✓' : '*'}
                      </span>
                    </label>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={19} style={{ position: 'absolute', left: 14, top: 16, color: isPasswordValid ? '#16a34a' : '#94a3b8' }} />
                    <input
                      id="reg-pass"
                      type="password"
                      value={form.password}
                      onChange={set('password')}
                      onBlur={markTouched('password')}
                      placeholder="Min. 8 chars"
                      style={{
                        width: '100%', height: 50, paddingLeft: 42, paddingRight: 12, borderRadius: 12,
                        border: isPasswordValid ? '2px solid #16a34a' : (touched.password ? '2px solid #ef4444' : '1.5px solid #cbd5e1'),
                        fontSize: 14.5, color: '#0f172a', outline: 'none', background: isPasswordValid ? '#f0fdf4' : '#f8fafc',
                        transition: 'all 0.2s'
                      }}
                    />
                  </div>
                  {touched.password && !isPasswordValid && (
                    <div style={{ fontSize: 11.5, color: '#ef4444', marginTop: 4, fontWeight: 600 }}>Min. 8 characters</div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label htmlFor="reg-cpass" style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Confirm Password{' '}
                      <span style={{ 
                        color: isConfirmPasswordValid ? '#16a34a' : '#ef4444', 
                        fontSize: 15, fontWeight: 900, transition: 'color 0.2s' 
                      }}>
                        {isConfirmPasswordValid ? '✓' : '*'}
                      </span>
                    </label>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={19} style={{ position: 'absolute', left: 14, top: 16, color: isConfirmPasswordValid ? '#16a34a' : '#94a3b8' }} />
                    <input
                      id="reg-cpass"
                      type="password"
                      value={form.confirmPassword}
                      onChange={set('confirmPassword')}
                      onBlur={markTouched('confirmPassword')}
                      placeholder="Re-enter password"
                      style={{
                        width: '100%', height: 50, paddingLeft: 42, paddingRight: 12, borderRadius: 12,
                        border: isConfirmPasswordValid ? '2px solid #16a34a' : (touched.confirmPassword ? '2px solid #ef4444' : '1.5px solid #cbd5e1'),
                        fontSize: 14.5, color: '#0f172a', outline: 'none', background: isConfirmPasswordValid ? '#f0fdf4' : '#f8fafc',
                        transition: 'all 0.2s'
                      }}
                    />
                  </div>
                  {form.confirmPassword && (
                    <div style={{ fontSize: 11.5, color: isConfirmPasswordValid ? '#16a34a' : '#ef4444', marginTop: 4, fontWeight: 600 }}>
                      {isConfirmPasswordValid ? '✓ Passwords match!' : 'Passwords do not match'}
                    </div>
                  )}
                </div>

              </div>

              <button
                type="button"
                onClick={handleNext}
                style={{
                  height: 52, borderRadius: 12, border: 'none', marginTop: 8,
                  background: isStep1Valid ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: '#ffffff', fontWeight: 800, fontSize: 16, cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'all 0.2s'
                }}
              >
                Next — Address Details <ArrowRight size={18} />
              </button>

            </div>
          ) : (
            /* ── STEP 2: Residential Address & Complete ── */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              
              {/* Aadhaar Number (Optional) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label htmlFor="reg-aadhar" style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Aadhaar Number (Optional){' '}
                    {form.aadhar && (
                      <span style={{ color: isAadhaarValid ? '#16a34a' : '#ef4444', fontSize: 15, fontWeight: 900 }}>
                        {isAadhaarValid ? '✓' : '*'}
                      </span>
                    )}
                  </label>
                  {form.aadhar && isAadhaarValid && (
                    <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>Valid Aadhaar</span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Hash size={19} style={{ position: 'absolute', left: 16, top: 16, color: form.aadhar && isAadhaarValid ? '#16a34a' : '#94a3b8' }} />
                  <input
                    id="reg-aadhar"
                    type="text"
                    maxLength={14}
                    value={form.aadhar}
                    onChange={set('aadhar')}
                    onBlur={markTouched('aadhar')}
                    placeholder="1234-5678-9012"
                    style={{
                      width: '100%', height: 50, paddingLeft: 46, paddingRight: 16, borderRadius: 12,
                      border: form.aadhar ? (isAadhaarValid ? '2px solid #16a34a' : '2px solid #ef4444') : '1.5px solid #cbd5e1',
                      fontSize: 15, color: '#0f172a', outline: 'none', background: form.aadhar && isAadhaarValid ? '#f0fdf4' : '#f8fafc',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
              </div>

              {/* Residential Address */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label htmlFor="reg-address" style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Residential Address{' '}
                    <span style={{ 
                      color: isAddressValid ? '#16a34a' : '#ef4444', 
                      fontSize: 15, fontWeight: 900, transition: 'color 0.2s' 
                    }}>
                      {isAddressValid ? '✓' : '*'}
                    </span>
                  </label>
                  {isAddressValid && (
                    <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>Valid Address</span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <MapPin size={19} style={{ position: 'absolute', left: 16, top: 16, color: isAddressValid ? '#16a34a' : '#94a3b8' }} />
                  <input
                    id="reg-address"
                    type="text"
                    value={form.address}
                    onChange={set('address')}
                    onBlur={markTouched('address')}
                    placeholder="Flat no., Street, Area/Locality"
                    style={{
                      width: '100%', height: 50, paddingLeft: 46, paddingRight: 16, borderRadius: 12,
                      border: isAddressValid ? '2px solid #16a34a' : (touched.address ? '2px solid #ef4444' : '1.5px solid #cbd5e1'),
                      fontSize: 15, color: '#0f172a', outline: 'none', background: isAddressValid ? '#f0fdf4' : '#f8fafc',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
              </div>

              {/* Ward & City Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label htmlFor="reg-ward" style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Ward{' '}
                      <span style={{ color: isWardValid ? '#16a34a' : '#ef4444', fontSize: 15, fontWeight: 900 }}>
                        {isWardValid ? '✓' : '*'}
                      </span>
                    </label>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={19} style={{ position: 'absolute', left: 14, top: 16, color: isWardValid ? '#16a34a' : '#94a3b8' }} />
                    <input
                      id="reg-ward"
                      type="text"
                      value={form.ward}
                      onChange={set('ward')}
                      onBlur={markTouched('ward')}
                      placeholder="e.g. Ward 12"
                      style={{
                        width: '100%', height: 50, paddingLeft: 42, paddingRight: 12, borderRadius: 12,
                        border: isWardValid ? '2px solid #16a34a' : (touched.ward ? '2px solid #ef4444' : '1.5px solid #cbd5e1'),
                        fontSize: 14.5, color: '#0f172a', outline: 'none', background: isWardValid ? '#f0fdf4' : '#f8fafc',
                        transition: 'all 0.2s'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label htmlFor="reg-city" style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      City{' '}
                      <span style={{ color: isCityValid ? '#16a34a' : '#ef4444', fontSize: 15, fontWeight: 900 }}>
                        {isCityValid ? '✓' : '*'}
                      </span>
                    </label>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={19} style={{ position: 'absolute', left: 14, top: 16, color: isCityValid ? '#16a34a' : '#94a3b8' }} />
                    <input
                      id="reg-city"
                      type="text"
                      value={form.city}
                      onChange={set('city')}
                      onBlur={markTouched('city')}
                      placeholder="e.g. Chennai"
                      style={{
                        width: '100%', height: 50, paddingLeft: 42, paddingRight: 12, borderRadius: 12,
                        border: isCityValid ? '2px solid #16a34a' : (touched.city ? '2px solid #ef4444' : '1.5px solid #cbd5e1'),
                        fontSize: 14.5, color: '#0f172a', outline: 'none', background: isCityValid ? '#f0fdf4' : '#f8fafc',
                        transition: 'all 0.2s'
                      }}
                    />
                  </div>
                </div>

              </div>

              {/* State & PIN Code Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                
                <div>
                  <label htmlFor="reg-state" style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    State
                  </label>
                  <input
                    id="reg-state"
                    type="text"
                    value={form.state}
                    onChange={set('state')}
                    placeholder="e.g. Tamil Nadu"
                    style={{
                      width: '100%', height: 50, paddingLeft: 16, paddingRight: 12, borderRadius: 12,
                      border: '1.5px solid #cbd5e1', fontSize: 14.5, color: '#0f172a', outline: 'none', background: '#f8fafc'
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label htmlFor="reg-pincode" style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      PIN Code (6 digits){' '}
                      <span style={{ color: isPincodeValid ? '#16a34a' : '#ef4444', fontSize: 15, fontWeight: 900 }}>
                        {isPincodeValid ? '✓' : '*'}
                      </span>
                    </label>
                  </div>
                  <input
                    id="reg-pincode"
                    type="text"
                    maxLength={6}
                    value={form.pincode}
                    onChange={set('pincode')}
                    onBlur={markTouched('pincode')}
                    placeholder="600001"
                    style={{
                      width: '100%', height: 50, paddingLeft: 16, paddingRight: 12, borderRadius: 12,
                      border: isPincodeValid ? '2px solid #16a34a' : (touched.pincode ? '2px solid #ef4444' : '1.5px solid #cbd5e1'),
                      fontSize: 14.5, color: '#0f172a', outline: 'none', background: isPincodeValid ? '#f0fdf4' : '#f8fafc',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>

              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  style={{
                    height: 52, padding: '0 24px', borderRadius: 12, border: '1.5px solid #cbd5e1',
                    background: '#ffffff', color: '#334155', fontWeight: 800, fontSize: 15, cursor: 'pointer'
                  }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1, height: 52, borderRadius: 12, border: 'none',
                    background: isStep2Valid ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#ffffff', fontWeight: 800, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 20px rgba(22,163,74,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    opacity: loading ? 0.8 : 1
                  }}
                >
                  {loading ? 'Registering...' : '✅ Complete Registration'}
                </button>
              </div>

            </form>
          )}

          <div style={{ textAlign: 'left', fontSize: 14, marginTop: 4 }}>
            <span style={{ color: '#64748b', fontWeight: 500 }}>Already have an account? </span>
            <Link to="/login" style={{ color: '#2563eb', fontWeight: 800, textDecoration: 'none' }}>
              Sign In Here
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}

export default RegisterPage;
