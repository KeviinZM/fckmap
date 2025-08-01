/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'fck-orange': '#FF6B35',
        'fck-orange-light': '#FF8A65',
        'fck-orange-dark': '#E55A2B',
      },
    },
  },
  plugins: [],
} 