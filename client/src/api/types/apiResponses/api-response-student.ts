export interface ApiResponseStudent {
    _id: string
    firstName: string
    lastName: string
    email: string
    mobile: string
    coursesEnrolled: any[]
    isGoogleUser: boolean
    dateJoined: string
    interests: string[]
    profilePic: ProfilePic
    /**
     * Indicates whether the student account has been blocked by the administrator.
     *
     * The backend attaches this flag to the student payload when a student is
     * suspended.  Without this property the frontend would fail at compile
     * time whenever we try to read `studentDetails.isBlocked` (see App.tsx).
     */
    isBlocked?: boolean
  }
  
  export interface ProfilePic {
    name: string
    key?: string
    url?:string;
    _id: string
  }
  