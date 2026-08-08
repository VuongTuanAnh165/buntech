<script setup lang="ts">
import { Check, ChevronDown, Search, X, AlertCircle } from 'lucide-vue-next'
import { useId } from '#imports'

interface Option {
  value: string | number
  label: string
}

const props = withDefaults(defineProps<{
  modelValue?: string | number
  label?: string
  options: Option[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  searchable?: boolean
  id?: string
}>(), {
  modelValue: '',
  placeholder: '',
  required: false,
  disabled: false,
  searchable: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const generatedId = useId()
const selectId = props.id || generatedId
const listboxId = `${selectId}-listbox`
const errorId = `${selectId}-error`
const hintId = `${selectId}-hint`

const isOpen = ref(false)
const searchQuery = ref('')
const activeIndex = ref(-1)
const triggerRef = ref<HTMLElement | null>(null)
const listboxRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
  const opt = props.options.find(o => String(o.value) === String(props.modelValue))
  return opt?.label || props.placeholder
})

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) return props.options
  const q = searchQuery.value.toLowerCase()
  return props.options.filter(o => o.label.toLowerCase().includes(q))
})

const describedBy = computed(() => {
  const parts: string[] = []
  if (props.error) parts.push(errorId)
  if (props.hint) parts.push(hintId)
  return parts.length ? parts.join(' ') : undefined
})

function open() {
  if (props.disabled) return
  isOpen.value = true
  activeIndex.value = props.options.findIndex(o => String(o.value) === String(props.modelValue))
  nextTick(() => {
    if (props.searchable) {
      const searchInput = listboxRef.value?.querySelector('input')
      searchInput?.focus()
    } else {
      listboxRef.value?.focus()
    }
  })
}

function close() {
  isOpen.value = false
  searchQuery.value = ''
  activeIndex.value = -1
  triggerRef.value?.focus()
}

function selectOption(opt: Option) {
  emit('update:modelValue', String(opt.value))
  close()
}

function onKeyDown(e: KeyboardEvent) {
  if (!isOpen.value) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault()
      open()
    }
    return
  }
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      activeIndex.value = Math.min(activeIndex.value + 1, filteredOptions.value.length - 1)
      scrollActiveIntoView()
      break
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value = Math.max(activeIndex.value - 1, 0)
      scrollActiveIntoView()
      break
    case 'Home':
      e.preventDefault()
      activeIndex.value = 0
      scrollActiveIntoView()
      break
    case 'End':
      e.preventDefault()
      activeIndex.value = filteredOptions.value.length - 1
      scrollActiveIntoView()
      break
    case 'Enter':
      e.preventDefault()
      if (activeIndex.value >= 0 && activeIndex.value < filteredOptions.value.length) {
        selectOption(filteredOptions.value[activeIndex.value])
      }
      break
    case 'Escape':
      e.preventDefault()
      close()
      break
    case 'Tab':
      close()
      break
  }
}

function scrollActiveIntoView() {
  nextTick(() => {
    const activeEl = listboxRef.value?.querySelector(`[data-index="${activeIndex.value}"]`)
    activeEl?.scrollIntoView({ block: 'nearest' })
  })
}

function onOutsideClick(e: MouseEvent) {
  const target = e.target as Node
  if (triggerRef.value?.contains(target) || listboxRef.value?.contains(target)) return
  close()
}

watch(isOpen, (val) => {
  if (val) {
    document.addEventListener('mousedown', onOutsideClick)
  } else {
    document.removeEventListener('mousedown', onOutsideClick)
  }
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onOutsideClick)
})
</script>

<template>
  <div class="relative" @keydown="onKeyDown">
    <label v-if="label" :for="selectId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger-500" aria-hidden="true">*</span>
    </label>
    <button
      :id="selectId"
      ref="triggerRef"
      type="button"
      :disabled="disabled"
      :aria-haspopup="'listbox'"
      :aria-expanded="isOpen"
      :aria-controls="listboxId"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="describedBy"
      :aria-required="required"
      :class="['form-input flex items-center justify-between text-left', error ? 'form-input-error' : '', disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer']"
      @click="isOpen ? close() : open()"
    >
      <span :class="selectedLabel === placeholder ? 'text-gray-400 dark:text-zinc-500' : ''">{{ selectedLabel }}</span>
      <ChevronDown :class="['w-4 h-4 text-gray-400 dark:text-zinc-500 transition-transform duration-200 flex-shrink-0', isOpen ? 'rotate-180' : '']" aria-hidden="true" />
    </button>

    <Transition name="dropdown">
      <div
        v-if="isOpen"
        :id="listboxId"
        ref="listboxRef"
        role="listbox"
        tabindex="-1"
        :aria-labelledby="selectId"
        class="absolute z-50 mt-1.5 w-full bg-surface border border-surface-border rounded-xl shadow-lg overflow-hidden origin-top"
      >
        <div v-if="searchable" class="p-2 border-b border-surface-border">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500" aria-hidden="true" />
            <input
              v-model="searchQuery"
              type="text"
              class="form-input pl-9 py-2 text-sm"
              placeholder="Tìm kiếm..."
              aria-label="Tìm kiếm tùy chọn"
            >
            <button v-if="searchQuery" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 min-w-[36px] min-h-[36px] flex items-center justify-center" aria-label="Xóa tìm kiếm" @click="searchQuery = ''">
              <X class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <ul class="max-h-[280px] overflow-y-auto scrollbar-thin py-1" role="presentation">
          <li v-if="filteredOptions.length === 0" class="px-3.5 py-2.5 text-sm text-gray-400 dark:text-zinc-500 text-center">
            Không tìm thấy kết quả
          </li>
          <li
            v-for="(opt, i) in filteredOptions"
            :key="opt.value"
            :data-index="i"
            role="option"
            :aria-selected="String(opt.value) === String(modelValue)"
            :class="[
              'flex items-center justify-between px-3.5 py-2.5 text-sm cursor-pointer transition-colors min-h-[44px]',
              i === activeIndex ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300' : 'text-surface-foreground hover:bg-surface-hover',
            ]"
            @click="selectOption(opt)"
            @mouseenter="activeIndex = i"
          >
            <span>{{ opt.label }}</span>
            <Check v-if="String(opt.value) === String(modelValue)" class="w-4 h-4 text-primary-600 flex-shrink-0" aria-hidden="true" />
          </li>
        </ul>
      </div>
    </Transition>

    <p v-if="error" :id="errorId" class="form-error" role="alert">
      <AlertCircle class="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      {{ error }}
    </p>
    <p v-else-if="hint" :id="hintId" class="form-hint">{{ hint }}</p>
  </div>
</template>
