<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import BaseIcon from '@/components/base/BaseIcon.vue'

const props = defineProps<{ aberto: boolean; titulo: string }>()
const emit = defineEmits<{ fechar: [] }>()

const dialogo = ref<HTMLDialogElement>()

watch(
  () => props.aberto,
  async (aberto) => {
    await nextTick()
    const el = dialogo.value
    if (!el) return
    if (aberto && !el.open) el.showModal()
    if (!aberto && el.open) el.close()
  },
  { immediate: true },
)

function aoClicarFora(evento: MouseEvent): void {
  if (evento.target === dialogo.value) emit('fechar')
}
</script>

<template>
  <dialog
    ref="dialogo"
    class="modal"
    @click="aoClicarFora"
    @cancel.prevent="emit('fechar')"
    @close="emit('fechar')"
  >
    <div v-if="aberto" class="painel">
      <header>
        <h2>{{ titulo }}</h2>
        <button type="button" class="fechar" aria-label="Fechar" @click="emit('fechar')">
          <BaseIcon nome="x" :tamanho="18" />
        </button>
      </header>
      <div class="corpo"><slot /></div>
      <footer v-if="$slots.rodape"><slot name="rodape" /></footer>
    </div>
  </dialog>
</template>

<style scoped>
.modal {
  padding: 0;
  border: none;
  background: transparent;
  width: min(580px, calc(100vw - 24px));
  max-height: 92dvh;
  color: var(--text);
  overflow: visible;
}

.modal::backdrop {
  background: rgb(3 10 12 / 0.72);
  backdrop-filter: blur(2px);
}

.painel {
  display: flex;
  flex-direction: column;
  max-height: 92dvh;
  background: var(--bg-elev);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  padding: var(--s4) var(--s5);
  border-bottom: 1px solid var(--border);
}

h2 {
  font-size: 1rem;
}

.fechar {
  color: var(--text-dim);
  padding: 4px;
  border-radius: var(--radius-sm);
}

.fechar:hover {
  color: var(--text);
  background: var(--surface-2);
}

.corpo {
  padding: var(--s5);
  overflow-y: auto;
}

footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--s2);
  padding: var(--s4) var(--s5);
  border-top: 1px solid var(--border);
  background: var(--bg);
}
</style>
