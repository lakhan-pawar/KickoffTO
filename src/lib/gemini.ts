import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY_1!,
  process.env.GEMINI_API_KEY_2!,
  process.env.GEMINI_API_KEY_3!,
].filter(Boolean)

let currentKeyIndex = 0

function getGeminiClient() {
  const key = GEMINI_KEYS[currentKeyIndex % GEMINI_KEYS.length]
  return new GoogleGenerativeAI(key)
}

function rotateKey() {
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length
}

export async function geminiGenerate(
  prompt: string,
  model: 'gemini-2.0-flash' | 'gemini-2.0-flash-lite' = 'gemini-2.0-flash',
  systemInstruction?: string,
): Promise<string> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < GEMINI_KEYS.length; attempt++) {
    try {
      const genAI = getGeminiClient()
      const geminiModel = genAI.getGenerativeModel({
        model,
        systemInstruction,
      })
      const result = await geminiModel.generateContent(prompt)
      return result.response.text()
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (lastError.message.includes('429') || lastError.message.includes('quota')) {
        rotateKey()
        continue
      }
      throw lastError
    }
  }

  throw lastError ?? new Error('All Gemini keys exhausted')
}

// JSON output helper — strips markdown fences before parsing
export async function geminiJSON<T>(
  prompt: string,
  model: 'gemini-2.0-flash' | 'gemini-2.0-flash-lite' = 'gemini-2.0-flash-lite',
): Promise<T> {
  const raw = await geminiGenerate(
    prompt + '\n\nRespond with ONLY valid JSON. No markdown, no backticks, no explanation.',
    model,
  )
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean) as T
}
