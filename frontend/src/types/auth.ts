export type AuthRole = "dosen" | "mahasiswa";

export type SeedUser = {
  identifier: string;
  role: AuthRole;
  name: string;
  salt?: string;
  password_hash: string;
  iterations?: number;
};

export type AuthSession = {
  identifier: string;
  role: AuthRole;
  name: string;
  login_at: string;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};
