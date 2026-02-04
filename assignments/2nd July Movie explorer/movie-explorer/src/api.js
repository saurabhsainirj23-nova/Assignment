// src/api.js
import axios from "axios";

const BASE_URL = "https://api.themoviedb.org/3";

console.log("API KEY:", import.meta.env.VITE_TMDB_API_KEY);

/* 🔹 Fetch Upcoming Movies */
export const fetchUpcomingMovies = async (page = 1) => {
  try {
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

    if (!API_KEY) {
      console.error("TMDB API key missing");
      return { results: [] };
    }

    const res = await axios.get(`${BASE_URL}/movie/upcoming`, {
      params: {
        api_key: API_KEY,
        language: "en-US",
        page,
      },
    });

    return res.data; // { results: [...] }
  } catch (error) {
    console.error("Upcoming movies error:", error);
    return { results: [] };
  }
};

/* 🔹 Search Movies */
export const searchMovies = async (query, page = 1) => {
  try {
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

    if (!API_KEY || !query) {
      return { results: [] };
    }

    const res = await axios.get(`${BASE_URL}/search/movie`, {
      params: {
        api_key: API_KEY,
        query,
        page,
      },
    });

    return res.data; // { results: [...] }
  } catch (error) {
    console.error("Search movies error:", error);
    return { results: [] };
  }
};
