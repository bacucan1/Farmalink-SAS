import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare class ErrorHandler {
    static handle(err: AppError, req: Request, res: Response, next: NextFunction): void;
    static createError(message: string, statusCode: number): AppError;
}
export declare const notFound: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map