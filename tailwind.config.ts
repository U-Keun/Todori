import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {
        fontFamily: {
            sans: ['"Noto Sans KR"', 'sans-serif'],
        }
    }
  },

  plugins: [require("@tailwindcss/typography")]
} as Config;
