import React from "react";
<<<<<<< HEAD
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
=======
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from "@material-tailwind/react";

const ShimmerCard = () => {
  return (
    <div className='w-[18.5rem] p-5 overflow-hidden hover:shadow-md hover:border animate-pulse'>
      <div className='relative'>
        <div className='bg-gradient-to-r from-gray-300 to-gray-100 h-[12rem] w-full rounded'></div>
      </div>
      <div className='pt-4'>
        <div className='mb-3'>
          <div className='bg-gradient-to-r from-gray-300 to-gray-100 h-6 w-1/2 mb-2 rounded'></div>
        </div>
        <div className='space-y-2'>
          <div className='bg-gradient-to-r from-gray-300 to-gray-100 h-4 w-3/4 rounded'></div>
          <div className='bg-gradient-to-r from-gray-300 to-gray-100 h-4 w-5/6 rounded'></div>
          <div className='bg-gradient-to-r from-gray-300 to-gray-100 h-4 w-1/2 rounded'></div>
        </div>
        <div className='mt-4 flex justify-between items-center'>
          <div className='group'>
            <div className='bg-gradient-to-r from-gray-300 to-gray-100 h-4 w-1/4 rounded'></div>
          </div>
          <div className='flex items-center gap-1.5'>
            <div className='bg-gradient-to-r from-gray-300 to-gray-100 h-4 w-6 rounded'></div>
            <div className='bg-gradient-to-r from-gray-300 to-gray-100 h-4 w-8 rounded'></div>
          </div>
        </div>
      </div>
    </div>
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  );
};

export default ShimmerCard;
