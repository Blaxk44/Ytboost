import { useState } from 'react';
import { extractIds } from '../lib/youtube';

export default function Retention() {
  const [url, setUrl] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setError(''); setData(null);
    const [id] = extractIds(url);
    if (!id) { setError('Paste a video URL.'); return; }
    setLoading(true);
    try {
      const r = await fetch(`/api/retention?id=${id}`);
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setData(d);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>📉 Retention Drop Analyzer</h1>
      <p className="meta">
        Retention is the strongest ranking signal. This shows estimated drop
        points by sampling audience-retention proxies. For exact data, connect
        the YouTube Analytics API (OAuth) — see notes below.
      </p>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <input
          placeholder="https://youtu.be/..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && run()}
        />
        <button onClick={run} disabled={loading}>{loading ? '…' : 'Analyze'}</button>
      </div>

      {error && <div className="error">{error}</div>}

      {data && (
        <div className="section">
          <h2>{data.title}</h2>
          <div className="meta">Duration {data.duration} · {data.views} views</div>

          <div className="section">
            <h2>Retention Curve (proxy)</h2>
            <svg width="100%" height="220" viewBox="0 0 1000 220" preserveAspectRatio="none">
              <polyline
                fill="none" stroke="#3ea6ff" strokeWidth="3"
                points={data.curve.map((v, i) =>
                  `${(i / (data.curve.length - 1)) * 1000},${220 - v * 2}`
                ).join(' ')}
              />
              <line x1="0" y1="220" x2="1000" y2="220" stroke="#272727" />
            </svg>
            <div className="meta">Y-axis: % of viewers still watching · X-axis: video timeline</div>
          </div>

          <div className="section">
            <h2>Drop-off hotspots</h2>
            {data.drops.map((d, i) => (
              <div key={i} className="score-card" style={{ textAlign: 'left', marginBottom: 10 }}>
                <strong>At {d.at}</strong> — {d.pctDrop}% drop
                <div className="meta">{d.note}</div>
              </div>
            ))}
          </div>

          <div className="section">
            <h2>Fix suggestions</h2>
            <ul>
              {data.fixes.map((f, i) => <li key={i} className="meta">{f}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
