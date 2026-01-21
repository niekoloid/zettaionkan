<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const props = defineProps<{
  colorName: string
  colorHex: string
}>()

const emit = defineEmits<{
  (e: 'recorded', blob: Blob): void
}>()

const isRecording = ref(false)
const mediaRecorder = ref<MediaRecorder | null>(null)
const audioChunks = ref<Blob[]>([])
const stream = ref<MediaStream | null>(null)
const recordingTime = ref(0)
let timerInterval: NodeJS.Timeout | null = null

const startRecording = async () => {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.value = new MediaRecorder(stream.value)
    audioChunks.value = []

    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.value.push(event.data)
    }

    mediaRecorder.value.onstop = () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' })
      emit('recorded', audioBlob)
      stopStream()
    }

    mediaRecorder.value.start()
    isRecording.value = true
    recordingTime.value = 0
    timerInterval = setInterval(() => {
      recordingTime.value += 0.1
      if (recordingTime.value >= 5) stopRecording() // Max 5 seconds
    }, 100)
  } catch (err) {
    console.error('Error accessing microphone:', err)
    alert('マイクへのアクセスが拒否されました。設定を確認してください。')
  }
}

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false
    if (timerInterval) clearInterval(timerInterval)
  }
}

const stopStream = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
}

onUnmounted(() => {
  stopRecording()
  stopStream()
})
</script>

<template>
  <div class="flex items-center space-x-3">
    <button
      v-if="!isRecording"
      @click="startRecording"
      class="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group relative"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 003 3s3 0 3-3V5a3 3 0 00-3-3z" />
      </svg>
      <span class="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">録音する</span>
    </button>

    <button
      v-else
      @click="stopRecording"
      class="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors relative flex items-center justify-center animate-pulse"
    >
      <div class="w-3 h-3 bg-white rounded-sm"></div>
      <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-red-500 text-[10px] font-bold whitespace-nowrap">
        {{ recordingTime.toFixed(1) }}s
      </div>
    </button>
  </div>
</template>
