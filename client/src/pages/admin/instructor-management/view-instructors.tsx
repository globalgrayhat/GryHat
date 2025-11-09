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
  getAllInstructors,
  unblockInstructors,
} from "../../../api/endpoints/instructor-management";
import { toast } from "react-toastify";
import { formatDate, getFullUrl } from "../../../utils/helpers";
import BlockReasonModal from "./block-reason-modal";
import usePagination from "../../../hooks/usePagination";

const TABLE_HEAD = ["Name", "Email", "Date Joined", "Status", "Actions", ""];

const ViewInstructors: React.FC = () => {
  const [instructors, setInstructors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [id, setId] = useState("");
  const ITEMS_PER_PAGE = 4;

  // Fetch all instructors
  const fetchInstructors = async () => {
    try {
      const response = await getAllInstructors();
      setInstructors(response?.data?.data || []);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.data?.message ||
        "Failed to load instructors";
      toast.error(msg, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, [updated]);

  // Client-side search
  const filtered = useMemo(
    () =>
      instructors.filter((ins) =>
        `${ins.firstName || ""} ${ins.lastName || ""} ${ins.email || ""}`
          .toLowerCase()
          .includes(search.toLowerCase().trim())
      ),
    [instructors, search]
  );

  // Pagination over filtered list
  const {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    goToPreviousPage,
    goToNextPage,
  } = usePagination(filtered, ITEMS_PER_PAGE);

  const handleUnblock = async (instructorId: string) => {
    try {
      const response = await unblockInstructors(instructorId);
      toast.success(response.data.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      setUpdated(!updated);
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
      {open && (
        <BlockReasonModal
          open={open}
          setOpen={setOpen}
          updated={updated}
          setUpdated={setUpdated}
          id={id}
        />
      )}

      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="flex flex-col justify-between gap-4 mb-4 md:flex-row md:items-center">
          <div>
            <Typography variant="h5" color="blue-gray">
              Manage Instructors
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              These are details about the instructors
            </Typography>
          </div>
          <div className="flex w-full gap-2 shrink-0 md:w-72">
            <Input
              label="Search"
              icon={<MagnifyingGlassIcon className="w-5 h-5" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>

      <CardBody className="px-0 overflow-x-auto">
        <table className="w-full text-left table-auto min-w-max">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map(
              (
                {
                  _id,
                  firstName,
                  lastName,
                  email,
                  dateJoined,
                  isBlocked,
                  isVerified,
                  profileUrl,
                  profilePic,
                }: any,
                index: number
              ) => {
                const isLast = index === currentData.length - 1;
                const classes = isLast
                  ? "p-4"
                  : "p-4 border-b border-blue-gray-50";

                // Normalize avatar source:
                // - If backend sends `profileUrl` (string, relative or absolute)
                // - Or `profilePic.url` (object form)
                let avatarSrc: string | undefined;
                if (profilePic?.url) {
                  avatarSrc = getFullUrl(profilePic.url);
                } else if (profileUrl) {
                  avatarSrc = getFullUrl(profileUrl);
                }

                const statusLabel = isBlocked
                  ? "Blocked"
                  : isVerified === false
                  ? "Pending"
                  : "Active";

                const statusColor = isBlocked
                  ? "red"
                  : isVerified === false
                  ? "amber"
                  : "green";

                return (
                  <tr key={_id}>
                    <td className={classes}>
                      <div className="flex items-center gap-3">
                        {avatarSrc ? (
                          <Avatar
                            src={avatarSrc}
                            alt={`${firstName} ${lastName}`}
                            size="md"
                            className="object-cover p-1 border border-blue-gray-50 bg-blue-gray-50/50"
                            onError={(e) => {
                              // Hide broken image, let name/icon carry
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
                          className="font-bold"
                        >
                          {`${firstName || ""} ${lastName || ""}`.trim() ||
                            "Unknown Instructor"}
                        </Typography>
                      </div>
                    </td>

                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {email || "-"}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {dateJoined ? formatDate(dateJoined) : "-"}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <div className="w-max">
                        <Chip
                          size="sm"
                          variant="ghost"
                          value={statusLabel}
                          color={statusColor}
                        />
                      </div>
                    </td>

                    <td className={classes}>
                      <div className="flex items-center">
                        {isBlocked ? (
                          <button
                            onClick={() => handleUnblock(_id)}
                            className="w-[80px] px-2 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-sm transform-gpu transition-transform duration-200 active:scale-95"
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setId(_id);
                              setOpen(true);
                            }}
                            className="w-[80px] px-2 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-sm transform-gpu transition-transform duration-200 active:scale-95"
                          >
                            Block
                          </button>
                        )}
                      </div>
                    </td>

                    <td className={classes}>
                      <Tooltip content="Edit User">
                        <IconButton variant="text" color="blue-gray">
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
      </CardBody>

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

        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <IconButton
                key={pageNumber}
                variant={pageNumber === currentPage ? "outlined" : "text"}
                color="blue-gray"
                size="sm"
                onClick={() => goToPage(pageNumber)}
              >
                {pageNumber}
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
    </Card>
  );
};

export default ViewInstructors;
