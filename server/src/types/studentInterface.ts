export interface StudentInterface {
  _id: string;
  firstName: string;
  lastName: string;
  profilePic?: {
    name: string;
    url?: string;
  };
  email: string;
  mobile?: string;
  password?: string;
  interests: Array<string>;
  coursesEnrolled: Array<string>;
  dateJoined: Date;
  isGoogleUser: boolean;
  isBlocked: boolean;
  blockedReason: string;
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
