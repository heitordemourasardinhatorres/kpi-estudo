<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import DuvidaEditor from '@/components/duvidas/DuvidaEditor.vue'
import ErroEditor from '@/components/erros/ErroEditor.vue'
import ListaForm from '@/components/listas/ListaForm.vue'
import { useToast } from '@/composables/useToast'
import { formatarCompleto, formatarDuracao } from '@/lib/date'
import { pct } from '@/lib/format'
import { percentualLista } from '@/lib/metrics'
import { useConfigStore } from '@/stores/config'
import { useListasStore } from '@/stores/listas'
import type { Lista } from '@/types'

const props = defineProps<{ id: string }>()

const router = useRouter()
const config = useConfigStore()
const listas = useListasStore()
const { mostrar } = useToast()

const editando = ref(false)

const lista = computed(() => listas.porId(props.id))
const aproveitamento = computed(() => (lista.value ? percentualLista(lista.value) : null))

const comId = <T extends unknown[]>(acao: (id: string, ...args: T) => void) => {
  return (...args: T) => {
    if (lista.value) acao(lista.value.id, ...args)
  }
}

const adicionarErro = comId(listas.adicionarErro)
const removerErro = comId(listas.removerErro)
const erroRapido = comId(listas.ajustarErroRapido)
const adicionarDuvida = comId(listas.adicionarDuvida)
const alternarDuvida = comId(listas.alternarDuvida)
const removerDuvida = comId(listas.removerDuvida)

function salvarEdicao(atualizada: Lista): void {
  listas.salvar(atualizada)
  editando.value = false
  mostrar('Lista atualizada')
}

function apagar(): void {
  if (!lista.value) return
  if (!confirm(`Apagar "${lista.value.titulo}" com seus erros e dúvidas?`)) return
  listas.remover(lista.value.id)
  mostrar('Lista apagada')
  router.push('/listas')
}
</script>

<template>
  <div v-if="lista">
    <RouterLink to="/listas" class="voltar">
      <BaseIcon nome="voltar" :tamanho="16" />
      Listas
    </RouterLink>

    <header class="pagina-cabecalho">
      <div>
        <h1>{{ lista.titulo }}</h1>
        <p>
          {{ formatarCompleto(lista.data) }}
          <template v-if="lista.materiaId"> · {{ config.nomeMateria(lista.materiaId) }}</template>
          <template v-if="lista.topico"> · {{ lista.topico }}</template>
          <template v-if="lista.duracaoMin"> · {{ formatarDuracao(lista.duracaoMin) }}</template>
        </p>
      </div>
      <div class="acoes">
        <BaseButton icone="lapis" @click="editando = true">Editar</BaseButton>
        <BaseButton variante="perigo" icone="lixeira" @click="apagar">Apagar</BaseButton>
      </div>
    </header>

    <BaseCard class="bloco">
      <div class="resumo">
        <div>
          <span class="rotulo">Aproveitamento</span>
          <strong class="valor">{{ pct(aproveitamento) }}</strong>
        </div>
        <p class="bruto">{{ lista.acertos }} de {{ lista.totalQuestoes }} questões</p>
      </div>
      <span class="trilho">
        <span class="preenchido" :style="{ width: `${(aproveitamento ?? 0) * 100}%` }" />
      </span>
      <p v-if="lista.observacao" class="observacao">{{ lista.observacao }}</p>
    </BaseCard>

    <BaseCard titulo="Erros" class="bloco">
      <ErroEditor
        :erros="lista.erros"
        @adicionar="adicionarErro"
        @remover="removerErro"
        @rapido="erroRapido"
      />
    </BaseCard>

    <BaseCard titulo="Dúvidas">
      <DuvidaEditor
        :duvidas="lista.duvidas"
        @adicionar="adicionarDuvida"
        @alternar="alternarDuvida"
        @remover="removerDuvida"
      />
    </BaseCard>

    <BaseModal :aberto="editando" titulo="Editar lista" @fechar="editando = false">
      <ListaForm :lista="lista" @salvar="salvarEdicao" @cancelar="editando = false" />
    </BaseModal>
  </div>

  <BaseEmpty v-else icone="listas" titulo="Lista não encontrada" descricao="Ela pode ter sido apagada.">
    <BaseButton @click="router.push('/listas')">Voltar para listas</BaseButton>
  </BaseEmpty>
</template>

<style scoped>
.voltar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: var(--s3);
  color: var(--text-dim);
  font-size: 0.85rem;
}

.voltar:hover {
  color: var(--brand-bright);
}

.acoes {
  display: flex;
  gap: var(--s2);
}

.bloco {
  margin-bottom: var(--s4);
}

.resumo {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s3);
  margin-bottom: var(--s3);
}

.rotulo {
  display: block;
  color: var(--text-dim);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.valor {
  font-family: var(--font-display);
  font-size: 2.1rem;
  font-variant-numeric: normal;
}

.bruto {
  color: var(--text-dim);
  font-size: 0.88rem;
}

.trilho {
  display: block;
  height: 8px;
  border-radius: 99px;
  background: var(--surface-2);
  overflow: hidden;
}

.preenchido {
  display: block;
  height: 100%;
  border-radius: 99px;
  background: var(--brand);
}

.observacao {
  margin-top: var(--s4);
  padding: var(--s3);
  background: var(--surface);
  border-left: 2px solid var(--border-strong);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  color: var(--text-dim);
  font-size: 0.86rem;
}
</style>
