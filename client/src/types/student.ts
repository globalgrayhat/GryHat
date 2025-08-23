export interface StudentData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    mobile: string;
    /**
     * A list of interests chosen by the student during registration.
     *
     * Historically this field was mandatory and fed into the category
     * recommendation engine.  The form no longer asks the user to pick
     * categories, so this field is now optional.  When omitted the backend
     * should treat it as an empty array.
     */
    interests?: string[];
  }
  