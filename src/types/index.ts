export type ID = string
export type ISODate = string
export type ISODateTime = string

export type TipoAvaliacao = 'acertos' | 'nota'

export interface Area {
  id: ID
  nome: string
  cor: string
  ordem: number
  avaliacao: TipoAvaliacao
  notaMaximaPadrao?: number
}

export interface Materia {
  id: ID
  nome: string
  areaId: ID
}

export interface Banca {
  id: ID
  nome: string
  ativa: boolean
}

export interface CategoriaErro {
  id: ID
  nome: string
  cor: string
  ativa: boolean
}

export interface Meta {
  id: ID
  bancaId: ID
  ano: number
  curso?: string
  notaCorte: number
  escalaMaxima: number
}

export interface RegistroErro {
  id: ID
  categoriaId: ID
  quantidade: number
  questao?: string
  materiaId?: ID
  topico?: string
  descricao?: string
}

export interface Duvida {
  id: ID
  descricao: string
  questao?: string
  materiaId?: ID
  resolvida: boolean
  criadaEm: ISODateTime
  resolvidaEm?: ISODateTime
}

export type ResultadoArea =
  | { areaId: ID; tipo: 'acertos'; acertos: number; total: number }
  | { areaId: ID; tipo: 'nota'; nota: number; notaMaxima: number }

export interface Simulado {
  id: ID
  bancaId: ID
  ano: number
  fase?: string
  data: ISODate
  duracaoMin?: number
  resultados: ResultadoArea[]
  erros: RegistroErro[]
  duvidas: Duvida[]
  observacao?: string
}

export interface Lista {
  id: ID
  titulo: string
  materiaId?: ID
  topico?: string
  data: ISODate
  duracaoMin?: number
  totalQuestoes: number
  acertos: number
  erros: RegistroErro[]
  duvidas: Duvida[]
  observacao?: string
}

export type Registro = Simulado | Lista

export interface DuvidaComOrigem extends Duvida {
  origem: { tipo: 'simulado' | 'lista'; id: ID; rotulo: string; data: ISODate }
}

export interface Preferencias {
  ultimoBackupEm: ISODateTime | null
}

export const SCHEMA_VERSION = 1

export interface BackupPayload {
  schemaVersion: number
  exportadoEm: ISODateTime
  config: {
    areas: Area[]
    materias: Materia[]
    bancas: Banca[]
    categorias: CategoriaErro[]
    metas: Meta[]
    preferencias: Preferencias
  }
  simulados: Simulado[]
  listas: Lista[]
}
