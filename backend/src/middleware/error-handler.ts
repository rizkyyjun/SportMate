import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/HttpError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      success: false,
      error: err.message,
    });
  } else {
    console.error('Internal Server Error:', err); // Log the error for debugging
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      details: err.message, // Provide more details in development, or a generic message in production
    });
  }
};
