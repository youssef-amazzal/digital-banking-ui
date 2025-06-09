export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN' | 'MANAGER';
}

export interface JwtResponse {
  token: string;
  refreshToken?: string;
  type: string;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface MessageResponse {
  message: string;
}

export interface User {
  id?: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  enabled?: boolean;
  accountNonExpired?: boolean;
  accountNonLocked?: boolean;
  credentialsNonExpired?: boolean;
  createdAt?: Date;
  lastLogin?: Date;
}
