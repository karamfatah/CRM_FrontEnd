import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

// GlassCard component that adapts to theme
export const GlassCard = ({ className = "", children, onClick, ...props }) => {
  const baseClasses = "rounded-2xl border border-white/10 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg dark:shadow-2xl";
  const interactiveClasses = onClick ? "cursor-pointer hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300" : "";
  
  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      <div className="rounded-2xl bg-gradient-to-b from-white/10 dark:from-gray-700/20 to-white/5 dark:to-gray-800/10 p-[1px]">
        <div className="rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

// Gradient text component
export const GradientText = ({ children, className = "" }) => (
  <span className={`bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent ${className}`}>
    {children}
  </span>
);

// Stat card component
export const StatCard = ({ label, value, delta, icon: Icon, className = "", onClick }) => {
  const isDark = document.documentElement.classList.contains("dark");
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onClick}
    >
      <GlassCard className={`p-4 ${onClick ? "cursor-pointer" : ""} ${className}`}>
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg ${onClick ? "hover:scale-110 transition-transform" : ""}`}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{value}</p>
              {delta && (
                <span className={`text-xs font-medium ${delta.startsWith("+") ? "text-emerald-500 dark:text-emerald-400" : delta.startsWith("-") ? "text-rose-500 dark:text-rose-400" : "text-gray-500 dark:text-gray-400"}`}>
                  {delta}
                </span>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

// Chip/Badge component
export const Chip = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white",
    success: "bg-emerald-500 text-white",
    warning: "bg-amber-500 text-white",
    danger: "bg-rose-500 text-white",
    info: "bg-sky-500 text-white",
  };
  
  return (
    <Badge className={`rounded-full px-3 py-1 text-xs font-semibold shadow-md ${variants[variant] || variants.default} ${className}`}>
      {children}
    </Badge>
  );
};

// Rating badge component
export const RatingBadge = ({ rating }) => {
  const variants = {
    happy: { bg: "bg-emerald-500", text: "text-white", label: "Happy" },
    medium: { bg: "bg-amber-500", text: "text-white", label: "Medium" },
    sad: { bg: "bg-rose-500", text: "text-white", label: "Sad" },
  };
  
  const variant = variants[rating] || { bg: "bg-gray-500", text: "text-white", label: rating || "N/A" };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variant.bg} ${variant.text} shadow-sm`}>
      {variant.label}
    </span>
  );
};

// Filter section component
export const FilterSection = ({ title, children, className = "" }) => (
  <GlassCard className={`p-6 mb-6 ${className}`}>
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
    {children}
  </GlassCard>
);

// Chart container component
export const ChartContainer = ({ title, children, className = "", onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <GlassCard className={`p-6 ${className}`} onClick={onClick}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="relative">
        {children}
      </div>
    </GlassCard>
  </motion.div>
);

// Page header component
export const PageHeader = ({ title, subtitle, actions, className = "" }) => (
  <div className={`mb-8 ${className}`}>
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  </div>
);

// Empty state component
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    {Icon && (
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    {description && (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">{description}</p>
    )}
    {action && action}
  </div>
);

// Loading skeleton component
export const LoadingSkeleton = ({ className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
  </div>
);

