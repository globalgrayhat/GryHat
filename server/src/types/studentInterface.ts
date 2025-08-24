export interface StudentInterface {
  _id: string;
  firstName: string;
  lastName: string;
  profilePic?: {
    name: string;
    url?: string;
  };
  email: string;
  mobile: number;
  password: string;
  isGoogleUser: boolean;
  isBlocked:boolean
  profileUrl:string;
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
