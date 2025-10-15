import { submitResponseService } from "../services/contact";

import END_POINTS from "../../constants/endpoints";
type ContactInfo = {
  name: string;
  email: string;
  message: string;
};

export const submitResponse = (info: ContactInfo) => {
  return submitResponseService(END_POINTS.CONTACT_US, info);
};
