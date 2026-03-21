// src/lib/unrealspeech.ts
// Uses v8 /stream endpoint — returns base64 audio data URI directly

const KEYS = [
  process.env.UNREAL_SPEECH_API_KEY_1,
  process.env.UNREAL_SPEECH_API_KEY_2,
  process.env.UNREAL_SPEECH_API_KEY_3,
].filter(Boolean) as string[]

let keyIndex = 0

function nextKey(): string | null {
  if (KEYS.length === 0) return null
  const key = KEYS[keyIndex % KEYS.length]
  keyIndex++
  return key
}

// Genre-matched voices and settings
export const GENRE_CONFIG: Record<string, {
  voice: string
  speed: string
  pitch: string
  label: string
}> = {
  horror:  { voice: 'Dan',      speed: '-0.3', pitch: '0.85', label: 'Dan — deep & eerie'      },
  romance: { voice: 'Liv',      speed: '-0.1', pitch: '1.05', label: 'Liv — warm & emotional'  },
  heist:   { voice: 'Will',     speed: '0.1',  pitch: '1.0',  label: 'Will — sharp & confident'},
  scifi:   { voice: 'Scarlett', speed: '0.0',  pitch: '1.1',  label: 'Scarlett — clear & cool' },
  western: { voice: 'Dan',      speed: '-0.2', pitch: '0.9',  label: 'Dan — gruff & measured'  },
  comedy:  { voice: 'Freya',    speed: '0.2',  pitch: '1.1',  label: 'Freya — light & playful' },
}

export interface TTSResult {
  audioDataUri: string | null  // data:audio/mpeg;base64,...
  error?: string
  voiceUsed?: string
}

export async function textToSpeech(
  text: string,
  genre: string = 'heist'
): Promise<TTSResult> {
  if (KEYS.length === 0) {
    return {
      audioDataUri: null,
      error: 'No UNREAL_SPEECH_API_KEY configured. Add UNREAL_SPEECH_API_KEY_1 to Vercel.',
    }
  }

  const config = GENRE_CONFIG[genre] ?? GENRE_CONFIG.heist

  // /stream supports max 1000 chars
  const truncated = text.slice(0, 1000)
  const useStream = truncated.length <= 1000

  for (let attempt = 0; attempt < KEYS.length; attempt++) {
    const key = nextKey()
    if (!key) continue

    try {
      const endpoint = useStream
        ? 'https://api.v8.unrealspeech.com/stream'
        : 'https://api.v8.unrealspeech.com/speech'

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Text: truncated,
          VoiceId: config.voice,
          Bitrate: '192k',
          Speed: config.speed,
          Pitch: config.pitch,
          Codec: 'libmp3lame',
        }),
      })

      // Rate limited — try next key
      if (res.status === 429) continue

      if (!res.ok) {
        const errText = await res.text()
        let errMsg = `HTTP ${res.status}`
        try {
          const errJson = JSON.parse(errText)
          errMsg = errJson.message ?? errJson.error ?? errMsg
        } catch {
          errMsg = errText.slice(0, 100) || errMsg
        }
        throw new Error(errMsg)
      }

      // /stream returns raw audio bytes
      const arrayBuffer = await res.arrayBuffer()

      if (arrayBuffer.byteLength === 0) {
        throw new Error('Empty audio response from Unreal Speech')
      }

      // Buffer works in Node.js runtime
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const dataUri = `data:audio/mpeg;base64,${base64}`

      return {
        audioDataUri: dataUri,
        voiceUsed: config.label,
      }

    } catch (err: unknown) {
      if (attempt < KEYS.length - 1) continue
      return {
        audioDataUri: null,
        error: err instanceof Error ? err.message : 'TTS failed',
      }
    }
  }

  return { audioDataUri: null, error: 'All keys exhausted' }
}
