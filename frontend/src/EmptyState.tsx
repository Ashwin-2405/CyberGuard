import React from "react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data found",
  message = "Upload a log file to get started analyzing cybersecurity threats.",
  children,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl shadow mt-12 animate-fadeIn">
    {/* You can replace below SVG with a custom SVG for branding */}
    <svg width="80" height="80" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#dbeafe"/>
      <path d="M11 27V18l9-7 9 7v9a5 5 0 0 1-2.2 4.1c-.7.51-2.38.9-6.8.9s-6.1-.39-6.8-.9A5 5 0 0 1 11 27z" fill="#2563eb" />
    </svg>
    <h2 className="mt-4 text-xl font-bold text-blue-700">{title}</h2>
    <p className="mt-2 text-md text-muted mb-3">{message}</p>
    {children}
  </div>
);

export default EmptyState;
