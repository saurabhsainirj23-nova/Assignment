import { useEffect, useState } from "react";
import { fetchUpcomingMovies } from "../api";
import MovieCard from "../components/MovieCard";

const UpcomingMovies = () => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getMovies = async () => {
      setLoading(true);
      setError(null);

      const data = await fetchUpcomingMovies(page);
      setMovies((prev) => [...prev, ...(data?.results || [])]);

      setLoading(false);
    };

    getMovies();
  }, [page]);

  return (
    <div>
      <h1>🎬 Upcoming Movies</h1>

      {error && <p className="status-message">{error}</p>}

      <div className="movie-grid">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {loading && <p className="status-message">Loading...</p>}

      {!loading && (
        <div className="load-more-container">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="load-more-btn"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default UpcomingMovies;
