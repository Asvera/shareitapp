import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    solid()
  ],
  base: "/share/", // Set to the repo name
  build: {
    outDir: "dist",
  },
})
