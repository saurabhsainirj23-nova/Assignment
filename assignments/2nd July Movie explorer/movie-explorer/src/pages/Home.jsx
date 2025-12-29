import React, { useState } from "react";
import { searchMovies } from "../api";
import MovieCard from "../components/MovieCard";

const Home = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await searchMovies(query, 1);
      setResults(res.data.results || []);
    } catch (err) {
      setError("Search failed. Please check your API key.");
    }
    setLoading(false);
  };

  return (
    <div>
      <section className="hero">
        <h1>🎥 Movie Explorer</h1>
        <p>Discover upcoming titles and search for movies by name.</p>
        <form className="search-bar" onSubmit={onSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="search-btn" type="submit">Search</button>
        </form>
        {error && <p className="status-message">{error}</p>}
      </section>

      <section>
        {loading && <p className="status-message">Searching...</p>}
        {!loading && results.length === 0 && query && !error && (
          <p className="status-message">No results found for "{query}".</p>
        )}
        <div className="movie-grid">
          {results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;