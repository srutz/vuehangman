<template>
  <div ref="root" tabindex="-1"
    class="w-[min(100%,40rem)] outline-none select-none rounded-2xl bg-zinc-300 border border-zinc-700 p-[clamp(0.5rem,2vw,1rem)] shadow-[0_8px_0_#020617,0_14px_24px_#0f172a30]"
    role="group" aria-label="Buchstabentastatur">
    <div v-for="row in rows" :key="row"
      class="keyboard-row grid grid-cols-22 gap-[clamp(0.2rem,1vw,0.5rem)] not-first:mt-[0.65rem]"
      :class="rowOffset(row)">
      <button v-for="letter in row" :key="letter" type="button"
        class="aspect-square min-w-0 col-span-2 cursor-pointer touch-manipulation rounded-lg border border-zinc-300 font-mono text-[clamp(0.875rem,3vw,1.25rem)] font-bold text-zinc-900 transition-[transform,box-shadow,background] duration-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400 motion-reduce:transition-none"
        :class="[
          pressedKeys.has(letter)
            ? 'is-pressed tranzinc-y-[3px] bg-sky-200 shadow-[0_1px_0_#64748b]'
            : 'bg-linear-to-b bg-zinc-200 shadow-[0_4px_0_#94a3b8] [@media(hover:hover)]:hover:bg-blue-100 [@media(hover:hover)]:hover:bg-none active:tranzinc-y-[3px] active:bg-sky-200 active:bg-none active:shadow-[0_1px_0_#64748b]',
          inactiveKeys.includes(letter) ? 'bg-zinc-400 bg-none cursor-not-allowed' : '',
        ]" :aria-keyshortcuts="letter" @click="emit('key-press', letter)">
        {{ letter }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useSettings } from '@/composables/useSettings.ts'

const { inactiveKeys = [], qwertz = true } = defineProps<{
  inactiveKeys?: string[]
  /** Use the German QWERTZ layout (default) instead of QWERTY. */
  qwertz?: boolean
}>()


const emit = defineEmits<{
  'key-press': [letter: string]
}>()

const { settings } = useSettings()
const useUmlauts = computed(() => settings.value.umlautMode === 'umlauts')

// Ü/Ö/Ä keys only exist when umlauts are enabled in the settings.
const rows = computed(() => {
  const [ue, oe, ae] = useUmlauts.value ? ['Ü', 'Ö', 'Ä'] : ['', '', '']
  return qwertz
    ? [`QWERTZUIOP${ue}`, `ASDFGHJKL${oe}${ae}`, 'YXCVBNM']
    : [`QWERTYUIOP${ue}`, `ASDFGHJKL${oe}${ae}`, 'ZXCVBNM']
})
// Centre each row in the 22-column grid (every key spans 2 columns).
const rowOffsets: Record<number, string> = {
  7: '[&>:first-child]:col-start-5',
  9: '[&>:first-child]:col-start-3',
  10: '[&>:first-child]:col-start-2',
  11: '',
}
function rowOffset(row: string) {
  return rowOffsets[row.length] ?? ''
}
const root = ref<HTMLElement | null>(null)
const pressedKeys = ref(new Set<string>())

function handleKeydown(event: KeyboardEvent) {
  if (
    event.defaultPrevented ||
    event.repeat ||
    event.isComposing ||
    event.ctrlKey ||
    event.altKey ||
    event.metaKey ||
    !(useUmlauts.value ? /^[a-zäöü]$/i : /^[a-z]$/i).test(event.key)
  ) {
    return
  }

  if (
    event.target instanceof HTMLElement &&
    event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')
  ) {
    return
  }

  const letter = event.key.toUpperCase()
  pressedKeys.value.add(letter)
  emit('key-press', letter)
}

function handleKeyup(event: KeyboardEvent) {
  pressedKeys.value.delete(event.key.toUpperCase())
}

function clearPressedKeys() {
  pressedKeys.value.clear()
}

onMounted(() => {
  // Claim focus so typing works right away.
  root.value?.focus({ preventScroll: true })
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('keyup', handleKeyup)
  window.addEventListener('blur', clearPressedKeys)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('keyup', handleKeyup)
  window.removeEventListener('blur', clearPressedKeys)
})
</script>
