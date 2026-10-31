<template>
  <div class="grow flex flex-col items-center py-2 text-white">
    <MyHeader>EINSTELLUNGEN</MyHeader>

    <div class="mt-8 w-[min(100%,28rem)] px-4">
      <label
        class="flex cursor-pointer items-center justify-between gap-4 rounded-lg bg-zinc-700 border border-zinc-800 px-4 py-3">
        <span>
          <span class="block text-lg">Umlaute (Ä Ö Ü)</span>
          <span class="block text-sm opacity-70">
            {{ useUmlauts ? 'Eigene Tasten für Ä, Ö und Ü' : 'Stattdessen AE, OE und UE schreiben' }}
          </span>
        </span>
        <input v-model="useUmlauts" type="checkbox" role="switch" class="peer sr-only" />
        <span aria-hidden="true"
          class="relative h-6 w-11 shrink-0 rounded-full bg-zinc-600 transition-colors peer-checked:bg-sky-500 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sky-400 after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"></span>
      </label>

      <a href="https://github.com/srutz/vuehangman" target="_blank" rel="noopener noreferrer"
        class="mt-4 flex items-center justify-between gap-4 rounded-lg bg-zinc-700 border border-zinc-800 px-4 py-3 hover:bg-zinc-700/80">
        <span>
          <span class="block text-lg">GitHub</span>
          <span class="block text-sm opacity-70">github.com/srutz/vuehangman</span>
        </span>
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MyHeader from '@/components/MyHeader.vue'
import { useSettings } from '@/composables/useSettings.ts'

const { settings } = useSettings()

const useUmlauts = computed({
  get: () => settings.value.umlautMode === 'umlauts',
  set: (on) => (settings.value.umlautMode = on ? 'umlauts' : 'digraphs'),
})
</script>
