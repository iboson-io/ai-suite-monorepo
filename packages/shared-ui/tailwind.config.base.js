import path from 'path'
import { fileURLToPath } from 'url'
import sharedPreset from './tailwind.preset.js'

const packageDir = path.dirname(fileURLToPath(import.meta.url))

/** @param {string} appDir Absolute path to the consuming app root */
export function createTailwindConfig(appDir) {
  return {
    presets: [sharedPreset],
    content: [
      path.join(appDir, 'index.html'),
      path.join(appDir, 'src/**/*.{vue,js,ts,jsx,tsx}'),
      path.join(packageDir, 'src/**/*.{vue,js,ts,jsx,tsx}'),
    ],
  }
}
