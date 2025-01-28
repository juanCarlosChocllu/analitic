import { Request } from 'express';
import { Types } from 'mongoose';
import { requestUserI } from 'src/interfaces/request.interface';

declare global {
  namespace Express {
    interface Request {
      user: Types.ObjectId; 
    }
  }
}
