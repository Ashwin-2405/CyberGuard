import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import FileAnalyzer from './components/FileAnalyzer';
import ResultPage from './components/ResultPage';

const AppLogo = () => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true">
    <circle cx="19" cy="19" r="19" fill="#353C68" />
    <ellipse cx="19" cy="14" rx="10" ry="3.2" fill="#6366F1" />
    <ellipse cx="19" cy="14" rx="6.4" ry="2" fill="#a5b4fc" />
    <rect x="14.5" y="22" width="9" height="5" rx="2.5" fill="#0ea5e9" />
    <rect x="16.4" y="24.1" width="5.2" height="1.8" rx="0.9" fill="#60a5fa" />
  </svg>
);

const CALM_DARK_BG = 'linear-gradient(117deg, #26283e 56%, #23234f 95%, #5c38fa 130%)';
const ELEVATION = '0 3px 16px #2e31a390, 0 1.5px 7px #70c0ff23';

// ---- Clean, zero-overlap dashboard shell ----
const DashboardShell: React.FC<{ onLogout: () => void; children: React.ReactNode }> = ({ onLogout, children }) => (
  <div
    style={{
      minHeight: '100vh',
      width: '100vw',
      background: CALM_DARK_BG,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflow: 'hidden',
      padding: 0,
    }}
  >
    {/* ---- HEADER, always at the top ---- */}
    <header style={{
      width: '100%',
      maxWidth: 680,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      margin: '0 auto',
      padding: "25px 32px 0 32px",
      position: "relative",
      background: "none"
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 13
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 14, background: '#232c4e', boxShadow: ELEVATION,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <AppLogo />
        </div>
        <span style={{
          color: '#bcd0fa',
          fontWeight: 800,
          fontSize: 23,
          letterSpacing: '0.03em',
          textShadow: "0 2px 16px #66f1ea2a"
        }}>CyberGuard</span>
      </div>
      <button
        style={{
          border: 'none',
          background: 'linear-gradient(95deg, #6366f1 64%, #0ea5e9 100%)',
          color: '#fff',
          padding: '10px 1.85em',
          borderRadius: 7,
          fontWeight: 650,
          letterSpacing: '1px',
          fontSize: '1em',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: '0 2px 12px #41379850',
          zIndex: 20,
          transition: 'box-shadow 0.16s, background 0.16s',
        }}
        onClick={onLogout}
        title="Logout"
        aria-label="Logout"
        onMouseOver={e => (e.currentTarget.style.boxShadow = '0 5px 28px #6366f176')}
        onMouseOut={e => (e.currentTarget.style.boxShadow = '0 2px 12px #41379850')}
      >
        Logout
      </button>
    </header>
    {/* Spacing below header */}
    <div style={{ height: 0, marginBottom: 20 }} />
    {/* ---- Main content card, always centered, never overlaps the header ---- */}
    <div
      style={{
        flex: 1,
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 0,
      }}
    >
      <div
        style={{
          background: 'rgba(25,27,39,0.98)',
          borderRadius: 26,
          boxShadow: '0 9px 40px #2d279c25',
          minWidth: 260,
          width: '96vw',
          maxWidth: 440,
          minHeight: 100, // min size for appearance
          maxHeight: 720,
          padding: "0px 0 0 0",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
    {/* ---- Decorative gradient ---- */}
    <div style={{
      position: "fixed",
      left: 0,
      bottom: 0,
      width: "100vw", height: 140,
      background: "radial-gradient(ellipse at 70% 140%, #6366f1cc 0%, transparent 70%)",
      opacity: 0.11,
      pointerEvents: "none",
      zIndex: 0
    }} />
  </div>
);

// ---- All post-login routes ----
const DashboardRoutes: React.FC<{ onLogout: () => void }> = ({ onLogout }) => (
  <Routes>
    <Route
      path="/"
      element={
        <DashboardShell onLogout={onLogout}>
          <div style={{
            color: '#edf2fa',
            fontWeight: 900,
            fontSize: 22,
            margin: '25px 0 18px 0',
            letterSpacing: "0.01em",
            textShadow: "0 2px 9px #B6CCFA13",
            textAlign: 'center'
          }}>
            Deep File Threat Analysis
          </div>
          <FileAnalyzer />
        </DashboardShell>
      }
    />
    <Route
      path="/results"
      element={
        <DashboardShell onLogout={onLogout}>
          <ResultPage />
        </DashboardShell>
      }
    />
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <Router>
      {token ? (
        <DashboardRoutes onLogout={() => setToken(null)} />
      ) : (
        <div
          style={{
            height: "100vh",
            minHeight: "100dvh",
            width: "100vw",
            background: CALM_DARK_BG,
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{
            width: "100vw", height: "100vh",
            display: "flex", alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            backdropFilter: "blur(2px)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24
            }}>
              <div style={{
                width: 35, height: 35, borderRadius: 10, background: '#232c4e', boxShadow: ELEVATION,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <AppLogo />
              </div>
              <span style={{
                color: '#c4d5fa',
                fontWeight: 790,
                fontSize: 22,
                letterSpacing: '0.025em',
                textShadow: "0 1.5px 9px #64f1ea17"
              }}>CyberGuard Login</span>
            </div>
            <div
              style={{
                background: 'rgba(25,27,39,0.97)',
                borderRadius: 23,
                boxShadow: '0 8px 28px #6366f119, 0 2px 17px #2dd4bf16',
                padding: "2.1em 1.2em 2.1em 1.17em",
                minWidth: 300,
                width: "98vw",
                maxWidth: 355,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {showRegister ? (
                <Register
                  onRegisterSuccess={setToken}
                  switchToLogin={() => setShowRegister(false)}
                />
              ) : (
                <Login
                  onLoginSuccess={setToken}
                  switchToRegister={() => setShowRegister(true)}
                />
              )}
            </div>
          </div>
        </div>
      )}
      <style>{`
        html, body, #root {
          height: 100vh !important;
          min-height: 100dvh !important;
          overflow: hidden !important;
        }
      `}</style>
    </Router>
  );
};

export default App;
