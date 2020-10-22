import { Context, Next } from 'koa';
import { Types } from 'mongoose';

import Post from '../model/post';

export const checkLoggedIn = (ctx: Context, next: Next): Promise<any> | undefined => {
  if (!ctx.state.user) {
    ctx.status = 401; // Unauthorized
    return;
  }
  return next();
};

export const checkPostObjectId = async (ctx: Context, next: Next): Promise<any> => {
  const { id } = ctx.params;
  if (!Types.ObjectId.isValid(id)) {
    ctx.status = 400; // Bad request
    return;
  }
  try {
    const post = await Post.findById(id).populate('author', 'username');
    // 포스트가 존재하지 않을 때
    if (!post) {
      ctx.status = 404; // Not found
      return;
    }
    ctx.state.post = post;
    return next();
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const checkOwnPost = async (ctx: Context, next: Next): Promise<any> => {
  const { user, post } = ctx.state;
  if (post.author._id.toString() !== user._id) {
    ctx.status = 403; // Forbidden
    return;
  }
  return next();
};
