import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request to /api/rss?url=... is fetched server-side by Node (no CORS!)
      '/api/rss': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', () => {});
        },
        bypass: async (req, res) => {
          const urlObj = new URL(req.url, 'http://localhost:5173');
          const feedUrl = urlObj.searchParams.get('url');

          if (!feedUrl) {
            res.statusCode = 400;
            res.end('Missing url parameter');
            return;
          }

          try {
            const response = await fetch(feedUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; PodcastPlayer/1.0)',
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
              },
            });

            if (!response.ok) {
              res.statusCode = response.status;
              res.end(`Upstream error: ${response.status}`);
              return;
            }

            const xml = await response.text();
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            res.end(xml);
          } catch (err) {
            res.statusCode = 500;
            res.end(`Proxy fetch error: ${err.message}`);
          }
        },
      },
    },
  },
});