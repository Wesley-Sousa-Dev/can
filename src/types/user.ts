/** Dados públicos da conta: nunca incluem a senha. */
export interface UserProfile {
  id: string;
  fullName: string;
  nickname: string;
  /** Data no formato ISO (AAAA-MM-DD). */
  birthDate: string;
  address: string;
  email: string;
  /** Data e hora de criação da conta, em ISO. */
  createdAt: string;
}

/** Corpo do cadastro (equivale a POST /users). */
export interface RegistrationData {
  fullName: string;
  nickname: string;
  birthDate: string;
  address: string;
  email: string;
  password: string;
}

/** Campos que o perfil permite editar (equivale a PATCH /users/:id). */
export type ProfileChanges = Pick<UserProfile, "fullName" | "nickname" | "address" | "email">;

export type SessionState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; user: UserProfile };
