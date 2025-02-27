"use client";

import React from "react";

export const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm z-50">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-t-emerald-500 border-r-emerald-500 border-b-transparent border-l-transparent animate-spin"></div>
        <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-t-transparent border-r-transparent border-b-emerald-300 border-l-emerald-300 animate-spin animate-reverse"></div>
      </div>
    </div>
  );
};

export default Loader;
