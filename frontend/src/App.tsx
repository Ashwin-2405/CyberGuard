import React, { useState } from "react";
import Auth from "./Auth";
import Dashboard from "./Dashboard";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const saveToken = (t: string) => { setToken(t); localStorage.setItem("token", t); };

  if (!token) return <Auth setToken={saveToken} />;
  return <Dashboard token={token} />;
}

export default App;
