import React, { useState, useEffect } from 'react';
import { AudioProvider } from './context/AudioContext';
import { searchPodcasts } from './api/podcastApi';
import Navbar from './components/Navbar';
import BottomPlayer from './components/BottomPlayer';
import Home from './pages/Home';
import PodcastDetail from './pages/PodcastDetail';

export default function App() {
  const [podcasts, setPodcasts] = useState([]);
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPodcasts = async (query = '') => {
    setLoading(true);
    setError(null);
    setSelectedPodcast(null); // Return to grid view on new search
    setSearchTerm(query);

    try {
      const results = await searchPodcasts(query);
      setPodcasts(results);
    } catch (err) {
      setError(err.message || 'Something went wrong while fetching podcasts.');
    } finally {
      setLoading(false);
    }
  };

  // Load initial podcasts on first render
  useEffect(() => {
    loadPodcasts('');
  }, []);

  return (
    <AudioProvider>
      <div className="min-vh-100 bg-black text-light d-flex flex-column">
        <Navbar
          onSearch={(query) => loadPodcasts(query)}
          onResetHome={() => loadPodcasts('')}
        />

        {/* Extra bottom padding (pb-5 mb-5) ensures BottomPlayer never hides content */}
        <main className="flex-grow-1 pb-5 mb-5">
          {selectedPodcast ? (
            <PodcastDetail
              podcast={selectedPodcast}
              onBack={() => setSelectedPodcast(null)}
            />
          ) : (
            <Home
              podcasts={podcasts}
              loading={loading}
              error={error}
              searchTerm={searchTerm}
              onSelectPodcast={(podcast) => setSelectedPodcast(podcast)}
            />
          )}
        </main>

        <BottomPlayer />
      </div>
    </AudioProvider>
  );
}