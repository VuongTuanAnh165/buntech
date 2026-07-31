<script setup lang="ts">
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { formatVND } from '../../composables/useFormat'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

interface Props {
  data: { date: string; revenue: number }[]
}
const props = defineProps<Props>()

const option = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params: { name: string; value: number }[]) => {
      const p = params[0]
      return `${p.name}<br/>${formatVND(p.value)}`
    },
  },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    data: props.data.map(d => d.date.slice(5)),
    axisLine: { lineStyle: { color: '#e5e7eb' } },
    axisLabel: { color: '#6b7280', fontSize: 11 },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: '#6b7280',
      fontSize: 11,
      formatter: (val: number) => {
        if (val >= 1000000) return `${(val / 1000000).toFixed(0)}tr`
        if (val >= 1000) return `${(val / 1000).toFixed(0)}k`
        return String(val)
      },
    },
    splitLine: { lineStyle: { color: '#f3f4f6' } },
  },
  series: [{
    type: 'line',
    data: props.data.map(d => d.revenue),
    smooth: true,
    lineStyle: { color: '#ed7628', width: 3 },
    itemStyle: { color: '#ed7628' },
    areaStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(237,118,40,0.25)' },
          { offset: 1, color: 'rgba(237,118,40,0)' },
        ],
      },
    },
  }],
}))
</script>

<template>
  <div style="height: 320px">
    <VChart :option="option" autoresize />
  </div>
</template>
