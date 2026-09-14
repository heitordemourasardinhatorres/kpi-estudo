export function prefereMovimentoReduzido(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
