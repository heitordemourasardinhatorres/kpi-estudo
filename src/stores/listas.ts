import { computed } from 'vue'
import { defineStore } from 'pinia'
import { criarColecao } from '@/lib/colecao'
import { ordenarPorData } from '@/lib/date'
import type { Lista } from '@/types'

export const useListasStore = defineStore(
  'listas',
  () => {
    const colecao = criarColecao<Lista>()
    const ordenadas = computed(() => ordenarPorData(colecao.itens.value))
    const recentes = computed(() => [...ordenadas.value].reverse())

    return { ...colecao, ordenadas, recentes }
  },
  { persist: true },
)
