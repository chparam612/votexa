'use client';

import React, { useEffect, useState } from 'react';

interface ElectionStats {
  totalVotes: number;
  riskDistribution: { low: number; medium: number; high: number };
  currentState: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<ElectionStats | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    // 1. Establish SSE Connection
    const eventSource = new EventSource('/api/admin/monitoring');

    eventSource.onopen = () => setStatus('connected');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStats(data);
    };

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
      setStatus('error');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-emerald-500 font-mono p-8 selection:bg-emerald-900 selection:text-emerald-200">
      <header className="flex justify-between items-center border-b border-emerald-900 pb-6 mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Votexa Sentinel</h1>
          <p className="text-xs opacity-50">Global Integrity & Election Monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-2 py-1 bg-emerald-900/30 border border-emerald-500/30 rounded text-[8px] font-black uppercase text-emerald-400">
            PRJ: votexa-ac15c
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'connected' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500'}`} />
            <span className="text-[10px] font-bold uppercase">{status}</span>
          </div>
        </div>
      </header>

      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TOTAL VOTES */}
          <div className="bg-zinc-950 border border-emerald-900/50 p-6 rounded-sm shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
              <span className="text-6xl font-black">V</span>
            </div>
            <TextLabel label="TOTAL BALLOTS CAST" />
            <TextValue value={stats.totalVotes.toLocaleString()} size="4xl" />
          </div>

          {/* CURRENT STATE */}
          <div className="bg-zinc-950 border border-emerald-900/50 p-6 rounded-sm shadow-2xl">
            <TextLabel label="ELECTION PHASE" />
            <div className="mt-2 inline-block px-3 py-1 bg-emerald-900/30 border border-emerald-500/50 text-xs font-black">
              {stats.currentState}
            </div>
          </div>

          {/* SYSTEM UPTIME */}
          <div className="bg-zinc-950 border border-emerald-900/50 p-6 rounded-sm shadow-2xl">
            <TextLabel label="SENTINEL UPTIME" />
            <TextValue value="99.999%" size="4xl" color="text-emerald-300" />
          </div>

          {/* RISK DISTRIBUTION */}
          <div className="md:col-span-2 bg-zinc-950 border border-emerald-900/50 p-8 rounded-sm shadow-2xl">
            <TextLabel label="VOTER RISK DISTRIBUTION" />
            <div className="mt-8 flex h-12 rounded-sm overflow-hidden border border-emerald-900">
              <div style={{ flex: stats.riskDistribution.low || 1 }} className="bg-emerald-600 flex items-center justify-center">
                <span className="text-[10px] font-black text-black">LOW</span>
              </div>
              <div style={{ flex: stats.riskDistribution.medium || 0 }} className="bg-yellow-500 flex items-center justify-center">
                <span className="text-[10px] font-black text-black">MED</span>
              </div>
              <div style={{ flex: stats.riskDistribution.high || 0 }} className="bg-red-600 flex items-center justify-center">
                <span className="text-[10px] font-black text-black">HIGH</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-[10px] opacity-60">
              <p>ENCRYPTION ACTIVE: 256-bit AES</p>
              <p>VERIFICATION ENGINE: O(1) COMPLEXITY</p>
            </div>
          </div>

          {/* LOGS TERMINAL */}
          <div className="bg-zinc-950 border border-emerald-900/50 p-4 rounded-sm shadow-2xl h-64 overflow-hidden">
            <TextLabel label="SYSTEM LOGS" />
            <div className="mt-4 text-[10px] space-y-1 opacity-80">
              <p>[INFO] Transition detected: VOTING_OPEN</p>
              <p>[WARN] High velocity detected in Region: CA-04</p>
              <p>[INFO] Batch sync complete (12.4ms)</p>
              <p className="animate-pulse text-emerald-300">_ Listening for packets...</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-emerald-900 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <TextLabel label="Initializing Neural Link..." />
        </div>
      )}
    </div>
  );
}

function TextLabel({ label }: { label: string }) {
  return <p className="text-[10px] font-black tracking-widest opacity-40 mb-1">{label}</p>;
}

function TextValue({ value, size = "2xl", color = "text-white" }: { value: string | number, size?: string, color?: string }) {
  return <p className={`${color} text-${size} font-black tracking-tighter`}>{value}</p>;
}
