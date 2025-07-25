import React from "react";
import Button from "./Button";

interface NavbarProps {
  onLogout?: () => void;
  username?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout, username }) => (
  <nav className="w-full shadow bg-gradient-to-r from-[#1a2234] to-[#2563eb] flex items-center justify-between px-5 py-3 z-40">
    <div className="flex items-center space-x-2">
      <span className="text-2xl font-black text-white tracking-wider">
        <span className="mr-2">🛡️</span> CyberGuard
      </span>
      <span className="badge info ml-3 hidden sm:inline">MLSA Hackathon</span>
    </div>
    <div className="flex items-center gap-4">
      {username && (
        <span className="hidden sm:inline text-white font-semibold opacity-90 text-base">
          Hi, <span className="font-bold">{username}</span>
        </span>
      )}
      {onLogout && (
        <Button variant="danger" size="sm" onClick={onLogout}>
          Logout
        </Button>
      )}
    </div>
  </nav>
);

export default Navbar;
