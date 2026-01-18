import { ref, onMounted, onUnmounted } from 'vue'

export function useExamTimer(durationMinutes: number) {
  const timeLeft = ref(durationMinutes * 60) // seconds
  const isTimeUp = ref(false)
  let intervalId: number | undefined

  const start = () => {
    intervalId = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value -= 1
      } else {
        isTimeUp.value = true
        clearInterval(intervalId)
      }
    }, 1000)
  }

  const stop = () => {
    if (intervalId) clearInterval(intervalId)
  }

  const formattedTime = () => {
    const minutes = Math.floor(timeLeft.value / 60)
    const seconds = timeLeft.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
  }

  onUnmounted(() => {
    stop()
  })

  return { timeLeft, isTimeUp, start, stop, formattedTime }
}
