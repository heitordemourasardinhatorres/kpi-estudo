<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import BaseChart from '@/components/charts/BaseChart.vue'
import { CORES, marcador } from '@/lib/echarts'
import { pct } from '@/lib/format'
import type { PontoFraco } from '@/lib/metrics'

const props = withDefaults(defineProps<{ itens: PontoFraco[]; limite?: number }>(), { limite: 7 })

const visiveis = computed(() => props.itens.filter((i) => i.erros > 0).slice(0, props.limite))
const altura = computed(() => Math.max(150, visiveis.value.length * 34 + 30))

const option = computed<EChartsOption>(() => {
  const ordenados = [...visiveis.value].reverse()
  return {
    grid: { left: 2, right: 30, top: 6, bottom: 2, containLabel: true },
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const p = params as { dataIndex: number; color?: string }
        const item = ordenados[p.dataIndex]
        if (!item) return ''
        const acerto =
          item.questoes > 0
            ? `<div style="color:${CORES.textoDim};margin-top:4px">${pct(item.percAcerto)} de acerto em ${item.questoes} questões de lista</div>`
            : ''
        return `${marcador(p.color)}<b>${item.materia.nome}</b><br>${item.erros} erro${item.erros > 1 ? 's' : ''} registrado${item.erros > 1 ? 's' : ''}${acerto}`
      },
    },
    xAxis: { type: 'value', minInterval: 1, splitLine: { show: false }, axisLabel: { show: false } },
    yAxis: {
      type: 'category',
      data: ordenados.map((i) => i.materia.nome),
      axisLine: { show: false },
    },
    series: [
      {
        type: 'bar',
        barWidth: 13,
        itemStyle: { color: '#1094ab', borderRadius: [0, 4, 4, 0] },
        label: {
          show: true,
          position: 'right',
          color: CORES.textoDim,
          fontSize: 11,
          formatter: '{c}',
        },
        data: ordenados.map((i) => i.erros),
      },
    ],
  }
})
</script>

<template>
  <BaseChart
    :option="option"
    :altura="altura"
    :vazio="visiveis.length === 0"
    mensagem-vazio="Anote os erros dos simulados e listas para ver o ranking."
  />
</template>
