"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number;
  color?: "default" | "success" | "warning";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function ProgressBar({
  progress,
  color = "default",
  size = "md",
  showLabel = true,
}: ProgressBarProps) {
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.setProperty(
        "--progress-width",
        `${progress}%`
      );
    }
  }, [progress]);

  const getColorClass = () => {
    switch (color) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-orange-500";
      default:
        return "bg-indigo-500";
    }
  };

  const getHeightClass = () => {
    switch (size) {
      case "sm":
        return "h-1";
      case "lg":
        return "h-3";
      default:
        return "h-2";
    }
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-700 mb-1 font-medium">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${getHeightClass()}`}>
        <motion.div
          ref={progressBarRef}
          className={`${getHeightClass()} rounded-full animated-progress-bar ${getColorClass()}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
