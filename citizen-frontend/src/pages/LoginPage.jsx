import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import keycloak from '../keycloak.js';
import { 
  Landmark, ShieldAlert, User, Briefcase, Lock, Eye, EyeOff, 
  ArrowLeft, ArrowRight, ShieldCheck, KeyRound, Globe, Sparkles, 
  ChevronDown, ChevronUp, Clock, Award
} from 'lucide-react';

const decodeJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginRole, setLoginRole] = useState('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showTestCreds, setShowTestCreds] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cp_remember_email');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Username or email is required.';
    if (!password) errs.password = 'Password is required.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('client_id', 'civicpulse-frontend');
      
      let finalUsername = email.trim();
      if (finalUsername === 'citizen4') {
        finalUsername = 'citizen4@gmail.com';
      }
      
      const officerMap = {
        john: 'john@muni.gov',
        mark: 'mark@muni.gov',
        ryan: 'ryan@muni.gov',
        chris: 'chris@muni.gov',
        ethan: 'ethan@muni.gov',
        jack: 'jack@muni.gov',
        david: 'david@muni.gov',
        will: 'will@muni.gov',
        emily: 'emily@muni.gov'
      };
      if (officerMap[finalUsername.toLowerCase()]) {
        finalUsername = officerMap[finalUsername.toLowerCase()];
      }

      params.append('username', finalUsername);
      params.append('password', password);

      const response = await axios.post(
        'http://localhost:8180/realms/civicpulse/protocol/openid-connect/token',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token, refresh_token, id_token } = response.data;

      // Validate Portal vs Role before accepting tokens
      const payload = decodeJwt(access_token);
      const roles = payload?.realm_access?.roles || [];
      const isCitizenRole = roles.includes('CITIZEN') || roles.includes('citizen');
      const isOfficerRole = roles.includes('OFFICER') || roles.includes('officer');
      const isAdminRole = roles.includes('ADMIN') || roles.includes('admin');

      if (loginRole === 'citizen') {
        if (isOfficerRole || isAdminRole) {
          setError('Access Denied. This account belongs to the Officer Portal. Please login using the Officer Portal.');
          setLoading(false);
          return;
        }
      } else if (loginRole === 'officer') {
        if (isCitizenRole && !isOfficerRole && !isAdminRole) {
          setError('Access Denied. Citizen accounts can only login through the Citizen Portal. Please switch to the Citizen Portal.');
          setLoading(false);
          return;
        }
      }

      // Save credentials if valid
      if (rememberMe) {
        localStorage.setItem('cp_remember_email', email);
      } else {
        localStorage.removeItem('cp_remember_email');
      }

      localStorage.setItem('kc_token', access_token);
      localStorage.setItem('kc_refreshToken', refresh_token);
      if (id_token) {
        localStorage.setItem('kc_idToken', id_token);
      }

      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Direct grant login failed:', err);
      if (err.response) {
        const errorDesc = err.response.data?.error_description || 'Invalid credentials or login flow not supported.';
        setError(errorDesc);
      } else {
        setError('Cannot connect to identity server. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleKeycloakSSORedirect = () => {
    keycloak.login({ redirectUri: window.location.origin + '/dashboard' });
  };

  const autofillCredentials = (userHandle, role = 'citizen') => {
    setEmail(userHandle);
    setPassword('Password123');
    setLoginRole(role);
    setFieldErrors({});
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'row',
      flexWrap: 'wrap',
      background: '#fafbfe',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif", 
      color: '#0f172a'
    }}>
      
      {/* ── Left Hero Panel (Matches image_1.png exactly) ── */}
      <div style={{
        flex: '1 1 48%',
        minWidth: 360,
        background: 'linear-gradient(145deg, #f3f6ff 0%, #ebf0fe 50%, #f6f3ff 100%)',
        position: 'relative', 
        overflow: 'hidden',
        padding: '52px 60px', 
        color: '#0f172a', 
        display: 'flex', 
        flexDirection: 'column',
        justify: 'space-between',
        borderRight: '1px solid #e2e8f0'
      }}>
        {/* Soft background ambient highlights */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60%', height: '60%', background: '#3b82f6', opacity: 0.06, borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '60%', height: '60%', background: '#8b5cf6', opacity: 0.06, borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />

        {/* Top Brand Header */}
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 16, zIndex: 2 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(37,99,235,0.3)', border: '1px solid rgba(255,255,255,0.4)'
          }}>
            <Landmark size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Smart Governance <span style={{ color: '#2563eb' }}>Platform</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>
              Government Administration & Citizen Services
            </div>
          </div>
        </Link>

        {/* Hero Middle Content (Fills full width, perfectly aligned) */}
        <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', gap: 24, width: '100%', margin: '40px 0' }}>
          
          {/* Badge Pill */}
          <div style={{
            background: 'rgba(37, 99, 235, 0.07)', 
            border: '1px solid rgba(37, 99, 235, 0.2)',
            padding: '8px 18px', 
            borderRadius: 30, 
            fontSize: 12.5, 
            fontWeight: 800, 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 10, 
            alignSelf: 'flex-start', 
            color: '#1e40af'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            IN Smart Governance Platform for Administrative Operations with Citizen Assistance
          </div>

          {/* Headline */}
          <h1 style={{ margin: 0, fontSize: 42, fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em', color: '#0f172a' }}>
            Unified Access to <br />
            <span style={{ 
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', 
              WebkitBackgroundClip: 'text', 
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              display: 'inline-block'
            }}>
              Public Governance Services
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{ margin: 0, fontSize: 15.5, color: '#475569', lineHeight: 1.6, fontWeight: 500, maxWidth: '95%' }}>
            File grievances, track real-time SLA officer deadlines, apply for birth & residence certificates, and access government welfare schemes from one secure platform.
          </p>

          {/* 2x2 Trust Badges Grid (Full Width) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%', paddingTop: 4 }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '14px 18px', borderRadius: 14, fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12, color: '#1e293b', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <ShieldCheck size={20} color="#16a34a" /> <span>256-bit SSL Encrypted</span>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '14px 18px', borderRadius: 14, fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12, color: '#1e293b', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <KeyRound size={20} color="#0284c7" /> <span>Keycloak SSO Secured</span>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '14px 18px', borderRadius: 14, fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12, color: '#1e293b', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <Clock size={20} color="#d97706" /> <span>Real-Time SLA Tracker</span>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '14px 18px', borderRadius: 14, fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12, color: '#1e293b', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <Award size={20} color="#7c3aed" /> <span>Digital Certificates</span>
            </div>
          </div>

          {/* Quick Metrics Bar (3 Equal Columns, Full Width) */}
          <div style={{
            marginTop: 6,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: '22px 20px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            alignItems: 'center',
            textAlign: 'center',
            width: '100%',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}>
            <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: 12 }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#2563eb', lineHeight: 1 }}>250K+</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>CITIZENS</div>
            </div>
            <div style={{ borderRight: '1px solid #e2e8f0', paddingLeft: 12, paddingRight: 12 }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981', lineHeight: 1 }}>99.4%</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>SLA TARGET</div>
            </div>
            <div style={{ paddingLeft: 12 }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#d97706', lineHeight: 1 }}>24/7</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>AVAILABLE</div>
            </div>
          </div>

        </div>

        {/* Left Panel Footer */}
        <div style={{ 
          zIndex: 2, 
          fontSize: 13, 
          color: '#64748b', 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center', 
          fontWeight: 500,
          borderTop: '1px solid #e2e8f0',
          paddingTop: 20,
          width: '100%'
        }}>
          <Link to="/" style={{ color: '#334155', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#2563eb'} onMouseOut={e => e.target.style.color = '#334155'}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>

      {/* ── Right Form Container (Centered & Clean) ── */}
      <div style={{
        flex: '1 1 52%',
        minWidth: 360,
        padding: '52px 8%',
        display: 'flex', 
        alignItems: 'center', 
        justify: 'center',
        background: '#ffffff', 
        position: 'relative'
      }}>
        <div style={{
          width: '100%', 
          maxWidth: 480,
          display: 'flex', 
          flexDirection: 'column', 
          gap: 24, 
          zIndex: 1, 
          position: 'relative'
        }}>
          
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 11.5, fontWeight: 900, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              E-GOVERNANCE SINGLE SIGN-ON
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Sign In to Your Account
            </h2>
            <p style={{ margin: 0, fontSize: 14.5, color: '#64748b', lineHeight: 1.5, fontWeight: 500 }}>
              Select your portal role below to access citizen services or administrative operations.
            </p>
          </div>

          {/* Portal Selector Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <button
              type="button"
              onClick={() => setLoginRole('citizen')}
              style={{
                padding: '16px', borderRadius: 16, textAlign: 'left', cursor: 'pointer',
                background: loginRole === 'citizen' ? 'rgba(59,130,246,0.06)' : '#ffffff',
                border: loginRole === 'citizen' ? '2px solid #3b82f6' : '1.5px solid #cbd5e1',
                boxShadow: loginRole === 'citizen' ? '0 4px 16px rgba(59,130,246,0.12)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none'
              }}
              onMouseOver={e => { if(loginRole !== 'citizen') e.currentTarget.style.borderColor = '#93c5fd' }}
              onMouseOut={e => { if(loginRole !== 'citizen') e.currentTarget.style.borderColor = '#cbd5e1' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: loginRole === 'citizen' ? '#3b82f6' : '#f1f5f9', color: loginRole === 'citizen' ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                  <User size={20} />
                </div>
                {loginRole === 'citizen' && <span style={{ fontSize: 11, fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '3px 10px', borderRadius: 12, border: '1px solid #86efac' }}>Active</span>}
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: loginRole === 'citizen' ? '#3b82f6' : '#334155' }}>Citizen Portal</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, fontWeight: 500 }}>Complaints & Applications</div>
            </button>

            <button
              type="button"
              onClick={() => setLoginRole('officer')}
              style={{
                padding: '16px', borderRadius: 16, textAlign: 'left', cursor: 'pointer',
                background: loginRole === 'officer' ? 'rgba(139,92,246,0.06)' : '#ffffff',
                border: loginRole === 'officer' ? '2px solid #8b5cf6' : '1.5px solid #cbd5e1',
                boxShadow: loginRole === 'officer' ? '0 4px 16px rgba(139,92,246,0.12)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none'
              }}
              onMouseOver={e => { if(loginRole !== 'officer') e.currentTarget.style.borderColor = '#c4b5fd' }}
              onMouseOut={e => { if(loginRole !== 'officer') e.currentTarget.style.borderColor = '#cbd5e1' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: loginRole === 'officer' ? '#8b5cf6' : '#f1f5f9', color: loginRole === 'officer' ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                  <Briefcase size={20} />
                </div>
                {loginRole === 'officer' && <span style={{ fontSize: 11, fontWeight: 800, color: '#6d28d9', background: '#ede9fe', padding: '3px 10px', borderRadius: 12, border: '1px solid #c4b5fd' }}>Active</span>}
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: loginRole === 'officer' ? '#8b5cf6' : '#334155' }}>Officer Portal</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, fontWeight: 500 }}>Review & Approve Tasks</div>
            </button>
          </div>

          {/* Alert Message */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 16px',
              color: '#dc2626', fontSize: 13.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10
            }}>
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <div style={{ lineHeight: 1.4 }}>{error}</div>
            </div>
          )}

          {/* Main Login Form */}
          <form onSubmit={handleCustomLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            <div>
              <label htmlFor="login-email" style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                USERNAME OR EMAIL ADDRESS <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', left: 16, top: 16, color: '#94a3b8' }} />
                <input
                  id="login-email"
                  type="text"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors({ ...fieldErrors, email: null }); }}
                  placeholder="citizen1@gmail.com"
                  style={{
                    width: '100%', height: 52, paddingLeft: 48, paddingRight: 16, borderRadius: 12,
                    border: fieldErrors.email ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
                    fontSize: 15, color: '#0f172a', boxSizing: 'border-box', outline: 'none',
                    transition: 'all 0.2s', background: '#f8fafc'
                  }}
                  onFocus={e => { if(!fieldErrors.email) { e.target.style.borderColor = loginRole === 'citizen' ? '#3b82f6' : '#8b5cf6'; e.target.style.boxShadow = loginRole === 'citizen' ? '0 0 0 3px rgba(59,130,246,0.15)' : '0 0 0 3px rgba(139,92,246,0.15)'; } }}
                  onBlur={e => { if(!fieldErrors.email) { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; } }}
                />
              </div>
              {fieldErrors.email && <div style={{ fontSize: 12.5, color: '#ef4444', marginTop: 5, fontWeight: 600 }}>{fieldErrors.email}</div>}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label htmlFor="login-password" style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  PASSWORD <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); alert('Please contact system administrator or use Keycloak SSO reset option.'); }}
                  style={{ fontSize: 12.5, fontWeight: 700, color: loginRole === 'citizen' ? '#2563eb' : '#8b5cf6', textDecoration: 'none' }}
                >
                  Forgot Password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: 16, top: 16, color: '#94a3b8' }} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors({ ...fieldErrors, password: null }); }}
                  placeholder="••••••••"
                  style={{
                    width: '100%', height: 52, paddingLeft: 48, paddingRight: 48, borderRadius: 12,
                    border: fieldErrors.password ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
                    fontSize: 15, color: '#0f172a', boxSizing: 'border-box', outline: 'none',
                    transition: 'all 0.2s', background: '#f8fafc'
                  }}
                  onFocus={e => { if(!fieldErrors.password) { e.target.style.borderColor = loginRole === 'citizen' ? '#3b82f6' : '#8b5cf6'; e.target.style.boxShadow = loginRole === 'citizen' ? '0 0 0 3px rgba(59,130,246,0.15)' : '0 0 0 3px rgba(139,92,246,0.15)'; } }}
                  onBlur={e => { if(!fieldErrors.password) { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; } }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: 15, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {fieldErrors.password && <div style={{ fontSize: 12.5, color: '#ef4444', marginTop: 5, fontWeight: 600 }}>{fieldErrors.password}</div>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: 17, height: 17, cursor: 'pointer', accentColor: loginRole === 'citizen' ? '#2563eb' : '#7c3aed', borderRadius: 4 }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: 13.5, color: '#475569', cursor: 'pointer', fontWeight: 600, userSelect: 'none' }}>
                Remember my username
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                height: 52, borderRadius: 12, border: 'none',
                background: loginRole === 'citizen' ? 'linear-gradient(135deg, #1d4ed8, #2563eb)' : 'linear-gradient(135deg, #6d28d9, #7c3aed)',
                color: '#ffffff', fontWeight: 800, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loginRole === 'citizen' ? '0 8px 20px rgba(37,99,235,0.25)' : '0 8px 20px rgba(124,58,237,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                marginTop: 6, transition: 'all 0.2s',
                opacity: loading ? 0.8 : 1
              }}
              onMouseOver={e => { if(!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseOut={e => { if(!loading) e.currentTarget.style.transform = 'none' }}
            >
              {loading ? (
                <>Authenticating...</>
              ) : (
                <>🔐 Sign In as {loginRole === 'citizen' ? 'Citizen' : 'Department Officer'} <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          <button
            type="button"
            onClick={handleKeycloakSSORedirect}
            style={{
              height: 50, borderRadius: 12, background: '#ffffff', color: '#334155',
              border: '1.5px solid #cbd5e1', fontWeight: 800, fontSize: 15, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)', transition: 'all 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#94a3b8' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1' }}
          >
            <Globe size={20} color="#0284c7" /> Use Keycloak Single Sign-On (SSO)
          </button>

          {/* Quick-Fill Demo Credentials Drawer */}
          <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', marginTop: 4 }}>
            <button
              type="button"
              onClick={() => setShowTestCreds(!showTestCreds)}
              style={{
                width: '100%', padding: '14px 18px', background: 'none', border: 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer', color: '#334155', fontWeight: 800, fontSize: 13.5,
                transition: 'background 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseOut={e => e.currentTarget.style.background = 'none'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} color="#0ea5e9" />
                <span>Quick-Fill Demo Credentials</span>
              </div>
              {showTestCreds ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
            </button>

            {showTestCreds && (
              <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
                <p style={{ margin: 0, fontSize: 12.5, color: '#64748b', lineHeight: 1.4 }}>Click any handle to auto-fill (Password: <strong style={{ color: '#0f172a' }}>Password123</strong>):</p>
                
                <div style={{ background: '#ffffff', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#1e40af', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={13} /> Citizens
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['citizen1@gmail.com', 'citizen2@gmail.com', 'citizen3@gmail.com', 'citizen4@gmail.com'].map(u => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => autofillCredentials(u, 'citizen')}
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontFamily: 'monospace', cursor: 'pointer', fontWeight: 700, color: '#334155', transition: 'all 0.15s' }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#1e40af' }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#334155' }}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#6d28d9', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Briefcase size={13} /> Department Officers
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                      { user: 'john', dept: 'Health' },
                      { user: 'mark', dept: 'Revenue' },
                      { user: 'ryan', dept: 'Municipal' },
                      { user: 'chris', dept: 'Water' },
                      { user: 'ethan', dept: 'Roads' },
                      { user: 'jack', dept: 'Electricity' },
                      { user: 'david', dept: 'Social Welfare' },
                      { user: 'will', dept: 'Urban' },
                      { user: 'emily', dept: 'Education' },
                    ].map(o => (
                      <button
                        key={o.user}
                        type="button"
                        onClick={() => autofillCredentials(o.user, 'officer')}
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontFamily: 'monospace', cursor: 'pointer', fontWeight: 700, color: '#334155', transition: 'all 0.15s' }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.color = '#5b21b6' }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#334155' }}
                      >
                        {o.user} <span style={{ color: '#94a3b8', fontSize: 10.5 }}>({o.dept})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'left', fontSize: 14 }}>
            <span style={{ color: '#64748b', fontWeight: 500 }}>Don't have an account? </span>
            <Link to="/register" style={{ color: '#2563eb', fontWeight: 800, textDecoration: 'none' }} onMouseOver={e => e.target.style.textDecoration = 'underline'} onMouseOut={e => e.target.style.textDecoration = 'none'}>
              Register as Citizen
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}

export default LoginPage;
