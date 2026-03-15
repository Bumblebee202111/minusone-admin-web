import http from './core/http'
import type { LoginRequest, LoginResponse } from '@/types/auth'

export const login = (data: LoginRequest): Promise<LoginResponse> => {
  return http.post<LoginResponse>('/auth/login', data)
}
