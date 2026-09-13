import { computed } from 'vue'
import { defineStore } from 'pinia'
import { criarColecao } from '@/lib/colecao'
import { ordenarPorData } from '@/lib/date'
import type { Simulado } from '@/types'

export const useSimuladosStore = defineStore(
  'simulados',
  () => {
    const colecao = criarColecao<Simulado>()
    const ordenados = computed(() => ordenarPorData(colecao.itens.value))
    const recentes = computed(() => [...ordenados.value].reverse())

    return { ...colecao, ordenados, recentes }
  },
  { persist: true },
)
