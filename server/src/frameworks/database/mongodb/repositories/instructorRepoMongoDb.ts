import Instructor from '../models/instructor';
import mongoose from 'mongoose';
import {
  InstructorInterface,
  SavedInstructorInterface
} from '@src/types/instructorInterface';
export const instructorRepoMongoDb = () => {
  const addInstructor = async (instructor: InstructorInterface) => {
    return await Instructor.create(instructor);
  };
  const getInstructorByEmail = async (email: string) => {
    const instructor: SavedInstructorInterface | null =
      await Instructor.findOne({ email }).select('+password').lean();
    return instructor;
  };
  const getInstructorRequests = async () => {
    const instructors: SavedInstructorInterface[] | null =
      await Instructor.find({ isVerified: false, rejected: false });
    return instructors;
  };
  const acceptInstructorRequest = async (instructorId: string) => {
    const response = await Instructor.findOneAndUpdate(
      { _id: instructorId },
      { isVerified: true }
    );
    return response;
  };
  const checkRejected = async (instructorId: string) => {
    const result = await Instructor.findOne({
      $and: [
        { _id: new mongoose.Types.ObjectId(instructorId) },
        { rejected: true }
      ]
    });
    return result;
  };
  const rejectInstructorRequest = async (
    instructorId: string,
    reason: string
  ) => {
    const options = {
      upsert: true,
      new: true
    };

    const update = {
      $set: { rejectedReason: reason, rejected: true }
    };
    const response = await Instructor.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(instructorId) },
      update,
      options
    );

    return response;
  };
  const getAllInstructors = async () => {
    // Find all instructors who are verified and not rejected, excluding the 'password' field
    const instructors: SavedInstructorInterface[] | null = 
      await Instructor.find({ isVerified: true, rejected: false })
        .select('-password'); // Exclude the password field
    return instructors;
  };
  const blockInstructors = async (instructorId: string, reason: string) => {
    await Instructor.updateOne(
      { _id: new mongoose.Types.ObjectId(instructorId) },
      {
        $set: {
          isBlocked: true,
          blockedReason: reason
        }
      }
    );
    return instructorId;
  };
  const unblockInstructors = async (instructorId: string) => {
    await Instructor.updateOne(
      { _id: new mongoose.Types.ObjectId(instructorId) },
      {
        $set: {
          isBlocked: false
        }
      }
    );
  };
  const getBlockedInstructors = async () => {
    const blockedInstructors = await Instructor.find({ isBlocked: true });
    return blockedInstructors;
  };
  const getInstructorById = async (instructorId: string) => {
    // Find the instructor by ID, exclude the 'password' field, only return verified and not rejected instructors
    const instructor: SavedInstructorInterface | null = 
      await Instructor.findOne({
        _id: new mongoose.Types.ObjectId(instructorId)
      })
      .select('-password') // Exclude the password field
      .where('isVerified').equals(true) // Only return verified instructors
      .where('rejected').equals(false) // Only return instructors who have not been rejected
      .lean(); 
      return instructor;
  };
  const getTotalNumberOfInstructors = async () => {
    const total = await Instructor.find().count();
    return total;
  };
  const changePassword = async (id: string, password: string) => {
    await Instructor.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { password }
    );
  };
  const updateProfile = async (
    id: string,
    instructorInfo: SavedInstructorInterface
  ) => {
    await Instructor.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { ...instructorInfo }
    );
  };
  return {
    addInstructor,
    getInstructorByEmail,
    getInstructorRequests,
    acceptInstructorRequest,
    checkRejected,
    rejectInstructorRequest,
    getAllInstructors,
    blockInstructors,
    unblockInstructors,
    getBlockedInstructors,
    getInstructorById,
    getTotalNumberOfInstructors,
    changePassword,
    updateProfile
  };
};

export type InstructorRepositoryMongoDb = typeof instructorRepoMongoDb;
