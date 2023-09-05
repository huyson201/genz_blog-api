/* eslint-disable prettier/prettier */
export enum Role {
  Admin,
  User,
}

export interface GoogleOAuth {
  googleId: string;
}

export interface RememberToken {
  tokenId: string;
  token: string;
}
