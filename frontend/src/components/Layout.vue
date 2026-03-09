<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="logo">
        <el-icon size="24"><Link /></el-icon>
        <span>项目邀请管理系统</span>
      </div>
    </el-header>
    <el-main class="main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
}

.main {
  padding: 24px;
  background-color: #f5f7fa;
}
</style>
