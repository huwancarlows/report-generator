"use client";
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function LoadingOverlay() {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Show loading instantly
        setLoading(true);
        // Hide after a minimum duration (e.g., 400ms)
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setLoading(false), 400);
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [pathname]);

    if (!loading) return null;
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(255,255,255,0.7)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <span style={{ marginLeft: 16, fontSize: 18 }}>Loading...</span>
        </div>
    );
} 