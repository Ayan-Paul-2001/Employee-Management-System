'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0f172a, #1e1b4b, #0f172a)',
                    padding: '1rem',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '1rem',
                        padding: '2rem',
                        textAlign: 'center',
                        maxWidth: '28rem',
                        width: '100%',
                    }}>
                        <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            Something went wrong!
                        </h2>
                        <p style={{ color: 'rgba(191,219,254,0.6)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            {error.message || 'An unexpected error occurred.'}
                        </p>
                        <button
                            onClick={reset}
                            style={{
                                padding: '0.625rem 1.5rem',
                                background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                                color: '#fff',
                                fontWeight: 600,
                                borderRadius: '0.75rem',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                            }}
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
