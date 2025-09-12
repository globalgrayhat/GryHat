import mongoose from 'mongoose';
import { User } from '../models/user';

/**
 * MongoDB repository for the unified User collection. This repository
 * exposes simple CRUD operations against the `users` collection,
 * independent of any specific role. When updating or retrieving
 * documents, ensure that the client has appropriate authorization.
 */
export const userRepoMongoDb = () => {
  const getUserById = async (id: string) => {
    return await User.findById(new mongoose.Types.ObjectId(id));
  };

  const getUserByEmail = async (email: string) => {
    return await User.findOne({ email });
  };

  const getAllUsers = async () => {
    return await User.find({});
  };

  const updateRole = async (id: string, newRole: string) => {
    const response = await User.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { role: newRole }
    );
    return response;
  };

  const blockUser = async (id: string, reason: string) => {
    await User.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { isBlocked: true, blockedReason: reason }
    );
  };

  const unblockUser = async (id: string) => {
    await User.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { isBlocked: false, blockedReason: '' }
    );
  };

  return {
    getUserById,
    getUserByEmail,
    getAllUsers,
    updateRole,
    blockUser,
    unblockUser
  };
};

export type UserRepositoryMongoDb = typeof userRepoMongoDb;