/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}", "./assets/**/*.svg"],
    theme: {
        extend: {
            screens: {
                // Minimum for full desktop
                // 615px - post container
                // 320px (container) + 40px (margin) - two sidebars
                fd: "1335px",
            },
        },
    },
    plugins: [require("@tailwindcss/aspect-ratio")],
};
