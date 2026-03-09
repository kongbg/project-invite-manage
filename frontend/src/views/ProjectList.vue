<template>
  <div class="project-list">
    <div class="page-header">
      <h2>项目管理</h2>
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>新建项目
      </el-button>
    </div>

    <el-card class="project-card" v-for="project in projects" :key="project.id">
      <div class="project-item">
        <div class="project-info" @click="goToDetail(project.id)">
          <h3>{{ project.name }}</h3>
          <p class="project-url">{{ project.inviteUrl }}</p>
          <p class="project-time">创建时间: {{ formatTime(project.createdAt) }}</p>
        </div>
        <div class="project-actions">
          <el-button type="primary" text @click="goToDetail(project.id)">
            管理渠道
          </el-button>
          <el-button type="danger" text @click="handleDelete(project)">
            删除
          </el-button>
        </div>
      </div>
    </el-card>

    <el-empty v-if="projects.length === 0" description="暂无项目，点击上方按钮创建" />

    <el-dialog
      v-model="dialogVisible"
      title="新建项目"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="邀请地址" prop="inviteUrl">
          <el-input 
            v-model="form.inviteUrl" 
            placeholder="请输入邀请地址，如 https://example.com/invite"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '../utils/request.js';

const router = useRouter();
const projects = ref([]);
const dialogVisible = ref(false);
const submitting = ref(false);
const formRef = ref();

const form = ref({
  name: '',
  inviteUrl: '',
});

const rules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  inviteUrl: [{ required: true, message: '请输入邀请地址', trigger: 'blur' }],
};

const fetchProjects = async () => {
  try {
    const res = await request.get('/api/projects');
    projects.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const showCreateDialog = () => {
  form.value = { name: '', inviteUrl: '' };
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    await request.post('/api/projects', form.value);
    ElMessage.success('创建成功');
    dialogVisible.value = false;
    fetchProjects();
  } catch (error) {
    console.error(error);
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (project) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除项目 "${project.name}" 吗？相关的渠道数据也将被删除。`,
      '确认删除',
      { type: 'warning' }
    );
    await request.delete(`/api/projects/${project.id}`);
    ElMessage.success('删除成功');
    fetchProjects();
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error);
    }
  }
};

const goToDetail = (id) => {
  router.push(`/timor/project/${id}`);
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

onMounted(fetchProjects);
</script>

<style scoped>
.project-list {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.project-card {
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.project-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-info {
  flex: 1;
}

.project-info h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
}

.project-url {
  color: #409eff;
  font-size: 14px;
  margin: 0 0 8px 0;
  word-break: break-all;
}

.project-time {
  color: #909399;
  font-size: 12px;
  margin: 0;
}

.project-actions {
  display: flex;
  gap: 8px;
}
</style>
