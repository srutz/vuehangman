<template>
  <div v-if="visible" ref="backdrop" tabindex="-1" role="dialog" aria-modal="true"
    aria-labelledby="confirm-dialog-message"
    class="fixed inset-0 flex items-center justify-center bg-black/50 outline-none [view-transition-name:vt-confirmdialog]"
    @click.self="resolveConfirmDialog(false)" @keydown.esc.stop.prevent="resolveConfirmDialog(false)">
    <div class="bg-white p-6 rounded shadow-lg max-w-sm flex flex-col grow min-h-[200px] gap-4">
      <div class="text-xl font-bold">Bestätigen</div>
      <p id="confirm-dialog-message">{{ message }}</p>
      <div class="grow"></div>
      <div class="mr-4 flex justify-end space-x-2">
        <my-button @click="resolveConfirmDialog(false)">Abbrechen</my-button>
        <my-button @click="resolveConfirmDialog(true)">Bestätigen</my-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { useConfirmDialog } from '@/composables/useConfirmDialog.ts';
import MyButton from './MyButton.vue';

const { visible, message, resolveConfirmDialog } = useConfirmDialog();
const backdrop = ref<HTMLElement | null>(null);

// Focus the dialog when it opens so the Escape key reaches it.
watch(visible, async (isVisible) => {
  if (!isVisible) return;
  await nextTick();
  backdrop.value?.focus();
});
</script>
