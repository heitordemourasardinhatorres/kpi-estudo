import { computed } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useListasStore } from '@/stores/listas'
import { useSimuladosStore } from '@/stores/simulados'
import type { DuvidaComOrigem } from '@/types'

export function useDuvidas() {
  const config = useConfigStore()
  const simulados = useSimuladosStore()
  const listas = useListasStore()

  const todas = computed<DuvidaComOrigem[]>(() => [
    ...simulados.itens.flatMap((s) =>
      s.duvidas.map((d) => ({
        ...d,
        origem: { tipo: 'simulado' as const, id: s.id, rotulo: config.rotuloSimulado(s), data: s.data },
      })),
    ),
    ...listas.itens.flatMap((l) =>
      l.duvidas.map((d) => ({
        ...d,
        origem: { tipo: 'lista' as const, id: l.id, rotulo: l.titulo, data: l.data },
      })),
    ),
  ])

  const pendentes = computed(() => todas.value.filter((d) => !d.resolvida))
  const resolvidas = computed(() => todas.value.filter((d) => d.resolvida))

  return { todas, pendentes, resolvidas }
}
