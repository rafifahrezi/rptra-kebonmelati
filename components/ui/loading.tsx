"use client";

import React from "react";
import { RefreshCw } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  description?: string;
  className?: string;
  fullScreen?: boolean;
}

// Loading State untuk halaman
export const LoadingState: React.FC<{
  title?: string;
  description?: string;
  size?: LoadingProps["size"];
}> = ({ 
  title = "Memuat data...", 
  description = "Sedang mengambil data dari server",
  size = "lg"
}) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
      <p className="mt-4 text-gray-600 font-medium">Memuat data...</p>
    </div>
  </div>
);

// Loading State untuk card/content area
export const LoadingCard: React.FC<{
  height?: string;
  className?: string;
}> = ({ height = "h-48", className = "" }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
      <p className="mt-4 text-gray-600 font-medium">Memuat data...</p>
    </div>
  </div>
);

// Loading grid untuk list/grid view
export const LoadingGrid: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 6, className = "" }) => (
 <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
      <p className="mt-4 text-gray-600 font-medium">Memuat data...</p>
    </div>
  </div>
);