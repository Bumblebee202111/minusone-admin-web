export interface AccountDto {
  id: number
  userName: string
  phone: string
}

export interface ProfileDto {
  userId: number
  nickname: string
  avatarUrl: string
  backgroundUrl: string | null
}

export interface UserCreateResponseDto {
  account: AccountDto
  profile: ProfileDto
}

export interface AccountCreateRequest {
  phone: string
  nickname: string
  password: string
}

export interface AccountUpdateRequest {
  password: string
}
