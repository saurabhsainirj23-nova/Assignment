import { Component } from "react";
import ErrorState from "./ErrorState";

class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error (can be replaced with Sentry / LogRocket)
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({ errorInfo });
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, showDetails = false } = this.props;

    if (hasError) {
      return (
        <ErrorState
          message="Something went wrong while loading this section."
          onRetry={this.handleRetry}
        >
          {showDetails && error && (
            <details className="error-details">
              <summary>Error Details</summary>
              <p>{error.toString()}</p>
              <pre>{errorInfo?.componentStack}</pre>
            </details>
          )}
        </ErrorState>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
