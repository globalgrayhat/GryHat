/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Avatar,
  IconButton,
} from "@material-tailwind/react";
import { getMyStudents } from "../../api/endpoints/instructor";
import { useState, useEffect } from "react";
import usePagination from "../../hooks/usePagination";
import { formatDate, getFullUrl } from "../../utils/helpers";
import { toast } from "react-toastify";
import type { Students } from "../../api/types/student/student";

const TABLE_HEAD = ["Student", "Course", "Status", "Joined"];

const MyStudents: React.FC = () => {
  const [students, setStudents] = useState<Students[]>([]);
  const [search, setSearch] = useState("");
  const ITEMS_PER_PAGE = 5;

  const fetchStudents = async () => {
    try {
      const response = await getMyStudents();
      const data = response?.data || [];
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Something went wrong", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const name = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
    return (
      name.includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.course || "").toLowerCase().includes(q)
    );
  });

  const {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
  } = usePagination(filtered, ITEMS_PER_PAGE);

  return (
    <div className="pb-6">
      <Card className="w-full h-full">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Typography variant="h5" color="blue-gray">
                Students list
              </Typography>
              <Typography color="gray" className="mt-1 text-sm font-normal">
                See information about all students enrolled in your courses.
              </Typography>
            </div>
            <div className="w-full sm:w-64">
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
          <table className="w-full mt-2 text-left table-auto min-w-max">
            <thead>
              <tr>
                {TABLE_HEAD.map((head, index) => (
                  <th
                    key={head}
                    className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50"
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
                    >
                      {head}
                      {index !== TABLE_HEAD.length - 1 && (
                        <ChevronUpDownIcon
                          strokeWidth={2}
                          className="w-4 h-4"
                        />
                      )}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map(
                (
                  {
                    email,
                    firstName,
                    lastName,
                    course,
                    isBlocked,
                    isGoogleUser,
                    dateJoined,
                    profileUrl,
                    profilePic,
                  },
                  index
                ) => {
                  const isLast = index === currentData.length - 1;
                  const classes = isLast
                    ? "p-4"
                    : "p-4 border-b border-blue-gray-50";

                  const avatarSrc = isGoogleUser
                    ? getFullUrl(profilePic?.url || "")
                    : getFullUrl(profileUrl || "");

                  return (
                    <tr key={`${email}-${index}`}>
                      <td className={classes}>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={avatarSrc}
                            alt={email}
                            size="sm"
                            className="object-cover"
                          />
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-medium"
                            >
                              {(firstName || "") + " " + (lastName || "")}
                            </Typography>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal opacity-70"
                            >
                              {email}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {course || "-"}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Chip
                          variant="ghost"
                          size="sm"
                          value={!isBlocked ? "Active" : "Blocked"}
                          color={isBlocked ? "red" : "green"}
                        />
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
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>

          {!currentData.length && (
            <div className="py-6 text-sm text-center text-gray-500">
              No students found.
            </div>
          )}
        </CardBody>

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
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNumber) => (
                  <IconButton
                    key={pageNumber}
                    variant={
                      pageNumber === currentPage ? "outlined" : "text"
                    }
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
        )}
      </Card>
    </div>
  );
};

export default MyStudents;
