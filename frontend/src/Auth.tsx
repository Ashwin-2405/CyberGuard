import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Button from "./Button";
import Alert from "./Alert";
import Loader from "./Loader";
import EmptyState from "./EmptyState";

interface AuthProps {
  setToken: (token: string) => void;
}

const API_URL = "http://localhost:5000";

const minPassLen = 6;

const Auth: React.FC<AuthProps> = ({ setToken }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Ref for username input to autofocus when switching login/register
  const usernameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    usernameRef.current?.focus();
    setMessage(null);
    setPassword("");
    setUsername("");
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (username.length < 3) {
      setMessage({ type: "error", text: "Username must be at least 3 characters." });
      return;
    }
    if (password.length < minPassLen) {
      setMessage({ type: "error", text: `Password must be at least ${minPassLen} characters.` });
      return;
    }

    setLoading(true);
    const url = isLogin ? "/api/auth/login" : "/api/auth/register";
    try {
      const { data } = await axios.post(`${API_URL}${url}`, { username, password });
      if (data.token) {
        setToken(data.token);
        setMessage({ type: "success", text: "Logged in successfully!" });
      } else if (data.msg) {
        setMessage({ type: "success", text: data.msg });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.msg || "Authentication failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card glass fade-in-up mx-auto mt-16 max-w-md w-full shadow">
      <h2 className="text-2xl font-extrabold mb-2 text-center section-header">
        {isLogin ? "Login to CyberGuard" : "Register for CyberGuard"}
      </h2>
      <p className="text-muted text-center mb-3">
        {isLogin
          ? "Enter your credentials to access your security dashboard."
          : "Create a secure account to get started."}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2" autoComplete="off" noValidate>
        <label htmlFor="auth-username">Username</label>
        <input
          id="auth-username"
          ref={usernameRef}
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          minLength={3}
          placeholder="Enter your username"
          autoFocus
          aria-required="true"
          aria-describedby="username-req"
          spellCheck={false}
        />
        <label htmlFor="auth-password" className="flex justify-between items-center">
          <span>Password</span>
          {!isLogin && (
            <span className="text-xs text-muted ml-1">{`Min. ${minPassLen} chars`}</span>
          )}
        </label>
        <div className="relative">
          <input
            id="auth-password"
            type={showPass ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={minPassLen}
            placeholder="Enter your password"
            aria-describedby="password-req"
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-2 top-2 text-gray-400 hover:text-blue-600 transition-all text-sm focus:outline-none"
            onClick={() => setShowPass((v) => !v)}
            aria-label={showPass ? "Hide password" : "Show password"}
          >
            {showPass ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Inline loader for in-form auth */}
        {loading && <Loader text={isLogin ? "Logging in..." : "Registering..."} className="mt-2 mb-1" />}

        <Button type="submit" className="mt-2" disabled={loading} loading={loading}>
          {isLogin ? "Login" : "Register"}
        </Button>
        {message && (
          <Alert type={message.type} role="alert" className="mt-3">
            {message.text}
          </Alert>
        )}
      </form>

      {/* Beautiful EmptyState below form if desired (optional) */}
      {!loading && !message && (
        <EmptyState
          title={isLogin ? "Welcome back!" : "New here?"}
          message={
            isLogin
              ? "Use your username and password to enter the dashboard."
              : "After registering, you'll be logged in automatically."
          }
        />
      )}
      
      <div className="flex justify-center mt-4">
        <Button
          variant="success"
          className="mx-auto mb-1 text-sm px-6 py-2"
          type="button"
          onClick={() => setIsLogin((l) => !l)}
        >
          {isLogin ? "No account? Register" : "Already have an account? Login"}
        </Button>
      </div>
    </div>
  );
};

export default Auth;
