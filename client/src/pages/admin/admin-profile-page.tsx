import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
  Input,
} from '@material-tailwind/react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * AdminProfilePage
 *
 * A simple editable profile page for administrators. It allows admins to
 * update their name and email. This is a placeholder page; in a real
 * application, this would connect to the backend to persist profile
 * changes. The form is styled consistently with the rest of the admin
 * dashboard and supports dark mode.
 */
const AdminProfilePage: React.FC = () => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Hook up to API to save admin profile
    // For now, just log the values
    // eslint-disable-next-line no-console
    console.log({ name, email });
    alert(t('admin.profileSaved') || 'Profile saved');
  };
  return (
    <Card className='max-w-xl mx-auto'>
      <CardHeader shadow={false} floated={false} className='rounded-none'>
        <Typography variant='h5' color='blue-gray'>
          {t('admin.profileSettings') || 'Profile Settings'}
        </Typography>
        <Typography color='gray' className='mt-1 font-normal'>
          {t('admin.profileSettingsDescription') || 'Update your admin profile information'}
        </Typography>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardBody className='space-y-4'>
          <div>
            <Input
              label={t('admin.name') || 'Name'}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Input
              label={t('admin.email') || 'Email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </CardBody>
        <CardFooter className='pt-0'>
          <Button type='submit' color='blue'>
            {t('admin.save') || 'Save'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AdminProfilePage;