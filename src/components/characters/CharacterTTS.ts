interface VoiceProfile {
  rate: number
  pitch: number
  volume: number
}

const CHARACTER_VOICES: Record<string, VoiceProfile> = {
  'el-maestro':    { rate: 0.85, pitch: 0.9,  volume: 0.9 },
  'xg-oracle':     { rate: 1.0,  pitch: 0.8,  volume: 0.85 },
  'var-review':    { rate: 0.9,  pitch: 0.85, volume: 0.9 },
  'the-archive':   { rate: 0.8,  pitch: 0.85, volume: 0.85 },
  'talentspotter': { rate: 1.0,  pitch: 1.0,  volume: 0.9 },
  'the-voice':     { rate: 1.1,  pitch: 1.2,  volume: 1.0 },
  'ultra':         { rate: 1.3,  pitch: 1.3,  volume: 1.0 },
  'fpl-guru':      { rate: 1.1,  pitch: 1.1,  volume: 0.9 },
  'aria-9':        { rate: 0.95, pitch: 0.5,  volume: 0.85 },
  'coach-believe': { rate: 1.2,  pitch: 1.2,  volume: 1.0 },
  'chef-fury':     { rate: 1.4,  pitch: 1.1,  volume: 1.0 },
  'the-antagonist':{ rate: 1.0,  pitch: 0.7,  volume: 0.9 },
}

export function speakAsCharacter(text: string, characterId: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  const profile = CHARACTER_VOICES[characterId] ?? { rate: 1.0, pitch: 1.0, volume: 0.9 }
  utterance.rate = profile.rate
  utterance.pitch = profile.pitch
  utterance.volume = profile.volume
  utterance.lang = 'en-US'

  const voices = window.speechSynthesis.getVoices()
  const preferredVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google'))
    ?? voices.find(v => v.lang.startsWith('en'))
    ?? voices[0]
  if (preferredVoice) utterance.voice = preferredVoice

  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}
