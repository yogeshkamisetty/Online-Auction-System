import { Component } from 'react';

// Catches render errors in any child so one broken component doesn't blank the whole app.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Hook for Sentry later: Sentry.captureException(error, { extra: info });
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ maxWidth: 560, margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ color: 'var(--error)' }}>Something went wrong</h1>
          <p style={{ color: 'var(--on-surface-variant)' }}>
            An unexpected error occurred. Try reloading the page.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
