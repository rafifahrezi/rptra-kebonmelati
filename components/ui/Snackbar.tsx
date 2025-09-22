import React, { useEffect } from "react";

interface SnackbarProps {
  message: string;
  type: "error" | "success";
  open: boolean;
  onClose: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, type, open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-xs px-4 py-3 rounded shadow-lg 
        text-white font-medium 
        ${type === "error" ? "bg-red-600" : "bg-green-600"}`}
      role="alert"
      aria-live="assertive"
    >
      {message}
    </div>
  );
};

export default Snackbar;
