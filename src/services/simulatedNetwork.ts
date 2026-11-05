// Espera artificial para a interface mostrar o estado "carregando", como
// aconteceria em uma requisição real. Deixa de existir quando a API chegar.
export const SIMULATED_NETWORK_DELAY_MS = 600;

export function waitForSimulatedNetwork(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_NETWORK_DELAY_MS));
}
