import React from "react";

// English comments: Small presentational component that renders stars + rating number.
const Stars: React.FC<{ rating?: number }> = ({ rating }) => {
  const r = Math.round(Math.max(0, Math.min(5, rating ?? 0)));
  return (
    <div className="flex items-center gap-0.5 text-[11px] sm:text-[12px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < r ? "text-amber-500" : "text-gray-300 dark:text-gray-500"}
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-gray-700 dark:text-gray-200">
        {(rating ?? 0).toFixed(1)}
      </span>
    </div>
  );
};

export default Stars;
