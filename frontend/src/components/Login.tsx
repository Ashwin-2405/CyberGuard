import React, { useState } from 'react';
import '../styles/auth.css';

// Elegant app icon/branding (edit or replace as needed)
const LoginLogo = () => (
  <svg width="36" height="36" viewBox="0 0 38 38" fill="none" aria-hidden="true" style={{marginBottom:-4}}>
    <circle cx="19" cy="19" r="19" fill="#353C68" />
    <ellipse cx="19" cy="14" rx="10" ry="3.2" fill="#6366F1" />
    <ellipse cx="19" cy="14" rx="6.4" ry="2" fill="#a5b4fc" />
    <rect x="14.5" y="22" width="9" height="5" rx="2.5" fill="#0ea5e9" />
    <rect x="16.4" y="24.1" width="5.2" height="1.8" rx="0.9" fill="#60a5fa" />
  </svg>
);

interface LoginProps {
  onLoginSuccess: (token: string) => void;
  switchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, switchToRegister }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPW, setShowPW] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compact submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await response.json();
      if (response.ok) {
        onLoginSuccess(data.token);
      } else {
        setError(data.msg || data.error || 'Invalid credentials');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: "100vh", width: "100vw",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "none", overflow: "hidden"
    }}>
      <form
        className="auth-card"
        style={{
          width: "375px",
          maxWidth: "97vw",
          background: 'rgba(31,30,48,0.98)',
          boxShadow: '0 8px 28px #3b82f63b,0 2.5px 15px #6366f155',
          borderRadius: 20,
          padding: "2.2em 1.7em 2.2em 1.7em",
          fontFamily: "'Inter','SF Pro Display',Arial,sans-serif",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: "0"
        }}
        onSubmit={handleLogin}
        aria-label="sign-in form"
        autoComplete="on"
      >
        {/* Logo + Head */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:9 }}>
          <LoginLogo />
          <span style={{
            fontWeight: 800,
            color: "#b6ccfa",
            letterSpacing: ".025em",
            fontSize: "1.11em",
            marginTop:2,
          }}>CyberGuard</span>
        </div>
        <h2 className="auth-title" style={{
          textAlign: "center", fontWeight: 650, color: "#c0bfff", fontSize: "1.17em", marginBottom: 13, marginTop:0
        }}>
          Sign In
        </h2>
        {/* FLEX ROW for inputs (desktop) */}
        <div className="login-fields-row" style={{
          display:"flex",
          flexDirection:"column",    // default mobile-first
          gap:4,
          width:"100%",
          alignItems:"flex-start",
          justifyContent:"center",
        }}>
          {/* Username */}
          <div className="input-group" style={{position:"relative", flex:1, minWidth:0, marginBottom:7}}>
            <span className="login-icon" style={{
              position:"absolute", left:14, top:12, fontSize:17, color:"#7176ba"
            }}>👤</span>
            <input
              className="auth-input"
              id="login-identifier"
              type="text"
              placeholder="Username or Email"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              autoFocus
              required
              autoComplete="username"
              aria-label="username or email"
              style={{paddingLeft:38, width:"100%", minWidth:0}}
            />
          </div>
          {/* Password */}
          <div className="input-group" style={{position:"relative", flex:1, minWidth:0, marginBottom:7}}>
            <span className="login-icon" style={{
              position:"absolute",
              left:14, top:12, fontSize:18, color:"#7176ba"
            }}>🔒</span>
            <input
              className="auth-input"
              id="login-password"
              type={showPW ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              aria-label="password"
              style={{paddingLeft:38, width:"100%", minWidth:0}}
            />
            <button
              tabIndex={0}
              type="button"
              aria-label={showPW?"Hide password":"Show password"}
              title={showPW?"Hide password":"Show password"}
              onClick={() => setShowPW(s => !s)}
              style={{
                position: "absolute",
                right: 5, top: 8,
                background: "none", border: "none", fontSize:17,
                color: "#7fd6fa", cursor: "pointer", opacity:0.88
              }}
            >
              {showPW ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
        <button
          className="auth-btn"
          type="submit"
          disabled={loading}
          style={{
            margin: "0.4em 0 0.5em 0", boxShadow:"0 2px 16px #0ea5e928",
            width:"100%",
            padding: "11px 0",
            borderRadius: 7,
            fontWeight: 700,
            fontSize: "1.01em",
          }}
        >
          {loading ? <span className="loader" /> : 'Login'}
        </button>
        {error && <div className="error-msg" role="alert" style={{
          background:"#541422", color:"#fba7c1", borderRadius:8, marginTop:7,
          padding:"7px 10px", fontSize:"0.99em", fontWeight:570,
          width:"100%", textAlign:"center", boxShadow:"0 1.5px 7px #88025422"
        }}>{error}</div>}

        <div className="new-user-note" style={{
          textAlign: "center", fontSize: "0.96em", margin: "13px 0 0 0",
          color: "#d1c6fd"
        }}>
          <span style={{color:"#b2e0ff"}}>New here?</span> Create your account to access CyberGuard.<br />
          <span
            className="register-span"
            tabIndex={0}
            role="button"
            onClick={switchToRegister}
            aria-label="Register"
            style={{
              color: "#0ea5e9",
              fontWeight: 600,
              textDecoration: "underline",
              cursor: "pointer",
              marginLeft: 4,
              fontSize: "1.06em"
            }}
            onKeyDown={e => (e.key === 'Enter' ? switchToRegister() : undefined)}
          >Register now</span>
        </div>
        {/* Desktop: fields side-by-side! */}
        <style>{`
          @media (min-width: 601px) {
            .login-fields-row {
              flex-direction: row !important;
              gap: 22px !important;
              align-items: flex-start !important;
              justify-content: center !important;
            }
            .login-fields-row .input-group {
              flex: 1 1 0;
              min-width: 0;
              margin-bottom: 0 !important;
            }
          }
          @media (max-width: 600px) {
            .login-fields-row {
              flex-direction: column !important;
              gap: 0 !important;
            }
            .login-fields-row .input-group {
              margin-bottom: 7px !important;
            }
          }
          .auth-input:focus {
            outline: 2px solid #4f46e5c0;
            background: #262758;
            box-shadow: 0 0 0 2px #4f46e544;
          }
          .auth-btn:active { background: #3b82f6; }
          .auth-input::-webkit-input-placeholder { color: #b1b7e6; opacity: 1;}
          .auth-input::-moz-placeholder { color: #b1b7e6; opacity: 1;}
          .auth-input:-ms-input-placeholder { color: #b1b7e6; opacity: 1;}
          .auth-input::placeholder { color: #b1b7e6; opacity:1;}
        `}</style>
      </form>
      <style>{`
        html, body, #root {
          height: 100vh !important;
          min-height: 100dvh !important;
          overflow: hidden !important;
        }
      `}</style>
    </div>
  );
};

export default Login;
