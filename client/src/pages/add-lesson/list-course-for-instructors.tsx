import React, { useEffect, useState, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  PencilIcon,
  UserPlusIcon,
  TrashIcon,
  SquaresPlusIcon,
} from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Tabs,
  TabsHeader,
  Tab,
  Avatar,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";
import { getCourseSelf } from "../../api/endpoints/course/course";
import { formatDate, getFullUrl } from "../../utils/helpers";
import { Link } from "react-router-dom";
import usePagination from "../../hooks/usePagination";
import useSearch from "../../hooks/useSearch";

const TABS = [
  { label: "All", value: "all" },
  { label: "Monitored", value: "monitored" },
  { label: "Pending", value: "pending" },
];

const TABLE_HEAD = ["Course", "Category", "Status", "Added", "Actions"];

// Component: Tabs + Search bar
function FilterTabs({
  tabValue,
  setTabValue,
  searchQuery,
  setSearchQuery,
}: {
  tabValue: string;
  setTabValue: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <Tabs
        value={tabValue}
        onChange={setTabValue}
        className="w-full md:w-max"
      >
        <TabsHeader>
          {TABS.map(({ label, value }) => (
            <Tab key={value} value={value}>
              &nbsp;&nbsp;{label}&nbsp;&nbsp;
            </Tab>
          ))}
        </TabsHeader>
      </Tabs>

      <div className="w-full md:w-72">
        <Input
          label="Search"
          value={searchQuery}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
          icon={<MagnifyingGlassIcon className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}

// Component: Table header
function CourseTableHead() {
  return (
    <thead>
      <tr>
        {TABLE_HEAD.map((head, idx) => (
          <th
            key={head}
            className="cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors hover:bg-blue-gray-50"
          >
            <Typography
              variant="small"
              color="blue-gray"
              className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
            >
              {head}
              {idx !== TABLE_HEAD.length - 1 && (
                <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
              )}
            </Typography>
          </th>
        ))}
      </tr>
    </thead>
  );
}

// Component: Row in the table
function CourseRow({
  course,
  isLast,
}: {
  course: any;
  isLast: boolean;
}) {
  const classes = isLast ? "p-4" : "p-3 border-b border-blue-gray-12";
  const {
    _id,
    title,
    thumbnailUrl,
    category,
    createdAt,
    isVerified,
  } = course;

  return (
    <tr key={_id}>
      <td className={classes}>
        <div className="flex items-center gap-3">
          {/* <Avatar
            src={getFullUrl(thumbnailUrl)}
            alt="course thumbnail"
            size="sm"
          /> */}
          <Typography variant="small" color="blue-gray" className="font-normal">
            {title}
          </Typography>
        </div>
      </td>
      <td className={classes}>
        <Typography variant="small" color="blue-gray" className="font-normal">
          {category}
        </Typography>
      </td>
      <td className={classes}>
        <Chip
          variant="ghost"
          size="sm"
          value={isVerified ? "Active" : "Pending"}
          color={isVerified ? "green" : "blue-gray"}
        />
      </td>
      <td className={classes}>
        <Typography variant="small" color="blue-gray" className="font-normal">
          {formatDate(createdAt)}
        </Typography>
      </td>
      <td className={classes}>
        <div className="flex gap-2">
          <Tooltip content="Add lessons">
            <Link to={`/instructors/view-lessons/${_id}`}>
              <IconButton variant="text" color="blue-gray">
                <SquaresPlusIcon className="h-4 w-4 text-blue-500" />
              </IconButton>
            </Link>
          </Tooltip>
          <Tooltip content="Edit course">
            <Link to={`/instructors/edit-course/${_id}`}>
              <IconButton variant="text" color="blue-gray">
                <PencilIcon className="h-4 w-4" />
              </IconButton>
            </Link>
          </Tooltip>
          <Tooltip content="Delete course">
            <IconButton variant="text" color="blue-gray">
              <TrashIcon className="h-4 w-4 text-red-500" />
            </IconButton>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
}

const ListCourseForInstructors: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tabValue, setTabValue] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await getCourseSelf();
        setCourses(res.data ?? []);
      } catch (e) {
        setCourses([]);
        console.error(e);
      }
    })();
  }, []);

  // استخدم useMemo لتقليل عمليات الفلترة و البحث غير الضرورية
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (tabValue === "monitored") return course.isVerified === true;
      if (tabValue === "pending") return course.isVerified === false;
      return true;
    });
  }, [courses, tabValue]);

  const searchResult = useSearch(filteredCourses, searchQuery);

  const {
    currentPage,
    totalPages,
    currentData,
    goToPreviousPage,
    goToNextPage,
  } = usePagination(searchQuery ? searchResult : filteredCourses, 4);

  return (
    <Card className="w-full mb-24">
      <CardHeader floated={false} shadow={false} className="rounded-none p-6">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h5" color="blue-gray">
              Course List
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              See information about all courses
            </Typography>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outlined" color="blue-gray" size="sm">
              View All
            </Button>
            <Link to="/instructors/add-course">
              <Button
                className="flex items-center gap-3"
                color="blue"
                size="sm"
                type="button"
              >
                <UserPlusIcon strokeWidth={2} className="h-4 w-4" /> Add Course
              </Button>
            </Link>
          </div>
        </div>

        <FilterTabs
          tabValue={tabValue}
          setTabValue={setTabValue}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </CardHeader>

      <CardBody className="overflow-x-auto px-0">
        <table className="mt-4 w-full min-w-max table-auto text-left">
          <CourseTableHead />

          <tbody>
            {currentData.length > 0 ? (
              currentData.map((course, i) => (
                <CourseRow key={course._id} course={course} isLast={i === currentData.length - 1} />
              ))
            ) : (
              <tr>
                <td
                  className="p-6 text-center"
                  colSpan={TABLE_HEAD.length}
                >
                  <div className="flex items-center justify-center gap-2">
                    <ExclamationCircleIcon className="h-6 w-6 text-blue-gray-400" />
                    <Typography variant="body" color="blue-gray">
                      No courses found matching your criteria.
                    </Typography>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardBody>

      <CardFooter className="flex flex-col gap-3 border-t border-blue-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <Typography variant="small" color="blue-gray" className="font-normal">
          Page {currentPage} of {totalPages}
        </Typography>
        <div className="flex gap-2">
          <Button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            variant="outlined"
            color="blue-gray"
            size="sm"
          >
            Previous
          </Button>
          <Button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            variant="outlined"
            color="blue-gray"
            size="sm"
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ListCourseForInstructors;
