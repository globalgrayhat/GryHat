/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  getAllInstructorRequests,
} from "../../../api/endpoints/instructor-management";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import useTimeAgo from "../../../hooks/useTimeAgo";
import type { InstructorApiResponse } from "../../../api/types/apiResponses/api-response-instructors";
import { Avatar } from "@material-tailwind/react";

const ViewInstructorRequests: React.FC = () => {
  const [requests, setRequests] = useState<InstructorApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const calculateTimeAgo = useTimeAgo();

  const handleApiCall = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllInstructorRequests();
      console.log(response.data.data);
      setRequests(response.data.data || []);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.data?.message || "Failed to fetch instructor requests";
      setError(errorMessage);
      toast.error(errorMessage, { position: toast.POSITION.BOTTOM_RIGHT });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleApiCall();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading instructor requests...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading requests</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={handleApiCall}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No instructor requests</h3>
        <p className="text-gray-600">There are currently no pending instructor applications to review.</p>
      </div>
    );
  }

  return (
    <ul role='list' className=' divide-gray-100  '>
      {requests.map((
                {
                  _id,
                  firstName,
                  lastName,
                  email,
                  dateJoined,
                  profilePic = {url: '', name: ''},
                }
              )  => (
        
          <li className='flex justify-between gap-x-6 gap-y-3 mt-3 p-3 py-5 rounded-md border bg-white border-gray-300'>
            <div className='flex gap-x-4'>
                <Avatar
                  src={profilePic?.url} 
                  alt={`${firstName} ${lastName}`}
                  size='md'
                  className='border border-blue-gray-50 bg-blue-gray-50/50 object-contain p-1'
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              <div className={`h-12 w-12 flex-none rounded-full bg-gray-200 flex items-center justify-center ${profilePic?.url ? 'hidden' : ''}`}>
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className='min-w-0 flex-auto'>
                <p className='text-sm font-semibold leading-6 text-gray-900'>
                  {`${firstName} ${lastName}`}
                </p>
                <p className='mt-1 truncate text-xs leading-5 text-gray-500'>
                  {email}
                </p>
              </div>
            </div>
            <div className='hidden sm:flex sm:flex-col sm:items-end'>
                <p className='mt-1 text-xs leading-5 text-gray-500'>
                Application sent {calculateTimeAgo(dateJoined)}
              </p>
            </div>
            <div className='flex gap-x-4'>
            <Link
          to={`/admin/instructors/requests/${_id}`}
          key={_id}
        >
              <button
                className='p-1 m-3 rounded-md bg-blue-600 text-white w-20 text-center focus:outline-none focus:ring-2 focus:ring-blue-600 hover:bg-blue-700 hover:shadow-md'
              >
                View
              </button>
            </Link>
            </div>
          </li>
      ))} 
    </ul>
  );
};
export default ViewInstructorRequests;
