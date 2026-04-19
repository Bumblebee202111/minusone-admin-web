import type { PageResponseDto } from '@/types/api'
import type {
  AccountCreateRequest,
  AccountDto,
  AccountUpdateRequest,
  UserCreateResponseDto,
} from '@/types/account'
import http from '@/api/core/http.ts'

export const getAccounts = (params: {
  page: number
  size: number
}): Promise<PageResponseDto<AccountDto>> => {
  return http.get<PageResponseDto<AccountDto>>('/accounts', { params })
}

export const getAccountById = (id: number): Promise<AccountDto> => {
  return http.get<AccountDto>(`/accounts/${id}`)
}

export const createAccount = (data: AccountCreateRequest): Promise<UserCreateResponseDto> => {
  return http.post<UserCreateResponseDto>('/accounts', data)
}

export const updateAccount = (id: number, data: AccountUpdateRequest): Promise<AccountDto> => {
  return http.put<AccountDto>(`/accounts/${id}`, data)
}

export const deleteAccount = (id: number): Promise<void> => {
  return http.delete<void>(`/accounts/${id}`)
}
