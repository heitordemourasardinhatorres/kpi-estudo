<script setup lang="ts">
import BaseIcon from '@/components/base/BaseIcon.vue'
import type { NomeIcone } from '@/lib/icones'

withDefaults(
  defineProps<{
    variante?: 'primario' | 'secundario' | 'fantasma' | 'perigo'
    tamanho?: 'sm' | 'md'
    icone?: NomeIcone
    tipo?: 'button' | 'submit'
    desabilitado?: boolean
  }>(),
  { variante: 'secundario', tamanho: 'md', tipo: 'button', desabilitado: false, icone: undefined },
)
</script>

<template>
  <button :type="tipo" :disabled="desabilitado" class="btn" :class="[variante, tamanho]">
    <BaseIcon v-if="icone" :nome="icone" :tamanho="tamanho === 'sm' ? 15 : 17" />
    <span v-if="$slots.default"><slot /></span>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--s2);
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  font-weight: 500;
  white-space: nowrap;
  transition: background 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
}

.md {
  padding: 9px 15px;
  font-size: 0.9rem;
}

.sm {
  padding: 5px 10px;
  font-size: 0.81rem;
}

.primario {
  background: var(--brand);
  color: var(--on-brand);
  font-weight: 600;
}

.primario:hover {
  background: var(--brand-bright);
}

.secundario {
  background: var(--surface-2);
  border-color: var(--border-strong);
  color: var(--text);
}

.secundario:hover {
  border-color: var(--brand);
}

.fantasma {
  color: var(--text-dim);
}

.fantasma:hover {
  background: var(--surface-2);
  color: var(--text);
}

.perigo {
  color: var(--erro);
}

.perigo:hover {
  background: color-mix(in srgb, var(--erro) 15%, transparent);
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
