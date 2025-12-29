import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const BASE_URL = "https://api.themoviedb.org/3";

export const fetchUpcomingMovies = (page = 1) => {
  if (!API_KEY) {
    return Promise.reject(new Error("Missing TMDB API key (VITE_TMDB_API_KEY)."));
  }
  return axios.get(`${BASE_URL}/movie/upcoming`, {
    params: {
      api_key: API_KEY,
      language: "en-US",
      page,
    },
  });
};

export const searchUpcomingMovies = (query, page = 1) => {
  if (!API_KEY) {
    return Promise.reject(new Error("Missing TMDB API key (VITE_TMDB_API_KEY)."));
  }
  return axios.get(`${BASE_URL}/search/movie`, {
    params: {
      api_key: API_KEY,
      query,
      page,
    },
  });
};

export const searchMovies = (query, page = 1) => {
  if (!ACCESS_TOKEN) {
    return Promise.reject(new Error("Missing TMDB v4 access token (VITE_TMDB_ACCESS_TOKEN)."));
  }
  return axios.get(`${BASE_URL}/search/movie`, {
    params: {
      query,
      page,
    },
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });
};
