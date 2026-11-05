// Só aceita caminhos internos, como "/checkout". Um valor como "//site.com" ou
// "https://site.com" levaria a pessoa para fora da Can logo depois do login,
// um golpe conhecido como "open redirect".
export function getSafeRedirectPath(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const isInternalPath = value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\");
  return isInternalPath ? value : undefined;
}

/** withRedirect("/login", "/checkout") vira "/login?redirectTo=%2Fcheckout". */
export function withRedirect(path: string, redirectTo: string | undefined): string {
  return redirectTo ? `${path}?redirectTo=${encodeURIComponent(redirectTo)}` : path;
}
