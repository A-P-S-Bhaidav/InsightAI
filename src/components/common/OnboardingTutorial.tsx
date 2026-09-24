'use client'

import React, { useState, useEffect } from 'react';
import { Brain, Plus, GitBranch, BarChart3, LayoutDashboard } from 'lucide-react';

interface OnboardingTutorialProps {
  onComplete?: () => void;
}

const STEPS = [
  {
    icon: <Brain size={24} />,
    title: 'Welcome to InsightAI!',
    description: "Your AI-powered data intelligence platform. Let's show you around.",
    color: '#8b5cf6'
  },
  {
    icon: <Plus size={24} />,
    title: 'Create Smart Tasks',
    description: 'Describe the data you need in plain English. Our AI will parse your requirements automatically.',
    color: '#3b82f6'
  },
  {
    icon: <GitBranch size={24} />,
    title: 'Automated Pipelines',
    description: 'InsightAI generates multi-step workflows to collect, validate, and structure your data.',
    color: '#10b981'
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Explore Your Data',
    description: 'View collected datasets in interactive tables and charts. Export as CSV or JSON anytime.',
    color: '#f59e0b'
  },
  {
    icon: <LayoutDashboard size={24} />,
    title: 'Your Command Center',
    description: 'Track all tasks, monitor quality scores, and manage your data operations from this dashboard.',
    color: '#ec4899'
  }
];

export default function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem('insightai_onboarding_done');
    if (done !== 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem('insightai_onboarding_done', 'true');
    setIsVisible(false);
    fetch('/api/user/onboarding', { method: 'PATCH' }).catch(() => {});
    if (onComplete) {
      onComplete();
    }
  };

  if (!isVisible) return null;

  const step = STEPS[currentStep];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        margin: '0 20px',
        background: '#14141e',
        borderRadius: '16px',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Progress bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'rgba(255,255,255,0.1)'
        }}>
          <div style={{
            height: '100%',
            background: step.color,
            width: `${((currentStep + 1) / STEPS.length) * 100}%`,
            transition: 'width 0.3s ease, background 0.3s ease'
          }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: `${step.color}1A`,
            color: step.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}>
            {React.cloneElement(step.icon as React.ReactElement<Record<string, unknown>>, { size: 48 })}
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '24px', textAlign: 'center', color: '#fff' }}>
            {step.title}
          </h2>
          <p style={{ fontSize: '15px', color: '#999', textAlign: 'center', lineHeight: '1.6', marginTop: '12px' }}>
            {step.description}
          </p>

          <div style={{ display: 'flex', gap: '8px', marginTop: '32px' }}>
            {STEPS.map((_, idx) => (
              <div key={idx} style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: idx === currentStep ? step.color : 'rgba(255,255,255,0.2)',
                transition: 'background 0.3s ease'
              }} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px', width: '100%' }}>
            {currentStep < STEPS.length - 1 ? (
              <>
                <button
                  onClick={handleComplete}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Skip
                </button>
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: step.color,
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Next
                </button>
              </>
            ) : (
              <button
                onClick={handleComplete}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: step.color,
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
