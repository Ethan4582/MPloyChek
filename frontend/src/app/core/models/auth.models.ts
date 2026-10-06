export type UserRole = 'General User' | 'Admin';
export type UserStatus = 'Active' | 'Disabled';

export interface IUser {
  _id: string;
  userId: string;
  name: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  userId: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  data: {
    token: string;
    expiresIn: string;
    user: IUser;
  };
}

export interface MeResponse {
  success: boolean;
  data: IUser;
}
