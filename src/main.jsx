import React from "react";
import ReactDOM from "react-dom/client";
import FarmSimCanvas from "./components/FarmSimCanvas";
import "./index.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, fontFamily: 'Arial, sans-serif' }}>
          <h1>Something went wrong.</h1>
          <p>The game encountered an error. Try these solutions:</p>
          <ol>
            <li><button onClick={() => window.location.reload()}>Reload the page</button></li>
            <li><button onClick={() => { localStorage.clear(); window.location.reload(); }}>Clear save data and reload</button></li>
          </ol>
          <details style={{ marginTop: 16 }}>
            <summary>Error details:</summary>
            <pre style={{ whiteSpace: "pre-wrap", background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
              {String(this.state.error)}
            </pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <FarmSimCanvas />
    </ErrorBoundary>
  </React.StrictMode>
);
