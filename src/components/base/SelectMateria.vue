<script setup lang="ts">
import { useConfigStore } from '@/stores/config'
import type { ID } from '@/types'

const modelo = defineModel<ID | undefined>({ required: true })
withDefaults(defineProps<{ vazio?: string }>(), { vazio: 'Sem matéria' })

const config = useConfigStore()
</script>

<template>
  <select v-model="modelo">
    <option :value="undefined">{{ vazio }}</option>
    <optgroup v-for="grupo in config.materiasAgrupadas" :key="grupo.area.id" :label="grupo.area.nome">
      <option v-for="materia in grupo.materias" :key="materia.id" :value="materia.id">
        {{ materia.nome }}
      </option>
    </optgroup>
  </select>
</template>
