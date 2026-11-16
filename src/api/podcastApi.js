const ITUNES_BASE_URL = 'https://itunes.apple.com/search';

const CACHE_KEY = 'podcast_episodes_cache_v2';
const loadCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
  } catch {
    return {};
  }
};
const episodeCache = loadCache();
const saveCache = () => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(episodeCache));
  } catch {
    // Ignore storage quota errors
  }
};

const inFlightRequests = {};

export async function searchPodcasts(term = 'technology', limit = 16) {
  const query = term.trim() || 'technology';
  const url = `${ITUNES_BASE_URL}?media=podcast&term=${encodeURIComponent(query)}&limit=${limit}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch podcasts from iTunes');
  }

  const data = await response.json();

  return data.results.map((podcast) => ({
    id: podcast.collectionId,
    title: podcast.collectionName,
    author: podcast.artistName,
    artwork: podcast.artworkUrl600 || podcast.artworkUrl100,
    feedUrl: podcast.feedUrl,
    genre: podcast.primaryGenreName,
    trackCount: podcast.trackCount,
  }));
}

export async function fetchPodcastEpisodes(feedUrl) {
  if (!feedUrl) {
    throw new Error('No RSS feed URL provided for this podcast');
  }

  if (episodeCache[feedUrl]) {
    return episodeCache[feedUrl];
  }

  if (inFlightRequests[feedUrl]) {
    return inFlightRequests[feedUrl];
  }

  inFlightRequests[feedUrl] = (async () => {
    try {
      let xmlText = null;

      // 1. Primary: Your own Vite server proxy (zero CORS, zero rate limits)
      try {
        const localRes = await fetch(`/api/rss?url=${encodeURIComponent(feedUrl)}`);
        if (localRes.ok) {
          const text = await localRes.text();
          if (text.includes('<rss') || text.includes('<channel')) {
            xmlText = text;
          }
        }
      } catch {
        // Fallback if not running on Vite dev server
      }

      // 2. Fallback: AllOrigins public proxy
      if (!xmlText) {
        const backupRes = await fetch(
          `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`
        );
        if (backupRes.ok) {
          const json = await backupRes.json();
          if (json.contents && (json.contents.includes('<rss') || json.contents.includes('<channel'))) {
            xmlText = json.contents;
          }
        }
      }

      if (!xmlText) {
        throw new Error('Could not load RSS feed from this podcast server.');
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      const podcastTitle =
        xmlDoc.querySelector('channel > title')?.textContent || 'Podcast';
      const channelImage =
        xmlDoc.querySelector('channel > image > url')?.textContent ||
        xmlDoc.getElementsByTagName('itunes:image')[0]?.getAttribute('href') ||
        '';

      const items = Array.from(xmlDoc.querySelectorAll('item')).slice(0, 25);

      const validEpisodes = items
        .map((item, index) => {
          const enclosureUrl = item.querySelector('enclosure')?.getAttribute('url');
          if (!enclosureUrl) return null;

          const itemImage =
            item.getElementsByTagName('itunes:image')[0]?.getAttribute('href') ||
            channelImage;

          const pubDateRaw = item.querySelector('pubDate')?.textContent;

          return {
            id: item.querySelector('guid')?.textContent || `${feedUrl}-${index}`,
            title: item.querySelector('title')?.textContent || 'Untitled Episode',
            pubDate: pubDateRaw
              ? new Date(pubDateRaw).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Recent',
            description:
              item.querySelector('description')?.textContent || 'No description.',
            audioUrl: enclosureUrl,
            duration: item.querySelector('enclosure')?.getAttribute('duration') || 0,
            artwork: itemImage,
            podcastTitle,
          };
        })
        .filter(Boolean);

      if (validEpisodes.length === 0) {
        throw new Error('No playable audio episodes found in this feed.');
      }

      episodeCache[feedUrl] = validEpisodes;
      saveCache();
      return validEpisodes;
    } finally {
      delete inFlightRequests[feedUrl];
    }
  })();

  return inFlightRequests[feedUrl];
}