import React from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface DataPoint {
  month: string;
  revenue: number;
  coursesAdded: number;
  coursesEnrolled: number;
}

interface Props {
  data: DataPoint[] | undefined | null;
}

const RevenueChart: React.FC<Props> = ({ data }) => {
  const safeData: DataPoint[] = Array.isArray(data)
    ? data.filter(
        (d) =>
          d &&
          typeof d.month === "string" &&
          typeof d.revenue === "number" &&
          typeof d.coursesAdded === "number" &&
          typeof d.coursesEnrolled === "number"
      )
    : [];

  if (!safeData.length) {
    return (
      <div className="bg-white p-4 shadow rounded-md text-[10px] text-gray-500">
        No revenue data available yet.
      </div>
    );
  }

  const chartOptions: ApexOptions = {
    chart: {
      id: "revenue-chart",
      animations: {
        enabled: true,
        easing: "linear",
        speed: 300,
      },
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: safeData.map((d) => d.month || ""),
      labels: {
        style: {
          fontSize: "10px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Amount",
        style: {
          fontSize: "10px",
        },
      },
      labels: {
        style: {
          fontSize: "9px",
        },
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "top",
      fontSize: "9px",
    },
    grid: {
      strokeDashArray: 4,
    },
    tooltip: {
      shared: true,
    },
  };

  const chartSeries = [
    {
      name: "Monthly Revenue",
      data: safeData.map((d) => d.revenue),
    },
    {
      name: "Courses Added",
      data: safeData.map((d) => d.coursesAdded),
    },
    {
      name: "Courses Enrolled",
      data: safeData.map((d) => d.coursesEnrolled),
    },
  ];

  return (
    <div className="p-4 bg-white border shadow rounded-2xl border-blue-gray-50">
      <ReactApexChart
        options={chartOptions}
        series={chartSeries}
        type="line"
        height={260}
      />
    </div>
  );
};

export default RevenueChart;
