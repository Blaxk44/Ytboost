import { useState, useMemo, useRef } from 'react';
import { FixedSizeGrid } from 'react-window';
import { extractIds } from '../lib/youtube';
import { pool, chunk } from '../lib/pool';

function fmt(n) {
  n = Number(n || 0);
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

function useGridSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 1200, h: 700 });
  const setRef = (el) => {
    ref.current = el;
    if (el) {
      const update = () => setSize({ w: el.clientWidth, h: Math.max(500, window.innerHeight - 320) });
      update();
      window.addEventListener('resize', update);
    }
  };
  return [setRef, size];
}

const COL_MIN = 340, ROW_H = 300;

export default function Home() {
  const [input, setInput] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [gridRef, size] = useGridSize();

  const cols = Math.max(1, Math.floor(size.w / COL_MIN));
  const colW = Math.floor(size.w / cols);

  const load = async () => {
    setError(''); setVideos([]);
    const ids = extractIds(input);
    if (!ids.length) { setError('No YouTube URLs found.'); return; }
    setLoading(true);

    const batches = chunk(ids, 50);
    let done = 0;
    const results = await pool(
      batches,
      async (b) => {
        const r = await fetch(`/api/videos?ids=${b.join(',')}`);
        const d = await r.json();
        if (d.error) throw new Error(d.error);
        done++;
        setProgress(`${done}/${batches.length} batches`);
        return d.items || [];
      },
      6 // 6 parallel batches = up to 300 videos at once, scale-safe
    );

    const flat = results.flat().filter(v => v && !v.__error);
    const map = Object.fromEntries(flat.map(v => [v.id, v]));
    setVideos(ids.map(id => map[id]).filter(Boolean));
    setProgress('');
    setLoading(false);
  };

  const Cell = useMemo(() => ({ columnIndex, rowIndex, style, data }) => {
    const idx = rowIndex * cols + columnIndex;
    const v = data[idx];
    if (!v) return null;
    return (
      <div style={{ ...style, padding: 8 }}>
        <div className="card" style={{ height: '100%' }}>
          <div className="iframe-wrap">
            <iframe
              src={`https://www.youtube.com/embed/${v.id}`}
              allowFullScreen loading="lazy" title={v.snippet.title}
            />
          </div>
          <div className="card-body">
            <h4>{v.snippet.title}</h4>
            <div className="meta">{v.snippet.channelTitle}</div>
            <div className="stats">
              <span><span className="stat-value">{fmt(v.statistics.viewCount)}</span> views</span>
              <span><span className="stat-value">{fmt(v.statistics.likeCount)}</span> likes</span>
            </div>
          </div>
        </div>
      </div>
    );
  }, [cols]);

  const rows = Math.ceil(videos.length / cols);

  return (
    <div className="container">
      <h1>📺 Multi-Video Dashboard</h1>
      <p className="meta">
        Handles thousands of URLs. Batched 50-per-request with 6-way concurrency,
        virtualized grid so only visible cards render — no lag regardless of count.
      </p>

      <textarea
        rows={6}
        style={{ marginTop: 12 }}
        placeholder="Paste unlimited YouTube URLs — one per line or mixed"
        value={input}
        onChange={e => setInput(e.target.value)}
      />

      <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
        <button onClick={load} disabled={loading}>
          {loading ? `Loading… ${progress}` : 'Load Videos'}
        </button>
        <span className="meta">{videos.length} loaded</span>
      </div>

      {error && <div className="error">{error}</div>}

      {videos.length > 0 && (
        <div ref={gridRef} style={{ height: size.h, marginTop: 16 }}>
          <FixedSizeGrid
            columnCount={cols}
            rowCount={rows}
            columnWidth={colW}
            rowHeight={ROW_H}
            width={size.w}
            height={size.h}
            itemData={videos}
          >
            {Cell}
          </FixedSizeGrid>
        </div>
      )}
    </div>
  );
}
