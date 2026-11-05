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
