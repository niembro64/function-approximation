/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        'pulse-slow': 'pulse 1s ease-in-out infinite',
      },
      colors: {
        // Canvas colors
        'canvas-best': '#2b7fff',
        'canvas-other': '#666666',
        'canvas-error': '#fb2c36',
        'canvas-points': '#fb2c36',
        'canvas-point-border': '#ffffff',
        'canvas-bg': '#1a1a1a',
        'canvas-grid': '#333333',
        'canvas-axes': '#666666',
        'canvas-labels': '#aaaaaa',

        // UI colors
        'primary': {
          DEFAULT: '#2b7fff',
          hover: '#1a6eee',
          dark: '#1a6eee',
          'dark-hover': '#0959dd',
        },
        'secondary': {
          DEFAULT: '#555555',
          hover: '#666666',
        },
        'active': {
          DEFAULT: '#d94444',
          hover: '#c73333',
        },
        'ui-bg': {
          DEFAULT: '#2a2a2a',
          dark: '#1a1a1a',
          hover: '#252525',
          highlight: '#1e293b',
        },
        'ui-border': {
          DEFAULT: '#555555',
          subtle: '#444444',
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
