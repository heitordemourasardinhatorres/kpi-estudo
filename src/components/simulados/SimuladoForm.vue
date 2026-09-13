<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseField from '@/components/base/BaseField.vue'
import { hojeISO } from '@/lib/date'
import { novoId } from '@/lib/id'
import { useConfigStore } from '@/stores/config'
import { useSimuladosStore } from '@/stores/simulados'
import type { ID, ResultadoArea, Simulado } from '@/types'

const props = defineProps<{ simulado?: Simulado }>()
const emit = defineEmits<{ salvar: [simulado: Simulado]; cancelar: [] }>()

const config = useConfigStore()
const simulados = useSimuladosStore()

interface RascunhoArea {
  acertos: number | null
  total: number | null
  nota: number | null
  notaMaxima: number | null
}

/** Prefill do total de questões com o último simulado: ela repete as mesmas provas. */
const ultimo = computed(() => simulados.recentes[0])

function rascunhoInicial(): Record<ID, RascunhoArea> {
  const mapa: Record<ID, RascunhoArea> = {}
  for (const area of config.areasOrdenadas) {
    const existente = props.simulado?.resultados.find((r) => r.areaId === area.id)
    const anterior = ultimo.value?.resultados.find((r) => r.areaId === area.id)
    mapa[area.id] = {
      acertos: existente?.tipo === 'acertos' ? existente.acertos : null,
      total:
        existente?.tipo === 'acertos'
          ? existente.total
          : props.simulado
            ? null
            : (anterior?.tipo === 'acertos' ? anterior.total : null),
      nota: existente?.tipo === 'nota' ? existente.nota : null,
      notaMaxima:
        existente?.tipo === 'nota' ? existente.notaMaxima : (area.notaMaximaPadrao ?? 10),
    }
  }
  return mapa
}

const form = reactive({
  bancaId: props.simulado?.bancaId ?? config.bancasAtivas[0]?.id ?? '',
  ano: props.simulado?.ano ?? new Date().getFullYear() - 1,
  fase: props.simulado?.fase ?? '1ª fase',
  data: props.simulado?.data ?? hojeISO(),
  duracaoMin: props.simulado?.duracaoMin ?? null,
  observacao: props.simulado?.observacao ?? '',
})

const areas = reactive(rascunhoInicial())
const erro = ref('')

const resultados = computed<ResultadoArea[]>(() => {
  const saida: ResultadoArea[] = []
  for (const area of config.areasOrdenadas) {
    const r = areas[area.id]
    if (!r) continue
    if (area.avaliacao === 'acertos') {
      if (r.total && r.total > 0) {
        saida.push({ areaId: area.id, tipo: 'acertos', acertos: r.acertos ?? 0, total: r.total })
      }
    } else if (r.nota !== null && r.notaMaxima) {
      saida.push({ areaId: area.id, tipo: 'nota', nota: r.nota, notaMaxima: r.notaMaxima })
    }
  }
  return saida
})

const meta = computed(() => config.metaAlvo(form.bancaId))

function salvar(): void {
  if (!form.bancaId) {
    erro.value = 'Escolha a banca.'
    return
  }
  if (!resultados.value.length) {
    erro.value = 'Preencha pelo menos uma área (o total de questões é obrigatório).'
    return
  }
  emit('salvar', {
    id: props.simulado?.id ?? novoId(),
    bancaId: form.bancaId,
    ano: form.ano,
    fase: form.fase.trim() || undefined,
    data: form.data,
    duracaoMin: form.duracaoMin ?? undefined,
    resultados: resultados.value,
    erros: props.simulado?.erros ?? [],
    duvidas: props.simulado?.duvidas ?? [],
    observacao: form.observacao.trim() || undefined,
  })
}
</script>

<template>
  <form @submit.prevent="salvar">
    <div class="grade">
      <BaseField rotulo="Banca">
        <select v-model="form.bancaId">
          <option v-for="banca in config.bancasAtivas" :key="banca.id" :value="banca.id">
            {{ banca.nome }}
          </option>
        </select>
      </BaseField>
      <BaseField rotulo="Ano da prova">
        <input v-model.number="form.ano" type="number" min="1990" max="2100" />
      </BaseField>
      <BaseField rotulo="Fase" dica="rótulo livre">
        <input v-model="form.fase" type="text" list="fases" placeholder="1ª fase" />
        <datalist id="fases">
          <option value="1ª fase" />
          <option value="2ª fase" />
          <option value="dia 1" />
          <option value="dia 2" />
        </datalist>
      </BaseField>
      <BaseField rotulo="Quando você fez">
        <input v-model="form.data" type="date" />
      </BaseField>
      <BaseField rotulo="Tempo gasto" dica="minutos">
        <input v-model.number="form.duracaoMin" type="number" min="0" placeholder="270" />
      </BaseField>
    </div>

    <p v-if="meta" class="meta">
      Meta desta banca: corte de {{ meta.notaCorte }}/{{ meta.escalaMaxima }} em
      {{ meta.ano }}{{ meta.curso ? ` · ${meta.curso}` : '' }}
    </p>

    <h3 class="titulo-areas">Nota por área</h3>
    <div class="areas">
      <div v-for="area in config.areasOrdenadas" :key="area.id" class="area">
        <span class="nome">
          <span class="ponto-cor" :style="{ background: area.cor }" />
          {{ area.nome }}
        </span>
        <template v-if="area.avaliacao === 'acertos'">
          <input
            v-model.number="areas[area.id]!.acertos"
            type="number"
            min="0"
            placeholder="acertos"
            :aria-label="`Acertos em ${area.nome}`"
          />
          <span class="barra">/</span>
          <input
            v-model.number="areas[area.id]!.total"
            type="number"
            min="0"
            placeholder="total"
            :aria-label="`Total de questões em ${area.nome}`"
          />
        </template>
        <template v-else>
          <input
            v-model.number="areas[area.id]!.nota"
            type="number"
            min="0"
            step="0.25"
            placeholder="nota"
            :aria-label="`Nota em ${area.nome}`"
          />
          <span class="barra">/</span>
          <input
            v-model.number="areas[area.id]!.notaMaxima"
            type="number"
            min="1"
            step="0.5"
            :aria-label="`Nota máxima em ${area.nome}`"
          />
        </template>
      </div>
    </div>

    <BaseField rotulo="Observação" dica="opcional">
      <textarea v-model="form.observacao" placeholder="Como foi a prova?" />
    </BaseField>

    <p v-if="erro" class="aviso">{{ erro }}</p>

    <footer>
      <BaseButton variante="fantasma" @click="emit('cancelar')">Cancelar</BaseButton>
      <BaseButton tipo="submit" variante="primario" icone="check">
        {{ props.simulado ? 'Salvar' : 'Registrar simulado' }}
      </BaseButton>
    </footer>
  </form>
</template>

<style scoped>
.grade {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: var(--s3);
}

.meta {
  margin-top: var(--s3);
  font-size: 0.8rem;
  color: var(--duvida);
}

.titulo-areas {
  margin: var(--s5) 0 var(--s3);
  color: var(--text-dim);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.areas {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: var(--s5);
}

.area {
  display: flex;
  align-items: center;
  gap: var(--s2);
  padding: 6px 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.nome {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--s2);
  font-size: 0.88rem;
}

.area input {
  width: 74px;
  text-align: center;
  background: var(--bg);
}

.barra {
  color: var(--text-faint);
}

.aviso {
  margin-top: var(--s3);
  color: var(--erro);
  font-size: 0.84rem;
}

footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--s2);
  margin-top: var(--s5);
}
</style>
