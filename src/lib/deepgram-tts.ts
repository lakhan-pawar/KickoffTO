// src/lib/deepgram-tts.ts
// Multi-voice support — calls Deepgram per speaker segment.

const KEYS = [
  process.env.DEEPGRAM_API_KEY_1,
  process.env.DEEPGRAM_API_KEY_2,
].filter(Boolean) as string[]

let keyIndex = 0

function nextKey(): string | null {
  if (!KEYS.length) return null
  const key = KEYS[keyIndex % KEYS.length]
  keyIndex++
  return key
}

// Genre narrator voices
export const GENRE_CONFIG: Record<string, {
  narratorVoice: string
  label: string
}> = {
  horror:  { narratorVoice: 'orpheus', label: 'Orpheus (Horror narrator)'   },
  romance: { narratorVoice: 'luna',    label: 'Luna (Romance narrator)'     },
  heist:   { narratorVoice: 'orion',   label: 'Orion (Heist narrator)'      },
  scifi:   { narratorVoice: 'helios',  label: 'Helios (Sci-Fi narrator)'    },
  western: { narratorVoice: 'arcas',   label: 'Arcas (Western narrator)'    },
  comedy:  { narratorVoice: 'athena',  label: 'Athena (Comedy narrator)'    },
}

// Character type → voice mapping
const CHARACTER_VOICES: Record<string, string> = {
  NARRATOR:    '', // set per genre
  PLAYER:      'orion',   // confident male
  MASTERMIND:  'orion',
  COMMANDER:   'perseus',
  SHERIFF:     'arcas',
  CONFUSED:    'zeus',
  KEEPER:      'helios',
  SAFE:        'helios',
  ANDROID:     'helios',
  COACH:       'eric',
  BARKEEP:     'eric',
  CONTROL:     'zeus',
  LOOKOUT:     'zeus',
  OUTLAW:      'orpheus',
  REFEREE:     'zeus',
  CROWD:       'thalia',
  FAN:         'thalia',
}

interface ScriptSegment {
  speaker: string
  text: string
  voice: string
}

export function cleanScriptForTTS(script: string): string {
  return script
    // Remove FADE IN/OUT, CUT TO, etc
    .replace(/\b(FADE IN|FADE OUT|CUT TO|SMASH CUT|DISSOLVE TO|MATCH CUT)\s*:?/gi, '')
    // Remove INT. / EXT. scene headings
    .replace(/^(INT\.|EXT\.)\s+.+$/gm, '')
    // Remove (stage directions in parentheses)
    .replace(/\([^)]*\)/g, '')
    // Remove ALL CAPS character name headers (e.g. "LIONEL" on its own line)
    // but preserve [TAGS]
    .replace(/^[A-Z][A-Z\s]{3,}$/gm, '')
    // Remove "SCENE 1 -" type headings
    .replace(/^SCENE\s+\d+\s*[-–]?.*/gmi, '')
    // Clean up multiple blank lines
    .replace(/\n{3,}/g, '\n\n')
    // Clean up leading/trailing whitespace per line
    .split('\n').map(l => l.trim()).join('\n')
    .trim()
}

// Parse [SPEAKER] or [SPEAKER:Name] tags
export function parseScript(
  script: string,
  genre: string
): ScriptSegment[] {
  const config        = GENRE_CONFIG[genre] ?? GENRE_CONFIG.heist
  const narratorVoice = config.narratorVoice

  const lines    = script.split('\n').filter(l => l.trim())
  const segments: ScriptSegment[] = []
  let buffer = ''
  let currentSpeaker = 'NARRATOR'
  let currentVoice   = narratorVoice

  for (const line of lines) {
    // Match [SPEAKER] or [SPEAKER:NAME] at start of line
    const tagMatch = line.match(/^\[([A-Z]+)(?::([^\]]+))?\](.*)$/)

    if (tagMatch) {
      // Save previous buffer
      if (buffer.trim()) {
        segments.push({
          speaker: currentSpeaker,
          text: buffer.trim().replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim(),
          voice: currentVoice
        })
        buffer = ''
      }

      const speakerType = tagMatch[1]
      const remainder   = (tagMatch[3] ?? '').trim()

      currentSpeaker = speakerType
      currentVoice   = speakerType === 'NARRATOR'
        ? narratorVoice
        : (CHARACTER_VOICES[speakerType] ?? narratorVoice)

      if (remainder) buffer = remainder + ' '
    } else {
      buffer += line + ' '
    }
  }

  if (buffer.trim()) {
    segments.push({
      speaker: currentSpeaker,
      text: buffer.trim().replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim(),
      voice: currentVoice
    })
  }

  // Fallback: if no tags found, treat as single narrator block
  if (segments.length === 0 && script.trim()) {
    segments.push({
      speaker: 'NARRATOR',
      text:    script.slice(0, 1800),
      voice:   narratorVoice,
    })
  }

  return segments
}

// Call Deepgram for one segment
async function synthesiseSegment(
  text: string,
  voice: string
): Promise<ArrayBuffer | null> {
  const truncated = text.slice(0, 900) // safe limit per segment

  for (let attempt = 0; attempt < KEYS.length; attempt++) {
    const key = nextKey()
    if (!key) return null

    try {
      const res = await fetch(
        `https://api.deepgram.com/v1/speak?model=aura-2-${voice}-en`,
        {
          method:  'POST',
          headers: {
            'Authorization': `Token ${key}`,
            'Content-Type':  'text/plain',
          },
          body: truncated,
        }
      )

      if (res.status === 402 || res.status === 429) continue
      if (!res.ok) return null

      return await res.arrayBuffer()
    } catch {
      if (attempt < KEYS.length - 1) continue
      return null
    }
  }
  return null
}

export interface TTSResult {
  audioDataUri:   string | null
  error?:         string
  voicesUsed?:    string[]
  segmentCount?:  number
  originalLength?: number
}

// Main export — multi-voice synthesis
export async function textToSpeech(
  text: string,
  genre: string = 'heist'
): Promise<TTSResult> {
  if (!KEYS.length) {
    return {
      audioDataUri: null,
      error: 'No DEEPGRAM_API_KEY configured. Add DEEPGRAM_API_KEY_1 to Vercel.',
    }
  }

  const cleanedText = cleanScriptForTTS(text)
  const segments    = parseScript(cleanedText, genre)

  if (!segments.length) {
    return { audioDataUri: null, error: 'No segments found in script' }
  }

  // Synthesise all segments in parallel
  const audioBuffers = await Promise.all(
    segments.map(seg => synthesiseSegment(seg.text, seg.voice))
  )

  // Filter out failures
  const validBuffers = audioBuffers.filter((b): b is ArrayBuffer => b !== null)

  if (!validBuffers.length) {
    return { audioDataUri: null, error: 'All Deepgram calls failed. Check API keys.' }
  }

  // Concatenate all MP3 buffers
  const totalBytes = validBuffers.reduce((sum, buf) => sum + buf.byteLength, 0)
  const merged     = new Uint8Array(totalBytes)
  let offset       = 0
  for (const buf of validBuffers) {
    merged.set(new Uint8Array(buf), offset)
    offset += buf.byteLength
  }

  const base64  = Buffer.from(merged).toString('base64')
  const dataUri = `data:audio/mpeg;base64,${base64}`

  const voicesUsed = [...new Set(segments.map(s =>
    `${s.speaker}→${s.voice}`
  ))]

  return {
    audioDataUri:    dataUri,
    voicesUsed,
    segmentCount:    segments.length,
    originalLength:  text.length,
  }
}
