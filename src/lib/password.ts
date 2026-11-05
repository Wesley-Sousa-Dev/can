// Guarda só o hash da senha, nunca o texto digitado.
// Na API de verdade, o hash é feito no servidor, com um algoritmo lento
// como bcrypt ou Argon2. Aqui o SHA-256 só evita senha em texto puro no navegador.
export async function hashPassword(password: string): Promise<string> {
  const passwordBytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", passwordBytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
