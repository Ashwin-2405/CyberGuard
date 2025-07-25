import React, { useState } from 'react';
import '../styles/auth.css';

// Brand/Logo SVG (calm, cyber vibe)
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
    } catch (err) {
      setError('Network error. Please try again!');
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
          minWidth: 312, maxWidth: 355,
          background: 'rgba(31,30,48,0.97)',
          boxShadow: '0 8px 28px #99b9fb29,0 2.5px 15px #3bbfae33',
          borderRadius: 22,
          padding:"2.3em 1.6em 2.3em 1.6em",
          fontFamily: "'Inter','SF Pro Display',Arial,sans-serif"
        }}
        onSubmit={handleRegister}
        aria-label="registration form"
        autoComplete="on"
      >
        <div style={{
          display:"flex", flexDirection:"column", alignItems:"center", marginBottom:12
        }}>
          <RegisterLogo />
          <span style={{
            fontWeight: 800,
            color: "#b6ccfa",
            letterSpacing: ".025em",
            fontSize: "1.14em",
            marginTop:2,
          }}>CyberGuard</span>
        </div>
        <h2 className="auth-title" style={{
          textAlign: "center", fontWeight: 650, color: "#c0bfff", fontSize: "1.2em", marginBottom: 14, marginTop:2
        }}>
          Create your account
        </h2>

        {/* Username */}
        <div className="input-group" style={{position:"relative"}}>
          <span style={{
            position:"absolute", left:13, top:13, fontSize:19, color:"#7176ba"
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
            style={{paddingLeft:39, marginBottom:16}}
          />
        </div>

        {/* Email */}
        <div className="input-group" style={{position:"relative"}}>
          <span style={{
            position:"absolute", left:13, top:13, fontSize:19, color:"#6ad0e8"
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
            style={{paddingLeft:39, marginBottom:16}}
          />
        </div>

        {/* Password */}
        <div className="input-group" style={{position:"relative"}}>
          <span style={{
            position:"absolute", left:13, top:13, fontSize:19, color:"#7176ba"
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
          {loading ? <span className="loader" /> : 'Register'}
        </button>
        {error && <div className="error-msg" role="alert">{error}</div>}

        <div className="new-user-note" style={{
          textAlign: "center",
          fontSize: "1em",
          margin: "16px 0 0 0",
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
              fontSize: "1.04em"
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
    </div>
  );
};

export default Register;
