interface AuthData {
  _id: string;
  email: string;
  tokenId: string;
  role: Role;
}

interface SendVerifyEmailData {
  to: { email: string }[];
  verify_url: string;
  name: string;
}
