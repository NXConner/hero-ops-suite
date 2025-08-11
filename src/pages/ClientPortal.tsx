import React, { useEffect, useState } from 'react';

export default function ClientPortal() {
  const [scanId, setScanId] = useState('');
  const [scan, setScan] = useState<any | null>(null);
  const [overlay, setOverlay] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const API = 'http://localhost:3002';

  const load = async () => {
    if (!scanId) return;
    const s = await fetch(`${API}/scans/${scanId}`).then((r) => r.json());
    setScan(s.scan);
    setOverlay(s.overlay);
    const m = await fetch(`${API}/messages?scan_id=${scanId}`).then((r) => r.json());
    setMessages(m.messages || []);
  };

  useEffect(() => {
    // no-op
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Client Portal</h1>
      <div className="flex gap-2">
        <input className="border px-2 py-1 rounded" placeholder="Scan ID" value={scanId} onChange={(e) => setScanId(e.target.value)} />
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={load}>Load</button>
      </div>
      {scan && (
        <div className="border rounded p-4">
          <div className="font-medium">Scan {scan.scan_id}</div>
          <div>Area: {scan.area_sqft ?? '—'} sqft</div>
          <div>Perimeter: {scan.perimeter_ft ?? '—'} ft</div>
        </div>
      )}
      {overlay && (
        <div className="border rounded p-4">
          <div className="font-medium">Overlay</div>
          <div>Cracks: {overlay.cracks?.length || 0} | Potholes: {overlay.potholes?.length || 0}</div>
        </div>
      )}
      <div className="border rounded p-4">
        <div className="font-medium mb-2">Messages</div>
        <ul className="list-disc ml-5">
          {messages.map((m) => (
            <li key={m.id}><b>{m.sender || 'system'}:</b> {m.message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}