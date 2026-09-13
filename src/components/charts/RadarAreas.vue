<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import BaseChart from '@/components/charts/BaseChart.vue'
import { CORES } from '@/lib/echarts'
import { COR_NEUTRA } from '@/lib/seed'
import type { DesempenhoArea } from '@/lib/metrics'

const props = withDefaults(defineProps<{ dados: DesempenhoArea[]; altura?: number }>(), { altura: 300 })

const comDados = computed(() => props.dados.filter((d) => d.media !== null))

const option = computed<EChartsOption>(() => ({
  legend: { top: 0, left: 0 },
  tooltip: {
    trigger: 'item',
    valueFormatter: (v) => `${Number(v).toFixed(1).replace('.', ',')}%`,
  },
  radar: {
    center: ['50%', '58%'],
    radius: '66%',
    indicator: comDados.value.map((d) => ({ name: d.area.nome, max: 100 })),
    axisName: { color: CORES.textoDim, fontSize: 11 },
    axisLine: { lineStyle: { color: CORES.grade } },
    splitLine: { lineStyle: { color: CORES.grade } },
    splitArea: { show: false },
  },
  series: [
    {
      type: 'radar',
      symbolSize: 5,
      data: [
        {
          name: 'Média geral',
          value: comDados.value.map((d) => Number(((d.media ?? 0) * 100).toFixed(1))),
          itemStyle: { color: COR_NEUTRA },
          lineStyle: { color: COR_NEUTRA, width: 1.5, type: 'dashed' },
        },
        {
          name: 'Último simulado',
          value: comDados.value.map((d) => Number(((d.ultimo ?? 0) * 100).toFixed(1))),
          itemStyle: { color: '#1094ab' },
          lineStyle: { color: '#1094ab', width: 2 },
          areaStyle: { color: 'rgba(16, 148, 171, 0.22)' },
        },
      ],
    },
  ],
}))
</script>

<template>
  <BaseChart
    :option="option"
    :altura="altura"
    :vazio="comDados.length < 3"
    mensagem-vazio="Registre simulados com pelo menos 3 áreas para ver o radar."
  />
</template>
