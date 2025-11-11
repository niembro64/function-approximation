/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'canvas-bg': '#1a1a1a',
        'primary': {
          DEFAULT: '#2b7fff',
          hover: '#1a6eee',
        },
        'ui-bg': {
          DEFAULT: '#2a2a2a',
          dark: '#1a1a1a',
          hover: '#252525',
          highlight: '#1e293b',
        },
        'ui-border': {
          DEFAULT: '#555555',
        },
        'ui-text': {
          DEFAULT: '#ffffff',
          normal: '#ffffff',
          muted: '#aaaaaa',
        },
      },
    },
  },
  plugins: [],
}
