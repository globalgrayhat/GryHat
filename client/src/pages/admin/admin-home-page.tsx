/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import RevenueChart from "./revenue-chart";
import TrendingCoursesChart from "./trending-chart";
import CourseCategoryChart from "./progress-chart";
import { Typography } from "@material-tailwind/react";
import { FaRupeeSign } from "react-icons/fa";
import {
  AiOutlineUser,
  AiOutlineBook,
  AiOutlineUsergroupAdd,
} from "react-icons/ai";
import {
  getDashboardData,
  getGraphData,
} from "../../api/endpoints/dashboard-data";
import type {
  DashData,
  GraphData,
} from "../../api/types/apiResponses/api-response-dash";
import { formatToINR } from "../../utils/helpers";
import { toast } from "react-toastify";

const AdminHomePage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashData | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  const fetchDashboardDetails = async () => {
    try {
      const response = await getDashboardData();
      setDashboardData(response.data);
    } catch {
      toast.error("Something went wrong");
    }
  };

  const fetchGraphData = async () => {
    try {
      const response = await getGraphData();
      setGraphData(response.data);
    } catch {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    fetchDashboardDetails();
    fetchGraphData();
  }, []);

  return (
    <div className="px-2 py-4 sm:px-4 lg:px-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <FaRupeeSign className="text-green-500" size={22} />
          <div>
            <Typography variant="small" className="text-gray-500">
              Monthly Revenue
            </Typography>
            <Typography className="text-sm font-semibold text-blue-gray-900">
              {formatToINR(dashboardData?.monthlyRevenue ?? 0)}
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <AiOutlineBook className="text-blue-500" size={22} />
          <div>
            <Typography variant="small" className="text-gray-500">
              Courses
            </Typography>
            <Typography className="text-sm font-semibold text-blue-gray-900">
              {dashboardData?.numberOfCourses ?? 0}
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <AiOutlineUser className="text-yellow-500" size={22} />
          <div>
            <Typography variant="small" className="text-gray-500">
              Instructors
            </Typography>
            <Typography className="text-sm font-semibold text-blue-gray-900">
              {dashboardData?.numberInstructors ?? 0}
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <AiOutlineUsergroupAdd className="text-red-500" size={22} />
          <div>
            <Typography variant="small" className="text-gray-500">
              Students
            </Typography>
            <Typography className="text-sm font-semibold text-blue-gray-900">
              {dashboardData?.numberOfStudents ?? 0}
            </Typography>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="mb-6">
        <Typography
          variant="h6"
          color="blue-gray"
          className="mb-3 font-semibold"
        >
          Monthly Revenue Chart
        </Typography>
        <RevenueChart data={graphData?.revenue ?? []} />
      </div>

      {/* Bottom charts: responsive grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <Typography
            variant="h6"
            color="blue-gray"
            className="mb-3 font-semibold"
          >
            Trending Courses
          </Typography>
          <TrendingCoursesChart
            data={graphData?.trendingCourses ?? []}
          />
        </div>
        <div>
          <Typography
            variant="h6"
            color="blue-gray"
            className="mb-3 font-semibold"
          >
            Categories
          </Typography>
          <CourseCategoryChart
            data={graphData?.courseByCategory ?? []}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
