export type UserRole = "admin" | "manager" | "customer";

export type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt?: string;
};
