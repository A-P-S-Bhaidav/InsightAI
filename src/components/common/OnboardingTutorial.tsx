'use client';

import React, { useState, useEffect } from 'react';
import { Brain, PlusCircle, GitMerge, BarChart2, Download, LayoutDashboard, X } from 'lucide-react';

interface OnboardingTutorialProps {
  onComplete: () => void;
}

const STEPS = [
  {
    title: 'Welcome to InsightAI!',
    description: "Let's take a quick tour of what you can do.",
    icon: Brain,
  },
  {
    title: 'Create Task',
    description: 'Start by describing what data you need in plain English.',
    icon: PlusCircle,
  },
  {
    title: 'AI Pipeline',
    description: 'Our AI creates a smart pipeline to collect, validate, and structure your data.',
    icon: GitMerge,
  },
  {
    title: 'View Results',
    description: 'View your collected data in tables and charts, with quality scoring.',
    icon: BarChart2,
  },
  {
    title: 'Export',
    description: 'Export your datasets as CSV, JSON, or PDF anytime.',
    icon: Download,
  },
  {
    title: 'Dashboard',
    description: 'Track all your tasks and data quality from this dashboard. You\'re all set!',
    icon: LayoutDashboard,
  }
];

export function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const localStatus = localStorage.getItem('insightai_onboarding_completed');
        if (localStatus === 'true') {
          setIsLoading(false);
          return;
        }

        const res = await fetch('/api/user/onboarding');
        const data = await res.json();
        
        if (!data.hasCompletedOnboarding) {
          setIsOpen(true);
        } else {
          localStorage.setItem('insightai_onboarding_completed', 'true');
        }
      } catch (e) {
        console.error('Failed to fetch onboarding status', e);
        // Fallback to local storage if API fails
        if (!localStorage.getItem('insightai_onboarding_completed')) {
          setIsOpen(true);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkStatus();
  }, []);

  const completeOnboarding = async (skipAndDontShow: boolean = false) => {
    setIsOpen(false);
    onComplete();
    
    if (skipAndDontShow || currentStep === STEPS.length - 1) {
      localStorage.setItem('insightai_onboarding_completed', 'true');
      try {
        await fetch('/api/user/onboarding', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        console.error('Failed to complete onboarding API call', e);
      }
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding(dontShowAgain);
  };

  if (isLoading || !isOpen) return null;

  const StepIcon = STEPS[currentStep].icon;
  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 'var(--spacing-md)'
    }}>
      <div className="card animate-fade-in" style={{ 
        width: '100%', 
        maxWidth: '520px', 
        padding: 0, 
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Progress Bar */}
        <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--color-bg-tertiary)' }}>
          <div style={{ 
            height: '100%', 
            width: `${progressPercentage}%`, 
            backgroundColor: 'var(--color-primary)',
            transition: 'width 0.3s ease'
          }} />
        </div>

        <div style={{ padding: 'var(--spacing-xl)' }}>
          {/* Content */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textAlign: 'center',
            minHeight: '200px'
          }}>
            <div style={{ 
              marginBottom: 'var(--spacing-lg)',
              color: 'var(--color-primary)',
              animation: currentStep === 0 ? 'pulse 2s infinite' : 'none'
            }}>
              <StepIcon size={64} strokeWidth={1.5} />
            </div>
            
            <h2 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-primary)' }}>
              {STEPS[currentStep].title}
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
              {STEPS[currentStep].description}
            </p>
          </div>

          {/* Footer Controls */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 'var(--spacing-md)',
            marginTop: 'var(--spacing-xl)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
              {STEPS.map((_, idx) => (
                <div 
                  key={idx}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: idx === currentStep ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                    transition: 'background-color 0.3s ease'
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <button 
                  onClick={handleSkip}
                  className="btn btn-ghost"
                  style={{ padding: '0 var(--spacing-sm)' }}
                >
                  Skip Tutorial
                </button>
                {currentStep > 0 && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-xs)' }}>
                    <input 
                      type="checkbox" 
                      checked={dontShowAgain}
                      onChange={(e) => setDontShowAgain(e.target.checked)}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    Don't show again
                  </label>
                )}
              </div>
              
              <button 
                onClick={handleNext}
                className="btn btn-primary"
              >
                {currentStep === STEPS.length - 1 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
