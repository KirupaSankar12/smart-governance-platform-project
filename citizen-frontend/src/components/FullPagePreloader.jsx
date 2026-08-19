import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sparkles } from 'lucide-react';

export default function FullPagePreloader() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 99999,
        background: isDark ? '#090d16' : '#fafafa',
        color: isDark ? '#f8fafc' : '#0f172a',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        transition: 'background 0.3s ease',
      }}
    >
      {/* Multi-Color Dual Conic Spinner Ring */}
      <div style={{ position: 'relative', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Outer Rainbow Conic Ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            padding: '3.5px',
            background: 'conic-gradient(from 0deg, #f43f5e, #8b5cf6, #3b82f6, #06b6d4, #10b981, #eab308, #f43f5e)',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3.5px), #fff 0)',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3.5px), #fff 0)',
            animation: 'colorfulRainbowSpin 1.2s linear infinite',
            filter: 'drop-shadow(0 0 12px rgba(139,92,246,0.4))',
          }}
        />

        {/* Inner Counter-Rotating Gradient Ring */}
        <div
          style={{
            position: 'absolute',
            inset: 10,
            borderRadius: '50%',
            padding: '2.5px',
            background: 'conic-gradient(from 180deg, #06b6d4, #ec4899, #8b5cf6, #3b82f6, #06b6d4)',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2.5px), #fff 0)',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 2.5px), #fff 0)',
            animation: 'colorfulCounterSpin 0.9s linear infinite',
          }}
        />

        {/* Glowing Center Icon */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(124, 58, 237, 0.4)', zIndex: 2
        }}>
          <Sparkles size={18} />
        </div>
      </div>

      {/* Colorful Gradient Shimmer Text */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <h2
          style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 900,
            background: 'linear-gradient(90deg, #f43f5e, #8b5cf6, #3b82f6, #06b6d4, #10b981, #eab308, #f43f5e)',
            backgroundSize: '300% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'rainbowTextShimmer 3s linear infinite',
            letterSpacing: '-0.02em',
          }}
        >
          Smart Governance Platform
        </h2>

        <p
          style={{
            margin: 0,
            fontSize: '13px',
            fontWeight: 700,
            color: isDark ? '#94a3b8' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
            animation: 'colorfulDotPulse 1s ease-in-out infinite'
          }} />
          <span style={{
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800
          }}>
            Loading workspace & secure services...
          </span>
        </p>
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes colorfulRainbowSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes colorfulCounterSpin {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes rainbowTextShimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        @keyframes colorfulDotPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
