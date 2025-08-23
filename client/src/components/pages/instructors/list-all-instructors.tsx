import React, { useEffect, useState, ChangeEvent } from 'react';
import InstructorCard from "./instructor-card";
import { Link } from "react-router-dom";
import { getAllInstructors } from "../../../api/endpoints/instructor-management";
import { InstructorApiResponse } from "../../../api/types/apiResponses/api-response-instructors";
import { toast } from "react-toastify";
import ShimmerListAllInstructors from "../../shimmer/shimmer-list-all-instructors";
import FilterInstructorSelectBox from "./filter-instructor-select-box";
import { RiSearchLine } from 'react-icons/ri';
import { Spinner } from '@material-tailwind/react';
import { useLanguage } from '../../../contexts/LanguageContext';

type Props = {};

const ListAllInstructors: React.FC<Props> = () => {
  const { t } = useLanguage();
  const [instructors, setInstructors] = useState<InstructorApiResponse[] | undefined>(undefined);
  const [filteredInstructors, setFilteredInstructors] = useState<
    InstructorApiResponse[] | undefined
  >(undefined);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [debouncedFilter, setDebouncedFilter] = useState<number | undefined>(
    undefined
  );

  const fetchInstructors = async () => {
    try {
      setIsLoading(true);
      const response = await getAllInstructors();
      setInstructors(response?.data?.data);
      setFilteredInstructors(response?.data?.data);
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      toast.error("Something went wrong", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const debounce = <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ) => {
    let timeoutId: number | undefined;
    return (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        func(...args);
      }, delay);
      setDebouncedFilter(timeoutId);
    };
  };

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchQuery(value);
  };

  useEffect(() => {
    const debouncedFilterFunc = debounce(() => {
      setIsSearchLoading(true);
      const searchResult = instructors?.filter(
        (instructor) =>
          instructor.firstName.toLowerCase().trim().includes(searchQuery) ||
          instructor.lastName.toLowerCase().trim().includes(searchQuery)
      );
      setTimeout(() => {
        setFilteredInstructors(searchResult);
        setIsSearchLoading(false);
      }, 500);
    }, 200);

    debouncedFilterFunc();

    return () => {
      if (debouncedFilter) {
        clearTimeout(debouncedFilter);
      }
    };
  }, [searchQuery, instructors]);

  const filteredAndSearchedInstructors = filteredInstructors?.filter(
    (instructor) =>
      filterValue.length === 0 ||
      instructor.subjects.some((category) => filterValue.includes(category))
  );
  const handleSelect = (value: string) => {
    setFilterValue(value);
  };

  if (isLoading || instructors === undefined) {
    return <ShimmerListAllInstructors />;
  }

  return (
    <div className='min-h-screen pb-7'>
      {/* Header section */}
      <div className='h-1/3 p-8 md:p-12 flex flex-col w-full bg-blue-gray-50 dark:bg-gray-800 items-center justify-center text-center'>
        <h1 className='p-2 text-customFontColorBlack dark:text-gray-100 text-3xl md:text-4xl font-bold'>
          {t('tutors.title') || 'Our Instructors'}
        </h1>
        <p className='text-customFontColorBlack dark:text-gray-300 mt-2 md:text-xl font-semibold'>
          {t('tutors.subtitle') || 'Meet Tutor Trek Subject Experts'}
        </p>
      </div>
      {/* Filter and search */}
      <div className='flex flex-col sm:flex-row p-4 sm:p-6 bg-white dark:bg-gray-900 justify-center items-center gap-4'>
        <div className='w-full sm:w-1/3'>
          <FilterInstructorSelectBox handleSelect={handleSelect} />
        </div>
        <div className='relative w-full sm:w-1/3'>
          <input
            type='text'
            value={searchQuery}
            onChange={handleSearchInputChange}
            className='p-2 pr-8 border rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-500 h-10 w-full'
            placeholder={t('tutors.searchPlaceholder') || 'Search instructors...'}
          />
          <RiSearchLine size={20} className='absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 pointer-events-none' />
        </div>
      </div>
      {/* Instructor list */}
      <div className='p-6 md:p-10 flex items-center gap-y-10 bg-gray-50 dark:bg-gray-900 justify-evenly flex-wrap'>
        {isSearchLoading ? (
          <Spinner color='blue-gray' className='h-8 w-8' />
        ) : filteredAndSearchedInstructors && filteredAndSearchedInstructors.length ? (
          filteredAndSearchedInstructors.map((instructor) => (
            <Link key={instructor._id} to={`/tutors/${instructor._id}`} className='m-4'>
              <InstructorCard {...instructor} />
            </Link>
          ))
        ) : (
          <div className='p-3 text-customFontColorBlack dark:text-gray-300 font-light'>
            {t('tutors.noResults') || 'No results found.'}
          </div>
        )}
      </div>
    </div>
  );

};

export default ListAllInstructors;
