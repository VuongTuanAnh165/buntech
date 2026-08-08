<script setup lang="ts">
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
const { formatVND } = useFormat()

use([CanvasRenderer, LineChart, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent])

interface Props {
  type?: 'line' | 'bar' | 'pie' | 'area'
  data: Record<string, unknown>[]
  xField?: string
  yField?: string
  nameField?: string
  valueField?: string
  height?: string
  colors?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  type: 'line',
  xField: 'day',
  yField: 'revenue',
  nameField: 'name',
  valueField: 'value',
  height: '320px',
  colors: () => ['#ed7628', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'],
})

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const option = computed(() => {
  const base = {
    tooltip: {
      trigger: props.type === 'pie' ? 'item' : 'axis',
      backgroundColor: isDark.value ? 'rgba(39,39,42,0.98)' : 'rgba(255,255,255,0.98)',
      borderColor: isDark.value ? '#3f3f46' : '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: isDark.value ? '#f4f4f5' : '#111827', fontSize: 12 },
      extraCssText: 'border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 10px 14px;',
    },
  }

  if (props.type === 'pie') {
    return {
      ...base,
      legend: {
        bottom: 0,
        icon: 'circle',
        textStyle: { color: isDark.value ? '#a1a1aa' : '#9ca3af', fontSize: 12 },
      },
      series: [{
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 8, borderColor: isDark.value ? '#27272a' : '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' },
        },
        data: props.data.map((d, i) => ({
          name: d[props.nameField] as string,
          value: d[props.valueField] as number,
          itemStyle: { color: props.colors[i % props.colors.length] },
        })),
      }],
    }
  }

  if (props.type === 'bar') {
    return {
      ...base,
      tooltip: { ...base.tooltip, formatter: (params: { name: string; value: number }[]) => {
        const p = params[0]
        return `<div style="font-size:11px;color:${isDark.value ? '#a1a1aa' : '#9ca3af'};margin-bottom:4px">${p.name}</div><div style="font-weight:600;font-size:14px">${formatVND(p.value)}</div>`
      } },
      grid: { left: '3%', right: '4%', top: '5%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: props.data.map(d => d[props.xField] as string),
        axisLine: { lineStyle: { color: isDark.value ? '#3f3f46' : '#e5e7eb' } },
        axisTick: { show: false },
        axisLabel: { color: isDark.value ? '#a1a1aa' : '#9ca3af', fontSize: 11, fontWeight: 500, interval: 0, rotate: props.data.length > 8 ? 30 : 0 },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: isDark.value ? '#a1a1aa' : '#9ca3af', fontSize: 11, fontWeight: 500,
          formatter: (val: number) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}tr` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : String(val),
        },
        splitLine: { lineStyle: { color: isDark.value ? '#27272a' : '#f3f4f6', type: 'dashed' } },
      },
      series: [{
        type: 'bar',
        data: props.data.map((d, i) => ({
          value: d[props.yField] as number,
          itemStyle: { color: props.colors[i % props.colors.length], borderRadius: [6, 6, 0, 0] },
        })),
        barWidth: '60%',
        emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(237,118,40,0.3)' } },
      }],
    }
  }

  // line / area
  return {
    ...base,
    tooltip: { ...base.tooltip, formatter: (params: { name: string; value: number }[]) => {
      const p = params[0]
      return `<div style="font-size:11px;color:${isDark.value ? '#a1a1aa' : '#9ca3af'};margin-bottom:4px">${p.name}</div><div style="font-weight:600;font-size:14px">${formatVND(p.value)}</div>`
    } },
    grid: { left: '3%', right: '4%', top: '5%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: props.data.map(d => (d[props.xField] as string || '').slice(5)),
      boundaryGap: false,
      axisLine: { lineStyle: { color: isDark.value ? '#3f3f46' : '#e5e7eb' } },
      axisTick: { show: false },
      axisLabel: { color: isDark.value ? '#a1a1aa' : '#9ca3af', fontSize: 11, fontWeight: 500 },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: isDark.value ? '#a1a1aa' : '#9ca3af', fontSize: 11, fontWeight: 500,
        formatter: (val: number) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}tr` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : String(val),
      },
      splitLine: { lineStyle: { color: isDark.value ? '#27272a' : '#f3f4f6', type: 'dashed' } },
    },
    series: [{
      type: 'line',
      data: props.data.map(d => d[props.yField] as number),
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: { color: '#ed7628', width: 3, shadowColor: 'rgba(237,118,40,0.3)', shadowBlur: 10, shadowOffsetY: 4 },
      itemStyle: { color: '#ed7628', borderColor: isDark.value ? '#27272a' : '#fff', borderWidth: 2 },
      ...(props.type === 'area' ? {
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(237,118,40,0.18)' },
              { offset: 1, color: 'rgba(237,118,40,0)' },
            ],
          },
        },
      } : {}),
      emphasis: { itemStyle: { shadowBlur: 15, shadowColor: 'rgba(237,118,40,0.4)' } },
    }],
  }
})
</script>

<template>
  <div :style="{ height: props.height }">
    <VChart :option="option" autoresize />
  </div>
</template>
