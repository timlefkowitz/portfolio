'use client';

import { useState } from 'react';

export default function MigratePage() {
  const [status, setStatus] = useState('idle');
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  const runMigration = async () => {
    setStatus('running');
    setLog([]);
    addLog('Starting migration...');

    try {
      // 1. Posts
      addLog('Migrating Posts...');
      const postsRes = await fetch('/api/posts');
      const posts = await postsRes.json();
      // If the API returns from Supabase (empty) this won't work for migration FROM json unless we have a specific migration endpoint
      // Since we overwrote the API routes, we need to read the JSON files on the server side in a special migration route.
      
      const res = await fetch('/api/migrate', { method: 'POST' });
      const result = await res.json();
      
      if (result.success) {
        addLog('Migration completed successfully!');
        result.logs.forEach((l: string) => addLog(l));
      } else {
        addLog('Migration failed: ' + result.error);
      }
    } catch (e: any) {
      addLog('Error: ' + e.message);
    }
    setStatus('done');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Data Migration</h1>
      <p className="mb-8 text-gray-600">
        This tool will read your local JSON files (data/*.json) and upload them to your Supabase database.
        <br/>
        <strong>Warning:</strong> This might duplicate data if run multiple times.
      </p>
      
      <button 
        onClick={runMigration}
        disabled={status === 'running'}
        className="bg-black text-white px-6 py-3 font-bold hover:bg-gray-800 disabled:opacity-50"
      >
        {status === 'running' ? 'Migrating...' : 'Start Migration'}
      </button>

      <div className="mt-8 bg-gray-100 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
        {log.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}

