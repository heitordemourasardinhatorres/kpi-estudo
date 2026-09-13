import type { PontoEvolucao } from '@/lib/metrics'

export interface SerieLinha {
  nome: string
  cor: string
  pontos: PontoEvolucao[]
}
