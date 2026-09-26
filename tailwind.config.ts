import type { Config } from "tailwindcss";
const config: Config = { content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { fontFamily: { display: ["Space Grotesk", "sans-serif"] }, colors: { ink: "#151826", plum: "#6747d9", coral: "#f06d62", mist: "#f5f5fb" }, boxShadow: { soft: "0 18px 60px rgba(30, 25, 70, .10)" } } }, plugins: [] };
export default config;
