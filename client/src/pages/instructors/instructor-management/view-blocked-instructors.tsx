/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { PencilIcon } from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  Card,
  CardHeader,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Avatar,
  IconButton,
  Tooltip,
  Input,
} from "@material-tailwind/react";
import {
  unblockInstructors,
  getBlockedInstructors,
} from "../../../api/endpoints/instructor-management";
import { toast } from "react-toastify";
import { formatDate, getFullUrl } from "../../../utils/helpers";
import usePagination from "../../../hooks/usePagination";

const TABLE_HEAD = ["Name", "Email", "Date Joined", "Status", "Actions", ""];

const ViewBlockedInstructors: React.FC = () => {
  const [instructors, setInstructors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [updated, setUpdated] = useState(false);
  const ITEMS_PER_PAGE = 6;

  // Fetch blocked instructors from API
  const fetchBlockedInstructors = async () => {
    try {
      const response = await getBlockedInstructors();
      setInstructors(response?.data?.data || []);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.data?.message ||
        "Failed to load blocked instructors";
      toast.error(msg, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    }
  };

  useEffect(() => {
    fetchBlockedInstructors();
  }, [updated]);

  // Client-side search by name/email
  const filtered = useMemo(
    () =>
      instructors.filter((ins) =>
        `${ins.firstName || ""} ${ins.lastName || ""} ${ins.email || ""}`
          .toLowerCase()
          .includes(search.toLowerCase().trim())
      ),
    [instructors, search]
  );

  // Paginate filtered results
  const {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    goToPreviousPage,
    goToNextPage,
  } = usePagination(filtered, ITEMS_PER_PAGE);

  // Handle unblock action
  const handleUnblock = async (instructorId: string) => {
    try {
      const response = await unblockInstructors(instructorId);
      toast.success(response.data.message || "Instructor unblocked", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      setUpdated((prev) => !prev);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.data?.message ||
        "Failed to unblock instructor";
      toast.error(msg, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    }
  };

  return (
    <Card className="w-full h-full">
      {/* Header: title + search */}
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Typography variant="h5" color="blue-gray">
              Blocked Instructors
            </Typography>
            <Typography color="gray" className="mt-1 text-sm font-normal">
              These instructors are currently blocked from the platform.
            </Typography>
          </div>
          <div className="flex w-full md:w-72">
            <Input
              label="Search"
              icon={<MagnifyingGlassIcon className="w-5 h-5" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              crossOrigin=""
            />
          </div>
        </div>
      </CardHeader>

      {/* Table */}
      <CardBody className="px-0 overflow-x-auto">
        <table className="w-full text-left table-auto min-w-max">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="p-4 text-xs font-medium tracking-wide uppercase text-blue-gray-600 bg-blue-gray-50/60 border-y border-blue-gray-100"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map(
              (
                {
                  _id,
                  profileUrl,
                  profilePic,
                  firstName,
                  lastName,
                  email,
                  dateJoined,
                }: any,
                index: number
              ) => {
                const isLast = index === currentData.length - 1;
                const classes = isLast
                  ? "p-4"
                  : "p-4 border-b border-blue-gray-50";

                // Normalize avatar URL:
                // - support `profilePic.url` or `profileUrl` (relative or absolute)
                let avatarSrc: string | undefined;
                if (profilePic?.url) {
                  avatarSrc = getFullUrl(profilePic.url);
                } else if (profileUrl) {
                  avatarSrc = getFullUrl(profileUrl);
                }

                const displayName =
                  `${firstName || ""} ${lastName || ""}`.trim() ||
                  "Unknown Instructor";

                return (
                  <tr key={_id} className="hover:bg-blue-gray-50/30">
                    {/* Name + Avatar */}
                    <td className={classes}>
                      <div className="flex items-center gap-3">
                        {avatarSrc ? (
                          <Avatar
                            src={avatarSrc}
                            alt={displayName}
                            size="md"
                            className="object-cover p-1 border border-blue-gray-50 bg-blue-gray-50/60"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center w-10 h-10 text-gray-400 bg-gray-200 rounded-full">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        )}
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          {displayName}
                        </Typography>
                      </div>
                    </td>

                    {/* Email */}
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal break-all"
                      >
                        {email || "-"}
                      </Typography>
                    </td>

                    {/* Date Joined */}
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {dateJoined ? formatDate(dateJoined) : "-"}
                      </Typography>
                    </td>

                    {/* Status */}
                    <td className={classes}>
                      <Chip
                        size="sm"
                        variant="ghost"
                        value="Blocked"
                        color="red"
                        className="px-2 py-0.5 text-[10px] font-semibold"
                      />
                    </td>

                    {/* Unblock button */}
                    <td className={classes}>
                      <button
                        onClick={() => handleUnblock(_id)}
                        className="w-20 px-2 py-1.5 text-[11px] bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-sm transform transition-transform duration-200 active:scale-95"
                      >
                        Unblock
                      </button>
                    </td>

                    {/* Edit icon */}
                    <td className={classes}>
                      <Tooltip content="Edit User">
                        <IconButton variant="text" color="blue-gray" size="sm">
                          <PencilIcon className="w-4 h-4" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>

        {currentData.length === 0 && (
          <div className="py-8 text-sm text-center text-gray-500">
            No blocked instructors found.
          </div>
        )}
      </CardBody>

      {/* Pagination */}
      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between p-4 border-t border-blue-gray-50">
          <Button
            variant="outlined"
            color="blue-gray"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <IconButton
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "filled" : "text"}
                  color="blue-gray"
                  size="sm"
                  onClick={() => goToPage(pageNumber)}
                  className="min-w-[28px]"
                >
                  <span className="text-xs">{pageNumber}</span>
                </IconButton>
              )
            )}
          </div>
          <Button
            variant="outlined"
            color="blue-gray"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ViewBlockedInstructors;
