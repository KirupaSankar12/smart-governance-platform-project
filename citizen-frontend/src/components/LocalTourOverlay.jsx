import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function LocalTourOverlay({ steps, activeStep, setActiveStep, onClose }) {
  const [coords, setCoords] = useState(null);

  const currentStep = steps[activeStep - 1];

  useEffect(() => {
    if (!currentStep) return;

    // Find target element in DOM
    const getCoords = () => {
      if (currentStep.targetKey) {
        const el = document.querySelector(`[data-tour="${currentStep.targetKey}"]`);
        if (el) {
          const rect = el.getBoundingClientRect();
          setCoords({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            bottom: rect.bottom
          });
          return;
        }
      }
      setCoords(null);
    };

    // Scroll element into view when the active step changes
    if (currentStep.targetKey) {
      const el = document.querySelector(`[data-tour="${currentStep.targetKey}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    getCoords();
    
    // Set a timeout to let the smooth scrolling complete before re-evaluating the final position
    const timeoutId = setTimeout(getCoords, 400);

    // Listen to resize and scroll events to keep overlay perfectly positioned in viewport
    window.addEventListener('resize', getCoords);
    window.addEventListener('scroll', getCoords, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', getCoords);
      window.removeEventListener('scroll', getCoords);
    };
  }, [currentStep, activeStep]);

  if (!currentStep) return null;

  const isMobile = window.innerWidth < 640;

  return (
    <>
      {/* 1. Backdrop and cutout */}
      {coords ? (
        <div
          style={{
            position: 'fixed',
            top: coords.top - 6,
            left: coords.left - 6,
            width: coords.width + 12,
            height: coords.height + 12,
            borderRadius: '12px',
            boxShadow: '0 0 0 9999px rgba(9, 13, 22, 0.72)',
            zIndex: 99999,
            pointerEvents: 'none',
            border: '2px solid #a855f7',
            transition: 'all 0.15s ease'
          }}
        />
      ) : (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 13, 22, 0.72)',
            zIndex: 99999,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* 2. Tooltip Card */}
      <div
        style={{
          position: 'fixed',
          zIndex: 100000,
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          width: '380px',
          maxWidth: 'calc(100vw - 32px)',
          transition: 'all 0.15s ease',
          ...(isMobile
            ? {
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)'
              }
            : coords
            ? (() => {
                const spaceBelow = window.innerHeight - coords.bottom;
                const showBelow = spaceBelow > 280;
                return {
                  top: showBelow ? coords.bottom + 16 : Math.max(20, coords.top - 260),
                  left: Math.max(20, Math.min(window.innerWidth - 400, coords.left))
                };
              })()
            : {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              })
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HelpCircle size={18} color="#a855f7" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Step {activeStep} of {steps.length}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
          {currentStep.title}
        </h4>
        <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: '#475569' }}>
          {currentStep.desc}
        </p>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '12px', fontWeight: 700 }}
          >
            Skip
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              disabled={activeStep === 1}
              onClick={() => setActiveStep(prev => prev - 1)}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: '50%', border: '1px solid #cbd5e1',
                background: '#fff', color: activeStep === 1 ? '#cbd5e1' : '#475569',
                cursor: activeStep === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={16} />
            </button>

            {activeStep < steps.length ? (
              <button
                onClick={() => setActiveStep(prev => prev + 1)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '0 14px', height: 32, borderRadius: 16, border: 'none',
                  background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff',
                  fontSize: '12px', fontWeight: 800, cursor: 'pointer'
                }}
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={onClose}
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '0 14px', height: 32, borderRadius: 16, border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
                  fontSize: '12px', fontWeight: 800, cursor: 'pointer'
                }}
              >
                Done!
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
