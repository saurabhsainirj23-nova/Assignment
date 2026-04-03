import { FaStar, FaRegStar } from "react-icons/fa";
import { useFavorites } from "../hooks/useFavorites";

const FavoriteButton = ({ event }) => {
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    isFavorite(event._id)
      ? removeFromFavorites(event._id)
      : addToFavorites(event);
  };

  return (
    <button
      className={`favorite-button ${
        isFavorite(event._id) ? "is-favorite" : ""
      }`}
      onClick={toggle}
      title={
        isFavorite(event._id)
          ? "Remove from favorites"
          : "Add to favorites"
      }
    >
      {isFavorite(event._id) ? <FaStar /> : <FaRegStar />}
    </button>
  );
};

export default FavoriteButton;
