import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';      // Import enhanced global & Tailwind CSS styles
import App from './App';
// Remove reportWebVitals if you aren't using it, or leave as an opt-in for analytics
import reportWebVitals from './reportWebVitals';

// Strictly typed root element for robust codebases
const rootElement = document.getElementById('root') as HTMLElement | null;

if (!rootElement) {
  throw new Error("Root element with id 'root' not found!"); // Immediate, clear error if root div missing
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Opt-in to web vitals reporting if desired for production analytics
// For most hackathon/portfolio/POC projects, this can be left as-is or even removed
reportWebVitals();
