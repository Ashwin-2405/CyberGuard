import React, { useState } from "react";
import axios from "axios";

export default function Auth({ setToken }: { setToken: (token: string) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isLogin ? "/api/auth/login" : "/api/auth/register";
    try {
      const { data } = await axios.post(
        `http://localhost:5000${url}`,
        { username, password }
      );
      if (data.token) setToken(data.token);
      alert(data.msg || "Success");
    } catch (err: any) {
      alert(err.response?.data?.msg || "Error");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="font-bold mb-2">
        {isLogin ? "Login" : "Register"}
      </h2>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <input value={username} onChange={e => setUsername(e.target.value)} required placeholder="Username" className="border p-2" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Password" className="border p-2" />
        <button className="bg-blue-600 text-white p-2" type="submit">{isLogin ? "Login" : "Register"}</button>
      </form>
      <button className="mt-4 text-blue-600" onClick={() => setIsLogin(l => !l)}>
        {isLogin ? "No account? Register" : "Have an account? Login"}
      </button>
    </div>
  );
}
