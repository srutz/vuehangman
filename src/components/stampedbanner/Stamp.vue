<template>
  <div v-if="text.trim().length > 0" class="stamped font-bold flex flex-col justify-center items-center text-white"
    :style="style">{{ text }}</div>
</template>

<style>
.stamped {
  position: absolute;
  border-radius: 5px;
  animation-duration: 0.5s;
  opacity: 0;
  animation-fill-mode: forwards;
}
</style>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, type CSSProperties } from 'vue'

export interface Point {
  x: number
  y: number
}

const { text, position, size, delayMs = 0, keyframes, color = '#374151' } = defineProps<{
  text: string
  position: Point
  size: number
  delayMs?: number
  keyframes: string
  color?: string
}>()

const animationName = ref(keyframes)

const style = computed(
  () =>
    ({
      animationDelay: delayMs + 'ms',
      left: position.x + 'px',
      top: position.y + 'px',
      width: size - 8 + 'px',
      height: size - 8 + 'px',
      fontSize: Math.round(size * 0.5) + 'px',
      background: color,
      animationName: animationName.value,
    }) satisfies CSSProperties,
)

/* simple frame based animation machine */
const frameCounter = ref(0)
onMounted(() => {
  const i = setInterval(() => {
    const DURATIONTICKS = 3
    if (frameCounter.value == DURATIONTICKS) {
      const animationNumber = keyframes.substring(keyframes.length - 1)
      animationName.value = 'fadeout' + animationNumber
    } else if (frameCounter.value > DURATIONTICKS) {
      frameCounter.value = 0
      animationName.value = keyframes
      return
    }
    frameCounter.value++
  }, 1_000)
  onUnmounted(() => clearInterval(i))
})
</script>
