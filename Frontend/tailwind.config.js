/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "collection-1-white": "var(--collection-1-white)",
        neutralwhite: "var(--neutralwhite)",
      },
      fontFamily: {
        "heading-h1": "var(--heading-h1-font-family)",
        "regular-none-medium": "var(--regular-none-medium-font-family)",
      },
    },
  },
  plugins: [],
};
