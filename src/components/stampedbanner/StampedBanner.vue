<!-- (c) Stepan Rutz 2024. All rights reserved. License under the WTFPL -->
<template>
  <div ref="elemRef" class="relative w-full" :style="{ height: size + 40 + 'px' }">
    <Stamp v-for="(c, i) in texts" :key="i" :text="c" :position="computePosition(i)" :size="size"
      :keyframes="'pulse' + (i % 4)" :delayMs="i * 50" :color="color" />
  </div>
</template>

<style>
@keyframes fadeout0 {
  0% {
    opacity: 1;
    transition: all .3s cubic-bezier(0.6, 0.04, 0.98, 0.335);
    transform: rotate(-20deg) scale(1);
  }

  100% {
    opacity: 0;
  }
}

@keyframes fadeout1 {
  0% {
    opacity: 1;
    transition: all .3s cubic-bezier(0.6, 0.04, 0.98, 0.335);
    transform: rotate(-15deg) scale(1);
  }

  100% {
    opacity: 0;
  }
}

@keyframes fadeout2 {
  0% {
    opacity: 1;
    transition: all .3s cubic-bezier(0.6, 0.04, 0.98, 0.335);
    transform: rotate(15deg) scale(1);
  }

  100% {
    opacity: 0;
  }
}

@keyframes fadeout3 {
  0% {
    opacity: 1;
    transition: all .3s cubic-bezier(0.6, 0.04, 0.98, 0.335);
    transform: rotate(20deg) scale(1);
  }

  100% {
    opacity: 0;
  }
}

@keyframes pulse0 {
  0% {
    opacity: 0;
  }

  8% {
    transform-origin: 50% 50%;
    transform: rotate(-8deg) scale(6);
    transition: all .3s cubic-bezier(0.6, 0.04, 0.98, 0.335);
    opacity: .5;
  }

  100% {
    transform: rotate(-20deg) scale(1);
    opacity: 1;
  }
}

@keyframes pulse1 {
  0% {
    opacity: 0;
  }

  8% {
    transform-origin: 50% 50%;
    transform: rotate(-3deg) scale(6);
    transition: all .3s cubic-bezier(0.6, 0.04, 0.98, 0.335);
    opacity: .5;
  }

  100% {
    transform: rotate(-15deg) scale(1);
    opacity: 1;
  }
}

@keyframes pulse2 {
  0% {
    opacity: 0;
  }

  8% {
    transform-origin: 50% 50%;
    transform: rotate(3deg) scale(6);
    transition: all .3s cubic-bezier(0.6, 0.04, 0.98, 0.335);
    opacity: .5;
  }

  100% {
    transform: rotate(15deg) scale(1);
    opacity: 1;
  }
}

@keyframes pulse3 {
  0% {
    opacity: 0;
  }

  8% {
    transform-origin: 50% 50%;
    transform: rotate(8deg) scale(6);
    transition: all .3s cubic-bezier(0.6, 0.04, 0.98, 0.335);
    opacity: .5;
  }

  100% {
    transform: rotate(20deg) scale(1);
    opacity: 1;
  }
}
</style>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import Stamp, { type Point } from './Stamp.vue'

const { text, color } = defineProps<{ text: string; color?: string }>()
const texts = computed(() => text.split(''))

const elemRef = useTemplateRef<HTMLDivElement>('elemRef')
const width = ref(0)

let ro: ResizeObserver | undefined
onMounted(() => {
  width.value = elemRef.value?.clientWidth ?? 0
  ro = new ResizeObserver(() => (width.value = elemRef.value?.clientWidth ?? 0))
  if (elemRef.value) ro.observe(elemRef.value)
})
onUnmounted(() => ro?.disconnect())

/* stamps shrink so the whole text always fits the available width */
const size = computed(() => {
  const fit = width.value > 0 ? Math.floor(width.value / texts.value.length) : 160
  return Math.max(36, Math.min(160, fit))
})

function computePosition(i: number): Point {
  const usedw = texts.value.length * size.value
  const x0 = (width.value - usedw) / 2
  return { x: x0 + i * size.value, y: 20 }
}
</script>
