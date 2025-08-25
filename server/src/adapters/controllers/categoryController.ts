import {
  addCategoryU,
  getAllCategoryU,
  getCategoryByIdU,
  editCategoryU
} from '../../app/usecases/category';
import { CategoryDbInterface } from '../../app/repositories/categoryDbRepository';
import { CategoryRepoMongodbInterface } from '../../frameworks/database/mongodb/repositories/categoryRepoMongoDb';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { CategoryInterface } from '../../types/category';

// Unified response sender to avoid repetition
const sendResponse = (
  res: Response,
  message: string,
  data: any = null,
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

const categoryController = (
  categoryDbRepository: CategoryDbInterface,
  categoryDbRepositoryImpl: CategoryRepoMongodbInterface
) => {
  const dbRepositoryCategory = categoryDbRepository(categoryDbRepositoryImpl());

  // Controller to add a new category
  const addCategory = asyncHandler(async (req: Request, res: Response) => {
    const category: CategoryInterface = req.body;
    await addCategoryU(category, dbRepositoryCategory);
    sendResponse(res, 'Successfully added a new category');
  });

  // Controller to get a category by ID
  const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const categoryId: string = req.params.categoryId;
    const category = await getCategoryByIdU(categoryId, dbRepositoryCategory);
    sendResponse(res, 'Successfully retrieved a category by id', category);
  });

  // Controller to get all categories
  const getAllCategory = asyncHandler(async (req: Request, res: Response) => {
    const categories = await getAllCategoryU(dbRepositoryCategory);
    sendResponse(res, 'Successfully retrieved all categories', categories);
  });

  // Controller to edit a category by ID
  const editCategory = asyncHandler(async (req: Request, res: Response) => {
    const categoryId: string = req.params.categoryId;
    const categoryInfo = req.body;
    await editCategoryU(categoryId, categoryInfo, dbRepositoryCategory);
    sendResponse(res, 'Successfully edited the category');
  });

  return {
    addCategory,
    getCategoryById,
    getAllCategory,
    editCategory
  };
};

export default categoryController;
