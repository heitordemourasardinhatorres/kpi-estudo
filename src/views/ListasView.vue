<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BarRankFracos from '@/components/charts/BarRankFracos.vue'
import BarStackCategorias from '@/components/charts/BarStackCategorias.vue'
import LineEvolucao from '@/components/charts/LineEvolucao.vue'
import type { SerieLinha } from '@/components/charts/tipos'
import ListaCard from '@/components/listas/ListaCard.vue'
import ListaForm from '@/components/listas/ListaForm.vue'
import { useReveal } from '@/composables/useReveal'
import { useToast } from '@/composables/useToast'
import { pct } from '@/lib/format'
import { errosPorMes, evolucaoListas, rankPontosFracos } from '@/lib/metrics'
import { useConfigStore } from '@/stores/config'
import { useListasStore } from '@/stores/listas'
import type { ID, Lista } from '@/types'

const router = useRouter()
const config = useConfigStore()
const listas = useListasStore()
const { mostrar } = useToast()

const formAberto = ref(false)
const materiaFiltro = ref<ID | 'todas'>('todas')

const filtradas = computed(() =>
  materiaFiltro.value === 'todas'
    ? listas.itens
    : listas.itens.filter((l) => l.materiaId === materiaFiltro.value),
)

const recentes = computed(() => [...filtradas.value].sort((a, b) => b.data.localeCompare(a.data)))

const listaEl = ref<HTMLElement>()
useReveal(listaEl, recentes)

const totais = computed(() => {
  const questoes = filtradas.value.reduce((acc, l) => acc + l.totalQuestoes, 0)
  const acertos = filtradas.value.reduce((acc, l) => acc + l.acertos, 0)
  return { questoes, acertos, percentual: questoes > 0 ? acertos / questoes : null }
})

const series = computed<SerieLinha[]>(() => [
  { nome: 'Aproveitamento', cor: '#1094ab', pontos: evolucaoListas(filtradas.value) },
])

const empilhado = computed(() => errosPorMes(filtradas.value, config.categorias))
const rank = computed(() => rankPontosFracos([], filtradas.value, config.materias))

function salvar(lista: Lista): void {
  listas.salvar(lista)
  formAberto.value = false
  mostrar('Lista registrada')
  // Leva direto pro detalhe: é lá que dá pra anotar erros e dúvidas.
  router.push(`/listas/${lista.id}`)
}
</script>

<template>
  <div>
    <header class="pagina-cabecalho">
      <div>
        <h1>Listas de questões</h1>
        <p>Exercícios por matéria e tópico, separados dos simulados.</p>
      </div>
      <BaseButton variante="primario" icone="mais" @click="formAberto = true">
        Registrar lista
      </BaseButton>
    </header>

    <div v-if="listas.itens.length" class="filtros">
      <select v-model="materiaFiltro" aria-label="Filtrar por matéria">
        <option value="todas">Todas as matérias</option>
        <optgroup v-for="grupo in config.materiasAgrupadas" :key="grupo.area.id" :label="grupo.area.nome">
          <option v-for="materia in grupo.materias" :key="materia.id" :value="materia.id">
            {{ materia.nome }}
          </option>
        </optgroup>
      </select>
      <p class="resumo">
        <strong>{{ totais.acertos }}</strong> de <strong>{{ totais.questoes }}</strong> questões ·
        <strong class="destaque">{{ pct(totais.percentual) }}</strong>
      </p>
    </div>

    <BaseCard titulo="Aproveitamento por lista" class="bloco">
      <LineEvolucao
        :series="series"
        :altura="300"
        mensagem-vazio="Registre listas para ver o aproveitamento ao longo do tempo."
      />
    </BaseCard>

    <div class="dois">
      <BaseCard titulo="Matérias com mais erro nas listas">
        <BarRankFracos :itens="rank.itens" />
      </BaseCard>
      <BaseCard titulo="De que você errou, mês a mês">
        <BarStackCategorias :serie="empilhado" />
      </BaseCard>
    </div>

    <section class="bloco">
      <div class="section-title">
        <h2>{{ recentes.length }} lista{{ recentes.length === 1 ? '' : 's' }}</h2>
      </div>
      <div v-if="recentes.length" ref="listaEl" class="lista">
        <ListaCard v-for="item in recentes" :key="item.id" :lista="item" />
      </div>
      <BaseEmpty
        v-else
        icone="listas"
        titulo="Nenhuma lista registrada"
        descricao="Cada lista guarda total, acertos, erros categorizados e dúvidas."
      >
        <BaseButton variante="primario" icone="mais" @click="formAberto = true">
          Registrar lista
        </BaseButton>
      </BaseEmpty>
    </section>

    <BaseModal :aberto="formAberto" titulo="Registrar lista" @fechar="formAberto = false">
      <ListaForm @salvar="salvar" @cancelar="formAberto = false" />
    </BaseModal>
  </div>
</template>

<style scoped>
.filtros {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  margin-bottom: var(--s4);
}

.filtros select {
  width: auto;
  min-width: 190px;
}

.resumo {
  color: var(--text-dim);
  font-size: 0.86rem;
}

.resumo strong {
  color: var(--text);
}

.resumo .destaque {
  color: var(--brand-bright);
}

.bloco {
  margin-bottom: var(--s5);
}

.dois {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
  gap: var(--s4);
  margin-bottom: var(--s5);
}

.lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--s3);
}
</style>
