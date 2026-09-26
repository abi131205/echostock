/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rust: {
          DEFAULT: '#B7410E',
          hover: '#9E370C',
          light: '#FDF3EE',
          border: '#F4CBB7'
        },
        charcoal: {
          DEFAULT: '#252A33',
          surface: '#1E222A',
          card: '#2D333E'
        },
        slate: {
          secondary: '#4A5568',
          subtle: '#6B7280',
          border: '#E2E8F0'
        },
        offwhite: '#FAF7F5',
        muted: '#6B6F76',
        risk: {
          healthy: '#15803D',
          healthyBg: '#DCFCE7',
          low: '#B45309',
          lowBg: '#FEF3C7',
          critical: '#B91C1C',
          criticalBg: '#FEE2E2'
        }
      },
      fontFamily: {
        serif: ['Bitter', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
