import initSqlJs from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
const dbPath = path.join(DATA_DIR, 'invite.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let db;
let SQL;

async function initDatabase() {
  try {
    SQL = await initSqlJs();
    
    if (fs.existsSync(dbPath)) {
      const filebuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(filebuffer);
    } else {
      db = new SQL.Database();
    }
    
    db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        inviteUrl TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS channels (
        id TEXT PRIMARY KEY,
        projectId TEXT NOT NULL,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        paramKey TEXT DEFAULT '',
        paramValue TEXT DEFAULT '',
        inviteCount INTEGER DEFAULT 0,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_channels_projectId ON channels(projectId);
      CREATE INDEX IF NOT EXISTS idx_channels_code ON channels(code);
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

function saveDb() {
  if (db) {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
}

function stmt(sql) {
  return {
    get: (...params) => {
      if (!db) return undefined;
      const result = db.exec(sql, params);
      if (result.length === 0 || result[0].values.length === 0) return undefined;
      const row = {};
      result[0].columns.forEach((col, i) => {
        row[col] = result[0].values[0][i];
      });
      return row;
    },
    all: (...params) => {
      if (!db) return [];
      const result = db.exec(sql, params);
      if (result.length === 0) return [];
      return result[0].values.map(v => {
        const row = {};
        result[0].columns.forEach((col, i) => {
          row[col] = v[i];
        });
        return row;
      });
    },
    run: (...params) => {
      if (!db) return { changes: 0 };
      db.run(sql, params);
      saveDb();
      return { changes: db.getRowsModified() };
    }
  };
}

const getAllProjectsStmt = stmt('SELECT * FROM projects ORDER BY createdAt DESC');
const getProjectByIdStmt = stmt('SELECT * FROM projects WHERE id = ?');
const createProjectStmt = stmt('INSERT INTO projects (id, name, inviteUrl, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)');
const updateProjectStmt = stmt('UPDATE projects SET name = ?, inviteUrl = ?, updatedAt = ? WHERE id = ?');
const deleteProjectStmt = stmt('DELETE FROM projects WHERE id = ?');
const deleteChannelsByProjectStmt = stmt('DELETE FROM channels WHERE projectId = ?');

const getChannelsByProjectStmt = stmt('SELECT * FROM channels WHERE projectId = ? ORDER BY createdAt DESC');
const getChannelByIdStmt = stmt('SELECT * FROM channels WHERE id = ?');
const getChannelByCodeStmt = stmt('SELECT * FROM channels WHERE code = ?');
const createChannelStmt = stmt('INSERT INTO channels (id, projectId, name, code, paramKey, paramValue, inviteCount, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
const updateChannelStmt = stmt('UPDATE channels SET name = ?, paramKey = ?, paramValue = ?, updatedAt = ? WHERE id = ?');
const deleteChannelStmt = stmt('DELETE FROM channels WHERE id = ?');
const incrementInviteCountStmt = stmt('UPDATE channels SET inviteCount = inviteCount + 1, updatedAt = ? WHERE code = ?');

export const database = {
  getAllProjects() {
    return getAllProjectsStmt.all();
  },

  getProjectById(id) {
    return getProjectByIdStmt.get(id);
  },

  createProject(project) {
    createProjectStmt.run(project.id, project.name, project.inviteUrl, project.createdAt, project.updatedAt);
    return project;
  },

  updateProject(id, updates) {
    const project = this.getProjectById(id);
    if (!project) return null;
    
    const updated = { ...project, ...updates, updatedAt: Date.now() };
    updateProjectStmt.run(updated.name, updated.inviteUrl, updated.updatedAt, id);
    return updated;
  },

  deleteProject(id) {
    deleteChannelsByProjectStmt.run(id);
    const result = deleteProjectStmt.run(id);
    return result.changes > 0;
  },

  getChannelsByProjectId(projectId) {
    return getChannelsByProjectStmt.all(projectId);
  },

  getChannelById(id) {
    return getChannelByIdStmt.get(id);
  },

  getChannelByCode(code) {
    return getChannelByCodeStmt.get(code);
  },

  createChannel(channel) {
    createChannelStmt.run(
      channel.id,
      channel.projectId,
      channel.name,
      channel.code,
      channel.paramKey || '',
      channel.paramValue || '',
      channel.inviteCount || 0,
      channel.createdAt,
      channel.updatedAt
    );
    return channel;
  },

  updateChannel(id, updates) {
    const channel = this.getChannelById(id);
    if (!channel) return null;
    
    const updated = { ...channel, ...updates, updatedAt: Date.now() };
    updateChannelStmt.run(updated.name, updated.paramKey || '', updated.paramValue || '', updated.updatedAt, id);
    return updated;
  },

  deleteChannel(id) {
    const result = deleteChannelStmt.run(id);
    return result.changes > 0;
  },

  incrementInviteCount(code) {
    const channel = this.getChannelByCode(code);
    if (!channel) return null;
    
    incrementInviteCountStmt.run(Date.now(), code);
    return this.getChannelByCode(code);
  }
};

export { initDatabase };
export default database;
