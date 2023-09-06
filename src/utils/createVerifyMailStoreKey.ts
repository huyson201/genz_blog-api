export const createVerifyMailStoreKey = (userId: string) => {
  return `verify-email::${userId}`;
};
