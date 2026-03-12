export type UserType = 'user' | 'agent';

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  userType: UserType;
  file: File | null;
}
export interface ProfileData {
  id: string;
  fullName: string;
  isAgent: boolean;
  phone: string;
  image_url: string;
}

/** Shape used when inserting a new profile row */
export interface ProfileInsert {
  id: string;
  fullName: string;
  phone: string;
  isAgent: boolean;
  image_url: string;
}

/** Shape used when updating a profile */
export interface ProfileUpdate {
  fullName?: string;
  phone?: string;
  image_url?: string;
}
export interface LoginForm {
  email: string;
  password: string;
}
export interface Session {
  access_token: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  user: User;
  weak_password: null | unknown; // Typically null, could be any other type if present
}

export interface User {
  id: string;
  aud: string;
  role?: string;
  email?: string;
  email_confirmed_at?: string | null;
  phone?: string;
  confirmation_sent_at?: string | null;
  confirmed_at?: string | null;
  created_at: string;
  last_sign_in_at?: string | null;
  recovery_sent_at?: string | null;
  updated_at?: string;
  is_anonymous?: boolean;
  identities?: Identity[];
  app_metadata: AppMetadata;
  user_metadata: UserMetadata;
}

export interface AppMetadata {
  provider?: string;
  providers?: string[];
  [key: string]: any;
}

export interface UserMetadata {
  email?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  sub?: string;
  [key: string]: any;
}

export interface Identity {
  id: string; // Identity UUID
  user_id: string; // User UUID
  identity_data?: Record<string, any>; // Custom claims from provider
  provider: string; // e.g., 'email', 'google', etc.
  created_at?: string;
  last_sign_in_at?: string;
  updated_at?: string;
}
export interface FullUserData {
  auth: User; // بيانات المصادقة
  profile: ProfileData; // بيانات الملف الشخصي
}
