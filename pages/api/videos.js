import { fetchVideos } from '../../lib/youtube';

export default async function handler(req, res) {
  const { ids } = req.query;
  if (!process.env.YOUTUBE_API_KEY)
    return res.status(500).json({ error: 'YOUTUBE_API_KEY not set' });
  if (!ids) return res.status(400).json({ error: 'Missing ids' });

  const list = ids.split(',').slice(0, 50);
  try {
    const items = await fetchVideos(list);
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ items });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}
