import path from 'path'
import { fileURLToPath } from 'url'
import { createTailwindConfig } from '@ai-suite/shared-ui/tailwind.config.base.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('tailwindcss').Config} */
export default createTailwindConfig(__dirname)
