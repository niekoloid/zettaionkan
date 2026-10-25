'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export default function VoiceRecorder({ colorName, colorHex, onRecorded }: { colorName: string; colorHex: string; onRecorded: (blob: Blob) => void }) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const recorder = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const chunks = useRef<Blob[]>([])
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordingRef = useRef(false)

  const stopStream = () => {
    stream.current?.getTracks().forEach(track => track.stop())
    stream.current = null
  }

  const stopRecording = useCallback(() => {
    if (recorder.current && recordingRef.current) {
      recorder.current.stop()
      recordingRef.current = false
      setIsRecording(false)
      if (timerInterval.current) clearInterval(timerInterval.current)
    }
  }, [])

  const startRecording = async () => {
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream.current)
      recorder.current = mr
      chunks.current = []
      mr.ondataavailable = event => { chunks.current.push(event.data) }
      mr.onstop = () => {
        onRecorded(new Blob(chunks.current, { type: 'audio/webm' }))
        stopStream()
      }
      mr.start()
      recordingRef.current = true
      setIsRecording(true)
      setRecordingTime(0)
      let t = 0
      timerInterval.current = setInterval(() => {
        t += 0.1
        setRecordingTime(t)
        if (t >= 5) stopRecording() // max 5 seconds
      }, 100)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      alert('マイクへのアクセスが拒否されました。設定を確認してください。')
    }
  }

  useEffect(() => () => {
    if (timerInterval.current) clearInterval(timerInterval.current)
    if (recorder.current && recordingRef.current) recorder.current.stop()
    stopStream()
  }, [])

  return (
<div className="flex items-center space-x-3">{(!isRecording) ? (<button className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group relative" onClick={startRecording}><svg className="h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 003 3s3 0 3-3V5a3 3 0 00-3-3z" /></svg><span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">録音する</span></button>) : (<button className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors relative flex items-center justify-center animate-pulse" onClick={stopRecording}><div className="w-3 h-3 bg-white rounded-sm" /><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-red-500 text-[10px] font-bold whitespace-nowrap">{recordingTime.toFixed(1)}s</div></button>)}</div>
  )
}
