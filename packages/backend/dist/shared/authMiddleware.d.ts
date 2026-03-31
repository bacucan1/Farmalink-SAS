import { Request, Response, NextFunction } from 'express';
/**
 * Bearer puede ser JWT (gateway / login nuevo) o base64(email) legado.
 */
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=authMiddleware.d.ts.map