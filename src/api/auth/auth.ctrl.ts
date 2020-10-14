import Joi from 'joi';
import { RouterContext } from 'koa-router';

import User from '../../model/user';

// 회원가입
// POST /api/auth/register
export const register = async (ctx: RouterContext): Promise<void> => {
  // request body 검증용 schema
  const schema = Joi.object().keys({
    username: Joi.string().min(2).max(8).required(),
    password: Joi.string().min(8).required(),
  });

  // 양식에 맞지 않으면 400: Bad request 에러
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { username, password } = ctx.request.body;

  try {
    // 입력받은 것과 같은 username을 가진 user 찾아보고, 있다면 409: Conflict 에러
    const exist = await User.findOne({ username });
    if (exist) {
      ctx.status = 409;
      return;
    }

    const user = new User({
      username,
    });
    await user.setPassword(password);
    await user.save();

    // 비밀번호 빼고 응답
    ctx.body = user.serialize();
  } catch (e) {
    ctx.throw(500, e);
  }
};
