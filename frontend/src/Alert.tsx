import React from "react";
import classNames from "classnames";

// Use: <Alert type="success">Success message!</Alert>

type Type = "success" | "error" | "info" | "warning";

interface AlertProps {
  type?: Type;
  children: React.ReactNode;
  className?: string;
  role?: "alert" | "status";
}

const typeClass: Record<Type, string> = {
  success: "alert success",
  error: "alert error",
  info: "alert",
  warning: "alert warning",
};

const Alert: React.FC<AlertProps> = ({
  type = "info",
  children,
  className,
  role = "alert",
}) => (
  <div className={classNames(typeClass[type], "fade-in-up", className)} role={role}>
    {children}
  </div>
);

export default Alert;
