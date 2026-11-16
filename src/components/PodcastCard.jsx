import React from 'react';

export default function PodcastCard({ podcast, onSelect }) {
  return (
    <div 
      className="card bg-secondary bg-opacity-10 border-0 h-100 shadow-sm text-light" 
      style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
      onClick={() => onSelect(podcast)}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <img
        src={podcast.artwork || '/placeholder-cover.png'}
        alt={podcast.title}
        className="card-img-top rounded-top"
        style={{ aspectRatio: '1/1', objectFit: 'cover' }}
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title fs-6 fw-bold text-truncate">{podcast.title}</h5>
        <p className="card-text text-muted small text-truncate mb-2">{podcast.author}</p>
        {podcast.genre && (
          <span className="badge bg-secondary align-self-start mt-auto">
            {podcast.genre}
          </span>
        )}
      </div>
    </div>
  );
}