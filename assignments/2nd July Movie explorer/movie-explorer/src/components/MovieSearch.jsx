import React, { useState } from "react";
import { searchMovies } from "../api";

export default function MovieSearch() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchMovies(query, 1);
      setMovies(res.data?.results || []);
    } catch (e) {
      setError("Search failed. Please check your API token.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Movie Search (TMDb)</h2>

      <input
        type="text"
        placeholder="Search for a movie..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: "10px", width: "250px", marginRight: "10px" }}
      />

      <button onClick={handleSearch} style={{ padding: "10px" }}>
        Search
      </button>

      {loading && <p className="status-message">Searching...</p>}
      {error && <p className="status-message" style={{ color: "#ff6b6b" }}>{error}</p>}

      <div style={{ marginTop: "20px" }}>
        {movies.length === 0 ? (
          <p>No results yet.</p>
        ) : (
          movies.map((movie) => (
            <div key={movie.id} style={{ marginBottom: "10px" }}>
              <strong>{movie.title}</strong> {movie.release_date ? `(${movie.release_date})` : ""}
            </div>
          ))
        )}
      </div>
    </div>
  );
}