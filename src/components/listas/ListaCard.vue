<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { formatarCompleto, formatarDuracao } from '@/lib/date'
import { pct } from '@/lib/format'
import { percentualLista, totalErros } from '@/lib/metrics'
import { useConfigStore } from '@/stores/config'
import type { Lista } from '@/types'

const props = defineProps<{ lista: Lista }>()

const config = useConfigStore()

const aproveitamento = computed(() => percentualLista(props.lista))
const erros = computed(() => totalErros(props.lista.erros))
const pendentes = computed(() => props.lista.duvidas.filter((d) => !d.resolvida).length)
const area = computed(() => config.areaDaMateria(props.lista.materiaId))
</script>

<template>
  <RouterLink :to="`/listas/${lista.id}`" class="card">
    <div class="topo">
      <strong>{{ lista.titulo }}</strong>
      <span class="pct">{{ pct(aproveitamento) }}</span>
    </div>

    <p class="meta">
      {{ formatarCompleto(lista.data) }} · {{ lista.acertos }}/{{ lista.totalQuestoes }}
      <template v-if="lista.duracaoMin"> · {{ formatarDuracao(lista.duracaoMin) }}</template>
      <template v-if="erros"> · {{ erros }} erro{{ erros === 1 ? '' : 's' }}</template>
      <template v-if="pendentes"> · {{ pendentes }} dúvida{{ pendentes === 1 ? '' : 's' }}</template>
    </p>

    <div class="tags">
      <span v-if="lista.materiaId" class="chip">
        <span class="ponto-cor" :style="{ background: area?.cor }" />
        {{ config.nomeMateria(lista.materiaId) }}
      </span>
      <span v-if="lista.topico" class="chip">{{ lista.topico }}</span>
    </div>
  </RouterLink>
</template>

<style scoped>
.card {
  display: block;
  padding: var(--s4);
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  transition: border-color 0.15s ease, background 0.15s ease;
}

.card:hover {
  border-color: var(--brand);
  background: var(--surface);
}

.topo {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s3);
}

.topo strong {
  font-size: 0.95rem;
}

.pct {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--brand-bright);
  font-variant-numeric: normal;
}

.meta {
  margin-top: 2px;
  color: var(--text-dim);
  font-size: 0.8rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: var(--s3);
}
</style>
