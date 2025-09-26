import React from "react";
import { Card } from "@material-tailwind/react";

const TrendingCardShimmer: React.FC = () => {
  return (
    <Card shadow={false} className="overflow-hidden rounded-2xl ring-1 ring-gray-200 bg-white">
      {/* cover skeleton with badges + instructor pin placeholders */}
      <div className="relative aspect-[16/9] w-full bg-gray-200 animate-pulse">
        {/* top-left badges placeholders */}
        <div className="absolute top-2 left-2 flex gap-2">
          <div className="h-5 w-16 rounded-full bg-white/80 ring-1 ring-black/5" />
          <div className="h-5 w-12 rounded-full bg-white/80 ring-1 ring-black/5" />
          <div className="h-5 w-14 rounded-full bg-white/80 ring-1 ring-black/5" />
        </div>
        {/* top-right instructor pin placeholder */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <div className="hidden sm:block h-5 w-24 rounded-full bg-white/80 ring-1 ring-black/5" />
          <div className="relative h-8 w-8 rounded-full bg-white/80 ring-1 ring-white/90 shadow-sm" />
        </div>
      </div>

      {/* body skeleton */}
      <div className="p-4">
        <div className="h-6 w-3/4 rounded bg-gray-200 animate-pulse mb-3" />
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-3 rounded bg-transparent" />
            <div className="h-4 w-14 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-3 rounded bg-transparent" />
            <div className="h-4 w-14 rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    </Card>
  );
};

export default TrendingCardShimmer;
export { TrendingCardShimmer };
