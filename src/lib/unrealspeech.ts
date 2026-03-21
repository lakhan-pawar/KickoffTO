// src/lib/unrealspeech.ts
// Key rotation — 3 free accounts = 750k chars/month total

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

// Genre → voice mapping
// Will: confident male, good for heist/western
// Dan: deep male, good for horror/documentary
// Scarlett: clear female, good for sci-fi
// Liv: warm female, good for romance
// Amy: authoritative, good for documentary
// Freya: light female, good for comedy
export const GENRE_VOICES: Record<string, string> = {
  horror:  'Dan',      // deep, menacing
  romance: 'Liv',      // warm, emotional
  heist:   'Will',     // sharp, confident
  scifi:   'Scarlett', // clear, futuristic
  western: 'Dan',      // gruff, measured
  comedy:  'Freya',    // light, playful
}

export interface TTSResult {
  audioUrl: string | null
  error?: string
  usedFallback: boolean
}

export async function textToSpeech(
  text: string,
  genre: string = 'heist'
): Promise<TTSResult> {
  const voiceId = GENRE_VOICES[genre] ?? 'Will'
  const truncated = text.slice(0, 3000) // max per request

  // Try each key in rotation
  for (let attempt = 0; attempt < Math.max(KEYS.length, 1); attempt++) {
    const key = nextKey()

    if (!key) {
      return {
        audioUrl: null,
        error: 'No Unreal Speech API keys configured. Add UNREAL_SPEECH_API_KEY_1 to Vercel.',
        usedFallback: true,
      }
    }

    try {
      const res = await fetch('https://api.v7.unrealspeech.com/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Text: truncated,
          VoiceId: voiceId,
          Bitrate: '192k',
          Speed: '0',
          Pitch: '1',
          TimestampType: 'sentence',
        }),
      })

      // Rate limited — try next key
      if (res.status === 429) {
        continue
      }

      if (!res.ok) {
        const err = await res.text()
        throw new Error(`Unreal Speech ${res.status}: ${err}`)
      }

      const data = await res.json() as {
        OutputUri?: string
        output_uri?: string
      }

      const audioUrl = data.OutputUri ?? data.output_uri ?? null

      if (!audioUrl) throw new Error('No audio URL in response')

      return { audioUrl, usedFallback: false }

    } catch (err: unknown) {
      if (attempt < KEYS.length - 1) continue
      return {
        audioUrl: null,
        error: err instanceof Error ? err.message : 'TTS failed',
        usedFallback: true,
      }
    }
  }

  return { audioUrl: null, error: 'All keys exhausted', usedFallback: true }
}
