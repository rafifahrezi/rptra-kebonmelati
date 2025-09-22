import React from 'react';

interface AdminLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const AdminLoading: React.FC<AdminLoadingProps> = ({ 
  message = "Memuat...", 
  size = 'md',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  const containerClasses = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : 'p-8 text-center';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        <div className={`animate-spin rounded-full border-b-2 border-green-500 mx-auto mb-4 ${sizeClasses[size]}`}></div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default AdminLoading;