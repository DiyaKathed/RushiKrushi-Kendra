/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agro: {
          dark: '#245C2A',        // Deep agricultural green
          forest: '#245C2A',      // Alias for deep agricultural green
          leaf: '#438A35',        // Leaf green
          fresh: '#79A83B',       // Fresh crop green
          harvest: '#F2C94C',     // Warm harvest yellow
          earth: '#80552F',       // Earth brown
          cream: '#FAF8F0',       // Warm off-white
          white: '#FFFFFF',
          text: '#263328',        // Main text
          muted: '#5D685B',       // Secondary text
          light: '#EAF2E3',       // Light green section background
          border: '#D7E1D1',      // Borders
          50: '#F4F8F2',
          100: '#EAF2E3',
          200: '#D7E1D1',
          300: '#B8D5B0',
          400: '#79A83B',
          500: '#438A35',
          600: '#357529',
          700: '#245C2A',
          800: '#1C4920',
          900: '#143618',
          950: '#0C220E',
          pale: '#F4F8F2',
          spring: '#79A83B',
          mint: '#93C47D',
          warm: '#FAF8F0',
          amber: '#F2C94C',
          soil: '#80552F'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'Mukta', 'system-ui', 'sans-serif'],
        marathi: ['Noto Sans Devanagari', 'Mukta', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(36, 92, 42, 0.08), 0 1px 2px rgba(36, 92, 42, 0.04)',
        'card-hover': '0 4px 12px rgba(36, 92, 42, 0.12), 0 2px 4px rgba(36, 92, 42, 0.06)',
      }
    },
  },
  plugins: [],
}
