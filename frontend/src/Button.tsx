import React from "react";
import classNames from "classnames";

// Install classnames with: npm install classnames

type Variant = "primary" | "success" | "danger";
type Size = "md" | "sm" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  icon,
  className,
  disabled,
  ...props
}) => {
  const base =
    "btn inline-flex items-center justify-center gap-2 focus:outline-none relative select-none transition-all";
  const extra = {
    primary: "",
    success: "btn-success",
    danger: "btn-danger",
  }[variant];

  const sizeClass = {
    md: "px-6 py-2 text-base",
    sm: "px-3 py-1 text-sm",
    lg: "px-8 py-3 text-lg",
  }[size];

  return (
    <button
      className={classNames(base, extra, sizeClass, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="spinner btn-loader"></span>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      <span className={loading ? "opacity-70" : ""}>{children}</span>
    </button>
  );
};

export default Button;
