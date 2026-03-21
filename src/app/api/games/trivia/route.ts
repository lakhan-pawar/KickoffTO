import { NextResponse } from 'next/server'
import { getCache, setCache } from '@/lib/redis'
import { geminiJSON } from '@/lib/gemini'

export const runtime = 'edge'

const FALLBACK_QUESTIONS = [
  {
    question: 'Which country has won the most FIFA World Cups?',
    options: ['Germany', 'Brazil', 'Italy', 'Argentina'],
    correct: 1,
    explanation: 'Brazil has won 5 World Cups (1958, 1962, 1970, 1994, 2002) — more than any other nation.',
  },
  {
    question: 'Who scored the famous "Hand of God" goal in 1986?',
    options: ['Pelé', 'Ronaldo', 'Diego Maradona', 'Zidane'],
    correct: 2,
    explanation: 'Diego Maradona scored the controversial "Hand of God" goal against England in the 1986 quarter-final.',
  },
  {
    question: 'Where will the 2026 World Cup Final be held?',
    options: ['Estadio Azteca', 'MetLife Stadium', 'AT&T Stadium', 'Rose Bowl'],
    correct: 1,
    explanation: 'The 2026 World Cup Final will be held at MetLife Stadium in East Rutherford, New Jersey, USA.',
  },
  {
    question: 'How many teams are competing in WC2026?',
    options: ['32', '36', '48', '64'],
    correct: 2,
    explanation: 'WC2026 is the first tournament to feature 48 teams, expanded from the previous 32-team format.',
  },
  {
    question: 'Which player won the Golden Boot at the 2022 World Cup?',
    options: ['Lionel Messi', 'Kylian Mbappé', 'Olivier Giroud', 'Richarlison'],
    correct: 1,
    explanation: 'Kylian Mbappé won the Golden Boot at Qatar 2022 with 8 goals, despite France losing in the final.',
  },
]

export async function GET() {
  const today = new Date().toISOString().split('T')[0]
  const cacheKey = `trivia:${today}`

  // Check cache first
  const cached = await getCache<{ questions: typeof FALLBACK_QUESTIONS }>(cacheKey)
  if (cached) {
    return NextResponse.json(cached)
  }

  // Generate via Gemini
  try {
    const prompt = `Generate exactly 5 football/soccer World Cup trivia questions for ${today}.
Mix difficulty: 2 easy, 2 medium, 1 hard.
Topics: WC history, famous moments, player records, WC2026 facts, tactics.

Return ONLY valid JSON in this exact format (no markdown, no backticks):
{
  "questions": [
    {
      "question": "question text here",
      "options": ["option A", "option B", "option C", "option D"],
      "correct": 0,
      "explanation": "brief explanation of why this is correct"
    }
  ]
}

The "correct" field is the 0-based index of the correct option.
Make all 4 options plausible — no obviously wrong answers.
Focus on World Cup history and WC2026 facts.`

    const data = await geminiJSON<{ questions: typeof FALLBACK_QUESTIONS }>(prompt)

    if (data.questions?.length === 5) {
      // Cache for 24 hours
      await setCache(cacheKey, data, 86400)
      return NextResponse.json(data)
    }
    throw new Error('Invalid response structure')
  } catch {
    // Cache fallback too so we don't hammer Gemini on errors
    const fallback = { questions: FALLBACK_QUESTIONS }
    await setCache(cacheKey, fallback, 3600) // 1hr for fallback
    return NextResponse.json(fallback)
  }
}
