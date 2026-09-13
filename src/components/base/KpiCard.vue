<script setup lang="ts">
import BaseIcon from '@/components/base/BaseIcon.vue'
import type { NomeIcone } from '@/lib/icones'

withDefaults(
  defineProps<{
    rotulo: string
    valor: string
    detalhe?: string
    delta?: string
    deltaPositivo?: boolean
    icone?: NomeIcone
  }>(),
  { detalhe: undefined, delta: undefined, deltaPositivo: true, icone: undefined },
)
</script>

<template>
  <article class="kpi">
    <header>
      <span class="rotulo">{{ rotulo }}</span>
      <BaseIcon v-if="icone" :nome="icone" :tamanho="15" />
    </header>
    <strong class="valor">{{ valor }}</strong>
    <p class="rodape">
      <span v-if="delta" class="delta" :class="{ positivo: deltaPositivo }">{{ delta }}</span>
      <span v-if="detalhe" class="detalhe">{{ detalhe }}</span>
    </p>
  </article>
</template>

<style scoped>
.kpi {
  padding: var(--s4);
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s2);
  color: var(--text-faint);
}

.rotulo {
  color: var(--text-dim);
  font-size: 0.78rem;
  font-weight: 500;
}

.valor {
  display: block;
  margin-top: 6px;
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 600;
  line-height: 1.1;
  /* dígitos proporcionais: tabular deixa número grande frouxo */
  font-variant-numeric: normal;
}

.rodape {
  display: flex;
  align-items: baseline;
  gap: var(--s2);
  margin-top: 4px;
  font-size: 0.78rem;
  min-height: 1.2em;
}

.delta {
  color: var(--erro);
  font-weight: 600;
}

.delta.positivo {
  color: var(--acerto);
}

.detalhe {
  color: var(--text-faint);
}
</style>
