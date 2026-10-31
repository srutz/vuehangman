import { ref } from "vue";

export type GameState = {
  state: "stopped" | "playing" | "won" | "lost"
  attempts: number
  misses: number
  word: string
  guessed: string[]
}



export function useHangman() {
  const game = ref<GameState>({
    state: "stopped",
    attempts: 0,
    misses: 0,
    word: "",
    guessed: []
  })

  function startGame(word: string) {
    game.value.state = "playing"
    game.value.word = word.toUpperCase()
    game.value.attempts = 0
    game.value.misses = 0
    game.value.guessed = []
  }

  function stopGame() {
    game.value.state = "stopped"
    game.value.attempts = 0
    game.value.misses = 0
    game.value.word = ""
    game.value.guessed = []
  }

  function guess(letter: string) {
    letter = letter.toUpperCase()
    if (game.value.state === "playing" && !game.value.guessed.includes(letter)) {
      game.value.guessed.push(letter)
      game.value.attempts++
      if (!game.value.word.includes(letter)) {
        game.value.misses++
      }
      if (game.value.word.split("").every(l => game.value.guessed.includes(l))) {
        game.value.state = "won"
      } else if (game.value.misses >= 6) {
        game.value.state = "lost"
      }
    }
  }

  return { game, startGame, stopGame, guess }
}
