import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import InstructorHeader from "./instructor-header";
import InstructorSideNav from "./instructor-side-nav";

const InstructorLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <InstructorSideNav isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <InstructorHeader toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InstructorLayout;