import React, { useEffect, useState } from 'react';
import { getApiBaseUrl } from '@/config/api';

export default function ContractorPortal() {
  const [scanId, setScanId] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const API = getApiBaseUrl();

  const load = async () => {
    const j = await fetch(`${API}/jobs${scanId ? `?scan_id=${scanId}` : ''}`).then((r) => r.json());
    setJobs(j.jobs || []);
  };

  const update = async (job_id: string, patch: any) => {
    await fetch(`${API}/jobs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ job_id, ...patch }) });
    await load();
  };

  useEffect(() => {
    // no-op
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Contractor Portal</h1>
      <div className="flex gap-2">
        <input className="border px-2 py-1 rounded" placeholder="Scan ID (optional)" value={scanId} onChange={(e) => setScanId(e.target.value)} />
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={load}>Load</button>
      </div>
      <div className="space-y-2">
        {jobs.map((j) => (
          <div key={j.job_id} className="border rounded p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">Job {j.job_id}</div>
              <div>Scan: {j.scan_id || '—'} | Status: {j.status}</div>
            </div>
            <div className="flex gap-2">
              <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => update(j.job_id, { status: 'accepted' })}>Accept</button>
              <button className="bg-yellow-600 text-white px-3 py-1 rounded" onClick={() => update(j.job_id, { status: 'in_progress' })}>Start</button>
              <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => update(j.job_id, { status: 'completed' })}>Complete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}