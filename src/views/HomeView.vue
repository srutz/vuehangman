<template>
  <div class="grow flex flex-col items-center py-2 text-white relative overflow-clip">
    <div v-if="game.state !== 'playing'" class="[view-transition-name:vt-header]">
      <MyHeader>HANGMAN</MyHeader>
    </div>

    <div v-if="game.state !== 'stopped'" class="flex justify-center w-full [view-transition-name:vt-hangman]">
      <MyHangman :misses="game.misses"
        :style="game.state === 'won' || game.state === 'lost' ? { maxWidth: '16.8rem' } : undefined" />
    </div>

    <template v-if="game.state === 'won'">
      <div class="my-4 px-8 w-full [view-transition-name:vt-start]">
        <StampedBanner text="Gewonnen!" color="#15803d" />
      </div>
    </template>
    <template v-if="game.state === 'lost'">
      <div class="my-4 px-8 w-full [view-transition-name:vt-start]">
        <StampedBanner text="Verloren!" color="#b91c1c" />
      </div>
    </template>
    <template v-if="game.state === 'won' || game.state === 'lost'">
      <div class="flex flex-col items-center gap-2 [view-transition-name:vt-result]">
        <div class="text-sm uppercase tracking-wide opacity-70">Das Wort war</div>
        <div class="flex gap-2 text-4xl font-mono" data-testid="result-word">
          <span v-for="(letter, index) in game.word" :key="index"
            :class="game.guessed.includes(letter) ? 'text-green-400' : 'text-red-400'">{{ letter }}</span>
        </div>
        <div class="mt-2 text-sm uppercase tracking-wide opacity-70">Deine Versuche</div>
        <div class="flex flex-wrap justify-center gap-2 font-mono text-2xl" data-testid="result-guesses">
          <span v-for="letter in game.guessed" :key="letter"
            :class="game.word.includes(letter) ? 'text-green-400' : 'text-red-400 line-through'">{{ letter }}</span>
        </div>
      </div>
    </template>
    <template v-if="game.state != 'playing'">
      <div class="my-4 [view-transition-name:vt-start]">
        <MyButton @click="start">
          Spiel starten
        </MyButton>
      </div>
    </template>
    <template v-if="game.state == 'playing'">
      <div class="mt-4 flex gap-2 select-none text-4xl font-mono [view-transition-name:vt-word]">
        <span v-for="(letter, index) in game.word" :key="index">
          {{ game.guessed.includes(letter) ? letter : '_' }}
        </span>
      </div>
      <div class="bottom-4 w-full flex justify-center [view-transition-name:vt-keyboard]">
        <MyKeyboard class="my-8" @key-press="handleKey" :inactiveKeys="game.guessed" />
      </div>
      <div class="mt-4 [view-transition-name:vt-stop]">
        <MyButton @click="stop">
          Spiel beenden
        </MyButton>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import MyHeader from '@/components/MyHeader.vue';
import MyButton from '../components/MyButton.vue'
import { useHangman } from '@/useHangman.ts';
import StampedBanner from '@/components/stampedbanner/StampedBanner.vue';
import MyHangman from '@/components/MyHangman.vue';
import MyKeyboard from '@/components/MyKeyboard.vue';
import { randomGermanWord } from '@/germanWords';
import { withTransition } from '@/viewTransition';
import { hasUmlauts, useSettings } from '@/composables/useSettings.ts';
import { onMounted } from 'vue';
import { useConfirmDialog } from '@/composables/useConfirmDialog.ts';

const { game, startGame, stopGame, guess } = useHangman();
const { showConfirmDialog } = useConfirmDialog();
const { settings, applyToWord } = useSettings();

// The setting may have changed on the settings page while a game was running.
// A word with umlauts can't be finished without umlaut keys, so end that game.
onMounted(() => {
  if (game.value.state === 'playing' && settings.value.umlautMode === 'digraphs' && hasUmlauts(game.value.word)) {
    stopGame();
  }
});

function start() {
  withTransition(() => startGame(applyToWord(randomGermanWord())));
}

function stop() {
  showConfirmDialog('Willst du das Spiel wirklich beenden?', (confirmed) => {
    if (confirmed) {
      withTransition(() => {
        stopGame();
      });
    }
  });
}

function handleKey(letter: string) {
  const { word, guessed, misses } = game.value;
  if (game.value.state !== 'playing' || guessed.includes(letter)) return;

  // Only animate when the guess ends the game (the keyboard leaves the DOM);
  // ordinary guesses just update the word and the hangman in place.
  const isMiss = !word.includes(letter);
  const endsGame = isMiss
    ? misses + 1 >= 6
    : word.split('').every((l) => l === letter || guessed.includes(l));

  if (endsGame) withTransition(() => guess(letter));
  else guess(letter);
}

</script>
