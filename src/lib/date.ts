import type { ISODate } from '@/types'

const curto = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' })
const completo = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const mesAno = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' })

/** Datas ISO são tratadas como locais: `new Date('2026-01-05')` seria UTC e voltaria um dia. */
export function paraData(iso: ISODate): Date {
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(ano ?? 1970, (mes ?? 1) - 1, dia ?? 1)
}

export function hojeISO(): ISODate {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export function formatarCurto(iso: ISODate): string {
  return curto.format(paraData(iso))
}

export function formatarCompleto(iso: ISODate): string {
  return completo.format(paraData(iso))
}

export function formatarMesAno(iso: ISODate): string {
  return mesAno.format(paraData(iso)).replace('.', '')
}

export function chaveMes(iso: ISODate): string {
  return iso.slice(0, 7)
}

export function diasDesde(iso: string | null): number | null {
  if (!iso) return null
  const ms = Date.now() - new Date(iso).getTime()
  return Math.floor(ms / 86_400_000)
}

export function ordenarPorData<T extends { data: ISODate }>(itens: T[]): T[] {
  return [...itens].sort((a, b) => a.data.localeCompare(b.data))
}

export function formatarDuracao(min: number | undefined): string {
  if (!min) return '—'
  const h = Math.floor(min / 60)
  const m = min % 60
  return h ? `${h}h${m ? String(m).padStart(2, '0') : ''}` : `${m}min`
}
