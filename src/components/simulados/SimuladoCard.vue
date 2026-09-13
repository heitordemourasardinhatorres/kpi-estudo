<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { formatarCompleto, formatarDuracao } from '@/lib/date'
import { pct } from '@/lib/format'
import { percentual, percentualSimulado, totalErros } from '@/lib/metrics'
import { useConfigStore } from '@/stores/config'
import type { Simulado } from '@/types'

const props = defineProps<{ simulado: Simulado }>()

const config = useConfigStore()

const geral = computed(() => percentualSimulado(props.simulado))
const erros = computed(() => totalErros(props.simulado.erros))
const pendentes = computed(() => props.simulado.duvidas.filter((d) => !d.resolvida).length)
</script>

<template>
  <RouterLink :to="`/simulados/${simulado.id}`" class="card">
    <div class="topo">
      <strong>{{ config.rotuloSimulado(simulado) }}</strong>
      <span class="geral">{{ pct(geral) }}</span>
    </div>

    <p class="meta">
      {{ formatarCompleto(simulado.data) }}
      <template v-if="simulado.duracaoMin"> · {{ formatarDuracao(simulado.duracaoMin) }}</template>
      <template v-if="erros"> · {{ erros }} erro{{ erros === 1 ? '' : 's' }}</template>
      <template v-if="pendentes"> · {{ pendentes }} dúvida{{ pendentes === 1 ? '' : 's' }}</template>
    </p>

    <div class="areas">
      <span
        v-for="resultado in simulado.resultados"
        :key="resultado.areaId"
        class="chip"
        :title="config.nomeArea(resultado.areaId)"
      >
        <span class="ponto-cor" :style="{ background: config.mapaAreas.get(resultado.areaId)?.cor }" />
        {{ config.nomeArea(resultado.areaId) }}
        <b>{{ pct(percentual(resultado), 0) }}</b>
      </span>
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
  font-size: 0.98rem;
}

.geral {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--brand-bright);
  font-variant-numeric: normal;
}

.meta {
  margin-top: 2px;
  color: var(--text-dim);
  font-size: 0.8rem;
}

.areas {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: var(--s3);
}

.chip b {
  color: var(--text);
  font-weight: 600;
}
</style>
