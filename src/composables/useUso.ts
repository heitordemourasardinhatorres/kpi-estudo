import { computed } from 'vue'
import { useListasStore } from '@/stores/listas'
import { useSimuladosStore } from '@/stores/simulados'
import type { ID } from '@/types'

/** Quantos registros dependem de um item de configuração — mostrado antes de apagar. */
export function useUso() {
  const simulados = useSimuladosStore()
  const listas = useListasStore()
  const registros = computed(() => [...simulados.itens, ...listas.itens])

  const errosCom = (filtro: (materiaId?: ID, categoriaId?: ID) => boolean) =>
    registros.value.reduce(
      (acc, r) => acc + r.erros.filter((e) => filtro(e.materiaId, e.categoriaId)).length,
      0,
    )

  return {
    banca: (id: ID) => simulados.itens.filter((s) => s.bancaId === id).length,
    area: (id: ID) => simulados.itens.filter((s) => s.resultados.some((r) => r.areaId === id)).length,
    categoria: (id: ID) => errosCom((_m, c) => c === id),
    materia: (id: ID) =>
      errosCom((m) => m === id) + listas.itens.filter((l) => l.materiaId === id).length,
  }
}
