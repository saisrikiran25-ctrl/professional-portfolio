/** Tailwind is only used by the legal page and the ⌘K palette; the main
 *  experience is styled in styles/site.css. Built locally (no CDN). */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        forge: {
          bg: '#090c12',
          darker: '#06080c',
          card: '#11151c',
          hover: '#171c25',
          border: '#1b212b',
          borderLight: '#2a313d',
          accent: '#FF5400',
          accentBright: '#FF7A33',
          accentDim: '#B33A00',
          silver: '#C8C8C8',
          silverDim: '#5a6270',
          muted: '#8b919c',
          cyan: '#00E5FF',
          emerald: '#10B981',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', 'system-ui', 'sans-serif'],
        heading: ['"Bricolage Grotesque Variable"', 'system-ui', 'sans-serif'],
        body: ['"Hanken Grotesk Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        fadeIn: 'fadeIn .25s ease-out both',
      },
    },
  },
  plugins: [],
};
