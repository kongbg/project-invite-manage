import Router from '@koa/router';
import jwt from 'jsonwebtoken';
import { database as db } from '../data/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

const router = new Router({ prefix: '/api/auth' });

router.post('/register', (ctx) => {
  console.log('User registration');
  const { username, password } = ctx.request.body;
  if (!username || !password) {
    ctx.status = 400;
    ctx.body = { success: false, message: '用户名和密码不能为空' };
    return;
  }
  if (username.length < 3 || password.length < 6) {
    ctx.status = 400;
    ctx.body = { success: false, message: '用户名至少3个字符，密码至少6个字符' };
    return;
  }
  const existingUser = db.getUserByUsername(username);
  if (existingUser) {
    ctx.status = 400;
    ctx.body = { success: false, message: '用户名已存在' };
    return;
  }
  const user = db.createUser(username, password);
  const token = generateToken(user);
  ctx.status = 201;
  ctx.body = {
    success: true,
    data: {
      user: { id: user.id, username: user.username },
      token
    }
  };
});

router.post('/login', (ctx) => {
  console.log('User login');
  const { username, password } = ctx.request.body;
  if (!username || !password) {
    ctx.status = 400;
    ctx.body = { success: false, message: '用户名和密码不能为空' };
    return;
  }
  const user = db.verifyPassword(username, password);
  if (!user) {
    ctx.status = 401;
    ctx.body = { success: false, message: '用户名或密码错误' };
    return;
  }
  const token = generateToken(user);
  ctx.body = {
    success: true,
    data: {
      user: { id: user.id, username: user.username },
      token
    }
  };
});

export { router as userRouter, verifyToken };
export default router;
