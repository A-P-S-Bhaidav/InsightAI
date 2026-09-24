'use client';

import { useEffect } from 'react';
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
  ListTodo
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      {/* Navigation */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Brain style={{ color: 'var(--color-primary)', width: '32px', height: '32px' }} />
          <span style={{ fontWeight: 'bold', fontSize: '1.25rem', letterSpacing: '-0.025em' }}>InsightAI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>
            Log In
          </Link>
          <Link href="/signup" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Section 1: Hero */}
      <section className="hero-gradient" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: '8rem', paddingBottom: '5rem', paddingLeft: '1rem', paddingRight: '1rem', minHeight: '80vh' }}>
        <div className="reveal" style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '2rem' }}>
            Turn Natural Language into{' '}
            <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Structured Data
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            InsightAI uses AI to collect, validate, and structure data from the web — all from a simple text prompt.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <Link href="/signup" className="btn btn-primary btn-lg">
              Get Started Free
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              See How It Works
            </a>
          </div>
        </div>

        {/* Hero Illustration Mockup */}
        <div className="reveal" style={{ marginTop: '5rem', width: '100%', maxWidth: '1024px', margin: '5rem auto 0' }}>
          <div className="dashboard-mockup" style={{ padding: '4px' }}>
            <div className="dashboard-mockup-header">
              <div className="mockup-dot red"></div>
              <div className="mockup-dot yellow"></div>
              <div className="mockup-dot green"></div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ height: '2rem', width: '33%', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '4px' }} className="animate-pulse"></div>
                  <div style={{ height: '1rem', width: '100%', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '4px' }} className="animate-pulse delay-1"></div>
                  <div style={{ height: '1rem', width: '83%', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '4px' }} className="animate-pulse delay-2"></div>
                  <div style={{ height: '8rem', width: '100%', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '8px', marginTop: '1.5rem', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                     <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)', opacity: 0.1 }} className="animate-pulse"></div>
                  </div>
                </div>
                <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ height: '6rem', width: '100%', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '8px', border: '1px solid var(--border-color)' }}></div>
                  <div style={{ height: '6rem', width: '100%', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '8px', border: '1px solid var(--border-color)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Trusted By / Stats Bar */}
      <section className="reveal" style={{ padding: '3rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '2rem' }}>
            Trusted by 1,000+ data teams worldwide
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3rem' }}>
            <div>
              <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>50K+</h3>
              <p style={{ color: 'var(--text-muted)' }}>Tasks Completed</p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>99.9%</h3>
              <p style={{ color: 'var(--text-muted)' }}>Uptime</p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>10M+</h3>
              <p style={{ color: 'var(--text-muted)' }}>Data Points</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Features Grid */}
      <section id="features" style={{ padding: '6rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Everything you need to master your data</h2>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Powerful tools wrapped in a simple, intuitive interface.
          </p>
        </div>
        
        <div className="grid-3" style={{ gap: '2rem' }}>
          {[
            { icon: Brain, title: 'AI-Powered Parsing', desc: 'Describe your data needs in plain English' },
            { icon: GitBranch, title: 'Smart Workflows', desc: 'Automated multi-step data pipelines' },
            { icon: Shield, title: 'Data Validation', desc: 'Quality scoring and anomaly detection' },
            { icon: Globe, title: 'Multiple Sources', desc: 'Collect from 10+ web platforms' },
            { icon: Download, title: 'Export Anywhere', desc: 'CSV, JSON, PDF with one click' },
            { icon: BarChart, title: 'Real-time Dashboard', desc: 'Track progress and visualize results' },
          ].map((feature, i) => (
            <div key={i} className="card reveal" style={{ padding: '1.5rem', transitionDelay: `${i * 100}ms` }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <feature.icon style={{ width: '24px', height: '24px', color: 'var(--color-primary)' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: How It Works */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>How It Works</h2>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Three simple steps to structured data.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6rem' }}>
            {/* Step 1 */}
            <div className="reveal-left" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '3rem' }}>
              <div style={{ flex: '1 1 400px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>1</div>
                <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Describe Your Data</h3>
                <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Just type what you need. Our AI understands context, structure, and intent, converting your plain English into a robust extraction plan.
                </p>
              </div>
              <div style={{ flex: '1 1 400px', width: '100%' }}>
                <div className="dashboard-mockup" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-main)' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)', alignItems: 'center' }}>
                    <Brain style={{ width: '20px', height: '20px' }} />
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Prompt Editor</span>
                  </div>
                  <div style={{ padding: '1rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                    "Find all SaaS companies in London that raised Series A in 2023. Extract their name, website, and founder emails."
                  </div>
                  <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>Generate Pipeline</button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="reveal-right" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '3rem', flexDirection: 'row-reverse' }}>
              <div style={{ flex: '1 1 400px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>2</div>
                <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>AI Creates a Pipeline</h3>
                <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Watch as InsightAI automatically builds a multi-step workflow. It identifies sources, sets up scrapers, and configures validation rules on the fly.
                </p>
              </div>
              <div style={{ flex: '1 1 400px', width: '100%' }}>
                <div className="dashboard-mockup" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-main)' }}>
                   <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)', alignItems: 'center' }}>
                    <GitBranch style={{ width: '20px', height: '20px' }} />
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Workflow Visualization</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Globe style={{ color: 'var(--color-primary)', width: '16px', height: '16px' }} /> Source Discovery
                    </div>
                    <div style={{ width: '2px', height: '1rem', backgroundColor: 'var(--border-color)', marginLeft: '1.5rem' }}></div>
                    <div style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                       <Database style={{ color: 'var(--color-secondary)', width: '16px', height: '16px' }} /> Data Extraction
                    </div>
                    <div style={{ width: '2px', height: '1rem', backgroundColor: 'var(--border-color)', marginLeft: '1.5rem' }}></div>
                    <div style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                       <Shield style={{ color: 'var(--color-success)', width: '16px', height: '16px' }} /> Quality Validation
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="reveal-left" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '3rem' }}>
              <div style={{ flex: '1 1 400px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>3</div>
                <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Get Structured Results</h3>
                <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Your data is ready. Export it instantly as CSV, JSON, or connect it directly to your database via our API.
                </p>
              </div>
              <div style={{ flex: '1 1 400px', width: '100%' }}>
                <div className="dashboard-mockup" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-main)', overflowX: 'auto' }}>
                   <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ListTodo style={{ width: '20px', height: '20px' }} />
                      <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Results Table</span>
                    </div>
                    <Download style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  </div>
                  <table className="table" style={{ width: '100%', fontSize: '0.875rem' }}>
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
                        <td style={{ color: 'var(--text-muted)' }}>dataflow.io</td>
                        <td><span className="badge badge-success">Verified</span></td>
                      </tr>
                      <tr>
                        <td>TechSphere</td>
                        <td style={{ color: 'var(--text-muted)' }}>techsphere.co</td>
                        <td><span className="badge badge-success">Verified</span></td>
                      </tr>
                      <tr>
                        <td>CloudScale</td>
                        <td style={{ color: 'var(--text-muted)' }}>cloudscale.ai</td>
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
      <section className="reveal" style={{ padding: '6rem 1.5rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>A command center for all your data operations</h2>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
          Monitor tasks, analyze quality scores, and manage datasets from one powerful dashboard.
        </p>
        <div className="dashboard-mockup" style={{ margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
          <div className="dashboard-mockup-header">
            <div className="mockup-dot red"></div>
            <div className="mockup-dot yellow"></div>
            <div className="mockup-dot green"></div>
          </div>
          <div style={{ position: 'relative' }}>
            <img 
               src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" 
               alt="Dashboard Preview" 
               style={{ width: '100%', height: 'auto', display: 'block', opacity: 0.7, filter: 'grayscale(100%) contrast(1.2)' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-main), transparent)' }}></div>
          </div>
        </div>
      </section>

      {/* Section 6: CTA Banner */}
      <section className="reveal" style={{ padding: '6rem 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', opacity: 0.1 }}></div>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 'bold', marginBottom: '2rem' }}>Ready to transform your data workflow?</h2>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
            Join 1,000+ teams using InsightAI to automate their data pipelines today.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Link href="/signup" className="btn btn-primary btn-lg">
              Get Started Free
            </Link>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle style={{ width: '16px', height: '16px', color: 'var(--color-success)' }} /> No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: Footer */}
      <footer style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', padding: '3rem 1.5rem' }}>
        <div className="grid-4" style={{ maxWidth: '1200px', margin: '0 auto', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Brain style={{ color: 'var(--color-primary)', width: '24px', height: '24px' }} />
              <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>InsightAI</span>
            </div>
            <p style={{ color: 'var(--text-muted)', maxWidth: '300px' }}>
              The AI-powered data intelligence platform that turns natural language into clean, structured data.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Product</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><Link href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Features</Link></li>
              <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Pricing</a></li>
              <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Documentation</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Company</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>About</a></li>
              <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Blog</a></li>
              <li><a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Support</a></li>
            </ul>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p>© {new Date().getFullYear()} InsightAI Inc. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Twitter</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>GitHub</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
