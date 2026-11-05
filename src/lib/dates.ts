// O fuso UTC é fixo de propósito: a data "2027-02-18" vira meia-noite em UTC,
// e formatá-la no fuso do Brasil mostraria o dia anterior. Também evita que o
// servidor e o navegador gerem textos diferentes.
const longDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "2027-02-18" vira "18 de fevereiro de 2027". */
export function formatLongDate(isoDate: string): string {
  return longDateFormatter.format(new Date(isoDate));
}

export function formatReleaseDate(isoDate: string): string {
  return formatLongDate(isoDate);
}

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "2027-02-18" vira "18 de fev. de 2027". */
export function formatShortDate(isoDate: string): string {
  return shortDateFormatter.format(new Date(isoDate));
}

// Um momento com horário usa o fuso de quem está vendo: um jogo adicionado às
// 22h em Brasília já é o dia seguinte em UTC. Por isso esta função só deve
// rodar no navegador.
const localShortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** "2026-11-04T15:30:00.000Z" vira "4 de nov. de 2026", no fuso do navegador. */
export function formatShortLocalDate(isoDateTime: string): string {
  return localShortDateFormatter.format(new Date(isoDateTime));
}

const relativeDayFormatter = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
const DAYS_SHOWN_AS_RELATIVE = 7;
const MILLISECONDS_PER_DAY = 86_400_000;

// Compara dias do calendário, e não blocos de 24 horas: algo de ontem às 23h
// continua sendo "ontem" hoje à 1h da manhã.
function getStartOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** "hoje", "ontem" ou "há 3 dias" na última semana; antes disso, "4 de nov. de 2026". Só no navegador. */
export function formatRelativeLocalDate(isoDateTime: string, now: Date = new Date()): string {
  const daysAgo = Math.round(
    (getStartOfLocalDay(now) - getStartOfLocalDay(new Date(isoDateTime))) / MILLISECONDS_PER_DAY,
  );
  if (daysAgo >= 0 && daysAgo < DAYS_SHOWN_AS_RELATIVE) {
    return relativeDayFormatter.format(-daysAgo, "day");
  }
  return formatShortLocalDate(isoDateTime);
}
