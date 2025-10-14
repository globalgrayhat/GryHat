import React from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Typography, Input } from '@material-tailwind/react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * AdminArticlesPage displays a list of articles stored in the platform.  This
 * initial version is a placeholder; integrate it with your backend by
 * replacing the hard-coded data and connecting the actions below to API
 * endpoints.  The page respects dark mode and uses Material‑Tailwind
 * components for consistency with the rest of the admin dashboard.
 */
const AdminArticlesPage: React.FC = () => {
  const { t } = useLanguage();

  // Placeholder data.  Replace this with real data from your API once
  // endpoints are available.
  const articles = [
    { _id: '1', title: 'What is Machine Learning?', author: 'Admin', date: '2025-01-20' },
    { _id: '2', title: 'Building a Modern Web App', author: 'Admin', date: '2025-02-10' },
  ];

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-semibold mb-4 dark:text-gray-100'>
        {t('admin.articles') || 'Articles'}
      </h1>
      <Card className='w-full'>
        <CardHeader floated={false} shadow={false} className='rounded-none'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
            <div>
              <Typography variant='h5' className='dark:text-gray-200'>
                {t('admin.articles') || 'Articles'}
              </Typography>
              <Typography color='gray' className='mt-1 font-normal dark:text-gray-400'>
                {t('admin.articlesDescription') || 'Manage platform articles.'}
              </Typography>
            </div>
            <div className='w-full md:w-72 flex items-center gap-2'>
              <Input label={t('admin.search') || 'Search'} className='dark:text-gray-200' />
              <Button size='sm' color='blue'>
                {t('common.add') || 'Add'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className='overflow-x-auto p-0'>
          <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
            <thead className='bg-gray-50 dark:bg-gray-800'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  {t('article.title') || 'Title'}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  {t('article.author') || 'Author'}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  {t('article.date') || 'Published'}
                </th>
                <th className='px-6 py-3' />
              </tr>
            </thead>
            <tbody className='bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700'>
              {articles.length > 0 ? (
                articles.map((article) => (
                  <tr key={article._id} className='hover:bg-gray-50 dark:hover:bg-gray-800'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100'>
                      {article.title}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {article.author}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {article.date}
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
                  <td colSpan={4} className='px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300'>
                    {t('admin.noArticles') || 'No articles found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
        <CardFooter className='border-t border-blue-gray-50 p-4 flex justify-end'>
          {/* Pagination placeholder */}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminArticlesPage;