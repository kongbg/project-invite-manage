import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import cors from 'koa-cors';
import { initDatabase } from './data/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import Project from './routes/projects.js';
import Channel from './routes/channels.js';
import Invite from './routes/invite.js';
import User from './routes/user.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Koa();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const distPath = path.join(__dirname, '../dist');

app.use(cors());
app.use(bodyParser());
app.use(User.routes());
app.use(User.allowedMethods());
app.use(Project.routes());
app.use(Project.allowedMethods());
app.use(Channel.routes());
app.use(Channel.allowedMethods());
app.use(Invite.routes());
app.use(Invite.allowedMethods());

app.use(serve(distPath));

app.use(async (ctx) => {
  if (ctx.path.startsWith('/api')) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'API endpoint not found' };
  } else {
    ctx.type = 'html';
    try {
      const fs = await import('fs');
      ctx.body = await fs.promises.readFile(path.join(distPath, 'index.html'), 'utf-8');
    } catch {
      ctx.status = 404;
      ctx.body = 'Not Found';
    }
  }
});

async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
