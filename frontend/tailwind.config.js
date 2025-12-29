/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Touch-friendly sizing
      minHeight: {
        'touch': '44px',  // Apple HIG minimum
      },
      minWidth: {
        'touch': '44px',
      },
      // Custom node sizes
      width: {
        'node': '120px',
      },
      height: {
        'node': '80px',
      },
    },
  },
  plugins: [],
}
