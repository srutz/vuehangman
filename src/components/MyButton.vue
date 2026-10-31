<template>
  <button :class="[base, variants[variant]]">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'default' | 'secondary' }>(), {
  variant: 'default',
})

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:pointer-events-none disabled:opacity-50'

const variants = {
  default: 'bg-blue-500 text-white shadow hover:bg-blue-500/90',
  secondary: 'bg-zinc-700 text-zinc-300 shadow-sm hover:bg-zinc-700/80',
}
</script>
