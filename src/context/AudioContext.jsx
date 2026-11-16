import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1); // 0.0 to 1.0
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const playEpisode = (episode) => {
    if (!episode || !episode.audioUrl) return;

    if (currentEpisode?.id !== episode.id) {
      setCurrentEpisode(episode);
      audioRef.current.src = episode.audioUrl;
      audioRef.current.play().catch((err) => console.error('Playback error:', err));
    } else {
      audioRef.current.play().catch((err) => console.error('Playback error:', err));
    }
    setIsPlaying(true);
  };

  const pauseEpisode = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const seekTo = (time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skipTime = (seconds) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const newTime = Math.min(Math.max(0, audio.currentTime + seconds), audio.duration);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Update volume (0 to 1) and unmute automatically if user drags slider above 0
  const changeVolume = (newVolume) => {
    const clamped = Math.min(Math.max(0, newVolume), 1);
    audioRef.current.volume = clamped;
    setVolume(clamped);

    if (clamped > 0 && isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    } else if (clamped === 0) {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  // Toggle mute state without losing previous volume level
  const toggleMute = () => {
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);

    // If unmuting while volume was dragged to 0, restore to 50%
    if (!nextMuted && volume === 0) {
      audioRef.current.volume = 0.5;
      setVolume(0.5);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentEpisode,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playEpisode,
        pauseEpisode,
        seekTo,
        skipTime,
        changeVolume,
        toggleMute,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};