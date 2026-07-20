/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: {
          50: '#f0f0f5',
          100: '#d8d8e8',
          200: '#b0b0d0',
          300: '#8888b8',
          400: '#6060a0',
          500: '#4040a0',
          600: '#303080',
          700: '#252560',
          800: '#1a1a40',
          900: '#0f0f25',
          950: '#080818',
        },
        mood: {
          happy: '#fbbf24',
          calm: '#60a5fa',
          neutral: '#9ca3af',
          sad: '#818cf8',
          angry: '#f87171',
          excited: '#fb923c',
          tired: '#a78bfa',
          grateful: '#34d399',
        }
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
}
