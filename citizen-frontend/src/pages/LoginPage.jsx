import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import keycloak from '../keycloak.js';
import heroImg from '../assets/hero_governance.png';
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
  const location = useLocation();
  const initialRoleParam = new URLSearchParams(location.search).get('role') || new URLSearchParams(location.search).get('portal');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginRole, setLoginRole] = useState(() => {
    if (initialRoleParam === 'admin' || initialRoleParam === 'officer') return 'officer';
    return 'citizen';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showTestCreds, setShowTestCreds] = useState(false);

  useEffect(() => {
    const roleParam = new URLSearchParams(location.search).get('role') || new URLSearchParams(location.search).get('portal');
    if (roleParam === 'admin' || roleParam === 'officer') {
      setLoginRole('officer');
    } else if (roleParam === 'citizen') {
      setLoginRole('citizen');
    }
  }, [location.search]);

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

  // ═══════════════════════════════════════════════════════════════
  // ██  REDESIGNED LOGIN PAGE — MATCHING REFERENCE IMAGE        ██
  // ═══════════════════════════════════════════════════════════════

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: '#0f172a',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #eff6ff 100%)'
    }}>
      
      {/* ── Left Panel — Government Building Illustration (Wider, Perfectly Aligned & Premium Light Theme) ── */}
      <div style={{
        flex: '1 1 58%',
        minWidth: 500,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #eff6ff 100%)',
        borderRight: '1px solid #e2e8f0',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '44px 60px',
        boxSizing: 'border-box',
        minHeight: '100vh'
      }}>
        {/* Ambient background glowing orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: '60%', height: '60%', background: '#2563eb', opacity: 0.04, borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '50%', height: '50%', background: '#10b981', opacity: 0.04, borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none' }} />

        {/* 1. Top Brand Bar Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', zIndex: 2 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(37,99,235,0.35)'
            }}>
              <Landmark size={25} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em' }}>Smart Governance Platform</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>for Administrative Operations with Citizen Assistance</div>
            </div>
          </Link>
        </div>

        {/* 2. Center Content — Hero Illustration, Titles & Trust Badges */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', width: '100%', maxWidth: 660, margin: 'auto', padding: '24px 0' }}>
          <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
            <img 
              src={heroImg}
              alt="Smart Governance Platform"
              style={{ 
                width: '100%', maxWidth: 580, height: 'auto', borderRadius: 24, 
                mixBlendMode: 'multiply',
                objectFit: 'contain',
                filter: 'drop-shadow(0 12px 28px rgba(37,99,235,0.08))'
              }}
            />
          </div>

          <h2 style={{ margin: '24px 0 10px', fontSize: 40, fontWeight: 900, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.04em' }}>
            Smart Governance <span style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Platform</span>
          </h2>
          <p style={{ margin: '0 auto 32px', fontSize: 17, color: '#475569', lineHeight: 1.55, maxWidth: 560, fontWeight: 500 }}>
            for Administrative Operations with Citizen Assistance
          </p>

          {/* Ultra-Premium Glass Trust Badges */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {[
              { icon: ShieldCheck, label: 'SSL Encrypted', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', shadow: 'rgba(16,185,129,0.12)' },
              { icon: KeyRound, label: 'Keycloak SSO', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', shadow: 'rgba(37,99,235,0.12)' },
              { icon: Clock, label: 'Real-Time SLA', color: '#d97706', bg: '#fffbeb', border: '#fde68a', shadow: 'rgba(245,158,11,0.12)' }
            ].map((b, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 26px', borderRadius: 100,
                background: b.bg, border: `1.5px solid ${b.border}`,
                boxShadow: `0 4px 16px ${b.shadow}`,
                fontSize: 14.5, fontWeight: 700, color: '#1e293b',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${b.shadow}`;
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = `0 4px 16px ${b.shadow}`;
              }}
              >
                <b.icon size={19} color={b.color} />
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Bottom Footer — Back to Home Button & Copyright */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', zIndex: 2 }}>
          <Link to="/" style={{ 
            textDecoration: 'none',
            color: '#334155', background: '#ffffff', border: '1.5px solid #cbd5e1',
            padding: '11px 24px', borderRadius: 14,
            boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
            fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.2s'
          }}
            onMouseOver={e => {
              e.currentTarget.style.color = '#2563eb';
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(37,99,235,0.15)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.color = '#334155';
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.05)';
            }}
          >
            <ArrowLeft size={18} /> Back to Home
          </Link>
          <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
            © 2026 Smart Governance Platform
          </div>
        </div>
      </div>

      {/* ── Right Panel — Login Form Card (Wider, Bigger Inputs & Perfectly Aligned) ── */}
      <div style={{
        flex: '1 1 42%',
        minWidth: 460,
        padding: '60px 6%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        position: 'relative'
      }}>
        <div style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Header */}
          <div>
            {/* Government Logo */}
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 22px rgba(37,99,235,0.3)', marginBottom: 18
            }}>
              <Landmark size={28} color="#ffffff" />
            </div>
            <h2 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Smart Governance Platform
            </h2>
            <p style={{ margin: '0 0 6px', fontSize: 14, color: '#64748b', fontWeight: 500 }}>
              for Administrative Operations with Citizen Assistance
            </p>

            {/* Role Label with decorative dots */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
              <span style={{
                fontSize: 13, fontWeight: 800, color: loginRole === 'citizen' ? '#2563eb' : '#7c3aed',
                textTransform: 'uppercase', letterSpacing: '0.06em'
              }}>
                {loginRole === 'citizen' ? 'Citizen' : 'Admin'} Login
              </span>
              <div style={{ display: 'flex', gap: 5 }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: i < 3 ? (loginRole === 'citizen' ? '#2563eb' : '#7c3aed') : '#e2e8f0'
                  }} />
                ))}
              </div>
            </div>
          </div>

          {/* Portal Selector Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <button type="button" onClick={() => setLoginRole('citizen')} style={{
              padding: '16px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
              background: loginRole === 'citizen' ? 'rgba(37,99,235,0.06)' : '#fafafa',
              border: loginRole === 'citizen' ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
              boxShadow: loginRole === 'citizen' ? '0 6px 18px rgba(37,99,235,0.12)' : 'none',
              transition: 'all 0.2s', outline: 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: loginRole === 'citizen' ? '#2563eb' : '#f1f5f9', color: loginRole === 'citizen' ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: loginRole === 'citizen' ? '#2563eb' : '#334155' }}>Citizen Portal</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Complaints & Services</div>
                </div>
              </div>
            </button>

            <button type="button" onClick={() => setLoginRole('officer')} style={{
              padding: '16px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
              background: loginRole === 'officer' ? 'rgba(124,58,237,0.06)' : '#fafafa',
              border: loginRole === 'officer' ? '2px solid #7c3aed' : '1.5px solid #e2e8f0',
              boxShadow: loginRole === 'officer' ? '0 6px 18px rgba(124,58,237,0.12)' : 'none',
              transition: 'all 0.2s', outline: 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: loginRole === 'officer' ? '#7c3aed' : '#f1f5f9', color: loginRole === 'officer' ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: loginRole === 'officer' ? '#7c3aed' : '#334155' }}>Officer Portal</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Review & Approve</div>
                </div>
              </div>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 12, padding: '14px 16px', color: '#dc2626', fontSize: 13.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <div style={{ lineHeight: 1.4 }}>{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleCustomLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email / Username */}
            <div>
              <label htmlFor="login-email" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Username / Email <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', left: 14, top: 16, color: '#94a3b8' }} />
                <input
                  id="login-email" type="text" value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors({ ...fieldErrors, email: null }); }}
                  placeholder="citizen1@gmail.com"
                  style={{
                    width: '100%', height: 52, paddingLeft: 46, paddingRight: 16, borderRadius: 12,
                    border: fieldErrors.email ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
                    fontSize: 15, color: '#0f172a', boxSizing: 'border-box', outline: 'none',
                    background: '#fafafa', transition: 'all 0.2s'
                  }}
                  onFocus={e => { if(!fieldErrors.email) { e.target.style.borderColor = loginRole === 'citizen' ? '#2563eb' : '#7c3aed'; e.target.style.boxShadow = `0 0 0 3.5px ${loginRole === 'citizen' ? 'rgba(37,99,235,0.12)' : 'rgba(124,58,237,0.12)'}` }}}
                  onBlur={e => { if(!fieldErrors.email) { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}}
                />
              </div>
              {fieldErrors.email && <div style={{ fontSize: 12.5, color: '#ef4444', marginTop: 5, fontWeight: 600 }}>{fieldErrors.email}</div>}
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label htmlFor="login-password" style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please contact system administrator or use Keycloak SSO reset option.'); }}
                  style={{ fontSize: 13, fontWeight: 700, color: loginRole === 'citizen' ? '#2563eb' : '#7c3aed', textDecoration: 'none' }}>
                  Forgot Password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: 14, top: 16, color: '#94a3b8' }} />
                <input
                  id="login-password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors({ ...fieldErrors, password: null }); }}
                  placeholder="••••••••"
                  style={{
                    width: '100%', height: 52, paddingLeft: 46, paddingRight: 48, borderRadius: 12,
                    border: fieldErrors.password ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
                    fontSize: 15, color: '#0f172a', boxSizing: 'border-box', outline: 'none',
                    background: '#fafafa', transition: 'all 0.2s'
                  }}
                  onFocus={e => { if(!fieldErrors.password) { e.target.style.borderColor = loginRole === 'citizen' ? '#2563eb' : '#7c3aed'; e.target.style.boxShadow = `0 0 0 3.5px ${loginRole === 'citizen' ? 'rgba(37,99,235,0.12)' : 'rgba(124,58,237,0.12)'}` }}}
                  onBlur={e => { if(!fieldErrors.password) { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {fieldErrors.password && <div style={{ fontSize: 12.5, color: '#ef4444', marginTop: 5, fontWeight: 600 }}>{fieldErrors.password}</div>}
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="rememberMe" checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: loginRole === 'citizen' ? '#2563eb' : '#7c3aed', borderRadius: 4 }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: 14, color: '#334155', cursor: 'pointer', fontWeight: 600 }}>Remember me</label>
            </div>

            {/* Login Button */}
            <button type="submit" disabled={loading} style={{
              height: 52, borderRadius: 12, border: 'none',
              background: loginRole === 'citizen' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: '#ffffff', fontWeight: 800, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loginRole === 'citizen' ? '0 8px 20px rgba(37,99,235,0.3)' : '0 8px 20px rgba(124,58,237,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.2s', opacity: loading ? 0.8 : 1
            }}
              onMouseOver={e => { if(!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = loginRole === 'citizen' ? '0 12px 26px rgba(37,99,235,0.4)' : '0 12px 26px rgba(124,58,237,0.4)' }}}
              onMouseOut={e => { if(!loading) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = loginRole === 'citizen' ? '0 8px 20px rgba(37,99,235,0.3)' : '0 8px 20px rgba(124,58,237,0.3)' }}}
            >
              {loading ? 'Authenticating...' : (
                <>Login <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Role switch prompt */}
          <div style={{ textAlign: 'center', fontSize: 14.5, color: '#475569', padding: '2px 0' }}>
            {loginRole === 'citizen' ? (
              <>Are you an officer? <button type="button" onClick={() => setLoginRole('officer')} style={{ background: 'none', border: 'none', color: '#7c3aed', fontWeight: 700, cursor: 'pointer', fontSize: 14.5, textDecoration: 'underline' }}>Login as Officer</button></>
            ) : (
              <>Are you a citizen? <button type="button" onClick={() => setLoginRole('citizen')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: 14.5, textDecoration: 'underline' }}>Login as Citizen</button></>
            )}
          </div>

          {/* Demo Credentials Drawer */}
          <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
            <button type="button" onClick={() => setShowTestCreds(!showTestCreds)} style={{
              width: '100%', padding: '14px 18px', background: 'none', border: 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer', color: '#334155', fontWeight: 700, fontSize: 14, transition: 'background 0.2s'
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
                <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.4 }}>Click any handle to auto-fill (Password: <strong style={{ color: '#0f172a' }}>Password123</strong>):</p>
                
                <div style={{ background: '#ffffff', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={14} /> Citizens
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['citizen1@gmail.com', 'citizen2@gmail.com', 'citizen3@gmail.com', 'citizen4@gmail.com'].map(u => (
                      <button key={u} type="button" onClick={() => autofillCredentials(u, 'citizen')}
                        style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', padding: '6px 10px', borderRadius: 8, fontSize: 12, fontFamily: 'monospace', cursor: 'pointer', fontWeight: 600, color: '#334155', transition: 'all 0.15s' }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#1e40af'; e.currentTarget.style.background = '#eff6ff' }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#334155'; e.currentTarget.style.background = '#f8fafc' }}
                      >{u}</button>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Briefcase size={14} /> Department Officers
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                      { user: 'john', dept: 'Health' }, { user: 'mark', dept: 'Revenue' },
                      { user: 'ryan', dept: 'Municipal' }, { user: 'chris', dept: 'Water' },
                      { user: 'ethan', dept: 'Roads' }, { user: 'jack', dept: 'Electricity' },
                      { user: 'david', dept: 'Social Welfare' }, { user: 'will', dept: 'Urban' },
                      { user: 'emily', dept: 'Education' },
                    ].map(o => (
                      <button key={o.user} type="button" onClick={() => autofillCredentials(o.user, 'officer')}
                        style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', padding: '6px 10px', borderRadius: 8, fontSize: 12, fontFamily: 'monospace', cursor: 'pointer', fontWeight: 600, color: '#334155', transition: 'all 0.15s' }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.color = '#5b21b6'; e.currentTarget.style.background = '#f5f3ff' }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#334155'; e.currentTarget.style.background = '#f8fafc' }}
                      >
                        {o.user} <span style={{ color: '#94a3b8', fontSize: 11 }}>({o.dept})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prominent & Neat Register Link */}
          <div style={{ 
            textAlign: 'center', fontSize: 15, padding: '16px 20px', 
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
            borderRadius: 14, border: '1.5px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap'
          }}>
            <span style={{ color: '#475569', fontWeight: 500 }}>Don't have an account?</span>
            <Link to="/register" style={{ 
              color: '#2563eb', fontWeight: 800, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 4,
              transition: 'all 0.2s'
            }}
              onMouseOver={e => { e.currentTarget.style.color = '#1d4ed8'; e.currentTarget.style.transform = 'translateX(2px)'; }}
              onMouseOut={e => { e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.transform = 'none'; }}
            >
              Register as Citizen <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;
