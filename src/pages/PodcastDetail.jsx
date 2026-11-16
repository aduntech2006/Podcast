import React, { useState, useEffect } from 'react';
import { fetchPodcastEpisodes } from '../api/podcastApi';
import EpisodeItem from '../components/EpisodeItem';

export default function PodcastDetail({ podcast, onBack }) {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadEpisodes() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPodcastEpisodes(podcast.feedUrl);
        if (isMounted) {
          setEpisodes(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load episodes.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadEpisodes();

    return () => {
      isMounted = false;
    };
  }, [podcast]);

  return (
    <div className="container py-4">
      <button onClick={onBack} className="btn btn-outline-light btn-sm mb-5">
        ← Back to Podcasts
      </button>

      {/* Podcast Header */}
      <div className="row align-items-center bg-dark p-4 rounded-3 border border-secondary mb-4 g-4">
        <div className="col-auto">
          <img
            src={podcast.artwork || '/placeholder-cover.png'}
            alt={podcast.title}
            className="rounded shadow"
            style={{ width: '140px', height: '140px', objectFit: 'cover' }}
          />
        </div>
        <div className="col">
          {podcast.genre && (
            <span className="badge bg-success mb-2">{podcast.genre}</span>
          )}
          <h1 className="h3 fw-bold text-light mb-1">{podcast.title}</h1>
          <p className="text-secondary mb-2">{podcast.author}</p>
          <p className="text-secondary small mb-0">
            {podcast.trackCount ? `${podcast.trackCount} total episodes` : ''}
          </p>
        </div>
      </div>

      {/* Episodes List */}
      <h3 className="h5 fw-bold text-light mb-3">Latest Episodes</h3>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading episodes...</span>
          </div>
          <p className="text-secondary mt-2">Fetching RSS feed...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && episodes.length === 0 && (
        <p className="text-secondary">No playable episodes found in this feed.</p>
      )}

      {!loading && !error && episodes.length > 0 && (
        <div>
          {episodes.map((episode) => (
            <EpisodeItem key={episode.id} episode={episode} />
          ))}
        </div>
      )}
    </div>
  );
}