import React from 'react';
import { Loader2 } from "lucide-react";

interface MapContainerProps {
  children?: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
}

export const MapContainer: React.FC<MapContainerProps> = ({ 
  children, 
  isLoading, 
  error 
}) => {
  if (isLoading) {
    return (
      <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg bg-gray-50 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <p className="text-sm text-gray-500 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
      {children}
    </div>
  );
};