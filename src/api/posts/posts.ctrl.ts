import Joi from 'joi';
import { RouterContext } from 'koa-router';

import Post from '../../model/post';

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
  });

  // 양식에 맞지 않으면 400: Bad request 에러
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { title, youtubeLink, description, originalSinger, originalTitle } = ctx.request.body;

  try {
    const post = new Post({
      title,
      youtubeLink,
      description,
      originalSinger,
      originalTitle,
      author: ctx.state.user._id,
    });
    await post.save();

    ctx.body = await post.join();
  } catch (e) {
    ctx.throw(500, e);
  }
};
