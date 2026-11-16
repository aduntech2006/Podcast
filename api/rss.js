export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PodcastPlayer/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });

    if (!response.ok) {
      return res.status(response.status).send(`Upstream error: ${response.status}`);
    }

    const xml = await response.text();

    // Cache on Vercel's edge CDN for 10 minutes to make repeat loads instant
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(xml);
  } catch (err) {
    return res.status(500).send(`Proxy fetch error: ${err.message}`);
  }
}