<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { useToast } from '@/composables/useToast'
import { useUso } from '@/composables/useUso'
import { novoId } from '@/lib/id'
import { useConfigStore } from '@/stores/config'
import type { Banca } from '@/types'

const config = useConfigStore()
const uso = useUso()
const { mostrar } = useToast()

const nova = ref('')

function adicionar(): void {
  const nome = nova.value.trim()
  if (!nome) return
  config.salvarBanca({ id: novoId(), nome, ativa: true })
  nova.value = ''
  mostrar(`${nome} cadastrada`)
}

function remover(banca: Banca): void {
  const total = uso.banca(banca.id)
  const aviso = total
    ? `${banca.nome} está em ${total} simulado(s). Apagar a banca não apaga os simulados, mas eles ficam sem nome. Continuar?`
    : `Apagar ${banca.nome}?`
  if (!confirm(aviso)) return
  config.removerBanca(banca.id)
  mostrar(`${banca.nome} removida`)
}
</script>

<template>
  <div>
    <p class="muted intro">
      Bancas e locais de prova. Desmarcar "ativa" tira a banca do formulário sem apagar o histórico.
    </p>

    <ul class="linhas">
      <li v-for="banca in config.bancas" :key="banca.id" class="linha">
        <input v-model="banca.nome" type="text" :aria-label="`Nome da banca ${banca.nome}`" />
        <span class="chip">{{ uso.banca(banca.id) }} simulados</span>
        <label class="ativa">
          <input v-model="banca.ativa" type="checkbox" />
          <span>ativa</span>
        </label>
        <button type="button" class="apagar" :aria-label="`Apagar ${banca.nome}`" @click="remover(banca)">
          <BaseIcon nome="lixeira" :tamanho="16" />
        </button>
      </li>
    </ul>

    <form class="adicionar" @submit.prevent="adicionar">
      <input v-model="nova" type="text" placeholder="Nova banca (ex.: ITA)" aria-label="Nova banca" />
      <BaseButton tipo="submit" variante="primario" icone="mais">Adicionar</BaseButton>
    </form>
  </div>
</template>

<style scoped>
.intro {
  font-size: 0.85rem;
  margin-bottom: var(--s4);
}

.linha input[type='text'] {
  flex: 1;
}

.ativa {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-dim);
  white-space: nowrap;
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
