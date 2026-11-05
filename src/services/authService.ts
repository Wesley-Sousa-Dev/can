import {
  readAccounts,
  saveAccounts,
  saveSessionAccountId,
  sessionStore,
  toUserProfile,
  type StoredAccount,
} from "@/data/accountStorage";
import { hashPassword } from "@/lib/password";
import {
  cartCollection,
  libraryCollection,
  wishlistCollection,
} from "@/services/userCollections";
import type { ProfileChanges, RegistrationData, UserProfile } from "@/types/user";

// Camada de negócio das contas. Cada função corresponde a um endpoint da API:
//   registerAccount → POST /users        signIn        → POST /sessions
//   updateProfile   → PATCH /users/:id   signOut       → DELETE /sessions
//   deleteAccount   → DELETE /users/:id
// Hoje os dados ficam no navegador. Com a API, só o corpo destas funções muda.

export type AccountErrorCode =
  | "nickname-taken"
  | "email-taken"
  | "invalid-credentials"
  | "account-not-found";

export type AccountResult =
  | { isSuccess: true; user: UserProfile }
  | { isSuccess: false; errorCode: AccountErrorCode };

// Espera artificial para a interface mostrar o estado "carregando",
// como aconteceria em uma requisição real.
const SIMULATED_NETWORK_DELAY_MS = 600;

function waitForSimulatedNetwork(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_NETWORK_DELAY_MS));
}

function isSameText(firstText: string, secondText: string): boolean {
  return firstText.trim().toLocaleLowerCase("pt-BR") === secondText.trim().toLocaleLowerCase("pt-BR");
}

function findConflict(
  accounts: StoredAccount[],
  nickname: string,
  email: string,
  ignoredAccountId?: string,
): AccountErrorCode | null {
  const otherAccounts = accounts.filter((account) => account.id !== ignoredAccountId);
  if (otherAccounts.some((account) => isSameText(account.nickname, nickname))) {
    return "nickname-taken";
  }
  if (otherAccounts.some((account) => isSameText(account.email, email))) {
    return "email-taken";
  }
  return null;
}

export async function registerAccount(registration: RegistrationData): Promise<AccountResult> {
  await waitForSimulatedNetwork();
  const accounts = readAccounts();
  const conflict = findConflict(accounts, registration.nickname, registration.email);
  if (conflict) {
    return { isSuccess: false, errorCode: conflict };
  }

  const newAccount: StoredAccount = {
    id: crypto.randomUUID(),
    fullName: registration.fullName.trim(),
    nickname: registration.nickname.trim(),
    birthDate: registration.birthDate,
    address: registration.address.trim(),
    email: registration.email.trim().toLocaleLowerCase("pt-BR"),
    createdAt: new Date().toISOString(),
    passwordHash: await hashPassword(registration.password),
  };
  saveAccounts([...accounts, newAccount]);
  // Quem acabou de criar a conta já entra direto, sem precisar fazer login.
  saveSessionAccountId(newAccount.id);
  return { isSuccess: true, user: toUserProfile(newAccount) };
}

// Aceita apelido ou e-mail. Em caso de erro, não revela qual dos dois estava
// errado, para não confirmar a terceiros quais contas existem.
export async function signIn(identifier: string, password: string): Promise<AccountResult> {
  await waitForSimulatedNetwork();
  const passwordHash = await hashPassword(password);
  const account = readAccounts().find(
    (candidate) =>
      (isSameText(candidate.nickname, identifier) || isSameText(candidate.email, identifier)) &&
      candidate.passwordHash === passwordHash,
  );
  if (!account) {
    return { isSuccess: false, errorCode: "invalid-credentials" };
  }
  saveSessionAccountId(account.id);
  return { isSuccess: true, user: toUserProfile(account) };
}

export function signOut() {
  saveSessionAccountId(null);
}

export async function updateProfile(userId: string, changes: ProfileChanges): Promise<AccountResult> {
  await waitForSimulatedNetwork();
  const accounts = readAccounts();
  const account = accounts.find((candidate) => candidate.id === userId);
  if (!account) {
    return { isSuccess: false, errorCode: "account-not-found" };
  }
  const conflict = findConflict(accounts, changes.nickname, changes.email, userId);
  if (conflict) {
    return { isSuccess: false, errorCode: conflict };
  }

  const updatedAccount: StoredAccount = {
    ...account,
    fullName: changes.fullName.trim(),
    nickname: changes.nickname.trim(),
    address: changes.address.trim(),
    email: changes.email.trim().toLocaleLowerCase("pt-BR"),
  };
  saveAccounts(accounts.map((candidate) => (candidate.id === userId ? updatedAccount : candidate)));
  return { isSuccess: true, user: toUserProfile(updatedAccount) };
}

export async function deleteAccount(userId: string): Promise<void> {
  await waitForSimulatedNetwork();
  saveAccounts(readAccounts().filter((account) => account.id !== userId));
  saveSessionAccountId(null);
  // No mock, carrinho, desejos e biblioteca pertencem ao navegador, e não à conta.
  // Na API, eles serão apagados junto com o usuário no próprio DELETE.
  cartCollection.clear();
  wishlistCollection.clear();
  libraryCollection.clear();
}

export { sessionStore };
