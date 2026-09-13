<script setup lang="ts">
withDefaults(defineProps<{ rotulo: string; dica?: string }>(), { dica: undefined })
</script>

<template>
  <label class="campo">
    <span class="rotulo">{{ rotulo }}</span>
    <slot />
    <small v-if="dica" class="dica">{{ dica }}</small>
  </label>
</template>

<style scoped>
.campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.rotulo {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-dim);
  letter-spacing: 0.02em;
}

.dica {
  font-size: 0.74rem;
  color: var(--text-faint);
}
</style>
