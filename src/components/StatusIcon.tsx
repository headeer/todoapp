"use client";

import { motion } from "framer-motion";
import { TaskStatus } from "@/app/projects/[id]/types";

interface StatusIconProps {
  status: TaskStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const StatusIcon: React.FC<StatusIconProps> = ({
  status,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const statusClasses = {
    [TaskStatus.TODO]: "text-gray-400",
    [TaskStatus.IN_PROGRESS]: "text-blue-500",
    [TaskStatus.DONE]: "text-green-500",
  };

  const renderIcon = () => {
    switch (status) {
      case TaskStatus.TODO:
        return (
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 100 16 8 8 0 000-16z"
            clipRule="evenodd"
          />
        );
      case TaskStatus.IN_PROGRESS:
        return (
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 100 16 8 8 0 000-16zm1 3v5h4v2h-6V7h2z"
            clipRule="evenodd"
          />
        );
      case TaskStatus.DONE:
        return (
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.707 7.293a1 1 0 00-1.414 0L11 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z"
            clipRule="evenodd"
          />
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
      <svg
        data-testid="status-icon"
        className={`${sizeClasses[size]} ${statusClasses[status]} ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        {renderIcon()}
      </svg>
    </motion.div>
  );
};

export default StatusIcon;
