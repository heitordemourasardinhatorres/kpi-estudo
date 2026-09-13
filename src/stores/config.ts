import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { removerPorId, upsert } from '@/lib/colecao'
import { AREAS_PADRAO, BANCAS_PADRAO, CATEGORIAS_PADRAO, MATERIAS_PADRAO } from '@/lib/seed'
import type { Area, Banca, BackupPayload, CategoriaErro, ID, Materia, Meta, Preferencias } from '@/types'

const copia = <T>(itens: T[]): T[] => itens.map((item) => ({ ...item }))

export const useConfigStore = defineStore(
  'config',
  () => {
    const areas = ref<Area[]>(copia(AREAS_PADRAO))
    const materias = ref<Materia[]>(copia(MATERIAS_PADRAO))
    const bancas = ref<Banca[]>(copia(BANCAS_PADRAO))
    const categorias = ref<CategoriaErro[]>(copia(CATEGORIAS_PADRAO))
    const metas = ref<Meta[]>([])
    const preferencias = ref<Preferencias>({ ultimoBackupEm: null })

    const areasOrdenadas = computed(() => [...areas.value].sort((a, b) => a.ordem - b.ordem))
    const bancasAtivas = computed(() => bancas.value.filter((b) => b.ativa))
    const categoriasAtivas = computed(() => categorias.value.filter((c) => c.ativa))

    const mapaAreas = computed(() => new Map(areas.value.map((a) => [a.id, a])))
    const mapaMaterias = computed(() => new Map(materias.value.map((m) => [m.id, m])))
    const mapaBancas = computed(() => new Map(bancas.value.map((b) => [b.id, b])))
    const mapaCategorias = computed(() => new Map(categorias.value.map((c) => [c.id, c])))

    const nomeArea = (id?: ID) => (id && mapaAreas.value.get(id)?.nome) || '—'
    const nomeMateria = (id?: ID) => (id && mapaMaterias.value.get(id)?.nome) || 'Sem matéria'
    const nomeBanca = (id?: ID) => (id && mapaBancas.value.get(id)?.nome) || '—'
    const nomeCategoria = (id?: ID) => (id && mapaCategorias.value.get(id)?.nome) || '—'
    const corCategoria = (id?: ID) => (id && mapaCategorias.value.get(id)?.cor) || '#9ab7bd'

    const rotuloSimulado = (s: { bancaId: ID; ano: number; fase?: string }) =>
      `${nomeBanca(s.bancaId)} ${s.ano}${s.fase ? ` · ${s.fase}` : ''}`

    const materiasDaArea = (areaId: ID) => materias.value.filter((m) => m.areaId === areaId)

    const materiasAgrupadas = computed(() =>
      areasOrdenadas.value
        .map((area) => ({ area, materias: materiasDaArea(area.id) }))
        .filter((grupo) => grupo.materias.length > 0),
    )

    const areaDaMateria = (materiaId?: ID) => {
      const areaId = materiaId ? mapaMaterias.value.get(materiaId)?.areaId : undefined
      return areaId ? mapaAreas.value.get(areaId) : undefined
    }
    /** Meta vigente da banca: o ano da meta é o vestibular alvo, não o ano da prova feita. */
    const metaAlvo = (bancaId?: ID) =>
      metas.value
        .filter((m) => m.bancaId === bancaId)
        .sort((a, b) => b.ano - a.ano)[0]

    const salvarArea = (area: Area) => upsert(areas.value, area)
    const removerArea = (id: ID) => {
      removerPorId(areas.value, id)
      materias.value = materias.value.filter((m) => m.areaId !== id)
    }
    const salvarMateria = (materia: Materia) => upsert(materias.value, materia)
    const removerMateria = (id: ID) => removerPorId(materias.value, id)
    const salvarBanca = (banca: Banca) => upsert(bancas.value, banca)
    const removerBanca = (id: ID) => {
      removerPorId(bancas.value, id)
      metas.value = metas.value.filter((m) => m.bancaId !== id)
    }
    const salvarCategoria = (categoria: CategoriaErro) => upsert(categorias.value, categoria)
    const removerCategoria = (id: ID) => removerPorId(categorias.value, id)
    const salvarMeta = (meta: Meta) => upsert(metas.value, meta)
    const removerMeta = (id: ID) => removerPorId(metas.value, id)

    function registrarBackup(): void {
      preferencias.value.ultimoBackupEm = new Date().toISOString()
    }

    function restaurarPadroes(): void {
      areas.value = copia(AREAS_PADRAO)
      materias.value = copia(MATERIAS_PADRAO)
      bancas.value = copia(BANCAS_PADRAO)
      categorias.value = copia(CATEGORIAS_PADRAO)
      metas.value = []
    }

    function substituir(config: BackupPayload['config']): void {
      areas.value = config.areas
      materias.value = config.materias
      bancas.value = config.bancas
      categorias.value = config.categorias
      metas.value = config.metas
      preferencias.value = config.preferencias
    }

    return {
      areas,
      materias,
      bancas,
      categorias,
      metas,
      preferencias,
      areasOrdenadas,
      bancasAtivas,
      categoriasAtivas,
      mapaAreas,
      mapaMaterias,
      mapaBancas,
      mapaCategorias,
      nomeArea,
      nomeMateria,
      nomeBanca,
      nomeCategoria,
      corCategoria,
      rotuloSimulado,
      materiasDaArea,
      materiasAgrupadas,
      areaDaMateria,
      metaAlvo,
      salvarArea,
      removerArea,
      salvarMateria,
      removerMateria,
      salvarBanca,
      removerBanca,
      salvarCategoria,
      removerCategoria,
      salvarMeta,
      removerMeta,
      registrarBackup,
      restaurarPadroes,
      substituir,
    }
  },
  { persist: true },
)
