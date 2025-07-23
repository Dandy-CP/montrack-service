export interface SignInResponse {
  name: string;
  email: string;
  is2FA: boolean;
  access_token: string;
  refresh_token: string;
}

export interface SingUpResponse {
  name: string;
  email: string;
}

export interface JWTPayloadUser {
  sub: string;
  user_id: string;
  name: string;
  email: string;
  iat: number;
  exp: number;
}

export interface UserInCache {
  user_id: string;
  name: string;
  email: string;
  access_token: string;
  refresh_token: string;
}
