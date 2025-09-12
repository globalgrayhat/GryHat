import { UserRepositoryMongoDb } from '../../frameworks/database/mongodb/repositories/userRepoMongoDb';

/**
 * Interface adapter for the unified User repository. This layer
 * abstracts the persistence implementation and exposes a clean
 * API for use cases to interact with users. It intentionally
 * mirrors the repository methods defined in `userRepoMongoDb`.
 */
export const userDbRepository = (
  repository: ReturnType<UserRepositoryMongoDb>
) => {
  const getUserById = async (id: string) => await repository.getUserById(id);
  const getUserByEmail = async (email: string) =>
    await repository.getUserByEmail(email);
  const getAllUsers = async () => await repository.getAllUsers();
  const updateRole = async (id: string, role: string) =>
    await repository.updateRole(id, role);
  const blockUser = async (id: string, reason: string) =>
    await repository.blockUser(id, reason);
  const unblockUser = async (id: string) => await repository.unblockUser(id);

  return {
    getUserById,
    getUserByEmail,
    getAllUsers,
    updateRole,
    blockUser,
    unblockUser
  };
};

export type UserDbRepository = typeof userDbRepository;