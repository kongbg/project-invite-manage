import Router from '@koa/router';
import { database } from '../data/db.js';
const router = new Router({ prefix: '/i' });

router.get('/:code', (ctx) => {
  console.log('Invite link accessed:', ctx.params.code);
  
  // 检查 Cookie 中是否已访问过该邀请码
  const visitedCodes = ctx.cookies.get('visited_invite_codes') || '';
  if (visitedCodes.includes(ctx.params.code)) {
    console.log('User has already visited this invite link');
    const channel = database.getChannelByCode(ctx.params.code);
    if (!channel) {
      ctx.status = 404;
      ctx.body = { success: false, message: '邀请链接不存在或已失效' };
      return;
    }
    const project = database.getProjectById(channel.projectId);
    if (!project) {
      ctx.status = 404;
      ctx.body = { success: false, message: '项目不存在' };
      return;
    }
    
    let targetUrl = project.inviteUrl;
    if (channel.paramKey) {
      const separator = targetUrl.includes('?') ? '&' : '?';
      targetUrl = `${targetUrl}${separator}${channel.paramKey}=${encodeURIComponent(channel.paramValue || channel.code)}`;
    }
    
    ctx.redirect(targetUrl);
    return;
  }
  
  const channel = database.getChannelByCode(ctx.params.code);
  if (!channel) {
    ctx.status = 404;
    ctx.body = { success: false, message: '邀请链接不存在或已失效' };
    return;
  }
  const project = database.getProjectById(channel.projectId);
  if (!project) {
    ctx.status = 404;
    ctx.body = { success: false, message: '项目不存在' };
    return;
  }
  
  // 增加邀请计数
  database.incrementInviteCount(ctx.params.code);
  
  // 设置 Cookie 记录已访问的邀请码
  const newVisitedCodes = visitedCodes ? `${visitedCodes},${ctx.params.code}` : ctx.params.code;
  ctx.cookies.set('visited_invite_codes', newVisitedCodes, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30天过期
    httpOnly: true,
    sameSite: 'strict'
  });
  
  let targetUrl = project.inviteUrl;
  if (channel.paramKey) {
    const separator = targetUrl.includes('?') ? '&' : '?';
    targetUrl = `${targetUrl}${separator}${channel.paramKey}=${encodeURIComponent(channel.paramValue || channel.code)}`;
  }
  
  ctx.redirect(targetUrl);
});

export default router;
