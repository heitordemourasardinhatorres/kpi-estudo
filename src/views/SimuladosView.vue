<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BarStackCategorias from '@/components/charts/BarStackCategorias.vue'
import LineEvolucao from '@/components/charts/LineEvolucao.vue'
import RadarAreas from '@/components/charts/RadarAreas.vue'
import type { SerieLinha } from '@/components/charts/tipos'
import SimuladoCard from '@/components/simulados/SimuladoCard.vue'
import SimuladoForm from '@/components/simulados/SimuladoForm.vue'
import { useReveal } from '@/composables/useReveal'
import { useToast } from '@/composables/useToast'
import { desempenhoPorArea, errosPorMes, evolucaoSimulados } from '@/lib/metrics'
import { useConfigStore } from '@/stores/config'
import { useSimuladosStore } from '@/stores/simulados'
import type { ID, Simulado } from '@/types'

const router = useRouter()
const config = useConfigStore()
const simulados = useSimuladosStore()
const { mostrar } = useToast()

const formAberto = ref(false)
const bancaFiltro = ref<ID | 'todas'>('todas')
const visao = ref<'total' | 'areas'>('total')

const filtrados = computed(() =>
  bancaFiltro.value === 'todas'
    ? simulados.itens
    : simulados.itens.filter((s) => s.bancaId === bancaFiltro.value),
)

const recentes = computed(() => [...filtrados.value].sort((a, b) => b.data.localeCompare(a.data)))

const listaEl = ref<HTMLElement>()
useReveal(listaEl, recentes)

const series = computed<SerieLinha[]>(() => {
  if (visao.value === 'total') {
    return [
      {
        nome: 'Total',
        cor: '#1094ab',
        pontos: evolucaoSimulados(filtrados.value, config.rotuloSimulado),
      },
    ]
  }
  return config.areasOrdenadas.map((area) => ({
    nome: area.nome,
    cor: area.cor,
    pontos: evolucaoSimulados(filtrados.value, config.rotuloSimulado, area.id),
  }))
})

const corte = computed(() => {
  const meta = config.metaAlvo(bancaFiltro.value === 'todas' ? undefined : bancaFiltro.value)
  return meta ? meta.notaCorte / meta.escalaMaxima : null
})

const radar = computed(() => desempenhoPorArea(filtrados.value, config.areasOrdenadas))
const empilhado = computed(() => errosPorMes(filtrados.value, config.categorias))

function salvar(simulado: Simulado): void {
  simulados.salvar(simulado)
  formAberto.value = false
  mostrar('Simulado registrado')
  // Leva direto pro detalhe: é lá que dá pra anotar erros e dúvidas.
  router.push(`/simulados/${simulado.id}`)
}
</script>

<template>
  <div>
    <header class="pagina-cabecalho">
      <div>
        <h1>Simulados</h1>
        <p>Provas antigas que você fez, nota por área e o que errou.</p>
      </div>
      <BaseButton variante="primario" icone="mais" @click="formAberto = true">
        Registrar simulado
      </BaseButton>
    </header>

    <div v-if="simulados.itens.length" class="filtros">
      <select v-model="bancaFiltro" aria-label="Filtrar por banca">
        <option value="todas">Todas as bancas</option>
        <option v-for="banca in config.bancas" :key="banca.id" :value="banca.id">
          {{ banca.nome }}
        </option>
      </select>
      <div class="visoes">
        <button type="button" :class="{ ativo: visao === 'total' }" @click="visao = 'total'">
          Total
        </button>
        <button type="button" :class="{ ativo: visao === 'areas' }" @click="visao = 'areas'">
          Por área
        </button>
      </div>
    </div>

    <BaseCard titulo="Evolução da nota" class="bloco">
      <LineEvolucao :series="series" :corte="corte" :altura="320" />
    </BaseCard>

    <div class="dois">
      <BaseCard titulo="Desempenho por área">
        <RadarAreas :dados="radar" />
      </BaseCard>
      <BaseCard titulo="De que você errou, mês a mês">
        <BarStackCategorias :serie="empilhado" />
      </BaseCard>
    </div>

    <section class="bloco">
      <div class="section-title">
        <h2>{{ recentes.length }} simulado{{ recentes.length === 1 ? '' : 's' }}</h2>
      </div>
      <div v-if="recentes.length" ref="listaEl" class="lista">
        <SimuladoCard v-for="simulado in recentes" :key="simulado.id" :simulado="simulado" />
      </div>
      <BaseEmpty
        v-else
        icone="simulados"
        titulo="Nenhum simulado por aqui"
        descricao="Registre a primeira prova para começar a ver a evolução."
      >
        <BaseButton variante="primario" icone="mais" @click="formAberto = true">
          Registrar simulado
        </BaseButton>
      </BaseEmpty>
    </section>

    <BaseModal :aberto="formAberto" titulo="Registrar simulado" @fechar="formAberto = false">
      <SimuladoForm @salvar="salvar" @cancelar="formAberto = false" />
    </BaseModal>
  </div>
</template>

<style scoped>
.filtros {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s3);
  margin-bottom: var(--s4);
}

.filtros select {
  width: auto;
  min-width: 170px;
}

.visoes {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 99px;
}

.visoes button {
  padding: 5px 14px;
  border-radius: 99px;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-dim);
}

.visoes button.ativo {
  background: var(--surface-2);
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
