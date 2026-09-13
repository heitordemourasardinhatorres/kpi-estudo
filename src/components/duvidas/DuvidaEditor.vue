<script setup lang="ts">
import { computed, reactive } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import SelectMateria from '@/components/base/SelectMateria.vue'
import { useConfigStore } from '@/stores/config'
import type { Duvida, ID } from '@/types'

const props = defineProps<{ duvidas: Duvida[] }>()
const emit = defineEmits<{
  adicionar: [duvida: { descricao: string; questao?: string; materiaId?: ID }]
  alternar: [id: ID]
  remover: [id: ID]
}>()

const config = useConfigStore()

const ordenadas = computed(() =>
  [...props.duvidas].sort((a, b) => Number(a.resolvida) - Number(b.resolvida)),
)
const pendentes = computed(() => props.duvidas.filter((d) => !d.resolvida).length)

const nova = reactive<{ questao: string; descricao: string; materiaId: ID | undefined }>({
  questao: '',
  descricao: '',
  materiaId: undefined,
})

function adicionar(): void {
  const descricao = nova.descricao.trim()
  if (!descricao) return
  emit('adicionar', {
    descricao,
    questao: nova.questao.trim() || undefined,
    materiaId: nova.materiaId,
  })
  nova.questao = ''
  nova.descricao = ''
}
</script>

<template>
  <div>
    <p v-if="pendentes" class="muted contagem">{{ pendentes }} pendente(s)</p>

    <ul v-if="ordenadas.length" class="linhas">
      <li v-for="duvida in ordenadas" :key="duvida.id" class="linha" :class="{ feita: duvida.resolvida }">
        <button
          type="button"
          class="marcar"
          :class="{ ok: duvida.resolvida }"
          :aria-label="duvida.resolvida ? 'Marcar como pendente' : 'Marcar como resolvida'"
          @click="emit('alternar', duvida.id)"
        >
          <BaseIcon v-if="duvida.resolvida" nome="check" :tamanho="13" />
        </button>
        <span v-if="duvida.questao" class="questao">{{ duvida.questao }}</span>
        <input v-model="duvida.descricao" type="text" aria-label="Descrição da dúvida" />
        <span v-if="duvida.materiaId" class="chip">{{ config.nomeMateria(duvida.materiaId) }}</span>
        <button type="button" class="apagar" aria-label="Apagar dúvida" @click="emit('remover', duvida.id)">
          <BaseIcon nome="x" :tamanho="15" />
        </button>
      </li>
    </ul>
    <p v-else class="muted vazio">Nenhuma dúvida anotada.</p>

    <form class="novo" @submit.prevent="adicionar">
      <input v-model="nova.questao" type="text" class="questao-input" placeholder="Q12" aria-label="Questão" />
      <input
        v-model="nova.descricao"
        type="text"
        class="descricao"
        placeholder="qual é a dúvida?"
        aria-label="Descrição da dúvida"
      />
      <SelectMateria v-model="nova.materiaId" />
      <BaseButton tipo="submit" variante="primario" tamanho="sm" icone="mais">Anotar</BaseButton>
    </form>
  </div>
</template>

<style scoped>
.contagem {
  font-size: 0.82rem;
  margin-bottom: var(--s3);
}

.vazio {
  font-size: 0.85rem;
  padding: var(--s3) 0;
}

.linha input[type='text'] {
  flex: 1;
}

.feita input {
  color: var(--text-faint);
  text-decoration: line-through;
}

.marcar {
  width: 19px;
  height: 19px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 6px;
  border: 1.5px solid var(--border-strong);
  color: var(--on-brand);
}

.marcar.ok {
  background: var(--acerto);
  border-color: var(--acerto);
}

.questao {
  font-weight: 600;
  font-size: 0.82rem;
  color: var(--brand-bright);
  white-space: nowrap;
}

.novo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s2);
  margin-top: var(--s3);
  padding-top: var(--s3);
  border-top: 1px dashed var(--border);
}

.questao-input {
  width: 62px;
  flex: none;
  text-align: center;
}

.descricao {
  flex: 1;
  min-width: 150px;
}

select {
  width: auto;
  min-width: 108px;
  padding: 5px 26px 5px 9px;
  font-size: 0.82rem;
  background-position: calc(100% - 14px) 14px, calc(100% - 9px) 14px;
}

.apagar {
  color: var(--text-faint);
  padding: 4px;
  border-radius: var(--radius-sm);
}

.apagar:hover {
  color: var(--erro);
  background: color-mix(in srgb, var(--erro) 14%, transparent);
}
</style>
