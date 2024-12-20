/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./scripts/popup.js", "./scripts/script.js"],

  theme: {
    extend: {
      colors: {
        'title-blue': '#61787f'
      },
    },
  },
  plugins: [],
}

