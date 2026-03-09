import Router from '@koa/router';
import { v4 as uuidv4 } from 'uuid';
import { database as db } from '../data/db.js';

const router = new Router({ prefix: '/api/projects' });

router.get('/', (ctx) => {
  // console.log('get all projects');
  const projects = db.getAllProjects();
  ctx.body = { success: true, data: projects };
});

router.post('/', (ctx) => {
  const { name, inviteUrl } = ctx.request.body;
  
  if (!name || !inviteUrl) {
    ctx.status = 400;
    ctx.body = { success: false, message: '项目名称和邀请地址不能为空' };
    return;
  }
  
  const project = {
    id: uuidv4(),
    name: name.trim(),
    inviteUrl: inviteUrl.trim(),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  db.createProject(project);
  ctx.status = 201;
  ctx.body = { success: true, data: project };
});

router.get('/:id', (ctx) => {
  const { id } = ctx.params;
  const project = db.getProjectById(id);
  
  if (!project) {
    ctx.status = 404;
    ctx.body = { success: false, message: '项目不存在' };
    return;
  }
  
  ctx.body = { success: true, data: project };
});

router.put('/:id', (ctx) => {
  const { id } = ctx.params;
  const { name, inviteUrl } = ctx.request.body;
  
  const project = db.getProjectById(id);
  if (!project) {
    ctx.status = 404;
    ctx.body = { success: false, message: '项目不存在' };
    return;
  }
  
  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (inviteUrl !== undefined) updates.inviteUrl = inviteUrl.trim();
  
  const updated = db.updateProject(id, updates);
  ctx.body = { success: true, data: updated };
});

router.delete('/:id', (ctx) => {
  const { id } = ctx.params;
  
  const project = db.getProjectById(id);
  if (!project) {
    ctx.status = 404;
    ctx.body = { success: false, message: '项目不存在' };
    return;
  }
  
  db.deleteProject(id);
  ctx.body = { success: true, message: '删除成功' };
});

export default router;
