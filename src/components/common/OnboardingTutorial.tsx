'use client'

import React, { useState, useEffect } from 'react';
import { Brain, Plus, LayoutDashboard, Sparkles, ArrowRight, X, PlayCircle, Code, Database, Search } from 'lucide-react';
import Link from 'next/link';

interface OnboardingTutorialProps {
  onComplete?: () => void;
}

const STEPS = [
  {
    icon: <Sparkles size={24} />,
    title: 'Meet Agentic RAG',
    subtitle: 'The AI brain behind InsightAI',
    description: 'Unlike simple scrapers, InsightAI uses an autonomous AI agent. It plans research, searches the web, and reads pages just like a human analyst.',
    color: '#8b5cf6',
    preview: (
      <div style={{ padding: 20, background: '#12121a', borderRadius: 12, border: '1px solid #2a2a3e', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#8b5cf633', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}><Brain size={16} /></div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Plan Research Strategy</div>
            <div style={{ fontSize: 11, color: '#888' }}>Generating 5-7 targeted search queries</div>
          </div>
        </div>
        <div style={{ height: 2, background: '#2a2a3e', width: '20px', marginLeft: 15 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#3b82f633', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}><Search size={16} /></div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Execute Web Search</div>
            <div style={{ fontSize: 11, color: '#888' }}>Scraping DuckDuckGo & target domains</div>
          </div>
        </div>
        <div style={{ height: 2, background: '#2a2a3e', width: '20px', marginLeft: 15 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#10b98133', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><Code size={16} /></div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>LLM Extraction</div>
            <div style={{ fontSize: 11, color: '#888' }}>Extracting structured data from raw HTML</div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: <Plus size={24} />,
    title: 'Create Your First Task',
    subtitle: 'Tell the AI what to find',
    description: 'Go to New Task. Describe what you need in plain English. For example, "Find remote AI engineering jobs above $150k".',
    color: '#3b82f6',
    preview: (
      <div style={{ padding: 16, background: '#12121a', borderRadius: 12, border: '1px solid #2a2a3e' }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>What data do you need?</div>
        <div style={{ background: '#1a1a2e', padding: 12, borderRadius: 8, color: '#e0e0f0', fontSize: 13, fontFamily: 'monospace' }}>
          Get me a list of <span style={{ color: '#3b82f6' }}>Deep Tech startup founders</span> in <span style={{ color: '#10b981' }}>San Francisco</span>.
        </div>
        <div style={{ marginTop: 16, fontSize: 11, color: '#888', marginBottom: 4 }}>Data Columns</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['Name', 'Email', 'LinkedIn', 'Company'].map(col => (
            <span key={col} style={{ background: '#3b82f622', color: '#3b82f6', padding: '4px 8px', borderRadius: 4, fontSize: 11 }}>{col}</span>
          ))}
        </div>
      </div>
    )
  },
  {
    icon: <Database size={24} />,
    title: 'Explore Datasets',
    subtitle: 'Clean, structured, validated data',
    description: 'InsightAI cross-references sources to eliminate duplicates. View your results in interactive tables, visualize field statistics, and export to CSV.',
    color: '#10b981',
    preview: (
      <div style={{ background: '#12121a', borderRadius: 12, border: '1px solid #2a2a3e', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #2a2a3e' }}>
          <div style={{ padding: '8px 12px', fontSize: 11, color: '#10b981', borderBottom: '2px solid #10b981' }}>Data Table</div>
          <div style={{ padding: '8px 12px', fontSize: 11, color: '#888' }}>Visualization</div>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 8, fontSize: 11, color: '#888', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #2a2a3e' }}>
            <div>Name</div><div>Company</div><div>LinkedIn</div>
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 8, fontSize: 12, color: '#e0e0f0', padding: '6px 0' }}>
              <div>Alex Chen</div><div>NeuralForge AI</div><div style={{ color: '#3b82f6' }}>linkedin.com/in/alexc</div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    icon: <LayoutDashboard size={24} />,
    title: 'Track Performance',
    subtitle: 'Dashboard & Usage Quotas',
    description: 'Monitor your task execution limits, API key usage, and overall data quality scores directly from your dashboard.',
    color: '#f59e0b',
    preview: (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: '#12121a', borderRadius: 12, border: '1px solid #2a2a3e', padding: 16 }}>
          <div style={{ fontSize: 11, color: '#888' }}>Total Data Points</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#e0e0f0', marginTop: 4 }}>1,432</div>
          <div style={{ fontSize: 10, color: '#10b981', marginTop: 4 }}>+12% this week</div>
        </div>
        <div style={{ background: '#12121a', borderRadius: 12, border: '1px solid #2a2a3e', padding: 16 }}>
          <div style={{ fontSize: 11, color: '#888' }}>Average Quality</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>94%</div>
          <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>Validated</div>
        </div>
      </div>
    )
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
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        maxWidth: 800, width: '100%',
        background: '#0a0a0f', border: '1px solid #2a2a3e',
        borderRadius: 24, overflow: 'hidden',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
      }}>
        {/* Left Side: Interactive Preview */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30,30,46,0.5) 0%, rgba(10,10,15,1) 100%)',
          padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          position: 'relative'
        }}>
          {/* Subtle background glow */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '80%', height: '80%', background: step.color, filter: 'blur(100px)', opacity: 0.15, zIndex: 0
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            {step.preview}
          </div>
        </div>

        {/* Right Side: Content */}
        <div style={{ padding: 40, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <button onClick={handleComplete} style={{
            position: 'absolute', top: 20, right: 20, background: 'transparent',
            border: 'none', color: '#888', cursor: 'pointer', padding: 8,
          }}>
            <X size={20} />
          </button>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: `${step.color}15`,
              color: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 24, border: `1px solid ${step.color}30`
            }}>
              {step.icon}
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, color: step.color, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              {step.subtitle}
            </div>
            
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 0 16px 0', lineHeight: 1.2 }}>
              {step.title}
            </h2>
            
            <p style={{ fontSize: 15, color: '#999', lineHeight: 1.6, margin: 0 }}>
              {step.description}
            </p>
          </div>

          <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {STEPS.map((_, idx) => (
                <div key={idx} style={{
                  width: idx === currentStep ? 24 : 8, height: 8, borderRadius: 4,
                  background: idx === currentStep ? step.color : '#2a2a3e',
                  transition: 'all 0.3s ease'
                }} />
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              {currentStep > 0 && (
                <button onClick={() => setCurrentStep(p => p - 1)} style={{
                  padding: '10px 20px', borderRadius: 8, border: '1px solid #2a2a3e',
                  background: 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 500,
                }}>Back</button>
              )}
              
              {currentStep < STEPS.length - 1 ? (
                <button onClick={() => setCurrentStep(p => p + 1)} style={{
                  padding: '10px 20px', borderRadius: 8, border: 'none',
                  background: step.color, color: '#fff', cursor: 'pointer', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <Link href="/tasks/new" onClick={handleComplete} style={{
                  padding: '10px 20px', borderRadius: 8, border: 'none', textDecoration: 'none',
                  background: step.color, color: '#fff', cursor: 'pointer', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <PlayCircle size={18} /> Start Exploring
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
