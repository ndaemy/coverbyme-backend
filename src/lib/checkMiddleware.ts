import { Context, Next } from 'koa';
import { Types } from 'mongoose';

export const checkLoggedIn = (ctx: Context, next: Next): Promise<any> | undefined => {
  if (!ctx.state.user) {
    ctx.status = 401; // Unauthorized
    return;
  }
  return next();
};

export const checkObjectId = (ctx: Context, next: Next): Promise<any> | undefined => {
  const { id } = ctx.params;
  if (!Types.ObjectId.isValid(id)) {
    ctx.status = 400; // Bad request
    return;
  }
  return next();
};
