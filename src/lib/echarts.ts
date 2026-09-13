import { registerTheme, use } from 'echarts/core'
import { BarChart, LineChart, RadarChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { PALETA_SERIES } from '@/lib/seed'

use([
  LineChart,
  BarChart,
  RadarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  CanvasRenderer,
])

export const CORES = {
  superficie: '#0e2126',
  texto: '#e6f3f5',
  textoDim: '#8faab0',
  textoFraco: '#5d777d',
  grade: '#173038',
  borda: '#2c545e',
  alerta: '#e0a83c',
} as const

export const TEMA = 'juju'

const fonte = "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif"

registerTheme(TEMA, {
  color: PALETA_SERIES,
  backgroundColor: 'transparent',
  textStyle: { fontFamily: fonte, color: CORES.textoDim, fontSize: 12 },
  legend: {
    textStyle: { color: CORES.textoDim, fontSize: 12, fontFamily: fonte },
    icon: 'roundRect',
    itemWidth: 9,
    itemHeight: 9,
    itemGap: 14,
  },
  tooltip: {
    backgroundColor: '#0b1d22',
    borderColor: CORES.borda,
    borderWidth: 1,
    padding: [8, 12],
    textStyle: { color: CORES.texto, fontSize: 12, fontFamily: fonte },
    axisPointer: { lineStyle: { color: CORES.borda, width: 1 } },
    extraCssText: 'border-radius:10px;box-shadow:0 10px 28px rgba(0,0,0,.45)',
  },
  categoryAxis: {
    axisLine: { show: true, lineStyle: { color: CORES.grade } },
    axisTick: { show: false },
    axisLabel: { color: CORES.textoDim, fontSize: 11, fontFamily: fonte },
    splitLine: { show: false },
  },
  valueAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: CORES.textoDim, fontSize: 11, fontFamily: fonte },
    splitLine: { show: true, lineStyle: { color: CORES.grade, type: 'dashed' } },
  },
  line: { symbol: 'circle', symbolSize: 8, smooth: false, lineStyle: { width: 2 } },
  bar: { itemStyle: { borderRadius: [4, 4, 0, 0] } },
})

export interface ParamTooltip {
  seriesName?: string
  dataIndex: number
  value: number | null
  color?: string
  axisValue?: string
  name?: string
}

export function marcador(cor?: string): string {
  return `<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${cor ?? CORES.textoDim};margin-right:6px"></span>`
}

/** Escala de eixo com folga, para a evolução não virar uma linha reta no meio. */
export function escalaPercentual(valores: number[]): { min: number; max: number } {
  if (!valores.length) return { min: 0, max: 100 }
  const menor = Math.min(...valores)
  const maior = Math.max(...valores)
  return {
    min: Math.max(0, Math.floor((menor - 8) / 5) * 5),
    max: Math.min(100, Math.ceil((maior + 8) / 5) * 5),
  }
}
