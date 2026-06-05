export type UserRole = "guardian" | "therapist" | "admin" | "child";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
}
