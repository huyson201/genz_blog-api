/* eslint-disable prettier/prettier */
export enum Role {
  Admin,
  User,
}

export enum PostDisplay {
  JUST_ME = 'draft',
  PUBLIC = 'public',
}

export interface GoogleOAuth {
  googleId: string;
}

export interface RememberToken {
  tokenId: string;
  token: string;
}
