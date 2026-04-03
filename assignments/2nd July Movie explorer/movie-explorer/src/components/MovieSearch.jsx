import React, { useState } from "react";
import { searchMovies } from "../api";
import MovieCard from "./MovieCard";

export default function MovieSearch() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const handleSearch = async (searchPage = 1) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    
    try {
      const res = await searchMovies(query, searchPage);
      const results = res?.results || [];
      
      if (searchPage === 1) {
        setMovies(results);
      } else {
        setMovies((prev) => [...prev, ...results]);
      }
      
      setHasMore(results.length > 0);
      setPage(searchPage);
    } catch {
      setError("Search failed. Please check your API token.");
    }
    setLoading(false);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      handleSearch(page + 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(1);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Movie Search (TMDb)</h2>

      <div className="search-bar" style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search for a movie..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="search-input"
        />
        <button onClick={() => handleSearch(1)} className="search-btn">
          Search
        </button>
      </div>

      {loading && <p className="status-message">Searching...</p>}
      {error && <p className="status-message" style={{ color: "#ff6b6b" }}>{error}</p>}

      <div className="movie-grid">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {movies.length > 0 && hasMore && !loading && (
        <div className="load-more-container">
          <button onClick={handleLoadMore} className="load-more-btn">
            Load More
          </button>
        </div>
      )}
    </div>
  );
}