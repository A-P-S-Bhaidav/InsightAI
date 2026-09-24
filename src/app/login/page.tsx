'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Brain, Mail, Lock, Loader2, LogIn, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (err) {
      setError('Failed to sign in with Google');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-dark)' }}>
      <div className="card" style={{ display: 'flex', maxWidth: '1000px', width: '100%', margin: '2rem', padding: '0', overflow: 'hidden', minHeight: '600px' }}>
        
        {/* Left Side - Branding */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <Brain size={40} />
            <h1 style={{ fontSize: '2rem', margin: 0 }}>InsightAI</h1>
          </div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>Unlock the power of your data</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6 }}>
            Join thousands of teams using InsightAI to transform raw data into actionable intelligence. 
            Connect, analyze, and automate with just a few clicks.
          </p>
        </div>

        {/* Right Side - Login Form */}
        <div style={{ flex: 1, padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--color-bg-card)' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Welcome back</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>Sign in to continue to your dashboard</p>
          </div>

          {error && (
            <div className="badge badge-danger" style={{ marginBottom: '1.5rem', padding: '0.75rem', display: 'block', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ width: '100%', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? <Loader2 className="animate-spin" size={18} /> : (
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
            )}
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
            <span style={{ padding: '0 1rem', fontSize: '0.875rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  type="email" 
                  className="input" 
                  placeholder="name@company.com" 
                  style={{ width: '100%', paddingLeft: '2.75rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span>Password</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  type="password" 
                  className="input" 
                  placeholder="••••••••" 
                  style={{ width: '100%', paddingLeft: '2.75rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
              Sign In
            </button>
          </form>

          <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
