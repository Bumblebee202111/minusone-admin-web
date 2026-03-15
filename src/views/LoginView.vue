<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.ts'
import  { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { LoginRequest } from '@/types/auth'
import { login } from '@/api/auth.ts'
import { Lock, User } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive<LoginRequest>({
  username: '',
  password: '',
})

const rules = reactive<FormRules<LoginRequest>>({
  username: [{required:true,message:'Please enter your username', trigger:'blur'}],
  password: [{required:true,message:'Please enter your password', trigger:'blur'}]
})

const handleLogin = async () => {
  if(!loginFormRef.value)return
  await  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        const res = await login(loginForm)

        authStore.setToken(res.token)

        ElMessage.success('Login successful')

        const redirect = route.query.redirect ? route.query.redirect as string : '/'
        await router.push(redirect)

      }catch(error) {
        console.error('Login failed', error)
      }finally {
        loading.value = false
      }
    }
  })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <el-card class="w-full max-w-md shadow-xl border-0 rounded-xl overflow-hidden">
      <div class="text-center mb-8 mt-4">
        <h1 class="text-3xl font-bold text-gray-800 tracking-tight">MinusOne</h1>
        <p class="text-sm text-gray-500 mt-2">Admin Control Panel</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        size="large"
        @keyup.enter="handleLogin"
        >
        <el-form-item prop="username">
          <el-input
          v-model="loginForm.username"
          placeholder="Username"
          :prefix-icon="User"
          clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
          v-model="loginForm.password"
          placeholder="Password"
          :prefix-icon="Lock"
          show-password
          />
        </el-form-item>

        <el-form-item class="mt-8">
          <el-button
            type="primary"
            class="w-full"
            :loading="loading"
          @click="handleLogin">
            {{loading?'Signing in...':'Sign In'}}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
