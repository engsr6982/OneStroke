import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const INVALID_CHAR_REGEX = /[\x00-\x1F\x7F<>*#"{}|^[\]`;?:&=+$,]/g
const DRIVE_LETTER_REGEX = /^[a-z]:/i

export default defineConfig({
  plugins: [vue()],
  build: {
    // minify: false, // false to debug
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: true,
    assetsDir: '.',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/main.ts'),
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content/content.ts'),
        loader: resolve(__dirname, 'src/content/loader.ts'),
        sidepanel: resolve(__dirname, 'src/sidepanel/main.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',

        sanitizeFileName(fileName) {
          const match = DRIVE_LETTER_REGEX.exec(fileName)
          const driveLetter = match ? match[0] : ''
          return driveLetter + fileName.slice(driveLetter.length).replace(INVALID_CHAR_REGEX, '')
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
