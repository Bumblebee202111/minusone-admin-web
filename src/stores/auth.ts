import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const token=ref<string|null>(localStorage.getItem('minusone_admin_token'))

  function setToken(newToken:string) {
    token.value=newToken
    localStorage.setItem('minusone_admin_token', newToken)
  }
  function clearToken() {
    token.value=null
    localStorage.removeItem('minusone_admin_token')
  }

  return { token, setToken, clearToken }
})
