<script setup lang="ts">
import { ArrowDown, Menu, User } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth.ts'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const handleCommand = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm('Are you sure you want to log out?', 'Warning', {
      confirmButtonText: 'Logout',
      cancelButtonText: 'Cancel',
      type: 'warning',
    })
      .then(() => {
        authStore.clearToken()
        ElMessage.success('Logged out successfully')
        router.push('/login')
      })
      .catch(() => {
        // Cancelled
      })
  }
}
</script>

<template>
  <el-container class="h-screen w-screen bg-gray-50">
    <el-aside width="250px" class="bg-gray-900 text-white shadow-lg">
      <div class="h-16 flex items-center justify-center border-b border-gray-800">
        <span class="text-xl font-bold tracking-wider">MinusOne</span>
      </div>
      <el-menu
        :default-active="route.path"
        router
        active-text-color="#409eff"
        background-color="#111827"
        text-color="#fff"
        class="border-r-0"
      >
        <el-menu-item index="/">
          <el-icon><Menu /></el-icon>
          <span>Dashboard</span>
        </el-menu-item>

        <el-menu-item index="/accounts">
          <el-icon><User /></el-icon>
          <span>Accounts</span>
        </el-menu-item>

        <!-- Future routes: Songs, Resources -->
      </el-menu>
    </el-aside>

    <el-container>
      <el-header
        class="bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm"
      >
        <div class="text-gray-600 font-medium">Admin Dashboard</div>

        <el-dropdown @command="handleCommand">
          <span
            class="flex items-center cursor-pointer text-gray-700 hover:text-primary transition-colors"
          >
            Administrator
            <el-icon class="ml-2"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout" divided> Logout</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <el-main class="p-6">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped></style>
