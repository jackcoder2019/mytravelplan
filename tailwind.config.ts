import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'navy-deep':  '#1a1a2e',
        'navy-mid':   '#16213e',
        'navy-light': '#0f3460',
        'accent-red': '#e94560',
        'accent-teal':'#a8dadc',
      },
    },
  },
  plugins: [],
}

export default config
