import React, { useState } from 'react';

export default function Navbar({ onSearch, onResetHome }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-4 shadow-sm">
      <div className="container-fluid">
        <span 
          className="navbar-brand fw-bold text-success fs-4" 
          style={{ cursor: 'pointer' }} 
          onClick={onResetHome}
        >
          🎙️ PodWave
        </span>
        <form className="d-flex w-50" onSubmit={handleSubmit}>
          <input
            className="form-control me-2 bg-secondary text-light border-0"
            type="search"
            placeholder="Search podcasts (e.g., tech, news)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-success fw-bold px-4" type="submit">
            Search
          </button>
        </form>
      </div>
    </nav>
  );
}