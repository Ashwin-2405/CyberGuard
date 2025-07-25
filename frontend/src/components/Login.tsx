import React, { useState } from 'react';
import '../styles/auth.css';

// OPTIONAL: App logo SVG (brand it!)
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

const LEVEL_COLORS = {
  SAFE:     '#22c55e',
  INFO:     '#3b82f6',
  WARNING:  '#facc15',
  DANGEROUS:'#ef4444',
  DANGER:   '#ef4444'
};

const Login: React.FC<LoginProps> = ({ onLoginSuccess, switchToRegister }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPW, setShowPW] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle login as username OR email
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
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:"100vh", width:"100vw",
      display:"flex", alignItems:"center", justifyContent:"center",
      background: "none"
    }}>
      <form
        className="auth-card"
        style={{
          minWidth: 312,
          maxWidth: 350,
          background: 'rgba(31,30,48,0.98)',
          boxShadow: '0 8px 28px #3b82f63b,0 2.5px 15px #6366f155',
          borderRadius: 22,
          padding:"2.3em 1.6em 2.3em 1.6em",
          fontFamily: "'Inter','SF Pro Display',Arial,sans-serif"
        }}
        onSubmit={handleLogin}
        aria-label="sign-in form"
        autoComplete="on"
      >
        <div style={{
          display:"flex", flexDirection:"column", alignItems:"center", marginBottom:12
        }}>
          <LoginLogo />
          <span style={{
            fontWeight: 800,
            color: "#b6ccfa",
            letterSpacing: ".025em",
            fontSize: "1.14em",
            marginTop:2,
          }}>CyberGuard</span>
        </div>
        <h2 className="auth-title" style={{
          textAlign: "center", fontWeight: 650, color: "#c0bfff", fontSize: "1.3em", marginBottom: 13, marginTop:0
        }}>Sign In</h2>
        <div className="input-group" style={{position:"relative"}}>
          <span className="login-icon" style={{
            position:"absolute", left:14, top:13, fontSize:18, color:"#7176ba"
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
            style={{paddingLeft:39, marginBottom:17}}
          />
        </div>
        <div className="input-group" style={{position:"relative"}}>
          <span className="login-icon" style={{
            position:"absolute",
            left:14, top:13, fontSize:19, color:"#7176ba"
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
            style={{paddingLeft:39, marginBottom:7}}
          />
          <button
            tabIndex={0}
            type="button"
            aria-label={showPW?"Hide password":"Show password"}
            title={showPW?"Hide password":"Show password"}
            onClick={() => setShowPW(s => !s)}
            style={{
              position: "absolute",
              right: 7, top: 9,
              background: "none", border: "none", fontSize:17,
              color: "#7fd6fa", cursor: "pointer", opacity:0.94
            }}
          >
            {showPW ? "🙈" : "👁️"}
          </button>
        </div>
        <button
          className="auth-btn"
          type="submit"
          disabled={loading}
          style={{
            margin: "0.5em 0 0.7em 0", boxShadow:"0 2px 16px #0ea5e933"
          }}
        >
          {loading ? <span className="loader" /> : 'Login'}
        </button>
        {error && <div className="error-msg" role="alert">{error}</div>}

        <div className="new-user-note" style={{
          textAlign: "center",
          fontSize: "1em",
          margin: "14px 0 0 0",
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
        <style>{`
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
    </div>
  );
};

export default Login;
