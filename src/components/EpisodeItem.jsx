import React from 'react';
import { useAudio } from '../context/AudioContext';
import { formatTime } from '../utils/formatTime';

export default function EpisodeItem({ episode }) {
  const { currentEpisode, isPlaying, playEpisode, pauseEpisode } = useAudio();
  const isCurrent = currentEpisode?.id === episode.id;

  const handleTogglePlay = () => {
    if (isCurrent && isPlaying) {
      pauseEpisode();
    } else {
      playEpisode(episode);
    }
  };

  return (
    <div className={`card bg-dark text-light p-3 mb-3 border ${isCurrent ? 'border-success' : 'border-secondary'}`}>
      <div className="d-flex justify-content-between align-items-center gap-3">
        <div className="flex-grow-1 overflow-hidden">
          <div className="text-muted small mb-1">
            {episode.pubDate} {episode.duration > 0 && `• ${formatTime(episode.duration)}`}
          </div>
          <h5 className="fs-6 mb-0 text-truncate">{episode.title}</h5>
        </div>
        <button 
          onClick={handleTogglePlay} 
          className={`btn btn-sm px-3 fw-bold text-nowrap ${isCurrent && isPlaying ? 'btn-outline-success' : 'btn-success'}`}
        >
          {isCurrent && isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>
    </div>
  );
}