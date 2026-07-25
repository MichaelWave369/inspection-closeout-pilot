import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve('public/links/archive/artifacts/carbon-loop/lumenbridge')
const filenames = (await readdir(root)).filter(name => /\.(?:html|css|js)$/i.test(name)).sort()
const documents = new Map()

for (const filename of filenames) {
  documents.set(filename, await readFile(path.join(root, filename), 'utf8'))
}

const combined = [...documents.entries()].map(([name, text]) => `\n/* ${name} */\n${text}`).join('\n')
const errors = []
const forbidden = [
  ['fetch()', /\bfetch\s*\(/i],
  ['XMLHttpRequest', /\bXMLHttpRequest\b/i],
  ['WebSocket', /\bWebSocket\b/i],
  ['EventSource', /\bEventSource\b/i],
  ['sendBeacon', /\bsendBeacon\b/i],
  ['localStorage', /\blocalStorage\b/i],
  ['sessionStorage', /\bsessionStorage\b/i],
  ['IndexedDB', /\bindexedDB\b/i],
  ['cookies', /\bdocument\.cookie\b/i],
  ['service worker registration', /\bserviceWorker\s*\.\s*register\b/i],
  ['geolocation', /\bnavigator\.geolocation\b/i],
  ['external HTTP asset', /(?:src|href)\s*=\s*["']https?:\/\//i],
  ['external form action', /<form[^>]+action\s*=\s*["'](?:https?:)?\/\//i],
]

for (const [label, pattern] of forbidden) {
  if (pattern.test(combined)) errors.push(`LumenBridge boundary violation: ${label} is present.`)
}

const html = documents.get('index.html') || ''
const required = [
  'Nothing is saved.',
  'No one has been notified by this page.',
  'It does not diagnose, treat, monitor, or provide crisis support.',
  'No account, analytics, runtime network request after the static page loads, or hidden score is used.',
]

for (const disclosure of required) {
  if (!html.includes(disclosure)) errors.push(`LumenBridge disclosure missing: “${disclosure}”`)
}

if (!documents.has('lumenbridge.js')) errors.push('LumenBridge script is missing.')
if (!documents.has('lumenbridge.css')) errors.push('LumenBridge stylesheet is missing.')

if (errors.length) {
  console.error('LumenBridge boundary validation failed:')
  errors.forEach(error => console.error(`- ${error}`))
  process.exitCode = 1
} else {
  console.log(`LumenBridge boundary validation passed: ${filenames.length} local files checked.`)
}
