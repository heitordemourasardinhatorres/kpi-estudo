<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import KpiCard from '@/components/base/KpiCard.vue'
import BarRankFracos from '@/components/charts/BarRankFracos.vue'
import LineEvolucao from '@/components/charts/LineEvolucao.vue'
import type { SerieLinha } from '@/components/charts/tipos'
import { useReveal } from '@/composables/useReveal'
import { diasDesde } from '@/lib/date'
import { num, pct, pontosPercentuais } from '@/lib/format'
import { calcularKpis, evolucaoSimulados, rankPontosFracos } from '@/lib/metrics'
import { useConfigStore } from '@/stores/config'
import { useListasStore } from '@/stores/listas'
import { useSimuladosStore } from '@/stores/simulados'

const config = useConfigStore()
const simulados = useSimuladosStore()
const listas = useListasStore()

const vazio = computed(() => !simulados.itens.length && !listas.itens.length)

const kpis = computed(() => calcularKpis(simulados.itens, listas.itens, config.materias))
const rank = computed(() => rankPontosFracos(simulados.itens, listas.itens, config.materias))

const series = computed<SerieLinha[]>(() => [
  { nome: 'Total', cor: '#1094ab', pontos: evolucaoSimulados(simulados.itens, config.rotuloSimulado) },
])

/** Corte da banca que ela mais treina nos últimos simulados — a meta que está valendo. */
const bancaPrincipal = computed(() => {
  const contagem = new Map<string, number>()
  for (const s of simulados.recentes.slice(0, 6)) {
    contagem.set(s.bancaId, (contagem.get(s.bancaId) ?? 0) + 1)
  }
  return [...contagem.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
})

const meta = computed(() => config.metaAlvo(bancaPrincipal.value))
const corte = computed(() => (meta.value ? meta.value.notaCorte / meta.value.escalaMaxima : null))

const kpisEl = ref<HTMLElement>()
useReveal(kpisEl)

const diasBackup = computed(() => diasDesde(config.preferencias.ultimoBackupEm))
const avisarBackup = computed(
  () => !vazio.value && (diasBackup.value === null || diasBackup.value > 14),
)
</script>

<template>
  <div>
    <header class="pagina-cabecalho">
      <div>
        <h1>Oi, Juju 👋</h1>
        <p>O resumo de como você está indo.</p>
      </div>
      <div class="atalhos">
        <RouterLink to="/simulados">
          <BaseButton variante="primario" icone="mais">Simulado</BaseButton>
        </RouterLink>
        <RouterLink to="/listas">
          <BaseButton icone="mais">Lista</BaseButton>
        </RouterLink>
      </div>
    </header>

    <BaseEmpty
      v-if="vazio"
      icone="tendencia"
      titulo="Ainda não tem nada registrado"
      descricao="Comece registrando um simulado ou uma lista de questões. Se quiser ver como o site fica cheio, carregue os dados de exemplo nas configurações."
    >
      <RouterLink to="/simulados">
        <BaseButton variante="primario" icone="mais">Registrar primeiro simulado</BaseButton>
      </RouterLink>
    </BaseEmpty>

    <template v-else>
      <RouterLink v-if="avisarBackup" to="/configuracoes" class="backup">
        <BaseIcon nome="alerta" :tamanho="17" />
        <span>
          {{
            diasBackup === null
              ? 'Você nunca exportou um backup. Limpar o navegador apaga tudo.'
              : `Último backup há ${diasBackup} dias. Vale exportar de novo.`
          }}
        </span>
        <BaseIcon nome="chevron" :tamanho="15" />
      </RouterLink>

      <div ref="kpisEl" class="kpis">
        <KpiCard
          rotulo="Média dos últimos 3"
          :valor="pct(kpis.mediaUltimos3)"
          :delta="kpis.delta !== null ? pontosPercentuais(kpis.delta) : undefined"
          :delta-positivo="(kpis.delta ?? 0) >= 0"
          detalhe="vs. 3 anteriores"
          icone="tendencia"
        />
        <KpiCard
          rotulo="Simulados feitos"
          :valor="num(kpis.totalSimulados)"
          :detalhe="`${listas.itens.length} listas`"
          icone="simulados"
        />
        <KpiCard
          rotulo="Questões resolvidas"
          :valor="num(kpis.totalQuestoes)"
          :detalhe="`${pct(kpis.percAcertoGeral)} de acerto`"
          icone="listas"
        />
        <KpiCard
          rotulo="Ponto mais fraco"
          :valor="kpis.materiaMaisFraca?.materia.nome ?? '—'"
          :detalhe="
            kpis.materiaMaisFraca ? `${kpis.materiaMaisFraca.erros} erros anotados` : 'sem erros anotados'
          "
          icone="alvo"
        />
      </div>

      <div class="conteudo">
        <BaseCard titulo="Evolução da nota nos simulados">
          <LineEvolucao :series="series" :corte="corte" :altura="330" />
          <p v-if="meta" class="legenda-corte">
            Linha tracejada: corte de {{ config.nomeBanca(meta.bancaId) }} {{ meta.ano
            }}{{ meta.curso ? ` · ${meta.curso}` : '' }}
          </p>
        </BaseCard>

        <BaseCard titulo="Onde você mais erra">
          <BarRankFracos :itens="rank.itens" :limite="8" />
          <p v-if="rank.errosSemMateria" class="nota">
            {{ rank.errosSemMateria }} erro(s) sem matéria não entram neste ranking.
          </p>
          <RouterLink v-if="kpis.duvidasPendentes" to="/duvidas" class="link-duvidas">
            {{ kpis.duvidasPendentes }} dúvida(s) pendente(s)
            <BaseIcon nome="chevron" :tamanho="14" />
          </RouterLink>
        </BaseCard>
      </div>
    </template>
  </div>
</template>

<style scoped>
.atalhos {
  display: flex;
  gap: var(--s2);
}

.backup {
  display: flex;
  align-items: center;
  gap: var(--s3);
  padding: var(--s3) var(--s4);
  margin-bottom: var(--s4);
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--duvida) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--duvida) 32%, transparent);
  color: var(--duvida);
  font-size: 0.85rem;
}

.backup span {
  flex: 1;
  color: var(--text);
}

.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--s3);
  margin-bottom: var(--s5);
}

.conteudo {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
  gap: var(--s4);
  align-items: start;
}

@media (max-width: 900px) {
  .conteudo {
    grid-template-columns: 1fr;
  }
}

.legenda-corte,
.nota {
  margin-top: var(--s3);
  color: var(--text-faint);
  font-size: 0.78rem;
}

.link-duvidas {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: var(--s3);
  font-size: 0.84rem;
  font-weight: 500;
}
</style>
