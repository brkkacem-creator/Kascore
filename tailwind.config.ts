/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-syne)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          gold:    '#C9A84C',
          'gold-light': '#F0CC6A',
          'gold-dark':  '#8B6914',
          black:   '#0A0A0A',
          'surface': '#111111',
          'surface2': '#1A1A1A',
          'border': '#2A2410',
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #8B6914 0%, #C9A84C 40%, #F0CC6A 60%, #C9A84C 80%, #8B6914 100%)',
        'gold-radial': 'radial-gradient(ellipse at center, #C9A84C 0%, #8B6914 60%, #5A4209 100%)',
        'hero-dark': 'radial-gradient(ellipse at 30% 40%, rgba(201,168,76,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(201,168,76,0.06) 0%, transparent 60%), #0A0A0A',
      },
      animation: {
        'pulse-dot':  'pulse-dot 1.5s ease-in-out infinite',
        'fade-in':    'fade-in 0.3s ease-out',
        'slide-up':   'slide-up 0.4s ease-out',
        'spin-slow':  'spin 8s linear infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-dot':  { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.3' } },
        'fade-in':    { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up':   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'shimmer':    { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
        'glow-pulse': { '0%,100%': { boxShadow: '0 0 20px rgba(201,168,76,0.15)' }, '50%': { boxShadow: '0 0 40px rgba(201,168,76,0.35)' } },
      },
      boxShadow: {
        'gold':    '0 0 20px rgba(201,168,76,0.25), 0 4px 24px rgba(0,0,0,0.6)',
        'gold-lg': '0 0 40px rgba(201,168,76,0.35), 0 8px 40px rgba(0,0,0,0.8)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
