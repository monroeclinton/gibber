/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}", "./assets/**/*.svg"],
    theme: {
        extend: {},
    },
    plugins: [require("@tailwindcss/aspect-ratio")],
};
