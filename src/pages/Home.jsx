import React from 'react';
import PodcastCard from '../components/PodcastCard';

export default function Home({ podcasts, loading, error, searchTerm, onSelectPodcast }) {
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 fw-bold text-light mb-0">
          {searchTerm ? `Results for "${searchTerm}"` : 'Trending Technology Podcasts'}
        </h2>
        <span className="text-secondary small">
          {!loading && `${podcasts.length} shows`}
        </span>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-secondary mt-2">Searching podcasts...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && podcasts.length === 0 && (
        <div className="text-center py-5 text-secondary">
          <p className="fs-5">No podcasts found. Try another search term!</p>
        </div>
      )}

      {!loading && !error && podcasts.length > 0 && (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {podcasts.map((podcast) => (
            <div className="col" key={podcast.id}>
              <PodcastCard podcast={podcast} onSelect={onSelectPodcast} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}