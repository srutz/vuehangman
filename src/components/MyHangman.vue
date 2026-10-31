<template>
  <svg viewBox="0 0 200 240" class="w-full max-w-60 text-zinc-200" role="img"
    :aria-label="`Hangman: ${wrongGuesses} of ${MAX_MISSES} wrong guesses`" fill="none" stroke="currentColor"
    stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <!-- gallows -->
    <g class="text-amber-700" stroke="currentColor">
      <line x1="20" y1="226" x2="120" y2="226" />
      <line x1="50" y1="226" x2="50" y2="20" />
      <line x1="50" y1="20" x2="140" y2="20" />
      <line x1="50" y1="56" x2="86" y2="20" />
    </g>
    <line x1="140" y1="20" x2="140" y2="50" stroke-width="3" class="text-amber-200" />

    <!-- body parts, revealed one per wrong guess -->
    <g :class="partClass(1)" :stroke="lost ? '#f87171' : 'currentColor'">
      <circle cx="140" cy="68" r="18" />
    </g>
    <line x1="140" y1="86" x2="140" y2="145" :class="partClass(2)" :stroke="lost ? '#f87171' : 'currentColor'" />
    <line x1="140" y1="100" x2="115" y2="127" :class="partClass(3)" :stroke="lost ? '#f87171' : 'currentColor'" />
    <line x1="140" y1="100" x2="165" y2="127" :class="partClass(4)" :stroke="lost ? '#f87171' : 'currentColor'" />
    <line x1="140" y1="145" x2="118" y2="188" :class="partClass(5)" :stroke="lost ? '#f87171' : 'currentColor'" />
    <line x1="140" y1="145" x2="162" y2="188" :class="partClass(6)" :stroke="lost ? '#f87171' : 'currentColor'" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const MAX_MISSES = 6

const props = defineProps<{
  /** Number of wrong guesses so far (0–6). */
  misses: number
}>()

const wrongGuesses = computed(() => Math.min(Math.max(props.misses, 0), MAX_MISSES))
const lost = computed(() => wrongGuesses.value >= MAX_MISSES)

function partClass(step: number) {
  return [
    'transition-opacity duration-300 motion-reduce:transition-none',
    wrongGuesses.value >= step ? 'opacity-100' : 'opacity-0',
  ]
}
</script>
