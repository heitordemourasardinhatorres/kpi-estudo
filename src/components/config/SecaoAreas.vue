<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { useToast } from '@/composables/useToast'
import { useUso } from '@/composables/useUso'
import { novoId } from '@/lib/id'
import { PALETA_SERIES } from '@/lib/seed'
import { useConfigStore } from '@/stores/config'
import type { Area, ID, Materia } from '@/types'

const config = useConfigStore()
const uso = useUso()
const { mostrar } = useToast()

const novaArea = ref('')
const novaMateria = ref<Record<ID, string>>({})

function adicionarArea(): void {
  const nome = novaArea.value.trim()
  if (!nome) return
  const cor = PALETA_SERIES[config.areas.length % PALETA_SERIES.length] as string
  config.salvarArea({
    id: novoId(),
    nome,
    cor,
    ordem: config.areas.length + 1,
    avaliacao: 'acertos',
  })
  novaArea.value = ''
  mostrar(`Área "${nome}" criada`)
}

function removerArea(area: Area): void {
  const total = uso.area(area.id)
  const materias = config.materiasDaArea(area.id).length
  const aviso = total
    ? `"${area.nome}" aparece em ${total} simulado(s) e tem ${materias} matéria(s). Apagar mesmo assim?`
    : `Apagar "${area.nome}" e suas ${materias} matéria(s)?`
  if (!confirm(aviso)) return
  config.removerArea(area.id)
  mostrar(`"${area.nome}" removida`)
}

function adicionarMateria(areaId: ID): void {
  const nome = (novaMateria.value[areaId] ?? '').trim()
  if (!nome) return
  config.salvarMateria({ id: novoId(), nome, areaId })
  novaMateria.value[areaId] = ''
}

function removerMateria(materia: Materia): void {
  const total = uso.materia(materia.id)
  const aviso = total
    ? `"${materia.nome}" está em ${total} registro(s). Apagar mesmo assim?`
    : `Apagar "${materia.nome}"?`
  if (!confirm(aviso)) return
  config.removerMateria(materia.id)
}
</script>

<template>
  <div>
    <p class="muted intro">
      As áreas viram as notas do simulado e os eixos do radar. As matérias são o que amarra um erro
      a um ponto fraco — sem elas, o ranking fica vazio.
    </p>

    <div class="areas">
      <article v-for="area in config.areasOrdenadas" :key="area.id" class="area">
        <header class="linha">
          <input v-model="area.cor" type="color" :aria-label="`Cor de ${area.nome}`" />
          <input v-model="area.nome" type="text" :aria-label="`Nome de ${area.nome}`" />
          <select v-model="area.avaliacao" :aria-label="`Tipo de nota de ${area.nome}`">
            <option value="acertos">acertos</option>
            <option value="nota">nota</option>
          </select>
          <input
            v-if="area.avaliacao === 'nota'"
            v-model.number="area.notaMaximaPadrao"
            type="number"
            min="1"
            step="0.5"
            class="max"
            :aria-label="`Nota máxima de ${area.nome}`"
          />
          <button
            type="button"
            class="apagar"
            :aria-label="`Apagar ${area.nome}`"
            @click="removerArea(area)"
          >
            <BaseIcon nome="lixeira" :tamanho="16" />
          </button>
        </header>

        <div class="materias">
          <span v-for="materia in config.materiasDaArea(area.id)" :key="materia.id" class="chip">
            {{ materia.nome }}
            <button
              type="button"
              class="tirar"
              :aria-label="`Apagar ${materia.nome}`"
              @click="removerMateria(materia)"
            >
              <BaseIcon nome="x" :tamanho="11" />
            </button>
          </span>
          <form class="nova-materia" @submit.prevent="adicionarMateria(area.id)">
            <input
              v-model="novaMateria[area.id]"
              type="text"
              placeholder="+ matéria"
              :aria-label="`Nova matéria em ${area.nome}`"
            />
          </form>
        </div>
      </article>
    </div>

    <form class="adicionar" @submit.prevent="adicionarArea">
      <input v-model="novaArea" type="text" placeholder="Nova área" aria-label="Nova área" />
      <BaseButton tipo="submit" variante="primario" icone="mais">Adicionar área</BaseButton>
    </form>
  </div>
</template>

<style scoped>
.intro {
  font-size: 0.85rem;
  margin-bottom: var(--s4);
}

.areas {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}

.area {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--s2);
}

.area .linha {
  background: transparent;
  border: none;
  padding: 2px 4px;
}

.linha input[type='text'] {
  flex: 1;
}

select {
  width: auto;
  padding: 5px 28px 5px 10px;
  font-size: 0.82rem;
  background-position: calc(100% - 15px) 14px, calc(100% - 10px) 14px;
}

.max {
  width: 66px;
  text-align: center;
}

.materias {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: var(--s2) var(--s2) var(--s1);
}

.tirar {
  color: var(--text-faint);
  display: grid;
  place-items: center;
}

.tirar:hover {
  color: var(--erro);
}

.nova-materia input {
  width: 116px;
  padding: 3px 8px;
  font-size: 0.78rem;
  background: transparent;
  border-style: dashed;
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
