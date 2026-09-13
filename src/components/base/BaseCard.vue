<script setup lang="ts">
withDefaults(defineProps<{ titulo?: string; densa?: boolean }>(), { titulo: undefined, densa: false })
</script>

<template>
  <section class="card" :class="{ densa }">
    <header v-if="titulo || $slots.acoes" class="cabecalho">
      <h2 v-if="titulo">{{ titulo }}</h2>
      <div v-if="$slots.acoes" class="acoes"><slot name="acoes" /></div>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.card {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--s5);
}

.densa {
  padding: var(--s4);
}

.cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  margin-bottom: var(--s4);
}

h2 {
  font-size: 0.95rem;
  letter-spacing: 0.01em;
}

.acoes {
  display: flex;
  align-items: center;
  gap: var(--s2);
}
</style>
