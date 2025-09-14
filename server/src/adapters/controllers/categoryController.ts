import { ok, created, fail, err } from '../../shared/http/respond';
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

const categoryController = (
  categoryDbRepository: CategoryDbInterface,
  categoryDbRepositoryImpl: CategoryRepoMongodbInterface
) => {
  const dbRepositoryCategory = categoryDbRepository(categoryDbRepositoryImpl());

  const addCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const category: CategoryInterface = req.body;
    await addCategoryU(category, dbRepositoryCategory);
    ok(res, 'Successfully added a new category', null);
  });

  const getCategoryById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const categoryId: string = req.params.categoryId;
    const category = await getCategoryByIdU(categoryId, dbRepositoryCategory);
    ok(res, 'Successfully retrieved a category by id', category);
  });

  const getAllCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const categories = await getAllCategoryU(dbRepositoryCategory);
    ok(res, 'Successfully retrieved all categories', categories);
  });

  const editCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const categoryId: string = req.params.categoryId;
    const categoryInfo = req.body;
    await editCategoryU(categoryId, categoryInfo, dbRepositoryCategory);
    ok(res, 'Successfully edited the category', null);
  });

  return {
    addCategory,
    getCategoryById,
    getAllCategory,
    editCategory
  };
};

export default categoryController;