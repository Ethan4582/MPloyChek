/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        notion: {
          bg: '#191919',
          sidebar: '#202020',
          card: '#202020',
          hover: '#262626',
          active: '#2f2f2f',
          border: '#2f2f2f',
          borderSubtle: '#262626',
          borderStrong: '#373737',
          text: '#ffffff',
          textMuted: '#9b9a97',
          textSubtle: '#605f5b',
          // Notion Muted Tag Colors (Matte, desaturated, authentic)
          tag: {
            grayBg: '#2a2a2a',
            grayText: '#9b9a97',
            blueBg: '#1e2d3d',
            blueText: '#529cca',
            greenBg: '#1f3328',
            greenText: '#4dab7e',
            orangeBg: '#392a1e',
            orangeText: '#e07a38',
            yellowBg: '#37321e',
            yellowText: '#d8a33f',
            purpleBg: '#2f223d',
            purpleText: '#9d68d3',
            pinkBg: '#38202d',
            pinkText: '#d15796',
            redBg: '#3b2222',
            redText: '#e05757',
            brownBg: '#332924',
            brownText: '#bc8c74',
          }
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Helvetica',
          '"Apple Color Emoji"',
          'Arial',
          'sans-serif',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"'
        ],
        mono: [
          '"SFMono-Regular"',
          'Menlo',
          'Consolas',
          '"PT Mono"',
          '"Liberation Mono"',
          'monospace'
        ]
      },
      boxShadow: {
        'notion-popover': '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 0 1px #2f2f2f',
        'notion-dropdown': '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px #333333',
        'notion-card': '0 1px 3px rgba(0, 0, 0, 0.2), 0 0 0 1px #2a2a2a',
      }
    },
  },
  plugins: [],
}
