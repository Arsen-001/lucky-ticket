'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Last-resort boundary for a crash in the ROOT layout itself (e.g. locale load
 * failing). It replaces <html>/<body> and renders OUTSIDE every provider, so
 * neither the i18n dictionary nor the global stylesheet are guaranteed here —
 * the copy is intentionally hardcoded and the styles inline. This is the one
 * place the no-hardcoded-strings / theme-variable rules cannot apply.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 24,
          textAlign: 'center',
          backgroundColor: '#1b1930',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Something went wrong</h2>
        <p style={{ fontSize: 14, opacity: 0.7, margin: 0, maxWidth: 280 }}>Please try again.</p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 8,
            padding: '12px 24px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            color: '#fff',
            background: 'linear-gradient(90deg, #7b2ff7, #de009b)',
          }}
        >
          Retry
        </button>
      </body>
    </html>
  );
}
