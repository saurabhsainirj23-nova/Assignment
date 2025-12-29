import React, { useEffect, useState } from "react";
import { fetchUpcomingMovies } from "../api";
import MovieCard from "../components/MovieCard";

const UpcomingMovies = () => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchUpcomingMovies(page);
      setMovies((prev) => [...prev, ...res.data.results]);
    } catch (err) {
      setError("Failed to fetch movies. Please check your API key.");
    }
    setLoading(false);
  };

  useEffect(() => {
    getMovies();
  }, [page]);

  return (
    <div>
      <h1>🎬 Upcoming Movies</h1>
      {error && <p className="status-message">{error}</p>}
      {!loading && movies.length === 0 && !error && (
        <p className="status-message">No movies available right now.</p>
      )}
      <div className="movie-grid">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
      <div className="load-more-container">
        <button onClick={() => setPage((prev) => prev + 1)} className="load-more-btn">
          Load More
        </button>
      </div>
      {loading && <p className="status-message">Loading...</p>}
    </div>
  );

};

export default UpcomingMovies;
