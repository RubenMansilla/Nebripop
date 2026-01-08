export type UserType = {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
  profilePicture: string;
  birthDate?: string | null;
  gender?: string | null;
  walletBalance?: number;
};
