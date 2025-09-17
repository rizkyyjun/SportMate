import { User } from '../../models/user.entity';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}
