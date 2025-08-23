import axiosInstance from '../middlewares/interceptor';

// API calls for site settings. These wrap the backend endpoints used to
// retrieve and update platform-wide settings such as the platform name
// and enabled login providers.

export const getSiteSettings = async () => {
  return await axiosInstance.get('/settings');
};

export const updateSiteSettings = async (data: { platformName?: string; loginOptions?: any }) => {
  return await axiosInstance.put('/settings', data);
};