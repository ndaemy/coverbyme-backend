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

    const token = user.generateToken();
    if (!token) throw Error;

    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
  } catch (e) {
    ctx.throw(500, e);
  }
};

// 로그인
// POST /api/auth/login
export const login = async (ctx: RouterContext): Promise<void> => {
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
    const user = await User.findOne({ username });
    const valid = await user?.checkPassword(password);

    // 해당 username을 가진 user가 존재하지 않거나
    // 비밀번호가 일치하지 않으면
    if (!user || !valid) {
      ctx.status = 401; // Unauthorized
      return;
    }

    ctx.body = user.serialize();

    const token = user.generateToken();
    if (!token) throw Error;

    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
  } catch (e) {
    ctx.throw(500, e);
  }
};

// 로그인 상태 확인
// GET /api/auth/check
export const check = async (ctx: RouterContext): Promise<void> => {
  const { user } = ctx.state;
  // 로그인 중이 아니라면
  if (!user) {
    ctx.status = 401; // Unauthorized
    return;
  }
  ctx.body = user;
};

// 로그아웃
// POST /api/auth/logout
export const logout = async (ctx: RouterContext): Promise<void> => {
  ctx.cookies.set('access_token');
  ctx.status = 204; // No content
};
