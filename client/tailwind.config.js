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
    },
  },
  plugins: [],
};