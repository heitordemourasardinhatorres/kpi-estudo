<script setup lang="ts">
import { animate } from 'animejs'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { useToast } from '@/composables/useToast'

const { toasts, dispensar } = useToast()

const reduzida = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function entrar(el: Element, done: () => void): void {
  if (reduzida()) return done()
  animate(el, {
    opacity: [0, 1],
    translateY: [10, 0],
    scale: [0.92, 1],
    duration: 320,
    ease: 'outBack',
    onComplete: done,
  })
}

function sair(el: Element, done: () => void): void {
  if (reduzida()) return done()
  animate(el, {
    opacity: [1, 0],
    scale: [1, 0.94],
    duration: 180,
    ease: 'inQuad',
    onComplete: done,
  })
}
</script>

<template>
  <div class="host" role="status" aria-live="polite">
    <TransitionGroup :css="false" @enter="entrar" @leave="sair">
      <button
        v-for="t in toasts"
        :key="t.id"
        class="toast"
        :class="t.tipo"
        type="button"
        @click="dispensar(t.id)"
      >
        <BaseIcon :nome="t.tipo === 'ok' ? 'check' : 'alerta'" :tamanho="16" />
        <span>{{ t.mensagem }}</span>
      </button>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.host {
  position: fixed;
  z-index: 60;
  bottom: calc(var(--tabbar-h) + var(--s4));
  left: 50%;
  translate: -50% 0;
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  align-items: center;
  pointer-events: none;
}

@media (min-width: 901px) {
  .host {
    bottom: var(--s5);
    left: calc(50% + var(--sidebar-w) / 2);
  }
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: var(--s2);
  padding: 10px 16px;
  border-radius: 99px;
  background: var(--surface-2);
  border: 1px solid var(--border-strong);
  box-shadow: var(--shadow);
  font-size: 0.875rem;
  font-weight: 500;
}

.toast.ok {
  color: var(--brand-bright);
}

.toast.erro {
  color: var(--erro);
}

.toast span {
  color: var(--text);
}
</style>
