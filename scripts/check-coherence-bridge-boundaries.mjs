import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const base = path.join(root, 'public/links/archive/artifacts/coherence-bridge')
const files = {
  architecture: fs.readFileSync(path.join(base, 'architecture-brief.html'), 'utf8'),
  safety: fs.readFileSync(path.join(base, 'safety-boundary-brief.html'), 'utf8'),
  drillHtml: fs.readFileSync(path.join(base, 'calibration-drill/index.html'), 'utf8'),
  drillJs: fs.readFileSync(path.join(base, 'calibration-drill/drill.js'), 'utf8'),
  pack: fs.readFileSync(path.join(root, 'public/links/archive/data/coherence-bridge-publication-pack.json'), 'utf8'),
}

const required = {
  architecture: [
    'non-clinical system architecture',
    'does not diagnose people',
    'does not diagnose people, provide therapy or crisis care',
    'Success is measured by agency and connection—not retention.',
    'pause, leave, delete, export, disagree',
  ],
  safety: [
    'Secret mood, vulnerability, dependency, or risk scoring.',
    'no one has been notified',
    'not an emergency or crisis service',
    'Retention is not wellbeing.',
    'does not assess the visitor',
  ],
  drillHtml: [
    'SYNTHETIC SYSTEM STATES · NOT A PERSONAL ASSESSMENT',
    'calls no model, saves no response, contacts no one',
    'this is not an emergency service and no one has been notified',
    'This preview is not saved, signed, sent, or treated as evidence of a real event.',
  ],
  drillJs: [
    "fixtureStatus:'demonstration-only'",
    "evidenceClass:'synthetic-example'",
    'humanContacted:false',
    'modelCalled:false',
    "'pause','human','renew'",
  ],
  pack: [
    'Published architecture + drill',
    'no visitor assessment',
    'does not diagnose people',
    'Human contact, pause, export, deletion, disagreement, and exit must remain easy.',
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
  'serviceWorker', 'geolocation',
]) {
  if (files.drillJs.includes(forbidden)) errors.push(`Calibration Drill contains forbidden API: ${forbidden}`)
}

if (/https?:\/\//i.test(files.drillHtml)) errors.push('Calibration Drill HTML must not load external HTTP assets or actions.')

let pack
try {
  pack = JSON.parse(files.pack)
} catch (error) {
  errors.push(`Coherence Bridge pack JSON failed to parse: ${error.message}`)
}

const project = pack?.projects?.find(item => item.id === 'coherence-bridge')
if (!project) errors.push('Coherence Bridge pack must contain coherence-bridge.')
if (project && project.status !== 'Published architecture + drill') errors.push('Coherence Bridge status must remain Published architecture + drill.')
if (project && !String(project.claimBoundary || '').includes('non-clinical research and safety architecture')) errors.push('Claim boundary must preserve non-clinical status.')
if (project && !String(project.claimBoundary || '').includes('contact anyone automatically')) errors.push('Claim boundary must deny automatic contact.')
if (project && !String(project.claimBoundary || '').includes('easy')) errors.push('Claim boundary must preserve easy human contact, pause, and exit.')

if (errors.length) {
  console.error('Coherence Bridge boundary validation failed:')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}

console.log('Coherence Bridge boundary validation passed.')
