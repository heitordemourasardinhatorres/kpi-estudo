import { chaveMes, ordenarPorData, paraData } from '@/lib/date'
import type {
  Area,
  CategoriaErro,
  ID,
  ISODate,
  Lista,
  Materia,
  RegistroErro,
  ResultadoArea,
  Simulado,
} from '@/types'

/** Tudo que é plotado passa por aqui: acertos e nota de redação viram a mesma fração 0–1. */
export function percentual(r: ResultadoArea): number {
  if (r.tipo === 'acertos') return r.total > 0 ? r.acertos / r.total : 0
  return r.notaMaxima > 0 ? r.nota / r.notaMaxima : 0
}

/** Peso da área no total do simulado: nº de questões, ou a escala da nota. */
function peso(r: ResultadoArea): number {
  return r.tipo === 'acertos' ? r.total : r.notaMaxima
}

export function percentualSimulado(s: Simulado): number | null {
  const somaPesos = s.resultados.reduce((acc, r) => acc + peso(r), 0)
  if (somaPesos <= 0) return null
  return s.resultados.reduce((acc, r) => acc + percentual(r) * peso(r), 0) / somaPesos
}

export function percentualArea(s: Simulado, areaId: ID): number | null {
  const r = s.resultados.find((x) => x.areaId === areaId)
  return r ? percentual(r) : null
}

export function questoesSimulado(s: Simulado): number {
  return s.resultados.reduce((acc, r) => acc + (r.tipo === 'acertos' ? r.total : 0), 0)
}

export function acertosSimulado(s: Simulado): number {
  return s.resultados.reduce((acc, r) => acc + (r.tipo === 'acertos' ? r.acertos : 0), 0)
}

export function percentualLista(l: Lista): number | null {
  return l.totalQuestoes > 0 ? l.acertos / l.totalQuestoes : null
}

export function totalErros(erros: RegistroErro[]): number {
  return erros.reduce((acc, e) => acc + e.quantidade, 0)
}

// ---------------------------------------------------------------- evolução

export interface PontoEvolucao {
  id: ID
  data: ISODate
  valor: number
  rotulo: string
}

export function evolucaoSimulados(
  simulados: Simulado[],
  rotulo: (s: Simulado) => string,
  areaId?: ID,
): PontoEvolucao[] {
  return ordenarPorData(simulados)
    .map((s) => {
      const valor = areaId ? percentualArea(s, areaId) : percentualSimulado(s)
      return valor === null ? null : { id: s.id, data: s.data, valor, rotulo: rotulo(s) }
    })
    .filter((p): p is PontoEvolucao => p !== null)
}

export function evolucaoListas(listas: Lista[]): PontoEvolucao[] {
  return ordenarPorData(listas)
    .map((l) => {
      const valor = percentualLista(l)
      return valor === null ? null : { id: l.id, data: l.data, valor, rotulo: l.titulo }
    })
    .filter((p): p is PontoEvolucao => p !== null)
}

// ---------------------------------------------------------------- por área

export interface DesempenhoArea {
  area: Area
  media: number | null
  ultimo: number | null
}

export function desempenhoPorArea(simulados: Simulado[], areas: Area[]): DesempenhoArea[] {
  const ordenados = ordenarPorData(simulados)
  return areas.map((area) => {
    const valores = ordenados
      .map((s) => percentualArea(s, area.id))
      .filter((v): v is number => v !== null)
    const media = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : null
    return { area, media, ultimo: valores.at(-1) ?? null }
  })
}

// ---------------------------------------------------------------- erros

export interface SerieEmpilhada {
  eixo: string[]
  series: { categoria: CategoriaErro; valores: number[] }[]
}

interface RegistroComErros {
  data: ISODate
  erros: RegistroErro[]
}

/** Barra empilhada por mês: junta simulados e listas para responder "erro de quê, e quando". */
export function errosPorMes(
  registros: RegistroComErros[],
  categorias: CategoriaErro[],
  maxMeses = 8,
): SerieEmpilhada {
  const meses = [...new Set(registros.map((r) => chaveMes(r.data)))].sort().slice(-maxMeses)
  const indice = new Map(meses.map((m, i) => [m, i]))

  const series = categorias.map((categoria) => ({
    categoria,
    valores: Array<number>(meses.length).fill(0),
  }))
  const porCategoria = new Map(series.map((s) => [s.categoria.id, s]))

  for (const registro of registros) {
    const i = indice.get(chaveMes(registro.data))
    if (i === undefined) continue
    for (const erro of registro.erros) {
      const serie = porCategoria.get(erro.categoriaId)
      if (serie) serie.valores[i] += erro.quantidade
    }
  }

  return {
    eixo: meses.map((m) => rotuloMes(m)),
    series: series.filter((s) => s.valores.some((v) => v > 0)),
  }
}

function rotuloMes(chave: string): string {
  const [ano, mes] = chave.split('-')
  const data = paraData(`${ano}-${mes}-01`)
  return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(data).replace('.', '')
}

export function errosPorCategoria(
  registros: RegistroComErros[],
  categorias: CategoriaErro[],
): { categoria: CategoriaErro; total: number }[] {
  const totais = new Map<ID, number>()
  for (const registro of registros) {
    for (const erro of registro.erros) {
      totais.set(erro.categoriaId, (totais.get(erro.categoriaId) ?? 0) + erro.quantidade)
    }
  }
  return categorias
    .map((categoria) => ({ categoria, total: totais.get(categoria.id) ?? 0 }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total)
}

// ---------------------------------------------------------------- pontos fracos

export interface PontoFraco {
  materia: Materia
  erros: number
  questoes: number
  acertos: number
  percAcerto: number | null
}

export interface RankPontosFracos {
  itens: PontoFraco[]
  errosSemMateria: number
}

/**
 * Erros com matéria (simulados + listas) rankeiam o ponto fraco; o % de acerto vem
 * só das listas, que são o único lugar com total de questões por matéria.
 */
export function rankPontosFracos(
  simulados: Simulado[],
  listas: Lista[],
  materias: Materia[],
): RankPontosFracos {
  const erros = new Map<ID, number>()
  let errosSemMateria = 0

  const contar = (registros: RegistroComErros[]) => {
    for (const registro of registros) {
      for (const erro of registro.erros) {
        if (!erro.materiaId) errosSemMateria += erro.quantidade
        else erros.set(erro.materiaId, (erros.get(erro.materiaId) ?? 0) + erro.quantidade)
      }
    }
  }
  contar(simulados)
  contar(listas)

  const questoes = new Map<ID, { total: number; acertos: number }>()
  for (const lista of listas) {
    if (!lista.materiaId) continue
    const atual = questoes.get(lista.materiaId) ?? { total: 0, acertos: 0 }
    atual.total += lista.totalQuestoes
    atual.acertos += lista.acertos
    questoes.set(lista.materiaId, atual)
  }

  const itens = materias
    .map((materia) => {
      const contagem = questoes.get(materia.id) ?? { total: 0, acertos: 0 }
      return {
        materia,
        erros: erros.get(materia.id) ?? 0,
        questoes: contagem.total,
        acertos: contagem.acertos,
        percAcerto: contagem.total > 0 ? contagem.acertos / contagem.total : null,
      }
    })
    .filter((x) => x.erros > 0 || x.questoes > 0)
    .sort((a, b) => b.erros - a.erros || (a.percAcerto ?? 1) - (b.percAcerto ?? 1))

  return { itens, errosSemMateria }
}

// ---------------------------------------------------------------- KPIs

export interface Kpis {
  mediaUltimos3: number | null
  delta: number | null
  totalSimulados: number
  totalQuestoes: number
  percAcertoGeral: number | null
  materiaMaisFraca: PontoFraco | null
  duvidasPendentes: number
}

const media = (valores: number[]): number | null =>
  valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : null

export function calcularKpis(simulados: Simulado[], listas: Lista[], materias: Materia[]): Kpis {
  const percentuais = ordenarPorData(simulados)
    .map(percentualSimulado)
    .filter((v): v is number => v !== null)

  const ultimos3 = media(percentuais.slice(-3))
  const anteriores3 = media(percentuais.slice(-6, -3))

  const questoes =
    simulados.reduce((acc, s) => acc + questoesSimulado(s), 0) +
    listas.reduce((acc, l) => acc + l.totalQuestoes, 0)
  const acertos =
    simulados.reduce((acc, s) => acc + acertosSimulado(s), 0) +
    listas.reduce((acc, l) => acc + l.acertos, 0)

  const duvidasPendentes = [...simulados, ...listas].reduce(
    (acc, r) => acc + r.duvidas.filter((d) => !d.resolvida).length,
    0,
  )

  const rank = rankPontosFracos(simulados, listas, materias)

  return {
    mediaUltimos3: ultimos3,
    delta: ultimos3 !== null && anteriores3 !== null ? ultimos3 - anteriores3 : null,
    totalSimulados: simulados.length,
    totalQuestoes: questoes,
    percAcertoGeral: questoes > 0 ? acertos / questoes : null,
    materiaMaisFraca: rank.itens[0] ?? null,
    duvidasPendentes,
  }
}
