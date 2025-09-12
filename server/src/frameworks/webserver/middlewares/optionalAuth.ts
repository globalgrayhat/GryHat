import { Request, Response, NextFunction } from 'express';
import { authService } from '../../services/authService';

/**
 * Optional JWT middleware:
 * - If Authorization bearer exists → verify & attach user to req
 * - If missing/invalid → continue  
 */
const optionalAuth = async (req: Request & { user?: any }, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      const service = authService();
      const payload = await service.decodeToken(token);
      if (payload) req.user = { Id: payload.Id, role: payload.role, email: payload.email };
    }
  } catch {
    // ignore invalid tokens
  }
  next();
};

export default optionalAuth;
