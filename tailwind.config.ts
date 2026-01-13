// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],

  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        // Your custom colors
        primary: '#0F3D2E',   // dark green
        secondary: '#6BAF92', // light green
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
    },
  },

  plugins: [],
}
