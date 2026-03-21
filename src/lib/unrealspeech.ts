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
export const GENRE_VOICES: Record<string, string> = {
  horror:  'Dan',
  romance: 'Liv',
  heist:   'Will',
  scifi:   'Scarlett',
  western: 'Dan',
  comedy:  'Freya',
}

export interface TTSResult {
  audioUrl: string | null
  error?: string
  usedFallback: boolean
  rawResponse?: string
}

export async function textToSpeech(
  text: string,
  genre: string = 'heist'
): Promise<TTSResult> {
  const voiceId = GENRE_VOICES[genre] ?? 'Will'
  const truncated = text.slice(0, 1500) // shorter = faster generation, less timeout risk

  if (KEYS.length === 0) {
    return {
      audioUrl: null,
      error: 'No UNREAL_SPEECH_API_KEY configured in Vercel environment variables.',
      usedFallback: true,
    }
  }

  // Try each key in rotation
  for (let attempt = 0; attempt < KEYS.length; attempt++) {
    const key = nextKey()
    if (!key) continue

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000) // 25s timeout

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
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Always read as text first — API sometimes returns plain text errors
      const rawText = await res.text()

      // Rate limited — try next key
      if (res.status === 429) {
        if (attempt < KEYS.length - 1) continue
        return {
          audioUrl: null,
          error: 'Rate limit hit on all configured keys.',
          usedFallback: true,
          rawResponse: rawText,
        }
      }

      // Try to parse as JSON
      let data: any = {}
      try {
        data = JSON.parse(rawText)
      } catch {
        // Not JSON — plain text error from Unreal Speech
        return {
          audioUrl: null,
          error: `Unreal Speech error: ${rawText.slice(0, 200)}`,
          usedFallback: true,
          rawResponse: rawText,
        }
      }

      // Check for error in JSON response
      if (data.error || data.message || !res.ok) {
        const errMsg = (data.error ?? data.message ?? `HTTP ${res.status}`) as string
        return {
          audioUrl: null,
          error: `Unreal Speech: ${errMsg}`,
          usedFallback: true,
          rawResponse: rawText,
        }
      }

      // Extract audio URL — try multiple field names
      const audioUrl = (
        data.OutputUri ??
        data.output_uri ??
        data.audioUri ??
        data.audio_uri ??
        data.url ??
        null
      ) as string | null

      if (!audioUrl) {
        return {
          audioUrl: null,
          error: `No audio URL in response. Fields: ${Object.keys(data).join(', ')}`,
          usedFallback: true,
          rawResponse: rawText,
        }
      }

      return { audioUrl, usedFallback: false }

    } catch (err: unknown) {
      clearTimeout(timeoutId)
      if (attempt < KEYS.length - 1) continue
      return {
        audioUrl: null,
        error: err instanceof Error ? err.message : 'Network error',
        usedFallback: true,
      }
    }
  }

  return { audioUrl: null, error: 'All keys exhausted', usedFallback: true }
}
