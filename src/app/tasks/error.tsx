'use client';
import { useEffect } from 'react';
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16, padding: 40 }}>
      <div style={{ fontSize: 48 }}>⚠️</div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Something went wrong</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0, textAlign: 'center', maxWidth: 400 }}>{error.message || 'An unexpected error occurred.'}</p>
      <button onClick={reset} className="btn btn-primary" style={{ marginTop: 8 }}>Try Again</button>
    </div>
  );
}
