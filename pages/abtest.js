import { useState, useEffect } from 'react';

const KEY = 'yt_ab_tests_v1';

export default function ABTest() {
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState({ videoId: '', variantA: '', variantB: '', ctrA: '', ctrB: '' });

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setTests(JSON.parse(raw));
  }, []);

  const save = (next) => { setTests(next); localStorage.setItem(KEY, JSON.stringify(next)); };

  const add = () => {
    if (!form.videoId || !form.variantA || !form.variantB) return;
    save([...tests, { ...form, id: Date.now(), winner: null }]);
    setForm({ videoId: '', variantA: '', variantB: '', ctrA: '', ctrB: '' });
  };

  const pickWinner = (id, side) => {
    save(tests.map(t => t.id === id ? { ...t, winner: side } : t));
  };

  const remove = (id) => save(tests.filter(t => t.id !== id));

  return (
    <div className="container">
      <h1>🧪 Thumbnail / Title A/B Tracker</h1>
      <p className="meta">
        Log variant CTRs from YouTube Studio → compare → pick winner. Stored
        locally in your browser (no server, no leaks).
      </p>

      <div className="section">
        <div className="flex-row">
          <input placeholder="Video ID (11 chars)" value={form.videoId}
            onChange={e => setForm({ ...form, videoId: e.target.value })} />
          <input placeholder="Variant A label / thumbnail URL" value={form.variantA}
            onChange={e => setForm({ ...form, variantA: e.target.value })} />
          <input placeholder="Variant B label / thumbnail URL" value={form.variantB}
            onChange={e => setForm({ ...form, variantB: e.target.value })} />
          <input placeholder="CTR A (%)" type="number" step="0.01" value={form.ctrA}
            onChange={e => setForm({ ...form, ctrA: e.target.value })} />
          <input placeholder="CTR B (%)" type="number" step="0.01" value={form.ctrB}
            onChange={e => setForm({ ...form, ctrB: e.target.value })} />
        </div>
        <button style={{ marginTop: 12 }} onClick={add}>Add Test</button>
      </div>

      <div className="section">
        <h2>Tests</h2>
        {tests.length === 0 && <div className="meta">No tests yet.</div>}
        {tests.map(t => {
          const a = +t.ctrA || 0, b = +t.ctrB || 0;
          const lead = a > b ? 'A' : b > a ? 'B' : '—';
          return (
            <div key={t.id} className="score-card" style={{ textAlign: 'left', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Video {t.videoId}</strong>
                <button onClick={() => remove(t.id)}
                  style={{ background: '#3a1a1a', color: '#ff8a8a', padding: '4px 10px' }}>
                  Delete
                </button>
              </div>
              <div className="flex-row" style={{ marginTop: 10 }}>
                <div>
                  <div className="meta">Variant A</div>
                  <div className="stat-value">{t.variantA} · {a}%</div>
                </div>
                <div>
                  <div className="meta">Variant B</div>
                  <div className="stat-value">{t.variantB} · {b}%</div>
                </div>
                <div>
                  <div className="meta">Leader</div>
                  <div className="stat-value" style={{ color: '#3ea6ff' }}>{lead}</div>
                </div>
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <button onClick={() => pickWinner(t.id, 'A')}
                  style={{ background: t.winner === 'A' ? '#3ea6ff' : '#272727', color: t.winner === 'A' ? '#0f0f0f' : '#f1f1f1' }}>
                  Ship A
                </button>
                <button onClick={() => pickWinner(t.id, 'B')}
                  style={{ background: t.winner === 'B' ? '#3ea6ff' : '#272727', color: t.winner === 'B' ? '#0f0f0f' : '#f1f1f1' }}>
                  Ship B
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
