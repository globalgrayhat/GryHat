import express from 'express';
import categoryController from '../../../adapters/controllers/categoryController';
import { categoryDbInterface } from '../../../app/repositories/categoryDbRepository';
import { categoryRepositoryMongodb } from '../../../frameworks/database/mongodb/repositories/categoryRepoMongoDb';

const categoryRouter = () => {
  const router = express.Router();

  const controller = categoryController(
    categoryDbInterface,
    categoryRepositoryMongodb
  );

<<<<<<< HEAD
  /**
   * @swagger
   * /api/category/add-category:
   *   post:
   *     summary: Add a new category
   *     tags: [Category]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Category created successfully
   *       400:
   *         description: Bad request
   */
  router.post('/add-category', controller.addCategory);

  /**
   * @swagger
   * /api/category/get-category/{categoryId}:
   *   get:
   *     summary: Get category by ID
   *     tags: [Category]
   *     parameters:
   *       - in: path
   *         name: categoryId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Category fetched successfully
   *       404:
   *         description: Category not found
   */
  router.get('/get-category/:categoryId', controller.getCategoryById);

  /**
   * @swagger
   * /api/category/get-all-categories:
   *   get:
   *     summary: Get all categories
   *     tags: [Category]
   *     responses:
   *       200:
   *         description: List of all categories
   */
  router.get('/get-all-categories', controller.getAllCategory);

  /**
   * @swagger
   * /api/category/edit-category/{categoryId}:
   *   put:
   *     summary: Edit category by ID
   *     tags: [Category]
   *     parameters:
   *       - in: path
   *         name: categoryId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: Category updated successfully
   *       404:
   *         description: Category not found
   */
  router.put('/edit-category/:categoryId', controller.editCategory);

/**
 * @swagger
 * /api/category/delete-category/{categoryId}:
 *   delete:
 *     summary: Delete category by ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 */
router.delete('/delete-category/:categoryId', controller.deleteCategory);

=======
  router.post('/add-category', controller.addCategory);

  router.get('/get-category/:categoryId', controller.getCategoryById);

  router.get('/get-all-categories', controller.getAllCategory);

  router.put('/edit-category/:categoryId',controller.editCategory)
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)

  return router;
};

export default categoryRouter;
