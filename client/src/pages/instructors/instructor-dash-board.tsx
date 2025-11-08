import React from "react";
import { Typography, Card } from "@material-tailwind/react";

const InstructorDashboard: React.FC = () => {
  return (
    <div className="space-y-4">
      <Typography variant="h4" className="text-gray-900">
        Welcome to your Instructor Dashboard
      </Typography>
      <Typography className="text-sm text-gray-600">
        Track your courses, manage students, and update your profile information.
      </Typography>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-semibold text-gray-500">Courses</p>
          <p className="mt-1 text-xl font-bold text-gray-900">—</p>
          <p className="mt-1 text-[10px] text-gray-500">
            Overview of your published & draft courses.
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-gray-500">Students</p>
          <p className="mt-1 text-xl font-bold text-gray-900">—</p>
          <p className="mt-1 text-[10px] text-gray-500">
            Track student enrollments & engagement.
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-gray-500">Earnings</p>
          <p className="mt-1 text-xl font-bold text-gray-900">—</p>
          <p className="mt-1 text-[10px] text-gray-500">
            Connect your earnings API to display insights here.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default InstructorDashboard;
