import type { Config } from 'tailwindcss';
const config: Config = { content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { colors: { canvas: '#090909', panel: '#111111', line: '#292929', muted: '#969696' } } }, plugins: [] };
export default config;
