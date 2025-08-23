import React, { useEffect, useState } from "react";
import ProfileForm from "./profile-form";
import ChangePasswordForm from "./password-form";
// Note: instructor profile fetch is handled within the ProfileForm itself
import { FiEdit } from "react-icons/fi";
import { useLanguage } from '../../../contexts/LanguageContext';

type Props = {};

const InstructorProfile: React.FC = (props: Props) => {
  const [editMode, setEditMode] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // No need to fetch student data here; instructor details are loaded in ProfileForm
  }, []);

  const handleEditClick = () => {
    setEditMode(true);  
  };

  return (
    <div className='w-full flex justify-center items-center'>
      <div className='w-11/12'>
        <div>
          <div className='pt-5 pb-6 w-full'>
            <h2 className='text-3xl font-semibold text-gray-800 dark:text-gray-100'>
              {t('settings.editProfileInfo') || 'Edit profile info'}
            </h2>
          </div>  
        </div>
        <div className='flex flex-col md:flex-row gap-x-10 h-full pb-20'>
          <div className='border md:w-7/12 w-full h-full rounded-md bg-white dark:bg-[#3b4252] border-gray-200 dark:border-gray-600 shadow-sm'>
            <div className='flex justify-between'>
              <h3 className='pl-5 pt-5 text-lg font-semibold text-gray-800 dark:text-gray-100'>
                {t('settings.accountInfo') || 'Account Info'}
              </h3>
              <div>
                <button className='p-5' onClick={handleEditClick}>
                  <FiEdit className='text-gray-600 dark:text-gray-300 text-lg' />
                </button>
              </div>  
            </div>
            <div className='p-6'>
              <ProfileForm editMode={editMode} setEditMode={setEditMode} />
            </div>  
          </div>   
          <div className='border my-7 md:mt-0 pt-5 pb-10 md:w-5/12 w-full h-full rounded-md bg-white dark:bg-[#3b4252] border-gray-200 dark:border-gray-600 shadow-sm'>
            <div className='flex justify-between'>
              <h3 className='pl-5 text-lg font-semibold text-gray-800 dark:text-gray-100'>
                {t('settings.changePassword') || 'Change password'}
              </h3>
              <button className='pr-3' onClick={handleEditClick}>
                <FiEdit className='text-gray-600 dark:text-gray-300 text-lg' />
              </button>
            </div>
            <div className='p-6'>
              <ChangePasswordForm />
            </div>
          </div>
        </div>
      </div>    
    </div>        
  );
};

export default InstructorProfile;
