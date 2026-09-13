<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import VChart from 'vue-echarts'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import { TEMA } from '@/lib/echarts'

withDefaults(defineProps<{ option: EChartsOption; altura?: number; vazio?: boolean; mensagemVazio?: string }>(), {
  altura: 280,
  vazio: false,
  mensagemVazio: 'Sem dados suficientes ainda.',
})
</script>

<template>
  <BaseEmpty v-if="vazio" icone="grafico" :titulo="mensagemVazio" />
  <VChart v-else class="grafico" :option="option" :theme="TEMA" :style="{ height: `${altura}px` }" autoresize />
</template>

<style scoped>
.grafico {
  width: 100%;
}
</style>
