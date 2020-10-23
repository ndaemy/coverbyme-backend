import Joi from 'joi';
import { RouterContext } from 'koa-router';

import Post from '../../model/post';

// 전체 글 리스트 보기
// GET /api/posts
export const list = async (ctx: RouterContext): Promise<void> => {
  try {
    const posts = await Post.find().populate('author', 'username');
    ctx.body = posts;
  } catch (e) {
    ctx.throw(500, e);
  }
};

// 글 작성
// POST /api/posts
export const write = async (ctx: RouterContext): Promise<void> => {
  // request body 검증용 schema
  const schema = Joi.object().keys({
    title: Joi.string().min(4).required(),
    youtubeLink: Joi.string().uri().required(),
    description: Joi.string(),
    originalSinger: Joi.string().required(),
    originalTitle: Joi.string().required(),
    category: Joi.string().valid('vocal', 'guitar', 'bass', 'drum', 'piano', 'band').required(),
  });

  // 양식에 맞지 않으면 400: Bad request 에러
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { title, youtubeLink, description, originalSinger, originalTitle, category } = ctx.request.body;

  try {
    const post = new Post({
      title,
      youtubeLink,
      description,
      originalSinger,
      originalTitle,
      category,
      author: ctx.state.user._id,
    });
    await post.save();

    ctx.body = await post.join();
  } catch (e) {
    ctx.throw(500, e);
  }
};

// 특정 글 보기
// GET /api/posts/:id
export const read = async (ctx: RouterContext): Promise<void> => {
  ctx.body = ctx.state.post;
};

// 특정 글 수정
// PATCH /api/posts/:id
export const update = async (ctx: RouterContext): Promise<void> => {
  const { id } = ctx.params;

  // request body 검증용 schema
  const schema = Joi.object().keys({
    title: Joi.string().min(4),
    youtubeLink: Joi.string().uri(),
    description: Joi.string(),
    originalSinger: Joi.string(),
    originalTitle: Joi.string(),
    category: Joi.string().valid('vocal', 'guitar', 'bass', 'drum', 'piano', 'band'),
  });

  // 양식에 맞지 않으면 400: Bad request 에러
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true,
    });
    if (!post) {
      ctx.status = 404; // Not found
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

// 특정 글 삭제
// DELETE /api/posts/:id
export const remove = async (ctx: RouterContext): Promise<void> => {
  const { id } = ctx.params;

  try {
    await Post.findByIdAndRemove(id);
    ctx.status = 204; // No content
  } catch (e) {
    ctx.throw(500, e);
  }
};
