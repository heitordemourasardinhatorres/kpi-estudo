import type { Area, Banca, CategoriaErro, Materia } from '@/types'

export const AREAS_PADRAO: Area[] = [
  { id: 'area-exatas', nome: 'Exatas', cor: '#1094ab', ordem: 1, avaliacao: 'acertos' },
  { id: 'area-humanas', nome: 'Humanas', cor: '#d95926', ordem: 2, avaliacao: 'acertos' },
  { id: 'area-biologicas', nome: 'Biológicas', cor: '#199e70', ordem: 3, avaliacao: 'acertos' },
  { id: 'area-linguagens', nome: 'Linguagens', cor: '#c98500', ordem: 4, avaliacao: 'acertos' },
  { id: 'area-redacao', nome: 'Redação', cor: '#d55181', ordem: 5, avaliacao: 'nota', notaMaximaPadrao: 10 },
]

export const MATERIAS_PADRAO: Materia[] = [
  { id: 'mat-matematica', nome: 'Matemática', areaId: 'area-exatas' },
  { id: 'mat-fisica', nome: 'Física', areaId: 'area-exatas' },
  { id: 'mat-quimica', nome: 'Química', areaId: 'area-exatas' },
  { id: 'mat-biologia', nome: 'Biologia', areaId: 'area-biologicas' },
  { id: 'mat-historia', nome: 'História', areaId: 'area-humanas' },
  { id: 'mat-geografia', nome: 'Geografia', areaId: 'area-humanas' },
  { id: 'mat-filosofia', nome: 'Filosofia', areaId: 'area-humanas' },
  { id: 'mat-sociologia', nome: 'Sociologia', areaId: 'area-humanas' },
  { id: 'mat-portugues', nome: 'Português', areaId: 'area-linguagens' },
  { id: 'mat-literatura', nome: 'Literatura', areaId: 'area-linguagens' },
  { id: 'mat-ingles', nome: 'Inglês', areaId: 'area-linguagens' },
]

export const BANCAS_PADRAO: Banca[] = [
  { id: 'banca-fuvest', nome: 'Fuvest', ativa: true },
  { id: 'banca-unicamp', nome: 'Unicamp', ativa: true },
  { id: 'banca-unesp', nome: 'Unesp', ativa: true },
  { id: 'banca-enem', nome: 'ENEM', ativa: true },
]

export const CATEGORIAS_PADRAO: CategoriaErro[] = [
  { id: 'cat-interpretacao', nome: 'Interpretação', cor: '#9085e9', ativa: true },
  { id: 'cat-conteudo', nome: 'Conteúdo não sabido', cor: '#e66767', ativa: true },
  { id: 'cat-conta', nome: 'Conta / álgebra', cor: '#1094ab', ativa: true },
  { id: 'cat-distracao', nome: 'Distração', cor: '#c98500', ativa: true },
  { id: 'cat-chute', nome: 'Chute errado', cor: '#d55181', ativa: true },
  { id: 'cat-tempo', nome: 'Faltou tempo', cor: '#008300', ativa: true },
]

/**
 * Ordem fixa validada para a superfície escura (#0e2126): banda de luminosidade,
 * piso de croma, separação sob daltonismo e contraste. Cores novas saem daqui,
 * na ordem — nunca geradas.
 */
export const PALETA_SERIES = [
  '#1094ab',
  '#d95926',
  '#199e70',
  '#c98500',
  '#d55181',
  '#008300',
  '#9085e9',
  '#e66767',
]

export const COR_NEUTRA = '#7a959b'
