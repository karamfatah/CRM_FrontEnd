import React from "react";

const Badge = React.forwardRef(({ className = "", variant = "default", ...props }, ref) => {
  const variantClasses = {
    default: "border-transparent bg-indigo-500 text-white",
    secondary: "border-transparent bg-gray-500 text-white",
    destructive: "border-transparent bg-red-500 text-white",
    outline: "border-gray-300 dark:border-gray-600 bg-transparent",
  };

  return (
    <div
      ref={ref}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantClasses[variant] || variantClasses.default} ${className}`}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };

