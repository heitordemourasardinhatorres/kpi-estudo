<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import BaseChart from '@/components/charts/BaseChart.vue'
import { CORES } from '@/lib/echarts'
import type { SerieEmpilhada } from '@/lib/metrics'

const props = withDefaults(defineProps<{ serie: SerieEmpilhada; altura?: number }>(), { altura: 290 })

const comRotuloDireto = computed(() => props.serie.series.length <= 4)

const option = computed<EChartsOption>(() => ({
  grid: { left: 2, right: 10, top: 36, bottom: 2, containLabel: true },
  legend: { top: 0, left: 0 },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    order: 'seriesDesc',
  },
  xAxis: { type: 'category', data: props.serie.eixo },
  yAxis: { type: 'value', minInterval: 1 },
  series: props.serie.series.map((s) => ({
    name: s.categoria.nome,
    type: 'bar' as const,
    stack: 'erros',
    barMaxWidth: 42,
    itemStyle: {
      color: s.categoria.cor,
      borderColor: CORES.superficie,
      borderWidth: 2,
      borderRadius: 3,
    },
    label: comRotuloDireto.value
      ? {
          show: true,
          position: 'inside' as const,
          color: '#07151a',
          fontSize: 11,
          fontWeight: 600 as const,
          formatter: (p: { value?: unknown }) => (Number(p.value) >= 3 ? String(p.value) : ''),
        }
      : undefined,
    data: s.valores,
  })),
}))
</script>

<template>
  <BaseChart
    :option="option"
    :altura="altura"
    :vazio="serie.series.length === 0"
    mensagem-vazio="Nenhum erro registrado ainda."
  />
</template>
