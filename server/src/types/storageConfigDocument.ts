import { ObjectId } from 'mongodb';
import { StorageConfig } from './storageConfig';

/**
 * StorageConfig document returned from MongoDB (includes _id).
 */
export type StorageConfigDocument = StorageConfig & { _id: ObjectId };
