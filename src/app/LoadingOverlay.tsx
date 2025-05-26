"use client";
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function LoadingOverlay({ show }: { show?: boolean }) {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (show === undefined) {
            // Only show loading if pathname actually changes, not on initial mount
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setLoading(true);
            timeoutRef.current = setTimeout(() => setLoading(false), 400);
            return () => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
            };
        }
    }, [pathname, show]);

    // If show is explicitly true, always show overlay
    if (show === true || loading) {
        return (
            <div
                aria-busy="true"
                aria-live="polite"
                role="status"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    animation: 'fadeInOverlay 0.2s',
                }}
            >
                <div className="loading-card">
                    <div className="dual-ring" />
                    <span className="loading-text">Loading...</span>
                </div>
                <style jsx>{`
                    @keyframes fadeInOverlay {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .loading-card {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 2rem 2.5rem;
                        border-radius: 1.5rem;
                        background: rgba(255, 255, 255, 0.7);
                        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
                        border: 1px solid rgba(255, 255, 255, 0.25);
                        backdrop-filter: blur(8px);
                        -webkit-backdrop-filter: blur(8px);
                        min-width: 220px;
                        min-height: 140px;
                        animation: fadeInOverlay 0.3s;
                    }
                    .dual-ring {
                        display: inline-block;
                        width: 56px;
                        height: 56px;
                    }
                    .dual-ring:after {
                        content: " ";
                        display: block;
                        width: 44px;
                        height: 44px;
                        margin: 6px;
                        border-radius: 50%;
                        border: 6px solid #2563eb;
                        border-color: #2563eb transparent #60a5fa transparent;
                        animation: dual-ring-spin 1.1s linear infinite;
                    }
                    @keyframes dual-ring-spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .loading-text {
                        margin-top: 1.5rem;
                        font-size: 1.15rem;
                        font-weight: 500;
                        color: #1e293b;
                        letter-spacing: 0.01em;
                        text-shadow: 0 1px 2px rgba(0,0,0,0.04);
                    }
                `}</style>
            </div>
        );
    }
    return null;
} 