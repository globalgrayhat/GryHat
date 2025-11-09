import React from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface CourseData {
  title: string;
  enrolled: number;
}

interface Props {
  data: CourseData[] | undefined | null;
}

const TrendingCoursesChart: React.FC<Props> = ({ data }) => {
  const safeData: CourseData[] = Array.isArray(data)
    ? data
        .filter(
          (item) =>
            item &&
            typeof item.title === "string" &&
            typeof item.enrolled === "number"
        )
        .slice()
        .sort((a, b) => b.enrolled - a.enrolled)
        .slice(0, 5)
    : [];

  if (!safeData.length) {
    return (
      <div className="bg-white p-4 shadow rounded-2xl border border-blue-gray-50 text-[10px] text-gray-500">
        No trending courses data available.
      </div>
    );
  }

  const chartOptions: ApexOptions = {
    chart: {
      id: "trending-courses-chart",
      toolbar: { show: false },
    },
    xaxis: {
      categories: safeData.map((c) => c.title),
      labels: {
        rotate: -25,
        style: {
          fontSize: "9px",
        },
        trim: true,
      },
    },
    yaxis: {
      title: {
        text: "Enrollment Count",
        style: { fontSize: "9px" },
      },
      labels: {
        style: { fontSize: "9px" },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      strokeDashArray: 4,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} enrollments`,
      },
    },
  };

  const chartSeries = [
    {
      name: "Enrollment Count",
      data: safeData.map((course) => course.enrolled),
    },
  ];

  return (
    <div className="p-4 bg-white border shadow rounded-2xl border-blue-gray-50">
      <ReactApexChart
        options={chartOptions}
        series={chartSeries}
        type="bar"
        height={255}
      />
    </div>
  );
};

export default TrendingCoursesChart;
