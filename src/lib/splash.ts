import { animate, createTimeline, svg, utils } from 'animejs'
import { prefereMovimentoReduzido } from '@/lib/movimento'

const MINIMO_MS = 3000
const MINIMO_REDUZIDO_MS = 1000
const TETO_MS = 5000

const esperar = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, ms)))

let avisarSaida: () => void = () => { }
/** Resolve quando a splash começa a sair: é o sinal para o app fazer a cascata de entrada. */
export const splashSaindo = new Promise<void>((resolve) => {
  avisarSaida = resolve
})

let pedirPulo: () => void = () => { }
const pulo = new Promise<void>((resolve) => {
  pedirPulo = () => resolve()
})

let elemento: HTMLElement | null = null
let reduzido = false
let inicio = 0
let entrada: Promise<void> = Promise.resolve()
let saiu = false

/** Chamada antes do mount: a marcação já está no index.html, aqui só entra o movimento. */
export function iniciarSplash(): void {
  elemento = document.getElementById('splash')
  if (!elemento) {
    avisarSaida()
    return
  }

  reduzido = prefereMovimentoReduzido()
  inicio = performance.now()

  elemento.addEventListener('pointerdown', pedirPulo, { once: true })
  window.addEventListener('keydown', pedirPulo, { once: true })

  if (reduzido) return

  const tracoJ = svg.createDrawable('#splash .traco-j')
  const tracoLinha = svg.createDrawable('#splash .traco-linha')
  utils.set([...tracoJ, ...tracoLinha], { draw: '0 0' })

  const linhaDoTempo = createTimeline()
    .add('#splash .splash-logo', { opacity: [0, 1], scale: [0.86, 1], duration: 380, ease: 'outQuart' }, 0)
    .add(tracoJ, { draw: ['0 0', '0 1'], duration: 420, ease: 'outCubic' }, 120)
    .add(tracoLinha, { draw: ['0 0', '0 1'], duration: 520, ease: 'outCubic' }, 300)
    .add('#splash .splash-texto', { opacity: [0, 1], translateY: [8, 0], duration: 380, ease: 'outQuad' }, 520)

  entrada = new Promise<void>((resolve) => {
    linhaDoTempo.then(() => resolve())
  })
}

/**
 * Sai quando a entrada terminou, a rota inicial carregou e o tempo mínimo passou.
 * Um clique/tecla antecipa (desde que o app esteja pronto) e o teto evita tela presa.
 */
export async function encerrarSplash(pronto: Promise<unknown>): Promise<void> {
  if (!elemento || saiu) return

  const appPronto = pronto.catch(() => undefined)
  const decorrido = performance.now() - inicio

  await Promise.race([
    Promise.all([entrada, appPronto, esperar((reduzido ? MINIMO_REDUZIDO_MS : MINIMO_MS) - decorrido)]),
    Promise.all([pulo, appPronto]),
    esperar(TETO_MS - decorrido),
  ])

  sair()
}

function sair(): void {
  const el = elemento
  if (!el || saiu) return
  saiu = true

  window.removeEventListener('keydown', pedirPulo)
  el.style.pointerEvents = 'none'
  document.getElementById('app')?.removeAttribute('aria-busy')
  avisarSaida()

  const remover = () => {
    el.remove()
    document.documentElement.classList.remove('splash-ativo')
  }

  if (reduzido) {
    animate(el, { opacity: [1, 0], duration: 150, ease: 'linear', onComplete: remover })
    return
  }

  animate('#splash .splash-centro', { translateY: [0, -6], duration: 260, ease: 'inQuad' })
  animate(el, { opacity: [1, 0], duration: 260, ease: 'inQuad', onComplete: remover })
}
