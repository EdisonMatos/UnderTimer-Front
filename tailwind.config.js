const flowbiteReact = require("flowbite-react/plugin/tailwindcss");

// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    ".flowbite-react\\class-list.json",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4267B2",
        cards: "#1C2531",
        alerts: "green",
        background: "#10151C",
      },
      screen: {
        phone2: "325px",
      },
    },
  },
  plugins: [flowbiteReact],
};
