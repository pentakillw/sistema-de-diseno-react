/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'segoe': ['"Segoe UI"', 'system-ui', 'sans-serif'],
        'lato': ['"Lato"', 'sans-serif'],
        'courier': ['"Courier Prime"', 'monospace'],
        'roboto': ['"Roboto"', 'sans-serif'],
        'open-sans': ['"Open Sans"', 'sans-serif'],
        'poppins': ['"Poppins"', 'sans-serif'],
        'roboto-slab': ['"Roboto Slab"', 'serif'],
        'inconsolata': ['"Inconsolata"', 'monospace'],
        'playfair-display': ['"Playfair Display"', 'serif'],
        'montserrat': ['"Montserrat"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}



