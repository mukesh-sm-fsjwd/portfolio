/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './admin.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00d4ff',
          cyan: '#00ffff',
          purple: '#a855f7',
          pink: '#ec4899',
          green: '#10b981',
        },
        bg: {
          primary: '#000000',
          secondary: '#0a0a0a',
          tertiary: '#111111',
          card: 'rgba(17,17,17,0.8)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00d4ff, #a855f7)',
        'gradient-secondary': 'linear-gradient(135deg, #00ffff, #00d4ff)',
        'gradient-accent': 'linear-gradient(135deg, #a855f7, #ec4899)',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(0,212,255,0.5)',
        'glow-purple': '0 0 20px rgba(168,85,247,0.5)',
      },
      animation: {
        'wave': 'wave 2s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
        'float': 'float 20s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'scroll-rtl': 'scrollRightToLeft 20s linear infinite',
        'scroll-ltr': 'scrollLeftToRight 25s linear infinite',
        'float-card': 'floatCard 6s ease-in-out infinite',
        'grid-move': 'gridMove 20s linear infinite',
        'fade-in-up': 'fadeInUp 1s ease',
        'rotate-slow': 'rotate 10s linear infinite',
        'pulse-badge': 'pulse-badge 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
