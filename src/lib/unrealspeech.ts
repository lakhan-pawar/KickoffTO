// src/lib/unrealspeech.ts
// Based on confirmed working v8 API protocol

const KEYS = [
  process.env.UNREAL_SPEECH_API_KEY_1,
  process.env.UNREAL_SPEECH_API_KEY_2,
  process.env.UNREAL_SPEECH_API_KEY_3,
].filter(Boolean).map(k => k!.trim()) as string[]

let keyIndex = 0

function nextKey(): string | null {
  if (KEYS.length === 0) return null
  const key = KEYS[keyIndex % KEYS.length]
  keyIndex++
  return key
}

// v8 voice IDs confirmed working
// Available: Sierra, Jasper, Aria, Nova, Eric, Liam, Ryan
export const GENRE_CONFIG: Record<string, {
  voice: string
  speed: number
  pitch: number
  label: string
}> = {
  horror:  { voice: 'Jasper', speed: -0.3, pitch: 0.85, label: 'Jasper — deep & eerie'       },
  romance: { voice: 'Aria',   speed: -0.1, pitch: 1.05, label: 'Aria — warm & emotional'     },
  heist:   { voice: 'Ryan',   speed:  0.1, pitch: 1.0,  label: 'Ryan — sharp & confident'    },
  scifi:   { voice: 'Sierra', speed:  0.0, pitch: 1.1,  label: 'Sierra — clear & futuristic' },
  western: { voice: 'Liam',   speed: -0.2, pitch: 0.9,  label: 'Liam — gruff & measured'     },
  comedy:  { voice: 'Nova',   speed:  0.2, pitch: 1.1,  label: 'Nova — light & playful'      },
}

// Smart truncation — find last complete sentence under 950 chars
function prepareText(text: string): string {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0)
  if (paragraphs.length === 0) return text.slice(0, 950)

  let result = ''
  for (const para of paragraphs) {
    const candidate = result ? `${result}\n\n${para.trim()}` : para.trim()
    if (candidate.length > 950) break
    result = candidate
  }

  if (!result) {
    const first = paragraphs[0].slice(0, 950)
    const lastDot = first.search(/[.!?][^.!?]*$/)
    return lastDot > 100 ? first.slice(0, lastDot + 1) : first
  }

  return result
}

export interface TTSResult {
  audioDataUri: string | null
  error?: string
  voiceUsed?: string
  originalLength?: number
  usedLength?: number
}

export async function textToSpeech(
  text: string,
  genre: string = 'heist'
): Promise<TTSResult> {
  if (KEYS.length === 0) {
    return {
      audioDataUri: null,
      error: 'No UNREAL_SPEECH_API_KEY configured in Vercel environment variables.',
    }
  }

  const config   = GENRE_CONFIG[genre] ?? GENRE_CONFIG.heist
  const prepared = prepareText(text)

  for (let attempt = 0; attempt < KEYS.length; attempt++) {
    const key = nextKey()
    if (!key) continue

    try {
      const res = await fetch('https://api.v8.unrealspeech.com/stream', {
        method: 'POST',
        headers: {
          // Official v8 API requires Bearer prefix (confirmed via search)
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Text:          prepared,
          VoiceId:       config.voice,
          Bitrate:       '192k',
          AudioFormat:   'mp3',
          OutputFormat:  'stream', // stream = raw bytes in response body
          TimestampType: 'sentence',
          Speed:         String(config.speed),
          Pitch:         String(config.pitch),
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
          errMsg = errText.slice(0, 150) || errMsg
        }
        throw new Error(errMsg)
      }

      // Read raw bytes and convert to base64 data URI
      const arrayBuffer = await res.arrayBuffer()

      if (arrayBuffer.byteLength === 0) {
        throw new Error('Empty audio response — check voice ID and text length')
      }

      // Buffer works in Node.js runtime
      const base64    = Buffer.from(arrayBuffer).toString('base64')
      const dataUri   = `data:audio/mpeg;base64,${base64}`

      return {
        audioDataUri:   dataUri,
        voiceUsed:      config.label,
        originalLength: text.length,
        usedLength:     prepared.length,
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
