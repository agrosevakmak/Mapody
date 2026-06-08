'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function CreditsBadge() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    const fetchCredits = async () => {
      try {
        const res = await fetch('/api/user/credits');
        if (res.ok) {
          const data = await res.json();
          setCredits(data.credits);
        }
      } catch {
        // Credits fetch failed silently
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, [session]);

  if (!session || loading) return null;

  const isLow = credits !== null && credits <= 1;

  return (
    <Link href="/pricing" className="inline-flex items-center gap-2 group">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          isLow
            ? 'bg-red/10 text-red animate-pulse'
            : 'bg-blue/10 text-blue group-hover:bg-blue/20'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <span>{credits ?? 0} credits</span>
        {isLow && (
          <span className="text-xs">Low</span>
        )}
      </div>
    </Link>
  );
}
