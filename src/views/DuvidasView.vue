<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { useDuvidas } from '@/composables/useDuvidas'
import { useReveal } from '@/composables/useReveal'
import { formatarCurto } from '@/lib/date'
import { useConfigStore } from '@/stores/config'
import { useListasStore } from '@/stores/listas'
import { useSimuladosStore } from '@/stores/simulados'
import type { DuvidaComOrigem } from '@/types'

const config = useConfigStore()
const simulados = useSimuladosStore()
const listas = useListasStore()
const { todas, pendentes } = useDuvidas()

const mostrarResolvidas = ref(false)

const visiveis = computed(() => (mostrarResolvidas.value ? todas.value : pendentes.value))

const grupos = computed(() => {
  const mapa = new Map<string, DuvidaComOrigem[]>()
  for (const duvida of visiveis.value) {
    const chave = config.nomeMateria(duvida.materiaId)
    mapa.set(chave, [...(mapa.get(chave) ?? []), duvida])
  }
  return [...mapa.entries()]
    .map(([materia, itens]) => ({
      materia,
      itens: [...itens].sort((a, b) => b.origem.data.localeCompare(a.origem.data)),
    }))
    .sort((a, b) => b.itens.length - a.itens.length)
})

const gruposEl = ref<HTMLElement>()
useReveal(gruposEl, grupos)

function alternar(duvida: DuvidaComOrigem): void {
  if (duvida.origem.tipo === 'simulado') simulados.alternarDuvida(duvida.origem.id, duvida.id)
  else listas.alternarDuvida(duvida.origem.id, duvida.id)
}
</script>

<template>
  <div>
    <header class="pagina-cabecalho">
      <div>
        <h1>Central de dúvidas</h1>
        <p>Tudo que ficou pendente em simulados e listas, junto num lugar só.</p>
      </div>
      <label class="alternador">
        <input v-model="mostrarResolvidas" type="checkbox" />
        <span>mostrar resolvidas</span>
      </label>
    </header>

    <BaseEmpty
      v-if="!visiveis.length"
      icone="duvidas"
      :titulo="mostrarResolvidas ? 'Nenhuma dúvida anotada' : 'Nenhuma dúvida pendente'"
      descricao="As dúvidas que você anotar dentro de um simulado ou lista aparecem aqui."
    />

    <div v-else ref="gruposEl" class="grupos">
      <BaseCard v-for="grupo in grupos" :key="grupo.materia" :titulo="grupo.materia" densa>
        <template #acoes>
          <span class="chip">{{ grupo.itens.length }}</span>
        </template>
        <ul class="duvidas">
          <li v-for="duvida in grupo.itens" :key="duvida.id" :class="{ feita: duvida.resolvida }">
            <button
              type="button"
              class="marcar"
              :class="{ ok: duvida.resolvida }"
              :aria-label="duvida.resolvida ? 'Marcar como pendente' : 'Marcar como resolvida'"
              @click="alternar(duvida)"
            >
              <BaseIcon v-if="duvida.resolvida" nome="check" :tamanho="13" />
            </button>
            <div class="texto">
              <p>
                <span v-if="duvida.questao" class="questao">{{ duvida.questao }}</span>
                {{ duvida.descricao }}
              </p>
              <RouterLink
                :to="`/${duvida.origem.tipo === 'simulado' ? 'simulados' : 'listas'}/${duvida.origem.id}`"
                class="origem"
              >
                {{ duvida.origem.rotulo }} · {{ formatarCurto(duvida.origem.data) }}
              </RouterLink>
            </div>
          </li>
        </ul>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.alternador {
  display: flex;
  align-items: center;
  gap: var(--s2);
  color: var(--text-dim);
  font-size: 0.84rem;
}

.grupos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--s3);
  align-items: start;
}

.duvidas {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}

.duvidas li {
  display: flex;
  gap: var(--s3);
}

.marcar {
  width: 19px;
  height: 19px;
  flex: none;
  margin-top: 2px;
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

.texto p {
  font-size: 0.88rem;
  line-height: 1.45;
}

.feita .texto p {
  color: var(--text-faint);
  text-decoration: line-through;
}

.questao {
  color: var(--brand-bright);
  font-weight: 600;
  margin-right: 4px;
}

.origem {
  display: inline-block;
  margin-top: 2px;
  color: var(--text-faint);
  font-size: 0.76rem;
}

.origem:hover {
  color: var(--brand-bright);
}
</style>
