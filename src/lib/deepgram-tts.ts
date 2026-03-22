// src/lib/deepgram-tts.ts
// Deepgram Aura-2 TTS — 2-key rotation
// Endpoint: POST https://api.deepgram.com/v1/speak?model=aura-2-[voice]-en
// Auth: Authorization: Token YOUR_KEY
// Body: plain text (Content-Type: text/plain)
// Response: raw MP3 bytes

const KEYS = [
  process.env.DEEPGRAM_API_KEY_1,
  process.env.DEEPGRAM_API_KEY_2,
].filter(Boolean) as string[]

let keyIndex = 0

function nextKey(): string | null {
  if (KEYS.length === 0) return null
  const key = KEYS[keyIndex % KEYS.length]
  keyIndex++
  return key
}

// Aura-2 genre-matched voices
// Full list: asteria, luna, stella, athena, hera, orion, arcas, perseus,
//            angus, orpheus, helios, zeus, thalia, amalthea, hermes, helena
export const GENRE_CONFIG: Record<string, {
  voice: string
  label: string
  description: string
}> = {
  horror:  { voice: 'orpheus',  label: 'Orpheus',  description: 'Deep, haunting male voice'    },
  romance: { voice: 'luna',     label: 'Luna',     description: 'Warm, emotional female voice' },
  heist:   { voice: 'orion',    label: 'Orion',    description: 'Sharp, confident male voice'  },
  scifi:   { voice: 'stella',   label: 'Stella',   description: 'Clear, futuristic female voice'},
  western: { voice: 'arcas',    label: 'Arcas',    description: 'Gruff, measured male voice'   },
  comedy:  { voice: 'athena',   label: 'Athena',   description: 'Bright, playful female voice' },
}

// Smart truncation — complete sentences under 2000 chars
// Deepgram handles longer text than Unreal Speech
function prepareText(text: string): string {
  if (text.length <= 2000) return text

  // Try full first two paragraphs
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0)
  let result = ''
  for (const para of paragraphs) {
    const candidate = result ? `${result}\n\n${para.trim()}` : para.trim()
    if (candidate.length > 1900) break
    result = candidate
  }

  if (result) return result

  // Fallback: truncate at last sentence under 1900 chars
  const truncated = text.slice(0, 1900)
  const lastSentence = truncated.search(/[.!?][^.!?]*$/)
  return lastSentence > 200 ? truncated.slice(0, lastSentence + 1) : truncated
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
      error: 'No DEEPGRAM_API_KEY configured. Add DEEPGRAM_API_KEY_1 to Vercel environment variables.',
    }
  }

  const config   = GENRE_CONFIG[genre] ?? GENRE_CONFIG.heist
  const prepared = prepareText(text)
  const model    = `aura-2-${config.voice}-en`

  for (let attempt = 0; attempt < KEYS.length; attempt++) {
    const key = nextKey()
    if (!key) continue

    try {
      const res = await fetch(
        `https://api.deepgram.com/v1/speak?model=${model}`,
        {
          method: 'POST',
          headers: {
            // Deepgram uses "Token" not "Bearer"
            'Authorization': `Token ${key}`,
            'Content-Type': 'text/plain',
          },
          body: prepared, // plain text body
        }
      )

      // Quota exceeded — try next key
      if (res.status === 402 || res.status === 429) {
        continue
      }

      if (!res.ok) {
        const errText = await res.text()
        let errMsg = `HTTP ${res.status}`
        try {
          const errJson = JSON.parse(errText)
          errMsg = errJson.err_msg ?? errJson.message ?? errMsg
        } catch {
          errMsg = errText.slice(0, 150) || errMsg
        }

        // Don't retry auth errors — wrong key
        if (res.status === 401 || res.status === 403) {
          return {
            audioDataUri: null,
            error: `Invalid Deepgram API key. Check DEEPGRAM_API_KEY_${attempt + 1} in Vercel.`,
          }
        }

        throw new Error(errMsg)
      }

      // Deepgram streams raw MP3 bytes directly
      const arrayBuffer = await res.arrayBuffer()

      if (arrayBuffer.byteLength === 0) {
        throw new Error('Empty audio response from Deepgram')
      }

      // Convert to base64 data URI
      const base64  = Buffer.from(arrayBuffer).toString('base64')
      const dataUri = `data:audio/mpeg;base64,${base64}`

      return {
        audioDataUri:   dataUri,
        voiceUsed:      `${config.label} · ${config.description}`,
        originalLength: text.length,
        usedLength:     prepared.length,
      }

    } catch (err: unknown) {
      // Try next key on network errors
      if (attempt < KEYS.length - 1) continue
      return {
        audioDataUri: null,
        error: err instanceof Error ? err.message : 'TTS request failed',
      }
    }
  }

  return {
    audioDataUri: null,
    error: 'All Deepgram API keys exhausted or over quota. Add DEEPGRAM_API_KEY_2 to Vercel.',
  }
}
