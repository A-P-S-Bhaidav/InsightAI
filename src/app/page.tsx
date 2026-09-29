'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Brain, 
  GitBranch, 
  Shield, 
  Globe, 
  Download, 
  BarChart,
  CheckCircle,
  Database,
  ListTodo,
  Menu,
  X
} from 'lucide-react';
import './landing.css';

export default function LandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <Brain className="landing-nav-logo-icon" />
          <span className="landing-nav-logo-text">InsightAI</span>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden-mobile landing-nav-desktop">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#how-it-works" className="landing-nav-link">How It Works</a>
          <div className="landing-nav-divider"></div>
          <Link href="/login" className="landing-nav-link">
            Log In
          </Link>
          <Link href="/signup" className="btn btn-primary">
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="mobile-only-flex landing-mobile-toggle" 
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={28} />
        </button>
      </nav>

      {/* Mobile Overlay Menu */}
      {isMobileMenuOpen && (
        <div className="landing-mobile-menu">
          <div className="landing-mobile-menu-header">
            <div className="landing-nav-logo">
              <Brain className="landing-nav-logo-icon" />
              <span className="landing-nav-logo-text">InsightAI</span>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="landing-mobile-toggle"
            >
              <X size={28} />
            </button>
          </div>
          
          <div className="landing-mobile-menu-links">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="landing-mobile-nav-link">Features</a>
            <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="landing-mobile-nav-link">How It Works</a>
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="landing-mobile-nav-link">
              Log In
            </Link>
          </div>
          
          <div className="landing-mobile-menu-footer">
            <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-primary landing-mobile-menu-btn">
              Get Started Free
            </Link>
          </div>
        </div>
      )}

      {/* Section 1: Hero */}
      <section className="hero-gradient landing-hero-section">
        <div className="reveal landing-hero-content">
          <h1 className="landing-hero-title">
            Turn Natural Language into{' '}
            <span className="landing-hero-title-highlight">
              Structured Data
            </span>
          </h1>
          <p className="landing-hero-subtitle">
            InsightAI uses AI to collect, validate, and structure data from the web — all from a simple text prompt.
          </p>
          <div className="landing-hero-actions">
            <Link href="/signup" className="btn btn-primary btn-lg">
              Get Started Free
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              See How It Works
            </a>
          </div>
        </div>

        {/* Hero Illustration Mockup */}
        <div className="reveal landing-hero-mockup-wrapper">
          <div className="dashboard-mockup landing-dashboard-mockup-padded">
            <div className="dashboard-mockup-header">
              <div className="mockup-dot red"></div>
              <div className="mockup-dot yellow"></div>
              <div className="mockup-dot green"></div>
            </div>
            <div className="landing-dashboard-mockup-body">
              <div className="landing-dashboard-mockup-grid">
                <div className="landing-mockup-col-main">
                  <div className="animate-pulse landing-pulse-bar-1"></div>
                  <div className="animate-pulse delay-1 landing-pulse-bar-2"></div>
                  <div className="animate-pulse delay-2 landing-pulse-bar-3"></div>
                  <div className="landing-pulse-box">
                     <div className="animate-pulse landing-pulse-gradient"></div>
                  </div>
                </div>
                <div className="landing-mockup-col-side">
                  <div className="landing-mockup-side-box"></div>
                  <div className="landing-mockup-side-box"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Trusted By / Stats Bar */}
      <section className="reveal landing-stats-section">
        <div className="landing-stats-container">
          <p className="landing-stats-title">
            Trusted by 1,000+ data teams worldwide
          </p>
          <div className="landing-stats-grid">
            <div>
              <h3 className="landing-stat-value">50K+</h3>
              <p className="landing-stat-label">Tasks Completed</p>
            </div>
            <div>
              <h3 className="landing-stat-value">99.9%</h3>
              <p className="landing-stat-label">Uptime</p>
            </div>
            <div>
              <h3 className="landing-stat-value">10M+</h3>
              <p className="landing-stat-label">Data Points</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Features Grid */}
      <section id="features" className="section-container">
        <div className="reveal landing-section-header">
          <h2 className="landing-section-title">Everything you need to master your data</h2>
          <p className="landing-section-subtitle">
            Powerful tools wrapped in a simple, intuitive interface.
          </p>
        </div>
        
        <div className="grid-3 landing-features-grid">
          {[
            { icon: Brain, title: 'AI-Powered Parsing', desc: 'Describe your data needs in plain English' },
            { icon: GitBranch, title: 'Smart Workflows', desc: 'Automated multi-step data pipelines' },
            { icon: Shield, title: 'Data Validation', desc: 'Quality scoring and anomaly detection' },
            { icon: Globe, title: 'Multiple Sources', desc: 'Collect from 10+ web platforms' },
            { icon: Download, title: 'Export Anywhere', desc: 'CSV, JSON, PDF with one click' },
            { icon: BarChart, title: 'Real-time Dashboard', desc: 'Track progress and visualize results' },
          ].map((feature, i) => (
            <div key={i} className={`card reveal landing-feature-card delay-${i * 100}`}>
              <div className="landing-feature-icon-wrapper">
                <feature.icon className="landing-feature-icon" />
              </div>
              <h3 className="landing-feature-title">{feature.title}</h3>
              <p className="landing-feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section: Why InsightAI vs LLMs */}
      <section className="section-container landing-comparison-section">
        <div className="reveal landing-section-header">
          <h2 className="landing-section-title">Why InsightAI vs. Standard LLMs?</h2>
          <p className="landing-section-subtitle-wide">
            ChatGPT is a conversational tool. InsightAI is an autonomous Data Engineering Pipeline.
          </p>
        </div>
        
        <div className="grid-2 landing-comparison-grid">
          <div className="card reveal landing-comparison-card-bad">
            <h3 className="landing-comparison-title">The LLM Problem</h3>
            <ul className="landing-comparison-list">
              <li><strong>Hallucinations:</strong> LLMs guess data and generate inconsistent formats.</li>
              <li><strong>Poor Browsing:</strong> They fail on anti-bot protections and don't dig deep.</li>
              <li><strong>No Verifiability:</strong> You can't verify where the data came from easily.</li>
              <li><strong>Context Limits:</strong> Long tasks cause them to repeat or forget data.</li>
            </ul>
          </div>
          
          <div className="card reveal landing-comparison-card-good">
            <h3 className="landing-comparison-title">The InsightAI Solution</h3>
            <ul className="landing-comparison-list">
              <li><strong>Deterministic Extraction:</strong> We force strict schemas using Zod. No guessing.</li>
              <li><strong>Deep Web Scraping:</strong> Autonomous agents navigate past blockers in parallel.</li>
              <li><strong>Traceable Evidence:</strong> Every row gets an `evidenceSnippet` with a source URL.</li>
              <li><strong>Fuzzy Deduplication:</strong> We match rows at the database level to ensure zero duplicates.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 4: How It Works */}
      <section id="how-it-works" className="landing-how-it-works-section">
        <div className="section-container">
          <div className="reveal landing-how-it-works-header">
            <h2 className="landing-section-title">How It Works</h2>
            <p className="landing-section-subtitle">Three simple steps to structured data.</p>
          </div>

          <div className="landing-steps-container">
            {/* Step 1 */}
            <div className="reveal-left flex-col-mobile landing-step-row">
              <div className="landing-step-text">
                <div className="landing-step-number-1">1</div>
                <h3 className="landing-step-title">Describe Your Data</h3>
                <p className="landing-step-desc">
                  Just type what you need. Our AI understands context, structure, and intent, converting your plain English into a robust extraction plan.
                </p>
              </div>
              <div className="landing-step-image">
                <div className="dashboard-mockup landing-step-mockup">
                  <div className="landing-step-mockup-header">
                    <Brain className="landing-step-mockup-icon" />
                    <span className="landing-step-mockup-title">Prompt Editor</span>
                  </div>
                  <div className="landing-step-mockup-code">
                    "Find all SaaS companies in London that raised Series A in 2023. Extract their name, website, and founder emails."
                  </div>
                  <button className="btn btn-primary landing-step-mockup-btn">Generate Pipeline</button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="reveal-right flex-col-mobile landing-step-row-reverse">
              <div className="landing-step-text">
                <div className="landing-step-number-2">2</div>
                <h3 className="landing-step-title">AI Creates a Pipeline</h3>
                <p className="landing-step-desc">
                  Watch as InsightAI automatically builds a multi-step workflow. It identifies sources, sets up scrapers, and configures validation rules on the fly.
                </p>
              </div>
              <div className="landing-step-image">
                <div className="dashboard-mockup landing-step-mockup">
                   <div className="landing-step-mockup-header">
                    <GitBranch className="landing-step-mockup-icon" />
                    <span className="landing-step-mockup-title">Workflow Visualization</span>
                  </div>
                  <div className="landing-workflow-container">
                    <div className="landing-workflow-item">
                      <Globe className="landing-workflow-icon-1" /> Source Discovery
                    </div>
                    <div className="landing-workflow-divider"></div>
                    <div className="landing-workflow-item">
                       <Database className="landing-workflow-icon-2" /> Data Extraction
                    </div>
                    <div className="landing-workflow-divider"></div>
                    <div className="landing-workflow-item">
                       <Shield className="landing-workflow-icon-3" /> Quality Validation
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="reveal-left flex-col-mobile landing-step-row">
              <div className="landing-step-text">
                <div className="landing-step-number-3">3</div>
                <h3 className="landing-step-title">Get Structured Results</h3>
                <p className="landing-step-desc">
                  Your data is ready. Export it instantly as CSV, JSON, or connect it directly to your database via our API.
                </p>
              </div>
              <div className="landing-step-image">
                <div className="dashboard-mockup landing-step-mockup-table">
                   <div className="landing-step-mockup-table-header">
                    <div className="landing-step-mockup-table-title-container">
                      <ListTodo className="landing-step-mockup-icon" />
                      <span className="landing-step-mockup-title">Results Table</span>
                    </div>
                    <Download className="landing-step-mockup-action-icon" />
                  </div>
                  <table className="table landing-results-table">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Website</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>DataFlow Inc</td>
                        <td className="landing-results-table-muted">dataflow.io</td>
                        <td><span className="badge badge-success">Verified</span></td>
                      </tr>
                      <tr>
                        <td>TechSphere</td>
                        <td className="landing-results-table-muted">techsphere.co</td>
                        <td><span className="badge badge-success">Verified</span></td>
                      </tr>
                      <tr>
                        <td>CloudScale</td>
                        <td className="landing-results-table-muted">cloudscale.ai</td>
                        <td><span className="badge badge-success">Verified</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 5: Screenshots / Dashboard Preview */}
      <section className="reveal section-container landing-dashboard-preview-section">
        <h2 className="landing-section-title">A command center for all your data operations</h2>
        <p className="landing-preview-subtitle">
          Monitor tasks, analyze quality scores, and manage datasets from one powerful dashboard.
        </p>
        <div className="dashboard-mockup landing-preview-mockup">
          <div className="dashboard-mockup-header">
            <div className="mockup-dot red"></div>
            <div className="mockup-dot yellow"></div>
            <div className="mockup-dot green"></div>
          </div>
          <div className="landing-preview-image-container">
            <img 
               src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" 
               alt="Dashboard Preview" 
               className="landing-preview-image"
            />
            <div className="landing-preview-fade"></div>
          </div>
        </div>
      </section>

      {/* Section 6: CTA Banner */}
      <section className="reveal section-container landing-cta-section">
        <div className="landing-cta-background"></div>
        <div className="landing-cta-content">
          <h2 className="landing-cta-title">Ready to transform your data workflow?</h2>
          <p className="landing-cta-subtitle">
            Join 1,000+ teams using InsightAI to automate their data pipelines today.
          </p>
          <div className="landing-cta-actions">
            <Link href="/signup" className="btn btn-primary btn-lg">
              Get Started Free
            </Link>
            <p className="landing-cta-guarantee">
              <CheckCircle className="landing-cta-guarantee-icon" /> No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: Footer */}
      <footer className="landing-footer">
        <div className="grid-4 landing-footer-grid">
          <div className="landing-footer-brand-col">
            <div className="landing-footer-brand">
              <Brain className="landing-footer-brand-icon" />
              <span className="landing-footer-brand-name">InsightAI</span>
            </div>
            <p className="landing-footer-brand-desc">
              The AI-powered data intelligence platform that turns natural language into clean, structured data.
            </p>
          </div>
          <div>
            <h4 className="landing-footer-heading">Product</h4>
            <ul className="landing-footer-list">
              <li><Link href="#features" className="landing-footer-link">Features</Link></li>
              <li><a href="#" className="landing-footer-link">Pricing</a></li>
              <li><a href="#" className="landing-footer-link">Documentation</a></li>
            </ul>
          </div>
          <div>
            <h4 className="landing-footer-heading">Company</h4>
            <ul className="landing-footer-list">
              <li><a href="#" className="landing-footer-link">About</a></li>
              <li><a href="#" className="landing-footer-link">Blog</a></li>
              <li><a href="#" className="landing-footer-link">Support</a></li>
            </ul>
          </div>
        </div>
        <div className="flex-col-mobile landing-footer-bottom">
          <p>© {new Date().getFullYear()} InsightAI Inc. All rights reserved.</p>
          <div className="landing-footer-socials">
            <a href="#" className="landing-footer-social-link">Twitter</a>
            <a href="#" className="landing-footer-social-link">GitHub</a>
            <a href="#" className="landing-footer-social-link">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
