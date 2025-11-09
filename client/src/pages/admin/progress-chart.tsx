/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface CourseCategory {
  _id: string;
  name: string;
  courseCount: number;
}

interface Props {
  data: CourseCategory[] | undefined | null;
}

const CourseCategoryChart: React.FC<Props> = ({ data }) => {
  const safeData: CourseCategory[] = Array.isArray(data)
    ? data.filter(
        (c) =>
          c &&
          typeof c.name === "string" &&
          typeof c.courseCount === "number"
      )
    : [];

  if (!safeData.length) {
    return (
      <div className="bg-white p-4 shadow rounded-2xl border border-blue-gray-50 text-[10px] text-gray-500">
        No category distribution data available.
      </div>
    );
  }

  const labels = safeData.map((category) => category.name);
  const series = safeData.map((category) => category.courseCount);

  const options: ApexOptions = {
    chart: {
      id: "course-category-donut-chart",
      type: "donut",
    },
    labels,
    legend: {
      show: true,
      position: "bottom",
      fontSize: "9px",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Courses",
              fontSize: "9px",
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 1,
    },
  };

  return (
    <div className="p-4 bg-white border shadow rounded-2xl border-blue-gray-50">
      <ReactApexChart
        options={options}
        series={series as any}
        type="donut"
        height={260}
      />
    </div>
  );
};

export default CourseCategoryChart;
