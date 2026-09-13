import { novoId } from '@/lib/id'
import type { Duvida, ID, Lista, Meta, RegistroErro, Simulado } from '@/types'

/** Gerador determinístico: os dados de exemplo são sempre os mesmos, o que ajuda a conferir gráficos. */
function sorteio(semente: number) {
  let estado = semente
  return () => {
    estado = (estado * 1664525 + 1013904223) % 4294967296
    return estado / 4294967296
  }
}

const CATEGORIAS = ['cat-interpretacao', 'cat-conteudo', 'cat-conta', 'cat-distracao', 'cat-chute', 'cat-tempo']
const MATERIAS = [
  'mat-matematica',
  'mat-fisica',
  'mat-quimica',
  'mat-biologia',
  'mat-historia',
  'mat-geografia',
  'mat-portugues',
  'mat-literatura',
]

const PROVAS: { bancaId: ID; ano: number; fase: string }[] = [
  { bancaId: 'banca-fuvest', ano: 2019, fase: '1ª fase' },
  { bancaId: 'banca-unesp', ano: 2020, fase: '1ª fase' },
  { bancaId: 'banca-fuvest', ano: 2020, fase: '1ª fase' },
  { bancaId: 'banca-unicamp', ano: 2021, fase: '1ª fase' },
  { bancaId: 'banca-enem', ano: 2021, fase: 'dia 2' },
  { bancaId: 'banca-fuvest', ano: 2022, fase: '1ª fase' },
  { bancaId: 'banca-unesp', ano: 2023, fase: '1ª fase' },
  { bancaId: 'banca-fuvest', ano: 2023, fase: '1ª fase' },
  { bancaId: 'banca-unicamp', ano: 2024, fase: '1ª fase' },
  { bancaId: 'banca-fuvest', ano: 2024, fase: '1ª fase' },
]

const TOPICOS: { titulo: string; materiaId: ID; topico: string }[] = [
  { titulo: 'Trigonometria — Prof. Ana', materiaId: 'mat-matematica', topico: 'Trigonometria' },
  { titulo: 'Funções exponenciais', materiaId: 'mat-matematica', topico: 'Funções' },
  { titulo: 'Geometria espacial', materiaId: 'mat-matematica', topico: 'Geometria' },
  { titulo: 'Cinemática — lista 3', materiaId: 'mat-fisica', topico: 'Cinemática' },
  { titulo: 'Eletrodinâmica', materiaId: 'mat-fisica', topico: 'Eletricidade' },
  { titulo: 'Estequiometria', materiaId: 'mat-quimica', topico: 'Estequiometria' },
  { titulo: 'Química orgânica — funções', materiaId: 'mat-quimica', topico: 'Orgânica' },
  { titulo: 'Termoquímica', materiaId: 'mat-quimica', topico: 'Termoquímica' },
  { titulo: 'Citologia', materiaId: 'mat-biologia', topico: 'Citologia' },
  { titulo: 'Genética — 2ª lei', materiaId: 'mat-biologia', topico: 'Genética' },
  { titulo: 'Brasil República', materiaId: 'mat-historia', topico: 'República' },
  { titulo: 'Geopolítica', materiaId: 'mat-geografia', topico: 'Geopolítica' },
  { titulo: 'Interpretação de texto', materiaId: 'mat-portugues', topico: 'Interpretação' },
  { titulo: 'Modernismo', materiaId: 'mat-literatura', topico: 'Modernismo' },
]

const DUVIDAS = [
  'Não entendi por que a reação não é de substituição.',
  'Fiquei em dúvida entre duas alternativas na questão de domínio.',
  'Por que o vetor resultante aponta pra baixo?',
  'Confundi o período da função — revisar.',
  'Não lembrei a diferença entre os dois movimentos literários.',
]

function dataRelativa(diasAtras: number): string {
  const d = new Date()
  d.setDate(d.getDate() - diasAtras)
  return d.toISOString().slice(0, 10)
}

const item = <T>(lista: T[], r: () => number): T => lista[Math.floor(r() * lista.length)] as T

function gerarErros(quantidade: number, r: () => number, comRapido: boolean): RegistroErro[] {
  const erros: RegistroErro[] = Array.from({ length: quantidade }, (_, i) => ({
    id: novoId(),
    categoriaId: item(CATEGORIAS, r),
    materiaId: item(MATERIAS, r),
    quantidade: 1,
    questao: `Q${Math.floor(r() * 88) + 1}`,
    descricao: i % 4 === 0 ? 'Revisar a fórmula usada.' : undefined,
  }))
  if (comRapido) {
    erros.push({ id: novoId(), categoriaId: 'cat-distracao', quantidade: Math.floor(r() * 3) + 1 })
  }
  return erros
}

function gerarDuvidas(quantidade: number, r: () => number): Duvida[] {
  return Array.from({ length: quantidade }, () => ({
    id: novoId(),
    descricao: item(DUVIDAS, r),
    questao: `Q${Math.floor(r() * 88) + 1}`,
    materiaId: item(MATERIAS, r),
    resolvida: r() > 0.7,
    criadaEm: new Date().toISOString(),
  }))
}

const METAS: Meta[] = [
  {
    id: 'meta-fuvest',
    bancaId: 'banca-fuvest',
    ano: new Date().getFullYear() + 1,
    curso: 'Engenharia',
    notaCorte: 62,
    escalaMaxima: 90,
  },
  {
    id: 'meta-unicamp',
    bancaId: 'banca-unicamp',
    ano: new Date().getFullYear() + 1,
    notaCorte: 48,
    escalaMaxima: 72,
  },
]

export function gerarDadosExemplo(): { simulados: Simulado[]; listas: Lista[]; metas: Meta[] } {
  const r = sorteio(20260913)

  const simulados: Simulado[] = PROVAS.map((prova, i) => {
    const progresso = i / (PROVAS.length - 1)
    const base = 0.48 + progresso * 0.22
    const nota = (total: number, ajuste: number) =>
      Math.round(total * Math.min(0.95, Math.max(0.2, base + ajuste + (r() - 0.5) * 0.12)))

    return {
      id: novoId(),
      bancaId: prova.bancaId,
      ano: prova.ano,
      fase: prova.fase,
      data: dataRelativa(200 - i * 20),
      duracaoMin: 240 + Math.floor(r() * 60),
      resultados: [
        { areaId: 'area-exatas', tipo: 'acertos', acertos: nota(25, 0.06), total: 25 },
        { areaId: 'area-humanas', tipo: 'acertos', acertos: nota(25, -0.04), total: 25 },
        { areaId: 'area-biologicas', tipo: 'acertos', acertos: nota(20, -0.09), total: 20 },
        { areaId: 'area-linguagens', tipo: 'acertos', acertos: nota(20, 0.02), total: 20 },
        ...(i % 3 === 0
          ? [
              {
                areaId: 'area-redacao',
                tipo: 'nota' as const,
                nota: Number((6 + progresso * 2.4 + r()).toFixed(1)),
                notaMaxima: 10,
              },
            ]
          : []),
      ],
      erros: gerarErros(4 + Math.floor(r() * 4), r, i % 2 === 0),
      duvidas: gerarDuvidas(Math.floor(r() * 3), r),
      observacao: i === PROVAS.length - 1 ? 'Cansei muito no fim da prova.' : undefined,
    }
  })

  const listas: Lista[] = Array.from({ length: 18 }, (_, i) => {
    const modelo = TOPICOS[i % TOPICOS.length] as (typeof TOPICOS)[number]
    const total = 10 + Math.floor(r() * 16)
    return {
      id: novoId(),
      titulo: modelo.titulo,
      materiaId: modelo.materiaId,
      topico: modelo.topico,
      data: dataRelativa(170 - i * 9),
      duracaoMin: 40 + Math.floor(r() * 50),
      totalQuestoes: total,
      acertos: Math.round(total * (0.55 + (i / 18) * 0.25 + (r() - 0.5) * 0.15)),
      erros: gerarErros(1 + Math.floor(r() * 3), r, false),
      duvidas: gerarDuvidas(r() > 0.6 ? 1 : 0, r),
    }
  })

  return { simulados, listas, metas: METAS.map((m) => ({ ...m })) }
}
