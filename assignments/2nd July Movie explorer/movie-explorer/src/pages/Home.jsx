import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchTrendingMovies, searchMovies } from "../api";
import MovieCard from "../components/MovieCard";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const Home = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchMode, setSearchMode] = useState(false);
  
  const debouncedQuery = useDebounce(query, 500);

  const fetchTrending = useCallback(async () => {
    const data = await fetchTrendingMovies(1);
    setTrending(data.results || []);
    setLoadingTrending(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const loadTrending = async () => {
      const data = await fetchTrendingMovies(1);
      if (isMounted) {
        setTrending(data.results || []);
        setLoadingTrending(false);
      }
    };
    loadTrending();
    
    return () => { isMounted = false; };
  }, [fetchTrending]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchMode(false);
      setResults([]);
      setPage(1);
      return;
    }

    setSearchMode(true);
    setLoading(true);
    setError(null);

    let isCancelled = false;

    const performSearch = async () => {
      const data = await searchMovies(debouncedQuery, 1);
      if (!isCancelled) {
        setResults(data.results || []);
        setHasMore((data.results || []).length > 0);
        setPage(1);
        setLoading(false);
      }
    };

    performSearch();

    return () => { isCancelled = true; };
  }, [debouncedQuery]);

  const handleSearch = useCallback(async (searchQuery, searchPage = 1) => {
    setLoading(true);
    setError(null);

    const data = await searchMovies(searchQuery, searchPage);
    const newResults = data.results || [];
    
    if (searchPage === 1) {
      setResults(newResults);
    } else {
      setResults((prev) => [...prev, ...newResults]);
    }
    
    setHasMore(newResults.length > 0);
    setPage(searchPage);
    setLoading(false);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && searchMode) {
      handleSearch(query, page + 1);
    }
  }, [hasMore, loading, searchMode, query, page, handleSearch]);

  const onSearch = useCallback((e) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query, 1);
    }
  }, [query, handleSearch]);

  const skeletonItems = useMemo(() => [...Array(6)], []);

  return (
    <div>
      <section className="hero">
        <h1>Movie Explorer</h1>
        <p>Discover trending movies and search for your favorites.</p>

        <form className="search-bar" onSubmit={onSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="search-btn" type="submit">
            Search
          </button>
        </form>

        {error && <p className="status-message">{error}</p>}
      </section>

      {loadingTrending ? (
        <div className="skeleton-container">
          <h2>Trending Movies</h2>
          <div className="movie-grid">
            {skeletonItems.map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <section>
          {!searchMode && (
            <>
              <h2>Trending Movies</h2>
              <div className="movie-grid">
                {trending.slice(0, 6).map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      <section>
        {loading && <p className="status-message">Searching...</p>}

        {!loading && searchMode && results.length === 0 && query && !error && (
          <p className="status-message">
            No results found for "{query}".
          </p>
        )}

        <div className="movie-grid">
          {results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {searchMode && results.length > 0 && hasMore && !loading && (
          <div className="load-more-container">
            <button onClick={handleLoadMore} className="load-more-btn">
              Load More
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
