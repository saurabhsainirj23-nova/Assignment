import React from "react";

const MovieCard = ({ movie }) => {
  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";
  return (
    <div className="movie-card">
      <img src={imageUrl} alt={movie.title} />
      <div className="movie-card-content">
        <h3>{movie.title}</h3>
        <p>📅 {movie.release_date}</p>
        <p>🌐 {movie.original_language.toUpperCase()}</p>
        <p>⭐ {movie.vote_average}</p>
        <p>{movie.overview}</p>
      </div>
    </div>
  );
};

export default MovieCard;
