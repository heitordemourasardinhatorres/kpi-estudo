const umaCasa = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const inteiro = new Intl.NumberFormat('pt-BR')

/** Recebe fração (0–1) e devolve percentual legível. */
export function pct(valor: number | null | undefined, casas = 1): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '—'
  const n = valor * 100
  return casas === 0 ? `${Math.round(n)}%` : `${umaCasa.format(n)}%`
}

export function pontosPercentuais(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '—'
  const n = valor * 100
  return `${n > 0 ? '+' : ''}${umaCasa.format(n)} pp`
}

export function num(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '—'
  return inteiro.format(valor)
}
