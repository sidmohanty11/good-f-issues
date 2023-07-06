/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    container: {
			center: true,
			padding: "2rem",
			screens: {
			  "2xl": "1400px",
			},
		},
    extend: {},
  },
  plugins: [],
};
