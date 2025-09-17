<<<<<<< HEAD
import { ok, created, fail, err } from '../../shared/http/respond';
=======
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
import {
  addCategoryU,
  getAllCategoryU,
  getCategoryByIdU,
<<<<<<< HEAD
  editCategoryU,
  deleteCategoryU
=======
  editCategoryU
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
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

<<<<<<< HEAD
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

const deleteCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const categoryId: string = req.params.categoryId;

  await deleteCategoryU(categoryId, dbRepositoryCategory);

  ok(res, 'Category deleted successfully', null);
});


=======
  const addCategory = asyncHandler(async (req: Request, res: Response) => {
    const category: CategoryInterface = req.body;
    await addCategoryU(category, dbRepositoryCategory);
    res.status(200).json({
      status: 'success',
      message: 'Successfully added a new category',
      data: null
    });
  });

  const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const categoryId: string = req.params.categoryId;
    const category = await getCategoryByIdU(categoryId, dbRepositoryCategory);
    res.status(200).json({
      status: 'success',
      message: 'Successfully retrieved a category by id',
      data: category
    });
  });

  const getAllCategory = asyncHandler(async (req: Request, res: Response) => {
    const categories = await getAllCategoryU(dbRepositoryCategory);
    res.status(200).json({
      status: 'success',
      message: 'Successfully retrieved all categories',
      data: categories
    });
  });

  const editCategory = asyncHandler(async (req: Request, res: Response) => {
    const categoryId: string = req.params.categoryId;
    const categoryInfo = req.body;
    await editCategoryU(categoryId, categoryInfo, dbRepositoryCategory);
    res.status(200).json({
      status: 'success',
      message: 'Successfully edited the category',
      data: null
    });
  });

>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  return {
    addCategory,
    getCategoryById,
    getAllCategory,
<<<<<<< HEAD
    editCategory,
    deleteCategory
  };
};

export default categoryController;
=======
    editCategory
  };
};

export default categoryController;
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
