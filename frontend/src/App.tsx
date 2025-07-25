import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import FileAnalyzer from './components/FileAnalyzer';

// OPTIONAL: App icon SVG (brand feel, can replace with your own)
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

// Fancy drop shadow for floating buttons/card
const ELEVATION = '0 3px 16px #2e31a390, 0 1.5px 7px #70c0ff23';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  // Dashboard / Authenticated
  if (token) {
    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100vw',
          background: CALM_DARK_BG,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          overflow: "auto",
          padding: 0,
        }}
      >
        {/* LOGO & BRANDING HEADER */}
        <header
          style={{
            width: '100vw',
            maxWidth: 590,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 18,
            margin: '0 auto 0 auto',
            padding: "22px 0px 0 0px",
            position: "relative"
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14, background: '#232c4e', boxShadow: ELEVATION,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <AppLogo />
            </div>
            <span style={{
              color: '#bcd0fa',
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: '0.03em',
              textShadow: "0 2px 16px #66f1ea2a"
            }}>CyberGuard</span>
          </div>
          {/* ---- Logout Button top right ---- */}
          <button
            style={{
              position: 'relative',
              top: 0, right: 6,
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
            onClick={() => setToken(null)}
            title="Logout"
            aria-label="Logout"
            onMouseOver={e => (e.currentTarget.style.boxShadow = '0 5px 28px #6366f176')}
            onMouseOut={e => (e.currentTarget.style.boxShadow = '0 2px 12px #41379850')}
          >
            Logout
          </button>
        </header>

        {/* Dashboard TITLE */}
        <div
          style={{
            color: '#edf2fa',
            fontWeight: 900,
            fontSize: 29,
            margin: '28px 0 20px 0',
            letterSpacing: "0.01em",
            textShadow: "0 2px 12px #B6CCFA15"
          }}
        >
          Deep File Threat Analysis
        </div>
        {/* Main analyzer panel */}
        <div style={{
          width: "100vw", display: "flex", flexDirection: "column", alignItems: "center"
        }}>
          <FileAnalyzer />
        </div>
        {/* Decorative gradient background overlay */}
        <div style={{
          position: "fixed",
          left: 0,
          bottom: 0,
          width: "100vw", height: 140,
          background:
            "radial-gradient(ellipse at 70% 140%, #6366f1cc 0%, transparent 70%)",
          opacity: 0.16,
          pointerEvents: "none",
          zIndex: 0
        }}/>
      </div>
    );
  }

  // Not logged in: show Login or Register (in dark-calm glass background)
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: CALM_DARK_BG,
        padding: 0,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div style={{
        width: "100%", minHeight: "100vh",
        display: "flex", alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        backdropFilter: "blur(1.6px)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 32
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
  );
};

export default App;
