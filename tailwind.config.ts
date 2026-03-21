import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          green: '#16a34a',
          hover: '#15803d',
        },
      },
      fontVariantNumeric: {
        tabular: 'tabular-nums',
      },
    },
  },
  plugins: [],
}

export default config
