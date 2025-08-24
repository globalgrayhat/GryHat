import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import useApiCall from '../../../hooks/useApiCall';
import { getAllCourses } from '../../../api/endpoints/course/course';
import { CourseInterface } from '../../../types/course';
import { Button, Card, CardBody, CardHeader, CardFooter, Typography, Input, Chip, Avatar } from '@material-tailwind/react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

/**
 * AdminCoursesPage renders a table of all courses in the platform. Admins can
 * view course information and perform management actions. The page uses
 * responsive styling and respects dark mode. It is a simple example and can
 * be extended to include editing, deletion and search.
 */
const AdminCoursesPage: React.FC = () => {
  const { t } = useLanguage();
  // Fetch all courses. The api returns an object with a `data` field or an array.
  const { data: courses, isLoading } = useApiCall(getAllCourses);

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-semibold mb-4 dark:text-gray-100'>{t('admin.courses')}</h1>
      {isLoading ? (
        <div className='flex justify-center py-10'>
          <ExclamationCircleIcon className='w-8 h-8 animate-spin text-blue-500' />
        </div>
      ) : (
        <Card className='w-full'>
          <CardHeader floated={false} shadow={false} className='rounded-none'>
            <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
              <div>
                <Typography variant='h5' className='dark:text-gray-200'>
                  {t('admin.courses')}
                </Typography>
                <Typography color='gray' className='mt-1 font-normal dark:text-gray-400'>
                  {t('admin.coursesDescription')}
                </Typography>
              </div>
              <div className='w-full md:w-72'>
                <Input
                  label={t('admin.search')}
                  className='dark:text-gray-200'
                />
              </div>
            </div>
          </CardHeader>
          <CardBody className='overflow-x-auto p-0'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
              <thead className='bg-gray-50 dark:bg-gray-800'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    {t('course.title') || 'Title'}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    {t('course.category') || 'Category'}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    {t('course.duration') || 'Duration'}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    {t('course.price') || 'Price'}
                  </th>
                  <th className='px-6 py-3' />
                </tr>
              </thead>
              <tbody className='bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700'>
                {Array.isArray(courses?.data) && courses?.data?.length && courses?.data?.length > 0 ? (
                  courses?.data?.map((course: CourseInterface) => (
                    <tr key={course._id} className='hover:bg-gray-50 dark:hover:bg-gray-800'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100'>
                        {course.title}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                        {course.category}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                        {course.duration}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                        {course.isPaid ? course.price : t('course.free') || 'Free'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2'>
                        <Button size='sm' color='blue' variant='outlined'>
                          {t('common.edit') || 'Edit'}
                        </Button>
                        <Button size='sm' color='red' variant='outlined'>
                          {t('common.delete') || 'Delete'}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className='px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300'>
                      {t('admin.noCourses')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardBody>
          {/* <CardFooter className='border-t border-blue-gray-50 p-4 flex justify-end'>
            {/* Pagination placeholder */}
          {/* </CardFooter> */}
        </Card>
      )}
    </div>
  );
};

export default AdminCoursesPage;