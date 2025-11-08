import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import InstructorHeader from "./instructor-header";
import InstructorSideNav from "./instructor-side-nav";

const InstructorLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <InstructorSideNav isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex flex-col flex-1 min-h-screen">
        <InstructorHeader toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 overflow-y-auto sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InstructorLayout;
