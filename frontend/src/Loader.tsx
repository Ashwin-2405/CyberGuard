import React from "react";

interface LoaderProps {
  text?: string;
  fullscreen?: boolean;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = "Loading...", fullscreen = false, className = "" }) => (
  <div className={
    (fullscreen ? "fixed inset-0 flex items-center justify-center bg-[#1a223488] z-50" : "") +
    (className ?? "")
  }
    aria-live="polite"
    aria-busy="true"
  >
    <span className="spinner mr-3" />
    <span className="text-lg font-medium text-blue-900 tracking-wide">{text}</span>
  </div>
);

export default Loader;
