/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#fcfbf9',
          card: '#ffffff',
          dim: '#f5f4ef',
          line: '#e7e5e4',
        },
        ink: {
          DEFAULT: '#1c1917',
          light: '#44403c',
          muted: '#78716c',
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Charter', 'Bitstream Charter', 'Iowan Old Style', 'Georgia', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['IBM Plex Mono', 'SF Mono', 'Consolas', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
