<script setup lang="ts">
import { reactive } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseField from '@/components/base/BaseField.vue'
import { useToast } from '@/composables/useToast'
import { pct } from '@/lib/format'
import { novoId } from '@/lib/id'
import { useConfigStore } from '@/stores/config'
import type { Meta } from '@/types'

const config = useConfigStore()
const { mostrar } = useToast()

const nova = reactive({
  bancaId: config.bancasAtivas[0]?.id ?? '',
  ano: new Date().getFullYear(),
  curso: '',
  notaCorte: 0,
  escalaMaxima: 90,
})

function adicionar(): void {
  if (!nova.bancaId || nova.notaCorte <= 0 || nova.escalaMaxima <= 0) return
  config.salvarMeta({
    id: novoId(),
    bancaId: nova.bancaId,
    ano: nova.ano,
    curso: nova.curso.trim() || undefined,
    notaCorte: nova.notaCorte,
    escalaMaxima: nova.escalaMaxima,
  })
  nova.curso = ''
  nova.notaCorte = 0
  mostrar('Meta cadastrada')
}

function remover(meta: Meta): void {
  config.removerMeta(meta.id)
  mostrar('Meta removida')
}
</script>

<template>
  <div>
    <p class="muted intro">
      A nota de corte vira a linha tracejada no gráfico de evolução. O site compara em percentual,
      então informe o corte e o total da prova (ex.: 78 de 90).
    </p>

    <ul v-if="config.metas.length" class="linhas">
      <li v-for="meta in config.metas" :key="meta.id" class="linha">
        <strong>{{ config.nomeBanca(meta.bancaId) }} {{ meta.ano }}</strong>
        <span v-if="meta.curso" class="chip">{{ meta.curso }}</span>
        <span class="corte">{{ meta.notaCorte }} / {{ meta.escalaMaxima }}</span>
        <span class="percentual">{{ pct(meta.notaCorte / meta.escalaMaxima) }}</span>
        <button type="button" class="apagar" aria-label="Apagar meta" @click="remover(meta)">
          <BaseIcon nome="lixeira" :tamanho="16" />
        </button>
      </li>
    </ul>
    <p v-else class="muted vazio">Nenhuma meta cadastrada.</p>

    <form class="form" @submit.prevent="adicionar">
      <BaseField rotulo="Banca">
        <select v-model="nova.bancaId">
          <option v-for="banca in config.bancasAtivas" :key="banca.id" :value="banca.id">
            {{ banca.nome }}
          </option>
        </select>
      </BaseField>
      <BaseField rotulo="Ano">
        <input v-model.number="nova.ano" type="number" min="2000" max="2100" />
      </BaseField>
      <BaseField rotulo="Curso" dica="opcional">
        <input v-model="nova.curso" type="text" placeholder="Medicina" />
      </BaseField>
      <BaseField rotulo="Nota de corte">
        <input v-model.number="nova.notaCorte" type="number" min="0" step="0.1" />
      </BaseField>
      <BaseField rotulo="Total da prova">
        <input v-model.number="nova.escalaMaxima" type="number" min="1" step="0.1" />
      </BaseField>
      <BaseButton tipo="submit" variante="primario" icone="alvo">Cadastrar</BaseButton>
    </form>
  </div>
</template>

<style scoped>
.intro {
  font-size: 0.85rem;
  margin-bottom: var(--s4);
}

.vazio {
  font-size: 0.85rem;
}

.linha strong {
  font-size: 0.9rem;
}

.corte {
  margin-left: auto;
  color: var(--text-dim);
  font-size: 0.85rem;
}

.percentual {
  color: var(--duvida);
  font-weight: 600;
  font-size: 0.85rem;
  min-width: 56px;
  text-align: right;
}

.form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  align-items: end;
  gap: var(--s3);
  margin-top: var(--s5);
  padding-top: var(--s5);
  border-top: 1px solid var(--border);
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
