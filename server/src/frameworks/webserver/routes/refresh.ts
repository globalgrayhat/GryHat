import express from 'express';
import refreshTokenController from '../../../adapters/controllers/refreshTokenController';
import { refreshTokenDbRepository } from '../../../app/repositories/refreshTokenDBRepository';
import { refreshTokenRepositoryMongoDB } from '../../../frameworks/database/mongodb/repositories/refreshTokenRepoMongoDb';
import { authService } from '../../../frameworks/services/authService';
import { authServiceInterface } from '../../../app/services/authServicesInterface';

const refreshRouter = () => {
  const router = express.Router();
  const controller = refreshTokenController(
    authServiceInterface,
    authService,
    refreshTokenDbRepository,
    refreshTokenRepositoryMongoDB
  );

  /**
   * @swagger
   * tags:
   *   name: RefreshToken
   *   description: Refresh token management
   */

  /**
   * @swagger
   * /api/all/refresh-token/refresh:
   *   post:
   *     summary: Refresh JWT access token
   *     tags: [RefreshToken]
   *     requestBody:
   *       description: Refresh token to generate a new access token
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               refreshToken:
   *                 type: string
   *                 description: The refresh token issued to the user
   *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *     responses:
   *       200:
   *         description: New access token generated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accessToken:
   *                   type: string
   *                   description: New JWT access token
   *       401:
   *         description: Invalid or expired refresh token
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Invalid refresh token"
   */
  router.post('/refresh', controller.refreshToken);

  return router;
};

export default refreshRouter;
