import "./ErrorState.css";

const ErrorState = ({
  title = "Error",
  message = "Something went wrong",
  onRetry,
  children,
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="error-container" role="alert">
      <h2>{title}</h2>
      <p>{message}</p>

      <button className="refresh-btn" onClick={handleRetry}>
        Try Again
      </button>

      {children}
    </div>
  );
};

export default ErrorState;
