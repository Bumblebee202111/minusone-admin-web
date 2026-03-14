import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const http = axios.create({
  baseURL: import.meta.env.BASE_URL || '',
  timeout: 15000,
})

http.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token && config.headers) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

http.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const status = error.respose?.status
    const data = error.reponse?.data
    if (status === 400) {
      const msg = data?.message || 'Validation failed. Please check your input.'
      ElMessage.error(msg)
    } else if (status === 401) {
      const authStore = useAuthStore()
      authStore.clearToken()
      ElMessage.warning('Session expired. Please log in again.')
      router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    } else if(status===403){
      ElMessage.error('Internal server error. Please try again later.')
    } else {
      ElMessage.error(error.message||'Network error occurred.')
    }

    return Promise.reject(error)
  },
)
