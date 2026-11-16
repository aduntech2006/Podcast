import React from 'react';
import { useAudio } from '../context/AudioContext';

export default function BottomPlayer() {
  const {
    currentEpisode,
    isPlaying,
    currentTime = 0,
    duration = 0,
    volume = 1,
    isMuted = false,
    playEpisode,
    pauseEpisode,
    seekTo,
    skipTime,
    changeVolume,
    toggleMute,
  } = useAudio();

  const handleTogglePlay = () => {
    if (!currentEpisode) return;
    if (isPlaying) {
      pauseEpisode();
    } else {
      playEpisode(currentEpisode);
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return '🔇';
    if (volume < 0.5) return '🔉';
    return '🔊';
  };

  return (
    <div
      className="fixed-bottom bg-dark text-white border-top border-secondary py-2 px-3 shadow-lg"
      style={{ zIndex: 1050 }}
    >
      <div className="container-fluid d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
        
        {/* Episode Artwork & Title */}
        <div className="d-flex align-items-center gap-3" style={{ minWidth: '200px' }}>
          {currentEpisode ? (
            <>
              <img
                src={currentEpisode.artwork || 'https://via.placeholder.com/48'}
                alt={currentEpisode.title}
                className="rounded"
                style={{ width: '48px', height: '48px', objectFit: 'cover' }}
              />
              <div className="text-truncate" style={{ maxWidth: '180px' }}>
                <div className="fw-semibold text-truncate small">{currentEpisode.title}</div>
                <div className="text-secondary text-truncate" style={{ fontSize: '0.75rem' }}>
                  {currentEpisode.podcastTitle}
                </div>
              </div>
            </>
          ) : (
            <div className="text-secondary small">
              No episode playing — pick one to start listening
            </div>
          )}
        </div>

        {/* Playback Controls */}
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => skipTime && skipTime(-15)}
            disabled={!currentEpisode}
            className="btn btn-outline-light btn-sm rounded-pill px-2"
            title="Rewind 15 seconds"
          >
            ↺ 15s
          </button>

          <button
            onClick={handleTogglePlay}
            disabled={!currentEpisode}
            className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '42px', height: '42px' }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <button
            onClick={() => skipTime && skipTime(30)}
            disabled={!currentEpisode}
            className="btn btn-outline-light btn-sm rounded-pill px-2"
            title="Forward 30 seconds"
          >
            30s ↻
          </button>
        </div>

        {/* Scrubber Bar */}
        <div className="d-flex align-items-center gap-2 flex-grow-1 w-100" style={{ maxWidth: '400px' }}>
          <span className="small text-secondary">{formatTime(currentTime)}</span>
          <input
            type="range"
            className="form-range flex-grow-1"
            min={0}
            max={duration || 0}
            value={currentTime}
            disabled={!currentEpisode}
            onChange={(e) => seekTo && seekTo(Number(e.target.value))}
          />
          <span className="small text-secondary">{formatTime(duration)}</span>
        </div>

        {/* Volume & Mute Controls */}
        <div className="d-none d-lg-flex align-items-center gap-2" style={{ width: '140px' }}>
          <button
            onClick={() => toggleMute && toggleMute()}
            className="btn btn-link text-white text-decoration-none p-0 fs-5"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {getVolumeIcon()}
          </button>
          <input
            type="range"
            className="form-range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => changeVolume && changeVolume(Number(e.target.value))}
            aria-label="Volume"
          />
        </div>

      </div>
    </div>
  );
}

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}