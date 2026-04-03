import { useEffect, useState, useCallback } from "react";
import { fetchUpcomingMovies } from "../api";
import MovieCard from "../components/MovieCard";

const UpcomingMovies = () => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const loadMovies = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError(null);

    const data = await fetchUpcomingMovies(pageNum);
    const newMovies = data?.results || [];
    
    if (pageNum === 1) {
      setMovies(newMovies);
    } else {
      setMovies((prev) => [...prev, ...newMovies]);
    }
    
    setHasMore(newMovies.length > 0);
    setLoadingInitial(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const load = async () => {
      const data = await fetchUpcomingMovies(1);
      if (isMounted) {
        setMovies(data.results || []);
        setHasMore((data.results || []).length > 0);
        setLoadingInitial(false);
      }
    };
    load();
    
    return () => { isMounted = false; };
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMovies(nextPage);
    }
  }, [hasMore, loading, page, loadMovies]);

  return (
    <div>
      <h1>Upcoming Movies</h1>

      {error && <p className="status-message">{error}</p>}

      <div className="movie-grid">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {loading && <p className="status-message">Loading...</p>}

      {!loadingInitial && movies.length === 0 && !error && (
        <p className="status-message">No upcoming movies found.</p>
      )}

      {!loadingInitial && hasMore && (
        <div className="load-more-container">
          <button
            onClick={handleLoadMore}
            className="load-more-btn"
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default UpcomingMovies;
