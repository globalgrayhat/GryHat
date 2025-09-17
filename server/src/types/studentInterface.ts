export interface StudentInterface {
  _id: string;
  firstName: string;
  lastName: string;
  profilePic?: {
    name: string;
    url?: string;
  };
  email: string;
<<<<<<< HEAD
  mobile?: string;
  password?: string;
  interests: Array<string>;
  coursesEnrolled: Array<string>;
  dateJoined: Date;
  isGoogleUser: boolean;
  isBlocked: boolean;
  blockedReason: string;
=======
  mobile: number;
  password: string;
  isGoogleUser: boolean;
  isBlocked:boolean
  profileUrl:string;
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
}

export interface StudentUpdateInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  profilePic?: {
    name: string;
    url?: string;
  };
}
