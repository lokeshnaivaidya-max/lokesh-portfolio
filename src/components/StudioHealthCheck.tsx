import React, { useState, useEffect } from 'react';
import { runHealthCheck, HealthStatus, hasSupabaseConfig, isProduction } from '../lib/supabase';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

function StatusIcon({ status }: { status: 'ok' | 'error' | 'pending' }) {
  if (status === 'ok') return <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />;
  if (status === 'error') return <XCircle className="w-5 h-5 text-red-400 shrink-0" />;
  return <Loader2 className="w-5 h-5 animate-spin text-gray-500 shrink-0" />;
}

function HealthRow({ label, status, message, key }: { label: string; status: 'ok' | 'error' | 'pending'; message?: string; key?: string }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded border ${status === 'ok' ? 'border-green-500/30 bg-green-950/20' : status === 'error' ? 'border-red-500/30 bg-red-950/20' : 'border-gray-700 bg-gray-900/20'}`}>
      <StatusIcon status={status} />
      <div className="min-w-0">
        <p className="font-mono text-xs uppercase tracking-wider text-white">{label}</p>
        {message && <p className="font-mono text-[10px] text-gray-400 mt-0.5 break-all">{message}</p>}
      </div>
    </div>
  );
}

export default function StudioHealthCheck() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [checking, setChecking] = useState(true);

  async function check() {
    setChecking(true);
    const result = await runHealthCheck();
    setHealth(result);
    setChecking(false);
  }

  useEffect(() => { check(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-3xl text-white tracking-wide mb-1 uppercase">Studio Health Check</h3>
          <p className="font-mono text-xs text-gray-500 uppercase">Real-time diagnostics for every backend component</p>
        </div>
        <button
          type="button"
          onClick={check}
          disabled={checking}
          className="flex items-center gap-1.5 bg-[#141414] hover:bg-[#1C1C1C] border border-[#2D2D2D] text-gray-400 hover:text-white px-3 py-1.5 rounded text-xs font-mono transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {checking && !health && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#F5B942]" />
        </div>
      )}

      {health && (
        <div className="space-y-4">
          <div className={`p-4 rounded border text-center ${health.overall === 'healthy' ? 'bg-green-950/30 border-green-500/40' : 'bg-red-950/30 border-red-500/40'}`}>
            <p className={`font-display text-2xl uppercase tracking-wider ${health.overall === 'healthy' ? 'text-green-400' : 'text-red-400'}`}>
              {health.overall === 'healthy' ? 'All Systems Operational' : 'Issues Detected'}
            </p>
            <p className="font-mono text-[10px] text-gray-500 mt-1 uppercase">
              Mode: {health.mode === 'production' ? 'Production (no localStorage fallback)' : 'Development (localStorage fallback allowed)'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <HealthRow
              label="Environment Variables"
              status={health.env.status}
              message={health.env.status === 'ok' ? 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set' : `URL: ${health.env.url_set ? '✓' : '✗'}, Key: ${health.env.key_set ? '✓' : '✗'}`}
            />
            <HealthRow label="Supabase Connection" status={health.connection.status} message={health.connection.message} />
            <HealthRow label="Authentication" status={health.auth.status} message={health.auth.message} />
            <HealthRow label="Database (projects table)" status={health.database.status} message={health.database.message} />
            <HealthRow label="Storage (listBuckets)" status={health.storage.status} message={health.storage.message} />
            <HealthRow label="RLS Policies" status={health.rls.status} message={health.rls.message} />
          </div>

          {Object.keys(health.buckets).length > 0 && (
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-gray-400 mb-2">Storage Buckets</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(health.buckets).map(([name, b]: [string, { status: 'ok' | 'error'; message?: string }]) => (
                  <HealthRow key={name} label={name} status={b.status} message={b.message} />
                ))}
              </div>
            </div>
          )}

          {!hasSupabaseConfig && (
            <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded">
              <p className="font-mono text-xs text-amber-400 uppercase tracking-wider font-semibold">Supabase Not Configured</p>
              <p className="font-mono text-[10px] text-gray-400 mt-1">
                Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables to connect. 
                {isProduction && ' The Studio will not allow data operations without Supabase in production mode.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
