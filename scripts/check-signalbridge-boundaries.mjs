import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const base = path.join(root, 'public/links/archive/artifacts/signalbridge')
const files = {
  architecture: fs.readFileSync(path.join(base, 'architecture-brief.html'), 'utf8'),
  boundary: fs.readFileSync(path.join(base, 'proof-run-boundary-brief.html'), 'utf8'),
  workbenchHtml: fs.readFileSync(path.join(base, 'proof-run/index.html'), 'utf8'),
  workbenchJs: fs.readFileSync(path.join(base, 'proof-run/workbench.js'), 'utf8'),
  pack: fs.readFileSync(path.join(root, 'public/links/archive/data/signalbridge-publication-pack.json'), 'utf8'),
}

const required = {
  architecture: [
    'Computational Collaborator readiness',
    'The valid recommendation may be',
    'not yet',
    'does not establish production traction, revenue, verified savings',
  ],
  boundary: [
    'Mock/no-live-action first',
    'Readiness is not certification',
    'Economic delta boundary',
    'Proof Run candidate',
    'cannot sign a manifest',
  ],
  workbenchHtml: [
    'FIXED SYNTHETIC INVENTORY · MOCK PROOF ONLY · NO LIVE ACTION',
    'performs no upload, crawling, account connection, model call, purchasing, cancellation, data movement, contract change, or production execution',
    'Nothing crosses into production.',
  ],
  workbenchJs: [
    "id:'field-closeout'",
    "id:'collaboration-overlap'",
    "id:'finance-approval'",
    "id:'sensitive-support'",
    "id:'orphan-saas'",
    "id:'customer-billing'",
    "fixtureStatus:'demonstration-only'",
    "evidenceClass:'synthetic-example'",
    "authority:'HUMAN_APPROVAL_REQUIRED'",
    "signature:'UNSIGNED_DEMO'",
    'humanApprovalRequired:true',
    'liveIntegration:false',
    'productionExecution:false',
    'softwareCancellation:false',
    'dataMovement:false',
    'automatedUnderwriting:false',
    'verifiedSavings:false',
    'revenueClaimed:false',
    'persisted:false',
    'networkCalled:false',
    'modelCalled:false',
    'archiveMutation:false',
  ],
  pack: [
    'Published architecture + mock Proof Run',
    'SignalBridge Packet v0.3',
    'Parallax Proof of Outcome Master Packet v0.1',
    'Parallax Lineage Protocol Object Spec v0.2',
    'may correctly resolve to not yet',
  ],
}

const errors = []
for (const [name, phrases] of Object.entries(required)) {
  for (const phrase of phrases) {
    if (!files[name].includes(phrase)) errors.push(`${name} is missing required SignalBridge phrase: ${phrase}`)
  }
}

for (const forbidden of [
  'fetch(', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'sendBeacon',
  'localStorage', 'sessionStorage', 'indexedDB', 'document.cookie',
  'serviceWorker', 'geolocation', 'showOpenFilePicker', 'FileReader',
]) {
  if (files.workbenchJs.includes(forbidden)) errors.push(`SignalBridge Workbench contains forbidden API: ${forbidden}`)
}

if (/https?:\/\//i.test(files.workbenchHtml)) {
  errors.push('SignalBridge Workbench HTML must not load external HTTP assets or actions.')
}

let pack
try {
  pack = JSON.parse(files.pack)
} catch (error) {
  errors.push(`SignalBridge pack JSON failed to parse: ${error.message}`)
}

const project = pack?.projects?.find(item => item.id === 'signalbridge')
if (!project) errors.push('SignalBridge pack must contain signalbridge.')
if (project && project.status !== 'Published architecture + mock Proof Run') {
  errors.push('SignalBridge status must remain Published architecture + mock Proof Run.')
}
for (const phrase of ['production traction', 'verified savings', 'automated underwriting', 'explicit human', 'not yet']) {
  if (project && !String(project.claimBoundary || '').toLowerCase().includes(phrase.toLowerCase())) {
    errors.push(`SignalBridge claim boundary must preserve: ${phrase}`)
  }
}

if (errors.length) {
  console.error('SignalBridge boundary validation failed:')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}

console.log('SignalBridge boundary validation passed.')
