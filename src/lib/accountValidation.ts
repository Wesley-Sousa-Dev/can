// Regras de validação das contas. Cada função devolve a mensagem de erro
// ou null quando o valor está certo. A mensagem diz o que corrigir, e não
// só que há um erro (WCAG 3.3.3).

const NICKNAME_PATTERN = /^[A-Za-z0-9_-]{3,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MINIMUM_AGE = 13;
const MINIMUM_PASSWORD_LENGTH = 8;
const MINIMUM_ADDRESS_LENGTH = 10;
const OLDEST_ACCEPTED_YEAR = 1900;

export function validateFullName(fullName: string): string | null {
  const trimmedName = fullName.trim();
  if (!trimmedName) {
    return "Informe seu nome completo.";
  }
  if (trimmedName.split(/\s+/).length < 2) {
    return "Informe nome e sobrenome, separados por espaço.";
  }
  return null;
}

export function validateNickname(nickname: string): string | null {
  if (!nickname.trim()) {
    return "Escolha um apelido.";
  }
  if (!NICKNAME_PATTERN.test(nickname.trim())) {
    return "Use de 3 a 20 caracteres: letras sem acento, números, _ ou -.";
  }
  return null;
}

function calculateAge(birthYear: number, birthMonth: number, birthDay: number, today: Date): number {
  const hasHadBirthdayThisYear =
    today.getMonth() + 1 > birthMonth ||
    (today.getMonth() + 1 === birthMonth && today.getDate() >= birthDay);
  return today.getFullYear() - birthYear - (hasHadBirthdayThisYear ? 0 : 1);
}

export function validateBirthDate(birthDate: string, today = new Date()): string | null {
  // O campo de data devolve vazio também quando falta dia, mês ou ano.
  const dateParts = ISO_DATE_PATTERN.exec(birthDate);
  if (!dateParts) {
    return "Informe sua data de nascimento completa: dia, mês e ano.";
  }
  const [, year, month, day] = dateParts.map(Number);
  if (year < OLDEST_ACCEPTED_YEAR) {
    return "Confira o ano de nascimento.";
  }
  const age = calculateAge(year, month, day, today);
  if (age < 0) {
    return "A data de nascimento não pode estar no futuro.";
  }
  if (age < MINIMUM_AGE) {
    return `Você precisa ter pelo menos ${MINIMUM_AGE} anos para criar uma conta.`;
  }
  return null;
}

export function validateAddress(address: string): string | null {
  const trimmedAddress = address.trim();
  if (!trimmedAddress) {
    return "Informe seu endereço.";
  }
  if (trimmedAddress.length < MINIMUM_ADDRESS_LENGTH) {
    return "Informe rua, número e cidade.";
  }
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return "Informe seu e-mail.";
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    return "Informe um e-mail válido, como nome@exemplo.com.";
  }
  return null;
}

export function validateNewPassword(password: string): string | null {
  if (!password) {
    return "Crie uma senha.";
  }
  if (password.length < MINIMUM_PASSWORD_LENGTH) {
    return `A senha precisa ter pelo menos ${MINIMUM_PASSWORD_LENGTH} caracteres.`;
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Use letras e números na senha.";
  }
  return null;
}

export function validateLoginIdentifier(identifier: string): string | null {
  return identifier.trim() ? null : "Informe seu apelido ou e-mail.";
}

export function validateLoginPassword(password: string): string | null {
  return password ? null : "Informe sua senha.";
}

export const NICKNAME_TAKEN_MESSAGE = "Este apelido já está em uso. Escolha outro.";
export const EMAIL_TAKEN_MESSAGE = "Já existe uma conta com este e-mail. Entre com ele ou use outro.";
