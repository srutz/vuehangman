<template>
  <div class="grow flex flex-col items-center py-8 text-white relative">
    <div class="[view-transition-name:vt-header]">
      <MyHeader>HANGMAN</MyHeader>
    </div>

    <div v-if="game.state !== 'stopped'" class="flex justify-center w-full [view-transition-name:vt-hangman]">
      <MyHangman :misses="game.misses" />
    </div>

    <template v-if="game.state === 'won'">
      <div class="my-8 [view-transition-name:vt-start] text-4xl">
        You won!
      </div>
    </template>
    <template v-if="game.state === 'lost'">
      <div class="my-8 [view-transition-name:vt-start] text-4xl">
        You lost!
      </div>
    </template>
    <template v-if="game.state === 'won' || game.state === 'lost'">
      <div class="flex flex-col items-center gap-2 [view-transition-name:vt-result]">
        <div class="text-sm uppercase tracking-wide opacity-70">The word was</div>
        <div class="flex gap-2 text-4xl font-mono" data-testid="result-word">
          <span v-for="(letter, index) in game.word" :key="index"
            :class="game.guessed.includes(letter) ? 'text-green-400' : 'text-red-400'">{{ letter }}</span>
        </div>
        <div class="mt-2 text-sm uppercase tracking-wide opacity-70">Your guesses</div>
        <div class="flex flex-wrap justify-center gap-2 font-mono text-2xl" data-testid="result-guesses">
          <span v-for="letter in game.guessed" :key="letter"
            :class="game.word.includes(letter) ? 'text-green-400' : 'text-red-400 line-through'">{{ letter }}</span>
        </div>
      </div>
    </template>
    <template v-if="game.state != 'playing'">
      <div class="my-4 [view-transition-name:vt-start]">
        <MyButton @click="start">
          Start Game
        </MyButton>
      </div>
    </template>
    <template v-if="game.state == 'playing'">
      <div class="mt-4 flex gap-2 select-none text-4xl font-mono [view-transition-name:vt-word]">
        <span v-for="(letter, index) in game.word" :key="index">
          {{ game.guessed.includes(letter) ? letter : '_' }}
        </span>
      </div>
      <div class="bottom-4 [view-transition-name:vt-keyboard]">
        <MyKeyboard class="my-8" @key-press="handleKey" :inactiveKeys="game.guessed" />
      </div>
      <div class="mt-4 [view-transition-name:vt-stop]">
        <MyButton @click="stop">
          Stop Game
        </MyButton>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import MyHeader from '@/components/MyHeader.vue';
import MyButton from '../components/MyButton.vue'
import { useHangman } from '@/useHangman.ts';
import MyHangman from '@/components/MyHangman.vue';
import MyKeyboard from '@/components/MyKeyboard.vue';
import { randomGermanWord } from '@/germanWords';
import { withTransition } from '@/viewTransition';
import { useConfirmDialog } from '@/composables/useConfirmDialog.ts';

const { game, startGame, stopGame, guess } = useHangman();
const { showConfirmDialog } = useConfirmDialog();

function start() {
  withTransition(() => startGame(randomGermanWord()));
}

function stop() {
  showConfirmDialog('Do you really want to stop the game?', (confirmed) => {
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
