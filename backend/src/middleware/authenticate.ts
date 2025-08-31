import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("SECRET_KEY is not set");
}
const JWT_SECRET = process.env.JWT_SECRET;

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
   try {
      const authHeader = req.headers.authorization;
  
      if (!authHeader) {
        res.status(401).json({ error: "No token provided" });
        return; // Don't return the response object, just return from function
      }
  
      // Extract token from Bearer format
      const token = authHeader.split(" ")[1];
  
      if (!token) {
        res.status(401).json({ error: "Invalid token format" });
        return; // Don't return the response object
      }
  
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
  
      next(); // Call next to continue
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(401).json({ error: "Invalid token" });
      // No return statement here
    }
};

export const isAdmin = async ( req: Request, res: Response, next: NextFunction): Promise<void> => 
{
  if ((req as any).user.user_level === 'admin') {
    next();
  } else {
    res.status(403).json({ error: "Forbidden" });
  }
}
export const isCostomer = async ( req: Request, res: Response, next: NextFunction): Promise<void> =>
{
  if ((req as any).user.user_level === 'customer') {
    next();
  } else {
    res.status(403).json({ error: "Forbidden" });
  }
}
    