import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C5A230',
          light: '#D4B84A',
          pale: '#F0E6C8',
          dark: '#8A6E1A',
        },
        obsidian: {
          DEFAULT: '#0A0A0A',
          50: '#1A1A1A',
          100: '#141414',
          200: '#0F0F0F',
        },
        cream: {
          DEFAULT: '#F5EFE0',
          muted: '#C8BEA8',
          dark: '#A09070',
        },
        smoke: '#252525',
      },
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'Georgia', 'serif'],
        josefin: ['var(--font-josefin)', 'Arial', 'sans-serif'],
        dm: ['var(--font-dm)', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        'ultra': '0.3em',
        'extreme': '0.5em',
      },
      animation: {
        'grain': 'grain 8s steps(10) infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
      },
      keyframes: {
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -5%)' },
          '20%': { transform: 'translate(-10%, 5%)' },
          '30%': { transform: 'translate(5%, -10%)' },
          '40%': { transform: 'translate(-5%, 15%)' },
          '50%': { transform: 'translate(-10%, 5%)' },
          '60%': { transform: 'translate(15%, 0%)' },
          '70%': { transform: 'translate(0%, 10%)' },
          '80%': { transform: 'translate(-15%, 0%)' },
          '90%': { transform: 'translate(10%, 5%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'radial-gold': 'radial-gradient(ellipse at center, rgba(197,162,48,0.08) 0%, transparent 70%)',
        'hero-gradient': 'linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.5) 50%, rgba(10,10,10,0.95) 100%)',
      },
    },
  },
  plugins: [],
}

export default config
