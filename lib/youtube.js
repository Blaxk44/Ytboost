const KEY = () => process.env.YOUTUBE_API_KEY;

export function extractIds(text) {
  const re = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/g;
  const set = new Set();
  for (const m of text.matchAll(re)) set.add(m[1]);
  return [...set];
}

export async function fetchVideos(ids) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${ids.join(',')}&key=${KEY()}`;
  const r = await fetch(url);
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.items || [];
}

export function parseDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return '0:00';
  const h = +(m[1] || 0), min = +(m[2] || 0), s = +(m[3] || 0);
  const pad = n => String(n).padStart(2, '0');
  return h ? `${h}:${pad(min)}:${pad(s)}` : `${min}:${pad(s)}`;
}
