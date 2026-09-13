<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import BaseChart from '@/components/charts/BaseChart.vue'
import type { SerieLinha } from '@/components/charts/tipos'
import { formatarCompleto, formatarCurto } from '@/lib/date'
import { CORES, escalaPercentual, marcador, type ParamTooltip } from '@/lib/echarts'

const props = withDefaults(
  defineProps<{ series: SerieLinha[]; corte?: number | null; altura?: number; mensagemVazio?: string }>(),
  { corte: null, altura: 300, mensagemVazio: 'Registre simulados para ver a evolução.' },
)

const datas = computed(() =>
  [...new Set(props.series.flatMap((s) => s.pontos.map((p) => p.data)))].sort(),
)

const rotulos = computed(() => {
  const mapa = new Map<string, string>()
  for (const serie of props.series) {
    for (const ponto of serie.pontos) if (!mapa.has(ponto.data)) mapa.set(ponto.data, ponto.rotulo)
  }
  return mapa
})

const umaSerie = computed(() => props.series.length === 1)
const comLegenda = computed(() => props.series.length >= 2)
/** Até 4 séries também ganham rótulo na ponta: identidade nunca fica só na cor. */
const comRotuloDireto = computed(() => props.series.length >= 2 && props.series.length <= 4)

const fmt = (v: number | null) => (v === null ? '—' : `${v.toFixed(1).replace('.', ',')}%`)

const option = computed<EChartsOption>(() => {
  const pontos = props.series.flatMap((s) => s.pontos.map((p) => p.valor * 100))
  const escala = escalaPercentual([...pontos, ...(props.corte ? [props.corte * 100] : [])])

  return {
    grid: {
      left: 2,
      right: comRotuloDireto.value ? 66 : 12,
      top: comLegenda.value ? 34 : 14,
      bottom: 2,
      containLabel: true,
    },
    legend: comLegenda.value ? { top: 0, left: 0 } : undefined,
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        const itens = params as ParamTooltip[]
        const data = datas.value[itens[0]?.dataIndex ?? 0] ?? ''
        const titulo = `${rotulos.value.get(data) ?? ''} · ${formatarCompleto(data)}`
        const linhas = itens
          .filter((i) => i.value !== null && i.value !== undefined)
          .map(
            (i) =>
              `${marcador(i.color)}${i.seriesName}<b style="float:right;margin-left:18px">${fmt(i.value)}</b>`,
          )
        return `<div style="color:${CORES.textoDim};margin-bottom:5px">${titulo}</div>${linhas.join('<br>')}`
      },
    },
    xAxis: { type: 'category', boundaryGap: false, data: datas.value.map(formatarCurto) },
    yAxis: { type: 'value', min: escala.min, max: escala.max, axisLabel: { formatter: '{value}%' } },
    series: props.series.map((serie, indice) => ({
      name: serie.nome,
      type: 'line' as const,
      connectNulls: true,
      symbolSize: 8,
      z: 3,
      itemStyle: { color: serie.cor, borderColor: CORES.superficie, borderWidth: 2 },
      lineStyle: { color: serie.cor, width: 2 },
      emphasis: { focus: 'series' as const },
      endLabel: comRotuloDireto.value
        ? { show: true, formatter: serie.nome, color: serie.cor, fontSize: 11, distance: 6 }
        : undefined,
      areaStyle: umaSerie.value
        ? {
            color: {
              type: 'linear' as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: `${serie.cor}44` },
                { offset: 1, color: `${serie.cor}00` },
              ],
            },
          }
        : undefined,
      data: datas.value.map((data) => {
        const ponto = serie.pontos.find((p) => p.data === data)
        return ponto ? Number((ponto.valor * 100).toFixed(1)) : null
      }),
      markLine:
        indice === 0 && props.corte
          ? {
              silent: true,
              symbol: 'none',
              lineStyle: { color: CORES.alerta, type: 'dashed' as const, width: 1.5 },
              label: {
                formatter: `corte ${Math.round(props.corte * 100)}%`,
                color: CORES.alerta,
                fontSize: 11,
                position: 'insideEndTop' as const,
              },
              data: [{ yAxis: Number((props.corte * 100).toFixed(1)) }],
            }
          : undefined,
    })),
  }
})
</script>

<template>
  <BaseChart
    :option="option"
    :altura="altura"
    :vazio="datas.length === 0"
    :mensagem-vazio="mensagemVazio"
  />
</template>
