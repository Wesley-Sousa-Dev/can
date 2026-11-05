/** Iniciais do primeiro e do último nome, para o avatar: "Maria da Silva" vira "MS". */
export function getInitials(fullName: string): string {
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
  if (nameParts.length === 0) {
    return "?";
  }
  const firstInitial = nameParts[0][0];
  const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : "";
  return `${firstInitial}${lastInitial}`.toLocaleUpperCase("pt-BR");
}

const memberSinceFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatMemberSince(isoDateTime: string): string {
  return memberSinceFormatter.format(new Date(isoDateTime));
}
