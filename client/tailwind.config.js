/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        acdyon: {
          blue: '#1E40FF',
          'blue-hover': '#1937DD',
          gold: '#D4AF37',
          'gold-light': '#FDF9E7',
          dark: '#0F172A',
          'dark-card': '#1E293B',
          'dark-border': '#334155',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'acdyon-blue': '0 18px 40px rgba(30, 64, 255, 0.22)',
        'acdyon-card': '0 24px 80px rgba(15, 23, 42, 0.08)',
        'acdyon-dark-card': '0 24px 80px rgba(0, 0, 0, 0.4)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        pulseSlow: 'pulseSlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        scanline: 'scanline 4s linear infinite',
      },
    },
  },
  plugins: [],
};