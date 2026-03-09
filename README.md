# 项目邀请管理系统

基于 Koa3 + Vue3 + Element-Plus + SQLite 构建的项目邀请管理系统。

## 功能特性

- **项目管理**: 创建、编辑、删除项目，配置邀请目标地址
- **渠道管理**: 为每个项目创建多个推广渠道，自动生成唯一渠道码
- **动态参数**: 支持自定义参数名和参数值，灵活追踪不同渠道来源
- **邀请统计**: 自动统计每个渠道的邀请访问次数
- **链接跳转**: 访问邀请链接时自动跳转到目标地址并携带渠道参数

## 技术栈

### 后端
- Koa3 (ES6 Module)
- Koa Router
- better-sqlite3 (SQLite 数据库)
- UUID (唯一标识生成)

### 前端
- Vue 3
- Vue Router
- Element Plus
- Axios
- Vite

## 项目结构

```
project-invite-manage/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── app.js          # 应用入口
│   │   ├── data/
│   │   │   └── db.js       # SQLite 数据库操作
│   │   └── routes/
│   │       ├── projects.js  # 项目路由
│   │       ├── channels.js  # 渠道路由
│   │       └── invite.js    # 邀请跳转路由
│   ├── data/               # SQLite 数据库文件目录
│   └── package.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── main.js        # 入口文件
│   │   ├── App.vue        # 根组件
│   │   ├── components/    # 公共组件
│   │   ├── views/         # 页面组件
│   │   ├── router/        # 路由配置
│   │   └── utils/         # 工具函数
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json           # 根 package.json
├── pnpm-workspace.yaml    # pnpm workspace 配置
├── Dockerfile             # Docker 构建文件
└── .dockerignore          # Docker 忽略文件
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
pnpm install
```

### 开发模式

启动后端服务:

```bash
pnpm dev
```

启动前端开发服务器 (新终端):

```bash
pnpm dev:frontend
```

访问:
- 前端开发服务: http://localhost:5173
- 后端 API: http://localhost:3000

### 生产构建

```bash
pnpm build
pnpm start
```

访问: http://localhost:3000

## API 接口

### 项目管理

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/projects | 获取所有项目 |
| GET | /api/projects/:id | 获取单个项目 |
| POST | /api/projects | 创建项目 |
| PUT | /api/projects/:id | 更新项目 |
| DELETE | /api/projects/:id | 删除项目 |

### 渠道管理

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/channels/project/:projectId | 获取项目的所有渠道 |
| GET | /api/channels/:id | 获取单个渠道 |
| POST | /api/channels | 创建渠道 |
| PUT | /api/channels/:id | 更新渠道 |
| DELETE | /api/channels/:id | 删除渠道 |

### 邀请跳转

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /i/:code | 邀请链接跳转 (自动统计并重定向) |

## 使用流程

1. **创建项目**: 填写项目名称和邀请目标地址 (如: `https://example.com/invite`)
2. **添加渠道**: 在项目中创建渠道，填写渠道名称 (如: 微信、QQ、短信)
3. **配置参数**: 可选配置动态参数名和参数值
4. **分享链接**: 复制生成的邀请链接分享给用户
5. **查看统计**: 在渠道列表中查看邀请访问次数

## 邀请链接说明

生成的邀请链接格式: `http://your-domain/i/{渠道码}`

访问该链接时:
1. 系统自动记录邀请次数 +1
2. 跳转到项目配置的目标地址
3. 如果配置了动态参数，会在目标地址后追加参数

示例:
- 目标地址: `https://example.com/invite`
- 渠道参数: `source=wechat`
- 最终跳转: `https://example.com/invite?source=wechat`

## Docker 部署

### 构建镜像

```bash
docker build -t project-invite-manage .
```

### 运行容器

```bash
docker run -d -p 3000:3000 -v invite-data:/data project-invite-manage
```

使用数据卷持久化 SQLite 数据库文件。

### Docker Compose (可选)

```yaml
version: '3.8'
services:
  invite-manage:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - invite-data:/data
    restart: unless-stopped

volumes:
  invite-data:
```

## 数据库

使用 SQLite 存储数据，数据库文件位于 `/data/invite.db` (Docker) 或 `backend/data/invite.db` (开发环境)。

可通过环境变量 `DATA_DIR` 自定义数据目录。

### 表结构

**projects 表:**
| 字段 | 类型 | 描述 |
|------|------|------|
| id | TEXT | 主键 (UUID) |
| name | TEXT | 项目名称 |
| inviteUrl | TEXT | 邀请目标地址 |
| createdAt | INTEGER | 创建时间戳 |
| updatedAt | INTEGER | 更新时间戳 |

**channels 表:**
| 字段 | 类型 | 描述 |
|------|------|------|
| id | TEXT | 主键 (UUID) |
| projectId | TEXT | 所属项目ID |
| name | TEXT | 渠道名称 |
| code | TEXT | 唯一渠道码 |
| paramKey | TEXT | 参数名 |
| paramValue | TEXT | 参数值 |
| inviteCount | INTEGER | 邀请次数 |
| createdAt | INTEGER | 创建时间戳 |
| updatedAt | INTEGER | 更新时间戳 |

## License

MIT
