import React from "react";

export const formatDateOnly = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const FormattedDate: React.FC<{ dateString: string }> = React.memo(({ dateString }) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return <span className="text-red-500">Invalid Date</span>;
  }
  return (
    <time dateTime={date.toISOString()} className="font-medium">
      {formatDateOnly(dateString)}
    </time>
  );
});

FormattedDate.displayName = 'FormattedDate';
