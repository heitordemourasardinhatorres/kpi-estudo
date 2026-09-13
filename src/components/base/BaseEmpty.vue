<script setup lang="ts">
import BaseIcon from '@/components/base/BaseIcon.vue'
import type { NomeIcone } from '@/lib/icones'

withDefaults(defineProps<{ icone?: NomeIcone; titulo: string; descricao?: string }>(), {
  icone: 'grafico',
  descricao: undefined,
})
</script>

<template>
  <div class="vazio">
    <BaseIcon :nome="icone" :tamanho="26" />
    <strong>{{ titulo }}</strong>
    <p v-if="descricao">{{ descricao }}</p>
    <slot />
  </div>
</template>

<style scoped>
.vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s2);
  padding: var(--s7) var(--s4);
  text-align: center;
  color: var(--text-faint);
}

strong {
  color: var(--text-dim);
  font-size: 0.92rem;
}

p {
  font-size: 0.83rem;
  max-width: 34ch;
}

.vazio :slotted(*) {
  margin-top: var(--s3);
}
</style>
