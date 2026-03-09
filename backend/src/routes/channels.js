import Router from '@koa/router';
import { v4 as uuidv4 } from 'uuid';
import { database as db } from '../data/db.js';

const router = new Router({ prefix: '/api/channels' });

function generateChannelCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

router.get('/project/:projectId', (ctx) => {
  const { projectId } = ctx.params;
  const channels = db.getChannelsByProjectId(projectId);
  ctx.body = { success: true, data: channels };
});

router.get('/:id', (ctx) => {
  const { id } = ctx.params;
  const channel = db.getChannelById(id);
  
  if (!channel) {
    ctx.status = 404;
    ctx.body = { success: false, message: '渠道不存在' };
    return;
  }
  
  ctx.body = { success: true, data: channel };
});

router.post('/', (ctx) => {
  const { projectId, name, paramKey, paramValue } = ctx.request.body;
  
  if (!projectId || !name) {
    ctx.status = 400;
    ctx.body = { success: false, message: '项目ID和渠道名称不能为空' };
    return;
  }
  
  const project = db.getProjectById(projectId);
  if (!project) {
    ctx.status = 404;
    ctx.body = { success: false, message: '项目不存在' };
    return;
  }
  
  let code;
  do {
    code = generateChannelCode();
  } while (db.getChannelByCode(code));
  
  const channel = {
    id: uuidv4(),
    projectId,
    name: name.trim(),
    code,
    paramKey: paramKey ? paramKey.trim() : '',
    paramValue: paramValue ? paramValue.trim() : '',
    inviteCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  db.createChannel(channel);
  ctx.status = 201;
  ctx.body = { success: true, data: channel };
});

router.put('/:id', (ctx) => {
  const { id } = ctx.params;
  const { name, paramKey, paramValue } = ctx.request.body;
  
  const channel = db.getChannelById(id);
  if (!channel) {
    ctx.status = 404;
    ctx.body = { success: false, message: '渠道不存在' };
    return;
  }
  
  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (paramKey !== undefined) updates.paramKey = paramKey.trim();
  if (paramValue !== undefined) updates.paramValue = paramValue.trim();
  
  const updated = db.updateChannel(id, updates);
  ctx.body = { success: true, data: updated };
});

router.delete('/:id', (ctx) => {
  const { id } = ctx.params;
  
  const channel = db.getChannelById(id);
  if (!channel) {
    ctx.status = 404;
    ctx.body = { success: false, message: '渠道不存在' };
    return;
  }
  
  db.deleteChannel(id);
  ctx.body = { success: true, message: '删除成功' };
});

export default router;
