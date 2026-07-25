import { execFileSync } from 'node:child_process'
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const publicRoot = join(root, 'public')

function collectJavaScriptFiles(directory) {
  const files = []
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry)
    const stats = statSync(fullPath)
    if (stats.isDirectory()) files.push(...collectJavaScriptFiles(fullPath))
    else if (stats.isFile() && fullPath.endsWith('.js')) files.push(fullPath)
  }
  return files
}

const files = collectJavaScriptFiles(publicRoot).sort()
let failures = 0

for (const file of files) {
  const displayPath = relative(root, file)
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' })
    console.log(`✓ ${displayPath}`)
  } catch (error) {
    failures += 1
    console.error(`✗ ${displayPath}`)
    const stderr = error?.stderr?.toString().trim()
    if (stderr) console.error(stderr)
  }
}

if (failures > 0) {
  console.error(`Public JavaScript syntax check failed for ${failures} file(s).`)
  process.exit(1)
}

console.log(`Checked ${files.length} public JavaScript file(s).`)
