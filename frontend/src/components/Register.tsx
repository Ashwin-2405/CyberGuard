import React, { useState } from 'react';
import '../styles/auth.css';

// Brand/Logo SVG (cyber calm love)
const RegisterLogo = () => (
  <svg width="36" height="36" viewBox="0 0 38 38" fill="none" aria-hidden="true" style={{marginBottom:-4}}>
    <circle cx="19" cy="19" r="19" fill="#353C68" />
    <ellipse cx="19" cy="14" rx="10" ry="3.2" fill="#6366F1" />
    <ellipse cx="19" cy="14" rx="6.4" ry="2" fill="#a5b4fc" />
    <rect x="14.5" y="22" width="9" height="5" rx="2.5" fill="#0ea5e9" />
    <rect x="16.4" y="24.1" width="5.2" height="1.8" rx="0.9" fill="#60a5fa" />
  </svg>
);

interface RegisterProps {
  onRegisterSuccess: (token: string) => void;
  switchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({
  onRegisterSuccess, switchToLogin
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPW, setShowPW]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        onRegisterSuccess(data.token);
      } else {
        setError(data.msg || data.error || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height:"100vh", width:"100vw",
      display:"flex", alignItems:"center", justifyContent:"center",
      background: "none", overflow: "hidden"
    }}>
      <form
        className="auth-card"
        style={{
          width: "332px",
          maxWidth: "95vw",
          background: 'rgba(31,30,48,0.97)',
          boxShadow: '0 8px 28px #99b9fb29,0 2.5px 15px #3bbfae33',
          borderRadius: 20,
          padding:"2em 1.4em 2em 1.4em",
          fontFamily: "'Inter','SF Pro Display',Arial,sans-serif",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center",
          minHeight: "0",
        }}
        onSubmit={handleRegister}
        aria-label="registration form"
        autoComplete="on"
      >
        <div style={{
          display:"flex", flexDirection:"column", alignItems:"center", marginBottom:10
        }}>
          <RegisterLogo />
          <span style={{
            fontWeight: 800,
            color: "#b6ccfa",
            letterSpacing: ".025em",
            fontSize: "1.11em",
            marginTop:2,
          }}>CyberGuard</span>
        </div>
        <h2 className="auth-title" style={{
          textAlign: "center", fontWeight: 650, color: "#c0bfff",
          fontSize: "1.12em", marginBottom: 13, marginTop:2
        }}>
          Create your account
        </h2>
        {/* Username */}
        <div className="input-group" style={{position:"relative"}}>
          <span style={{
            position:"absolute", left:13, top:11, fontSize:17, color:"#7176ba"
          }}>👤</span>
          <input
            className="auth-input"
            id="register-username"
            type="text"
            placeholder="Username"
            value={username}
            minLength={3}
            maxLength={32}
            autoFocus
            required
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            aria-label="username"
            style={{paddingLeft:38, marginBottom:14, width:"95%"}}
          />
        </div>
        {/* Email */}
        <div className="input-group" style={{position:"relative"}}>
          <span style={{
            position:"absolute", left:13, top:11, fontSize:17, color:"#4ca7cc"
          }}>✉️</span>
          <input
            className="auth-input"
            id="register-email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            aria-label="email"
            style={{paddingLeft:38, marginBottom:14, width:"95%"}}
          />
        </div>
        {/* Password */}
        <div className="input-group" style={{position:"relative"}}>
          <span style={{
            position:"absolute", left:13, top:11, fontSize:17, color:"#7176ba"
          }}>🔒</span>
          <input
            className="auth-input"
            id="register-password"
            type={showPW ? "text" : "password"}
            placeholder="Password"
            value={password}
            minLength={6}
            maxLength={128}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            aria-label="password"
            style={{paddingLeft:38, marginBottom:6, width:"95%"}}
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
              color: "#7fd6fa", cursor: "pointer", opacity:0.90
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
            margin: "0.4em 0 0.5em 0", boxShadow:"0 2px 16px #0ea5e928",
            width:"100%",
            padding: "11px 0",
            borderRadius: 7,
            fontWeight: 700,
            fontSize: "1.01em",
          }}
        >
          {loading ? <span className="loader" /> : 'Register'}
        </button>
        {error && <div className="error-msg" role="alert" style={{
          background:"#541422", color:"#fba7c1", borderRadius:8, marginTop:6,
          padding:"7px 10px", fontSize:"0.96em", fontWeight:560,
          width:"100%", textAlign:"center", boxShadow:"0 1.5px 7px #88025422"
        }}>{error}</div>}
        <div className="new-user-note" style={{
          textAlign: "center",
          fontSize: "0.94em",
          margin: "13px 0 0 0",
          color: "#d1c6fd"
        }}>
          <span style={{color:"#b2e0ff"}}>Already have an account?</span>
          <span
            className="register-span"
            tabIndex={0}
            role="button"
            onClick={switchToLogin}
            aria-label="Login"
            style={{
              color: "#0ea5e9",
              fontWeight: 600,
              textDecoration: "underline",
              cursor: "pointer",
              marginLeft: 6,
              fontSize: "1.045em"
            }}
            onKeyDown={e => (e.key === 'Enter' ? switchToLogin() : undefined)}>
            Login
          </span>
        </div>
        <style>{`
          .auth-input:focus {
            outline: 2px solid #0ea5e988;
            background: #23245c;
            box-shadow: 0 0 0 2.5px #20b3fc44;
          }
          .auth-btn:active { background: #20b3fc; }
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

export default Register;
