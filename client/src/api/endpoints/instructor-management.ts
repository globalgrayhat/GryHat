// client/src/api/endpoints/instructor-management.ts

import END_POINTS from "../../constants/endpoints";
import {
  getInstructors,
  acceptRequest,
  rejectRequest,
  getAllInstructor,
  blockInstructor,
  unblockInstructor,
  getBlockedInstructor,
  getIndividualInstructor,
} from "../services/instructor-manage-service";

/**
 * Get all pending instructor requests.
 * Backend is expected to return only instructors that are:
 * isVerified === false && isBlocked === false (or it filters internally).
 */
export const getAllInstructorRequests = () => {
  return getInstructors(END_POINTS.GET_INSTRUCTOR_REQUESTS);
};

/**
 * Accept a specific instructor request.
 *
 * Expected final URL (service should handle concatenation):
 *   `${END_POINTS.ACCEPT_INSTRUCTOR_REQUESTS}/${instructorId}`
 *
 * Example:
 *   /api/instructors/accept-instructor-request/68e9917da1fdd65c392fc592
 */
export const acceptInstructorRequest = (instructorId: string) => {
  return acceptRequest(END_POINTS.ACCEPT_INSTRUCTOR_REQUESTS, instructorId);
};

/**
 * Reject a specific instructor request with a reason.
 *
 * Expected final URL:
 *   `${END_POINTS.REJECT_INSTRUCTOR_REQUESTS}/${instructorId}`
 */
export const rejectInstructorRequest = (
  instructorId: string,
  reason: string
) => {
  return rejectRequest(
    END_POINTS.REJECT_INSTRUCTOR_REQUESTS,
    instructorId,
    reason
  );
};

/**
 * Get all instructors (approved/active list).
 */
export const getAllInstructors = () => {
  return getAllInstructor(END_POINTS.GET_INSTRUCTORS);
};

/**
 * Block an instructor with a specific reason.
 *
 * Expected final URL:
 *   `${END_POINTS.BLOCK_INSTRUCTORS}/${instructorId}`
 */
export const blockInstructors = (instructorId: string, reason: string) => {
  return blockInstructor(
    END_POINTS.BLOCK_INSTRUCTORS,
    instructorId,
    reason
  );
};

/**
 * Unblock a specific instructor.
 *
 * Expected final URL:
 *   `${END_POINTS.UNBLOCK_INSTRUCTORS}/${instructorId}`
 */
export const unblockInstructors = (instructorId: string) => {
  return unblockInstructor(END_POINTS.UNBLOCK_INSTRUCTORS, instructorId);
};

/**
 * Get all blocked instructors.
 */
export const getBlockedInstructors = () => {
  return getBlockedInstructor(END_POINTS.GET_BLOCKED_INSTRUCTORS);
};

/**
 * Get full details of a single instructor (used for request details page).
 *
 * Expected final URL:
 *   `${END_POINTS.GET_INSTRUCTOR}/${instructorId}`
 */
export const getIndividualInstructors = (instructorId: string) => {
  return getIndividualInstructor(END_POINTS.GET_INSTRUCTOR, instructorId);
};
