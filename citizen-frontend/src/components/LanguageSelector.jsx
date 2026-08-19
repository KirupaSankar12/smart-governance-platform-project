import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
];

export default function LanguageSelector({ compact = false }) {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('civicpulse_language', code);
    
    // Dynamically trigger Google Translate element
    try {
      const selectEl = document.querySelector('.goog-te-combo');
      if (selectEl) {
        selectEl.value = code;
        selectEl.dispatchEvent(new Event('change'));
      }
    } catch (e) {
      console.warn('Google Translate not ready:', e);
    }

    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    // Auto-trigger translation on mount
    const saved = localStorage.getItem('civicpulse_language') || 'en';
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const selectEl = document.querySelector('.goog-te-combo');
      if (selectEl) {
        if (selectEl.value !== saved) {
          selectEl.value = saved;
          selectEl.dispatchEvent(new Event('change'));
        }
        clearInterval(interval);
      } else if (attempts > 25) {
        clearInterval(interval);
      }
    }, 200);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(interval);
    };
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Select Interface Language"
        style={{
          height: compact ? 34 : 38,
          padding: compact ? '0 10px' : '0 14px',
          borderRadius: 10,
          background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#ffffff',
          color: isDark ? '#ffffff' : '#0f172a',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.16)' : '1px solid #cbd5e1',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all 0.2s ease',
          boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)'
        }}
      >
        <Globe size={15} style={{ color: '#2563eb' }} />
        <span>{currentLang.native}</span>
        <ChevronDown size={13} style={{ opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 150,
            background: isDark ? '#1e293b' : '#ffffff',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.16)' : '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '6px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.18)',
            zIndex: 10050,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <div style={{
            fontSize: 10,
            fontWeight: 800,
            color: isDark ? '#94a3b8' : '#64748b',
            padding: '4px 10px 6px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            🌐 Language
          </div>

          {LANGUAGES.map((lang) => {
            const isSelected = i18n.language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: 'none',
                  background: isSelected ? (isDark ? 'rgba(37,99,235,0.25)' : '#eff6ff') : 'transparent',
                  color: isSelected ? '#2563eb' : (isDark ? '#f8fafc' : '#0f172a'),
                  fontSize: 13,
                  fontWeight: isSelected ? 800 : 600,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.15s ease'
                }}
              >
                <span>{lang.native}</span>
                {isSelected && <Check size={14} style={{ color: '#2563eb' }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
