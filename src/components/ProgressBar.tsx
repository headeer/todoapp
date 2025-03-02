"use client";

import React from "react";
import clsx from "clsx";

interface ProgressBarProps {
  progress: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={clsx("w-full", className)} data-testid="progress-container">
      <div className="flex justify-between text-sm text-gray-700 mb-1 font-medium">
        <span>Progress</span>
        <span>{clampedProgress}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        className="w-full bg-gray-200 rounded-full h-2"
      >
        <div
          className="h-2 rounded-full animated-progress-bar bg-indigo-500"
          style={
            {
              width: 0,
              "--progress-width": `${clampedProgress}%`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
};
