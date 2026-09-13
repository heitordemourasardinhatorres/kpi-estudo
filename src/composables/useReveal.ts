import { nextTick, onMounted, watch, type Ref } from 'vue'
import { animate, stagger } from 'animejs'

const reduzida = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Entrada em cascata para os filhos diretos de um container (cards de simulado/lista,
 * KPIs, grupos de dúvida). Reobserva `gatilho` para animar de novo quando a lista trocar
 * (ex.: filtro de banca/matéria), sem repetir a cada re-render por outro motivo.
 */
export function useReveal(container: Ref<HTMLElement | undefined | null>, gatilho?: Ref<unknown>) {
  function revelar(): void {
    const el = container.value
    if (!el || reduzida()) return
    const itens = el.children
    if (!itens.length) return
    animate(itens, {
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 420,
      delay: stagger(40),
      ease: 'outQuad',
    })
  }

  onMounted(() => {
    void nextTick().then(revelar)
  })

  if (gatilho) {
    watch(gatilho, () => {
      void nextTick().then(revelar)
    })
  }
}
