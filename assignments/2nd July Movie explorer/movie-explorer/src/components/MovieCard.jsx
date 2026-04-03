import React, { useState, memo, useCallback } from "react";
import { fetchMovieDetails } from "../api";

const MovieCard = memo(({ movie }) => {
  const [showModal, setShowModal] = useState(false);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const imageUrl = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  const handleCardClick = useCallback(async () => {
    if (details) {
      setShowModal(true);
      return;
    }
    setShowModal(true);
    setLoadingDetails(true);
    const data = await fetchMovieDetails(movie?.id);
    setDetails(data);
    setLoadingDetails(false);
  }, [movie?.id, details]);

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="movie-card" onClick={handleCardClick}>
        <img src={imageUrl} alt={movie?.title || "Movie"} loading="lazy" />
        <div className="movie-card-content">
          <h3>{movie?.title || "Untitled"}</h3>
          <p>📅 {movie?.release_date || "N/A"}</p>
          <p>🌐 {(movie?.original_language || "en").toUpperCase()}</p>
          <p>⭐ {movie?.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</p>
          <p>{movie?.overview || "No description available."}</p>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleClose}>&times;</button>
            
            {loadingDetails ? (
              <div className="modal-loading">Loading...</div>
            ) : details ? (
              <>
                <div className="modal-header">
                  <img 
                    src={details.poster_path 
                      ? `https://image.tmdb.org/t/p/w500${details.poster_path}` 
                      : "https://via.placeholder.com/500x750?text=No+Image"} 
                    alt={details.title}
                    className="modal-poster"
                  />
                  <div className="modal-info">
                    <h2>{details.title}</h2>
                    <div className="modal-meta">
                      <span>{formatDate(details.release_date)}</span>
                      <span>•</span>
                      <span>{details.runtime} min</span>
                      <span>•</span>
                      <span>⭐ {details.vote_average?.toFixed(1)}</span>
                    </div>
                    <div className="modal-genres">
                      {details.genres?.map((g) => (
                        <span key={g.id} className="genre-tag">{g.name}</span>
                      )) || []}
                    </div>
                    {details.tagline && <p className="modal-tagline">{details.tagline}</p>}
                  </div>
                </div>
                <div className="modal-overview">
                  <h3>Overview</h3>
                  <p>{details.overview}</p>
                </div>
                {details.budget > 0 && (
                  <p className="modal-budget">Budget: ${details.budget.toLocaleString()}</p>
                )}
                {details.revenue > 0 && (
                  <p className="modal-revenue">Revenue: ${details.revenue.toLocaleString()}</p>
                )}
              </>
            ) : (
              <p>Failed to load details.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
});

MovieCard.displayName = "MovieCard";

export default MovieCard;
