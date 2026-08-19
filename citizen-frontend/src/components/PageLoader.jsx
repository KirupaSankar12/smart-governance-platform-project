import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sparkles } from 'lucide-react';

function PageLoader({ message = 'Loading...' }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: '280px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '18px',
        padding: '32px',
        background: 'transparent',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Colorful Conic Spinner Ring */}
      <div style={{ position: 'relative', width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            padding: '3px',
            background: 'conic-gradient(from 0deg, #f43f5e, #8b5cf6, #3b82f6, #06b6d4, #10b981, #eab308, #f43f5e)',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #fff 0)',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #fff 0)',
            animation: 'colorfulPageSpin 1s linear infinite',
            filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.35))',
          }}
        />
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Sparkles size={14} />
        </div>
      </div>

      <p style={{
        fontSize: '14px',
        fontWeight: 800,
        margin: 0,
        background: 'linear-gradient(90deg, #f43f5e, #8b5cf6, #3b82f6, #06b6d4, #10b981, #f43f5e)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'rainbowPageTextShimmer 2.5s linear infinite',
        letterSpacing: '-0.01em'
      }}>
        {message}
      </p>

      <style>{`
        @keyframes colorfulPageSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes rainbowPageTextShimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  );
}

export default PageLoader;
