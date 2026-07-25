import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const base = path.join(root, 'public/links/archive/artifacts/roomlight-data-spine')
const files = {
  architecture: fs.readFileSync(path.join(base, 'architecture-brief.html'), 'utf8'),
  safety: fs.readFileSync(path.join(base, 'safety-boundary-brief.html'), 'utf8'),
  benchHtml: fs.readFileSync(path.join(base, 'field-bench/index.html'), 'utf8'),
  benchJs: fs.readFileSync(path.join(base, 'field-bench/bench.js'), 'utf8'),
  pack: fs.readFileSync(path.join(root, 'public/links/archive/data/roomlight-publication-pack.json'), 'utf8'),
}

const required = {
  architecture: [
    'not a certified instrument, medical device, emergency service, or environmental safety guarantee',
    'A reading may support review; it does not establish that a space is safe.',
    'RoomLight should never infer permission to control hazardous equipment',
    'instrumented starter installation',
  ],
  safety: [
    'Observation does not create control authority.',
    'connects to no live sensor, stores nothing, and sends nothing.',
    'RoomLight is not an emergency service, certified safety system, medical device',
    'Quarantine rule',
  ],
  benchHtml: [
    'SYNTHETIC SENSOR PACKETS · NO LIVE HARDWARE',
    'connects to no sensor, actuator, radio, serial device, cloud service, account, database, or analytics system.',
    'No space is declared safe or unsafe, and no equipment is controlled.',
    'Observation is not certification. A packet is not permission.',
  ],
  benchJs: [
    "fixtureStatus:'demonstration-only'",
    "evidenceClass:'synthetic-example'",
    'liveSensors:false',
    'hardwareControlled:false',
    'networkCalled:false',
    'persisted:false',
  ],
  pack: [
    'Published architecture + field bench',
    'not a certified instrument',
    'uses fixed synthetic data',
    'connects to no hardware',
  ],
}

const errors = []
for (const [name, phrases] of Object.entries(required)) {
  for (const phrase of phrases) {
    if (!files[name].includes(phrase)) errors.push(`${name} is missing required boundary phrase: ${phrase}`)
  }
}

for (const forbidden of [
  'fetch(', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'sendBeacon',
  'localStorage', 'sessionStorage', 'indexedDB', 'document.cookie',
  'serviceWorker', 'geolocation', 'navigator.bluetooth', 'navigator.serial',
  'navigator.usb', 'navigator.hid',
]) {
  if (files.benchJs.includes(forbidden)) errors.push(`RoomLight Field Bench contains forbidden API: ${forbidden}`)
}

if (/https?:\/\//i.test(files.benchHtml)) {
  errors.push('RoomLight Field Bench HTML must not load external HTTP assets or actions.')
}

let pack
try {
  pack = JSON.parse(files.pack)
} catch (error) {
  errors.push(`RoomLight pack JSON failed to parse: ${error.message}`)
}

const project = pack?.projects?.find(item => item.id === 'roomlight-data-spine')
if (!project) errors.push('RoomLight pack must contain roomlight-data-spine.')
if (project && project.status !== 'Published architecture + field bench') {
  errors.push('RoomLight status must remain Published architecture + field bench.')
}
if (project && !String(project.claimBoundary || '').includes('not a certified instrument')) {
  errors.push('RoomLight claim boundary must deny certified-instrument status.')
}
if (project && !String(project.claimBoundary || '').includes('permission to control equipment')) {
  errors.push('RoomLight claim boundary must deny implied equipment-control authority.')
}

if (errors.length) {
  console.error('RoomLight boundary validation failed:')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}

console.log('RoomLight boundary validation passed.')
