import React from "react";
import { Card, CardHeader, CardBody } from "@material-tailwind/react";

const ShimmerCard: React.FC = () => {
  return (
    <Card
      shadow={false}
      className="w-full max-w-[20rem] overflow-hidden rounded-2xl ring-1 ring-gray-200 bg-white"
    >
      {/* Cover skeleton (16:9) */}
      <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-0">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />

          {/* top-left badges placeholders (category + price) */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-2">
            <div className="h-5 w-20 rounded-full bg-white/80 ring-1 ring-black/5" />
            <div className="h-5 w-14 rounded-full bg-white/80 ring-1 ring-black/5" />
          </div>

          {/* top-right instructor pin placeholder (name pill + avatar) */}
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <div className="hidden sm:block h-5 w-24 rounded-full bg-white/80 ring-1 ring-black/5" />
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-white/80 ring-1 ring-white/90 shadow-sm" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-blue-500 ring-1 ring-white" />
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Body skeleton */}
      <CardBody className="p-4">
        {/* title */}
        <div className="h-6 w-3/4 rounded bg-gray-200 animate-pulse mb-2" />

        {/* description (2 lines) */}
        <div className="h-4 w-full rounded bg-gray-200 animate-pulse mb-1" />
        <div className="h-4 w-5/6 rounded bg-gray-200 animate-pulse" />

        {/* meta row: duration/level/enrolled + rating */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-3 rounded bg-transparent" />
            <div className="h-4 w-14 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-3 rounded bg-transparent" />
            <div className="h-4 w-14 rounded bg-gray-200 animate-pulse" />
          </div>
          {/* rating placeholder */}
          <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
        </div>
      </CardBody>
    </Card>
  );
};

export default ShimmerCard;
