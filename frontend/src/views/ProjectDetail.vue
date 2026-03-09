<template>
  <div class="project-detail">
    <div class="page-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>返回
        </el-button>
        <h2>{{ project?.name }}</h2>
      </div>
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>新增渠道
      </el-button>
    </div>

    <el-card class="info-card">
      <template #header>
        <span>项目信息</span>
      </template>
      <div class="project-info">
        <p><strong>邀请地址:</strong> {{ project?.inviteUrl }}</p>
        <p><strong>创建时间:</strong> {{ formatTime(project?.createdAt) }}</p>
      </div>
    </el-card>

    <h3 class="section-title">渠道列表</h3>

    <el-card class="channel-card" v-for="channel in channels" :key="channel.id">
      <div class="channel-item">
        <div class="channel-info">
          <div class="channel-header">
            <h4>{{ channel.name }}</h4>
            <el-tag type="success">邀请: {{ channel.inviteCount }}</el-tag>
          </div>
          <div class="channel-params">
            <p v-if="channel.paramKey">
              <strong>动态参数:</strong> {{ channel.paramKey }}={{ channel.paramValue || channel.code }}
            </p>
            <p class="invite-link">
              <strong>邀请链接:</strong>
              <el-link type="primary" :href="getInviteLink(channel.code)" target="_blank">
                {{ getInviteLink(channel.code) }}
              </el-link>
              <el-button 
                type="primary" 
                link 
                size="small" 
                @click="copyLink(channel.code)"
              >
                <el-icon><CopyDocument /></el-icon>复制
              </el-button>
            </p>
          </div>
        </div>
        <div class="channel-actions">
          <el-button type="primary" text @click="handleEdit(channel)">
            编辑
          </el-button>
          <el-button type="danger" text @click="handleDelete(channel)">
            删除
          </el-button>
        </div>
      </div>
    </el-card>

    <el-empty v-if="channels.length === 0" description="暂无渠道，点击上方按钮创建" />

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑渠道' : '新增渠道'"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="渠道名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入渠道名称，如：微信、QQ、短信" />
        </el-form-item>
        <el-form-item label="参数名" prop="paramKey">
          <el-input 
            v-model="form.paramKey" 
            placeholder="可选，如：source、channel、ref"
          />
        </el-form-item>
        <el-form-item label="参数值" prop="paramValue">
          <el-input 
            v-model="form.paramValue" 
            placeholder="可选，留空则使用渠道码作为值"
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
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '../utils/request.js';

const route = useRoute();
const router = useRouter();
const projectId = route.params.id;

const project = ref(null);
const channels = ref([]);
const dialogVisible = ref(false);
const submitting = ref(false);
const isEdit = ref(false);
const formRef = ref();
const currentChannelId = ref(null);

const form = ref({
  name: '',
  paramKey: '',
  paramValue: '',
});

const rules = {
  name: [{ required: true, message: '请输入渠道名称', trigger: 'blur' }],
};

const fetchProject = async () => {
  try {
    const res = await request.get(`/api/projects/${projectId}`);
    project.value = res.data;
  } catch (error) {
    console.error(error);
    router.push('/');
  }
};

const fetchChannels = async () => {
  try {
    const res = await request.get(`/api/channels/project/${projectId}`);
    channels.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const showCreateDialog = () => {
  isEdit.value = false;
  currentChannelId.value = null;
  form.value = { name: '', paramKey: '', paramValue: '' };
  dialogVisible.value = true;
};

const handleEdit = (channel) => {
  isEdit.value = true;
  currentChannelId.value = channel.id;
  form.value = {
    name: channel.name,
    paramKey: channel.paramKey,
    paramValue: channel.paramValue,
  };
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    if (isEdit.value) {
      await request.put(`/api/channels/${currentChannelId.value}`, form.value);
      ElMessage.success('更新成功');
    } else {
      await request.post('/api/channels', { ...form.value, projectId });
      ElMessage.success('创建成功');
    }
    dialogVisible.value = false;
    fetchChannels();
  } catch (error) {
    console.error(error);
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (channel) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除渠道 "${channel.name}" 吗？`,
      '确认删除',
      { type: 'warning' }
    );
    await request.delete(`/api/channels/${channel.id}`);
    ElMessage.success('删除成功');
    fetchChannels();
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error);
    }
  }
};

const getInviteLink = (code) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/i/${code}`;
};

const copyLink = (code) => {
  const link = getInviteLink(code);
  navigator.clipboard.writeText(link).then(() => {
    ElMessage.success('链接已复制到剪贴板');
  }).catch(() => {
    ElMessage.error('复制失败');
  });
};

const goBack = () => {
  router.push('/timor');
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString();
};

onMounted(() => {
  fetchProject();
  fetchChannels();
});
</script>

<style scoped>
.project-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.info-card {
  margin-bottom: 24px;
}

.project-info p {
  margin: 8px 0;
  color: #606266;
}

.section-title {
  margin: 24px 0 16px 0;
  color: #303133;
  font-size: 18px;
}

.channel-card {
  margin-bottom: 16px;
}

.channel-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.channel-info {
  flex: 1;
}

.channel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.channel-header h4 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.channel-params p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
}

.invite-link {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.channel-actions {
  display: flex;
  gap: 8px;
}
</style>
