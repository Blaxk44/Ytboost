import { useState } from 'react';
import { extractIds } from '../lib/youtube';

export default function Repost() {
  const [url, setUrl] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const run = async () => {
    setError(''); setData(null);
    const [id] = extractIds(url);
    if (!id) { setError('Paste a Shorts URL.'); return; }
    const r = await fetch(`/api/videos?ids=${id}`);
    const d = await r.json();
    if (d.error || !d.items?.length) { setError('Fetch failed.'); return; }
    const v = d.items[0];
    const title = v.snippet.title;
    const tags = (v.snippet.tags || []).slice(0, 12).map(t => '#' + t.replace(/\s+/g, ''));
    const base = `${title}\n\n${tags.join(' ')}`;

    setData({
      tiktok: base + '\n\n#fyp #foryou #viral',
      reels: base + '\n\n#reels #instagood #explore',
      x: `${title}\n\n${tags.slice(0, 3).join(' ')}`,
      pinned: `${title}\n\n${tags.join(' ')}\n\nFull video 👆`,
      rawTitle: title,
      rawTags: v.snippet.tags || [],
    });
  };

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label} caption copied`);
  };

  return (
    <div className="container">
      <h1>♻️ Cross-Platform Repost Kit</h1>
      <p className="meta">
        Pulls title + tags from a YouTube video and generates ready-to-paste
        captions for TikTok, Reels, X, and pinned comments.
      </p>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <input placeholder="https://youtube.com/shorts/..." value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && run()} />
        <button onClick={run}>Generate</button>
      </div>

      {error && <div className="error">{error}</div>}

      {data && (
        <div className="section">
          {['tiktok', 'reels', 'x', 'pinned'].map(k => (
            <div key={k} className="score-card" style={{ textAlign: 'left', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ textTransform: 'capitalize' }}>{k}</strong>
                <button onClick={() => copy(data[k], k)}>Copy</button>
              </div>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', marginTop: 10 }}>
                {data[k]}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
