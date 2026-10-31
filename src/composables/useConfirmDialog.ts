import { ref } from "vue";

// Module-level state so every caller and the single mounted <ConfirmDialog />
// share the same dialog.
const visible = ref(false);
const message = ref("");
let pending: ((value: boolean) => void) | null = null;

export function useConfirmDialog() {
  function showConfirmDialog(msg: string, callback: (value: boolean) => void) {
    // ancel it before opening a new one.
    pending?.(false);
    message.value = msg;
    pending = callback;
    visible.value = true;
  }

  function resolveConfirmDialog(value: boolean) {
    const cb = pending;
    pending = null;
    visible.value = false;
    cb?.(value);
  }

  return {
    visible,
    message,
    showConfirmDialog,
    resolveConfirmDialog,
  };
}
