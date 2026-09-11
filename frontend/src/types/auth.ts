export type SessionUser = {
  id: number;
  name: string;
  email: string;
  status: "active" | "suspended" | "inactive";
  roles: string[];
  permissions: string[];
};

export type LoginResult =
  | { ok: true }
  | { ok: false; message: string };
