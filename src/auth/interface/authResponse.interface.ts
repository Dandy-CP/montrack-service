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
  message: string;
}

export interface JWTPayloadUser {
  sub: string;
  user_id: string;
  name: string;
  email: string;
  iat: number;
  exp: number;
}
