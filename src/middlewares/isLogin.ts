import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    export interface Request {
      userId?: string;
      filePath?: string;
    }
  }
}

export const isLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.headers;
    const result: any = await jwt.verify(token as string, process.env.SECRET || 'supersecret' );
    if (!result) {
      throw new Error('invalid token');
    }
    console.log('result', result);
    req.userId = result.id;
    next();
  } catch (error) {
    res.status(403).send({ message: error.message });
  }
};

export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;    
    const result: any = await jwt.verify(token as string, process.env.SECRET || 'supersecret' );    
    if (!result) {
      res.redirect('/')
    }  
    req.userId = result.id;
    next();
  } catch (error) {
    res.redirect('/')
  }
};
