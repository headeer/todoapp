"use client";

import { motion } from "framer-motion";

interface StatusIconProps {
  status: "TODO" | "IN_PROGRESS" | "DONE";
  size?: "sm" | "md" | "lg";
}

export default function StatusIcon({ status, size = "md" }: StatusIconProps) {
  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "h-4 w-4";
      case "lg":
        return "h-6 w-6";
      default:
        return "h-5 w-5";
    }
  };

  const getColorClass = () => {
    switch (status) {
      case "TODO":
        return "text-emerald-400";
      case "IN_PROGRESS":
        return "text-amber-400";
      case "DONE":
        return "text-emerald-500";
      default:
        return "text-gray-400";
    }
  };

  const renderIcon = () => {
    switch (status) {
      case "TODO":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${getSizeClass()} ${getColorClass()}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        );
      case "IN_PROGRESS":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${getSizeClass()} ${getColorClass()}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "DONE":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${getSizeClass()} ${getColorClass()}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {renderIcon()}
    </motion.div>
  );
}
