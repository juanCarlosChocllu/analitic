import { Request } from 'express';
import { requestUserI } from 'src/interfaces/request.interface';

declare global {
  namespace Express {
    interface Request {
      user?: requestUserI; 
    }
  }
}
