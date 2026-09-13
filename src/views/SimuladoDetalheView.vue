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
import SimuladoForm from '@/components/simulados/SimuladoForm.vue'
import { useToast } from '@/composables/useToast'
import { formatarCompleto, formatarDuracao } from '@/lib/date'
import { pct } from '@/lib/format'
import { percentual, percentualSimulado } from '@/lib/metrics'
import { useConfigStore } from '@/stores/config'
import { useSimuladosStore } from '@/stores/simulados'
import type { Simulado } from '@/types'

const props = defineProps<{ id: string }>()

const router = useRouter()
const config = useConfigStore()
const simulados = useSimuladosStore()
const { mostrar } = useToast()

const editando = ref(false)

const simulado = computed(() => simulados.porId(props.id))
const geral = computed(() => (simulado.value ? percentualSimulado(simulado.value) : null))
const meta = computed(() => config.metaAlvo(simulado.value?.bancaId))
const corte = computed(() => (meta.value ? meta.value.notaCorte / meta.value.escalaMaxima : null))

const comId = <T extends unknown[]>(acao: (id: string, ...args: T) => void) => {
  return (...args: T) => {
    if (simulado.value) acao(simulado.value.id, ...args)
  }
}

const adicionarErro = comId(simulados.adicionarErro)
const removerErro = comId(simulados.removerErro)
const erroRapido = comId(simulados.ajustarErroRapido)
const adicionarDuvida = comId(simulados.adicionarDuvida)
const alternarDuvida = comId(simulados.alternarDuvida)
const removerDuvida = comId(simulados.removerDuvida)

function salvarEdicao(atualizado: Simulado): void {
  simulados.salvar(atualizado)
  editando.value = false
  mostrar('Simulado atualizado')
}

function apagar(): void {
  if (!simulado.value) return
  if (!confirm(`Apagar ${config.rotuloSimulado(simulado.value)} com seus erros e dúvidas?`)) return
  simulados.remover(simulado.value.id)
  mostrar('Simulado apagado')
  router.push('/simulados')
}
</script>

<template>
  <div v-if="simulado">
    <RouterLink to="/simulados" class="voltar">
      <BaseIcon nome="voltar" :tamanho="16" />
      Simulados
    </RouterLink>

    <header class="pagina-cabecalho">
      <div>
        <h1>{{ config.rotuloSimulado(simulado) }}</h1>
        <p>
          {{ formatarCompleto(simulado.data) }}
          <template v-if="simulado.duracaoMin"> · {{ formatarDuracao(simulado.duracaoMin) }}</template>
        </p>
      </div>
      <div class="acoes">
        <BaseButton icone="lapis" @click="editando = true">Editar</BaseButton>
        <BaseButton variante="perigo" icone="lixeira" @click="apagar">Apagar</BaseButton>
      </div>
    </header>

    <BaseCard class="bloco">
      <div class="resultado-geral">
        <div>
          <span class="rotulo">Aproveitamento</span>
          <strong class="valor">{{ pct(geral) }}</strong>
        </div>
        <p v-if="corte !== null" class="corte" :class="{ acima: (geral ?? 0) >= corte }">
          {{ (geral ?? 0) >= corte ? 'Acima' : 'Abaixo' }} do corte de {{ pct(corte, 0) }}
          ({{ config.nomeBanca(simulado.bancaId) }} {{ meta?.ano }})
        </p>
      </div>

      <ul class="areas">
        <li v-for="resultado in simulado.resultados" :key="resultado.areaId">
          <span class="nome">{{ config.nomeArea(resultado.areaId) }}</span>
          <span class="bruto">
            {{ resultado.tipo === 'acertos' ? `${resultado.acertos}/${resultado.total}` : `${resultado.nota}/${resultado.notaMaxima}` }}
          </span>
          <span class="trilho">
            <span
              class="preenchido"
              :style="{
                width: `${percentual(resultado) * 100}%`,
                background: config.mapaAreas.get(resultado.areaId)?.cor,
              }"
            />
          </span>
          <span class="pct">{{ pct(percentual(resultado), 0) }}</span>
        </li>
      </ul>

      <p v-if="simulado.observacao" class="observacao">{{ simulado.observacao }}</p>
    </BaseCard>

    <BaseCard titulo="Erros" class="bloco">
      <ErroEditor
        :erros="simulado.erros"
        @adicionar="adicionarErro"
        @remover="removerErro"
        @rapido="erroRapido"
      />
    </BaseCard>

    <BaseCard titulo="Dúvidas">
      <DuvidaEditor
        :duvidas="simulado.duvidas"
        @adicionar="adicionarDuvida"
        @alternar="alternarDuvida"
        @remover="removerDuvida"
      />
    </BaseCard>

    <BaseModal :aberto="editando" titulo="Editar simulado" @fechar="editando = false">
      <SimuladoForm :simulado="simulado" @salvar="salvarEdicao" @cancelar="editando = false" />
    </BaseModal>
  </div>

  <BaseEmpty v-else icone="simulados" titulo="Simulado não encontrado" descricao="Ele pode ter sido apagado.">
    <BaseButton @click="router.push('/simulados')">Voltar para simulados</BaseButton>
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

.resultado-geral {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--s3);
  padding-bottom: var(--s4);
  margin-bottom: var(--s4);
  border-bottom: 1px solid var(--border);
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

.corte {
  font-size: 0.85rem;
  color: var(--duvida);
}

.corte.acima {
  color: var(--acerto);
}

.areas {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}

.areas li {
  display: flex;
  align-items: center;
  gap: var(--s3);
}

.nome {
  width: 104px;
  flex: none;
  font-size: 0.88rem;
}

.bruto {
  width: 62px;
  flex: none;
  text-align: right;
  color: var(--text-dim);
  font-size: 0.84rem;
}

.trilho {
  flex: 1;
  height: 7px;
  border-radius: 99px;
  background: var(--surface-2);
  overflow: hidden;
}

.preenchido {
  display: block;
  height: 100%;
  border-radius: 99px;
}

.pct {
  width: 44px;
  flex: none;
  text-align: right;
  font-size: 0.84rem;
  font-weight: 600;
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

@media (max-width: 560px) {
  .nome {
    width: 80px;
    font-size: 0.82rem;
  }
}
</style>
