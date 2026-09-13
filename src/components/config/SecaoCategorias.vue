<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { useToast } from '@/composables/useToast'
import { useUso } from '@/composables/useUso'
import { novoId } from '@/lib/id'
import { PALETA_SERIES } from '@/lib/seed'
import { useConfigStore } from '@/stores/config'
import type { CategoriaErro } from '@/types'

const config = useConfigStore()
const uso = useUso()
const { mostrar } = useToast()

const nova = ref('')

function adicionar(): void {
  const nome = nova.value.trim()
  if (!nome) return
  const cor = PALETA_SERIES[config.categorias.length % PALETA_SERIES.length] as string
  config.salvarCategoria({ id: novoId(), nome, cor, ativa: true })
  nova.value = ''
  mostrar(`Categoria "${nome}" criada`)
}

function remover(categoria: CategoriaErro): void {
  const total = uso.categoria(categoria.id)
  const aviso = total
    ? `"${categoria.nome}" está em ${total} erro(s) registrado(s). Se só quer tirar do formulário, desmarque "ativa". Apagar mesmo assim?`
    : `Apagar "${categoria.nome}"?`
  if (!confirm(aviso)) return
  config.removerCategoria(categoria.id)
  mostrar(`"${categoria.nome}" removida`)
}
</script>

<template>
  <div>
    <p class="muted intro">
      As categorias que aparecem ao anotar um erro. A cor é a que vai para o gráfico de composição
      dos erros.
    </p>

    <ul class="linhas">
      <li v-for="categoria in config.categorias" :key="categoria.id" class="linha">
        <input v-model="categoria.cor" type="color" :aria-label="`Cor de ${categoria.nome}`" />
        <input v-model="categoria.nome" type="text" :aria-label="`Nome de ${categoria.nome}`" />
        <span class="chip">{{ uso.categoria(categoria.id) }} erros</span>
        <label class="ativa">
          <input v-model="categoria.ativa" type="checkbox" />
          <span>ativa</span>
        </label>
        <button
          type="button"
          class="apagar"
          :aria-label="`Apagar ${categoria.nome}`"
          @click="remover(categoria)"
        >
          <BaseIcon nome="lixeira" :tamanho="16" />
        </button>
      </li>
    </ul>

    <form class="adicionar" @submit.prevent="adicionar">
      <input
        v-model="nova"
        type="text"
        placeholder="Nova categoria (ex.: leu errado o enunciado)"
        aria-label="Nova categoria"
      />
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
