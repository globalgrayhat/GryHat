import React from "react";
import { Typography } from "@material-tailwind/react";

export interface AdminTableColumn {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  width?: string;
}

interface AdminTableProps<T> {
  columns: AdminTableColumn[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * AdminTable
 * - جدول موحّد لجميع صفحات الأدمن.
 * - أعمدة ديناميكية + صفوف مخصصة.
 * - يحتوي حالات التحميل و"لا توجد بيانات" بشكل متناسق.
 */
const AdminTable = <T,>({
  columns,
  data,
  renderRow,
  isLoading = false,
  emptyMessage = "No records found.",
  className,
}: AdminTableProps<T>) => {
  return (
    <div
      className={`
        relative
        w-full
        overflow-x-auto
        rounded-2xl
        border
        border-blue-gray-50
        bg-white
        shadow-sm
        ${className || ""}
      `}
    >
      <table className="min-w-full text-left align-middle">
        <thead className="border-b bg-blue-gray-50/80 border-blue-gray-100">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={`
                  px-3 sm:px-4 py-3
                  text-[9px] sm:text-[10px]
                  font-semibold
                  tracking-wide
                  uppercase
                  text-blue-gray-500
                  ${col.align === "center" ? "text-center" : ""}
                  ${col.align === "right" ? "text-right" : ""}
                `}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-blue-gray-50">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-8">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                  <Typography className="text-[10px] text-gray-500">
                    Loading...
                  </Typography>
                </div>
              </td>
            </tr>
          ) : !data || data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8">
                <div className="flex flex-col items-center justify-center gap-1">
                  <Typography className="text-[11px] text-gray-500">
                    {emptyMessage}
                  </Typography>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, index) => renderRow(item, index))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
