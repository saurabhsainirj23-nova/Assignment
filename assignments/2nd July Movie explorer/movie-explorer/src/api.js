import axios from "axios";

const BASE_URL = "https://api.themoviedb.org/3";

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("API Error:", error.message);
      return Promise.reject(error);
    }
  );

  return instance;
};

const api = createAxiosInstance();

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key, data) => {
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
};

const getApiKey = () => import.meta.env.VITE_TMDB_API_KEY;

const handleError = (error, context) => {
  if (error.response) {
    console.error(`${context} - Server error:`, error.response.status);
  } else if (error.request) {
    console.error(`${context} - Network error`);
  } else {
    console.error(`${context} - Error:`, error.message);
  }
  return { results: [], total_results: 0, total_pages: 0 };
};

const buildParams = (page = 1) => ({
  api_key: getApiKey(),
  language: "en-US",
  page,
});

export const fetchTrendingMovies = async (page = 1) => {
  const cacheKey = `trending_${page}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const res = await api.get("/trending/movie/week", { params: buildParams(page) });
    setCachedData(cacheKey, res.data);
    return res.data;
  } catch (error) {
    return handleError(error, "Trending movies");
  }
};

export const fetchUpcomingMovies = async (page = 1) => {
  const cacheKey = `upcoming_${page}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const res = await api.get("/movie/upcoming", { params: buildParams(page) });
    setCachedData(cacheKey, res.data);
    return res.data;
  } catch (error) {
    return handleError(error, "Upcoming movies");
  }
};

export const searchMovies = async (query, page = 1) => {
  if (!query.trim() || !getApiKey()) return { results: [], total_results: 0 };

  const cacheKey = `search_${query.trim()}_${page}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const res = await api.get("/search/movie", {
      params: { ...buildParams(page), query: query.trim() },
    });
    setCachedData(cacheKey, res.data);
    return res.data;
  } catch (error) {
    return handleError(error, "Search movies");
  }
};

export const fetchMovieDetails = async (movieId) => {
  const cacheKey = `movie_${movieId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const res = await api.get(`/movie/${movieId}`, { params: buildParams() });
    setCachedData(cacheKey, res.data);
    return res.data;
  } catch (error) {
    handleError(error, "Movie details");
    return null;
  }
};

export const fetchGenres = async () => {
  const cacheKey = "genres";
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const res = await api.get("/genre/movie/list", { params: buildParams() });
    setCachedData(cacheKey, res.data.genres || []);
    return res.data.genres || [];
  } catch (error) {
    handleError(error, "Genres");
    return [];
  }
};
