import React, { useState, useEffect } from "react";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import Alert from "./Alert";
import Navbar from "./Navbar";
// import Loader from "./Loader"; // Uncomment if you want a global loader overlay
// import jwt_decode from "jwt-decode"; // If you want to decode the token for username

/**
 * Main App component for CyberGuard
 * - Manages authentication/token state.
 * - Renders Navbar, Auth, or Dashboard as required.
 * - Handles token persistence, logout, and (optional) auto-login expiry.
 * - Smoothly integrates the new design system.
 */
const App: React.FC = () => {
  // Store token in state; initialize from localStorage if exists
  const [token, setToken] = useState<string>(() =>
    localStorage.getItem("token") || ""
  );
  // App-level error (for token/session issues)
  const [appError, setAppError] = useState<string | null>(null);
  // You may add a global loading boolean for future advanced use
  // const [loading, setLoading] = useState(false);

  /**
   * Handles user logout by clearing state and storage
   */
  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  // Optional: extract username from JWT for Navbar
  let username: string | undefined = undefined;
  // If you want to show username in the Navbar, uncomment below and install jwt-decode
  // if (token) {
  //   try {
  //     const decoded = jwt_decode<{ username?: string }>(token);
  //     username = decoded.username;
  //   } catch {
  //     username = undefined;
  //   }
  // }

  // Optionally: Securely auto-logout if token structure is wrong or expired
  useEffect(() => {
    try {
      if (token) {
        // JWT expiry check placeholder (enhance with jwt-decode if needed)
        // import jwt_decode from "jwt-decode";
        // const { exp } = jwt_decode<{ exp: number }>(token);
        // if (exp && Date.now() >= exp * 1000) handleLogout();
      }
    } catch {
      setAppError("Session expired or token invalid. Please log in again.");
      handleLogout();
    }
    // eslint-disable-next-line
  }, [token]);

  return (
    <div className="App min-h-screen bg-slate-50 text-zinc-900">
      {/* Global sticky navbar */}
      <Navbar onLogout={token ? handleLogout : undefined} username={username} />

      {/* App-level alerts */}
      {appError && (
        <Alert type="error" role="alert" className="fade-in-up mb-3">
          {appError}
        </Alert>
      )}

      {/* Main content */}
      <main className="w-full flex-1 flex flex-col">
        {!token ? (
          <Auth setToken={setToken} />
        ) : (
          <Dashboard token={token} onLogout={handleLogout} />
        )}
      </main>

      <footer className="pt-16 text-xs text-muted text-center">
        CyberGuard © {new Date().getFullYear()} &ndash; MLSA Hackathon Demo
      </footer>
    </div>
  );
};

export default App;
