export const handleApiError = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    // The request was made and the server responded with a status code
    const status = (error as { response: { status: number } }).response.status;
    const errorMessage =
      typeof error.response === "object" &&
      error.response !== null &&
      "data" in error.response &&
      typeof error.response.data === "object" &&
      error.response.data !== null &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
        ? error.response.data.message
        : "Unknown error";

    if (status === 401) {
      // Handle authentication errors
      return "Authentication failed. Please check your credentials.";
    } else if (status === 400) {
      // Handle validation errors
      return `Validation failed: ${errorMessage}`;
    } else {
      // Handle other server errors
      return `Server error: ${errorMessage}`;
    }
  } else if (
    typeof error === "object" &&
    error !== null &&
    "request" in error
  ) {
    // The request was made, but no response was received
    return "No response received from the server. Please try again later.";
  } else {
    // Other errors occurred
    console.error("Error:", error);
    return "An unexpected error occurred. Please try again.";
  }
};
