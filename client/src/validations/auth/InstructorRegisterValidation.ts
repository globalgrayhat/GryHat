import { object, string, ref } from "yup";

export const instructorRegistrationValidationSchema = object().shape({
  firstName: string().trim().required("First Name is required"),
  lastName: string().trim().required("Last Name is required"),
  email: string().email("Invalid email").trim().required("Email is required"),
  mobile: string().trim()
    .required("Mobile number is required")
    .matches(
      /^(?:(?:\+|0{0,2})91(\s*[-]\s*)?|[0]?)?[6789]\d{9}$/,
      "Please enter a valid 10-digit mobile number"
    ),
  qualification:string().trim().required("Qualification is required"),
  subjects:string().trim().required("Subjects is required"),
  experience:string().trim().required("Experience is required"),
  skills:string().trim().required("Skills is required"),
  about:string().min(10,"Too short").trim().required("About is required"),
  password: string().required("Password is required"),
  confirmPassword: string()
    .oneOf([ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});


// Step 1 Validation: Personal Information
export const instructorRegistrationValidationSchemaStep1 = object().shape({
  firstName: string().trim().required("First Name is required"), // First name is mandatory and trimmed
  lastName: string().trim().required("Last Name is required"),   // Last name is mandatory and trimmed
  email: string().email("Invalid email").trim().required("Email is required"), // Must be a valid email and mandatory
  mobile: string()
    .trim()
    .required("Mobile number is required")
    .matches(
      /^(?:(?:\+|0{0,2})91(\s*[-]\s*)?|[0]?)?[6789]\d{9}$/,  // Regex to validate mobile number format (example for India)
      "Please enter a valid 10-digit mobile number"
    ),
});

// Step 2 Validation: Qualifications and Experience
export const instructorRegistrationValidationSchemaStep2 = object().shape({
  qualification: string().trim().required("Qualification is required"), // Mandatory qualification
  subjects: string().trim().required("Subjects is required"),           // Mandatory subjects taught
  experience: string().trim().required("Experience is required"),       // Mandatory teaching experience
  skills: string().trim().required("Skills is required"),               // Mandatory skills
  about: string().min(10, "Too short").trim().required("About is required"), // 'About' field must have at least 10 characters
});

// Step 3 Validation: Certificates and File Uploads
// Typically file validations are handled outside Yup or with custom tests.
// Leaving this empty for now or can add custom validations if needed.
export const instructorRegistrationValidationSchemaStep3 = object().shape({});

// Step 4 Validation: Account Credentials
export const instructorRegistrationValidationSchemaStep4 = object().shape({
  password: string().required("Password is required"), // Password is mandatory
  confirmPassword: string()
    .oneOf([ref("password")], "Passwords must match") // Confirm password must match password
    .required("Confirm Password is required"),
});