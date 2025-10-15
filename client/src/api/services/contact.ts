import axiosInstance from "../middlewares/interceptor";
import type { ContactInfo } from "../types/student/student";
import CONFIG_KEYS from "../../config";

export const submitResponseService = async (
  endpoint: string,
  info: ContactInfo
) => {
  const response = await axiosInstance.post(
    `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
    info
  );
  return response.data;
};
