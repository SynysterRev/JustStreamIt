/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html"],
  safelist: ["button-more", "force-display"],
  theme: {
    extend: {
      colors: {
        'title-blue': '#61787f'
      },
    },
  },
  plugins: [],
}

