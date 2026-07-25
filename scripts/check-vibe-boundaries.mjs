import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const base = path.join(root, 'public/links/archive/artifacts/vibe')
const files = {
  architecture: fs.readFileSync(path.join(base, 'architecture-brief.html'), 'utf8'),
  commandBoundary: fs.readFileSync(path.join(base, 'command-boundary-brief.html'), 'utf8'),
  workbenchHtml: fs.readFileSync(path.join(base, 'intent-workbench/index.html'), 'utf8'),
  workbenchJs: fs.readFileSync(path.join(base, 'intent-workbench/workbench.js'), 'utf8'),
  pack: fs.readFileSync(path.join(root, 'public/links/archive/data/vibe-publication-pack.json'), 'utf8'),
}

const required = {
  architecture: [
    'intention is source code',
    'Preservation is compilation truth',
    'emission is blocked',
    'does not mean complete theorem proving',
    'working prototype compiler with implemented bounded language and domain slices',
    'PhiPython is a bounded guided Python layer inside Vibe',
  ],
  commandBoundary: [
    'Preview should be the default review posture',
    'No hidden apply',
    'not a correctness proof',
    'Command availability is not command authorization',
    'VIBE_COMMAND_ATLAS.md',
  ],
  workbenchHtml: [
    'FIXED SYNTHETIC SPECS · NO CODE EXECUTION · NO REAL EMISSION',
    'does not accept uploads, execute source code, invoke the real compiler, call a model, access a registry, apply patches, persist state, or emit production artifacts',
    'No real target is emitted.',
  ],
  workbenchJs: [
    "id:'payment-router'",
    "id:'hidden-telemetry'",
    "id:'missing-authority'",
    "id:'irreversible-migration'",
    "id:'semantic-drift'",
    "id:'safe-patch'",
    "fixtureStatus:'demonstration-only'",
    "evidenceClass:'synthetic-example'",
    'emissionPerformed:false',
    'patchApplied:false',
    'realCompilerInvoked:false',
    'codeExecuted:false',
    'visitorInputAccepted:false',
    'canonicalProofArtifact:false',
    'humanAuthorizationRequired:true',
    'persisted:false',
    'networkCalled:false',
    'modelCalled:false',
    'archiveMutation:false',
  ],
  pack: [
    'Published compiler architecture + intent workbench',
    'working prototype compiler with implemented bounded language and domain slices',
    'Current Vibe proof means machine-checkable metadata',
    'VIBE_COMMAND_ATLAS.md',
    'Vibe Public Preservation Fixture Suite',
  ],
}

const errors = []
for (const [name, phrases] of Object.entries(required)) {
  for (const phrase of phrases) {
    if (!files[name].includes(phrase)) errors.push(`${name} is missing required Vibe phrase: ${phrase}`)
  }
}

for (const forbidden of [
  'fetch(', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'sendBeacon',
  'localStorage', 'sessionStorage', 'indexedDB', 'document.cookie',
  'serviceWorker', 'geolocation', 'showOpenFilePicker', 'FileReader',
  'eval(', 'new Function(', 'WebAssembly',
]) {
  if (files.workbenchJs.includes(forbidden)) errors.push(`Vibe Workbench contains forbidden API: ${forbidden}`)
}

if (/https?:\/\//i.test(files.workbenchHtml)) {
  errors.push('Vibe Workbench HTML must not load external HTTP assets or actions.')
}

let pack
try {
  pack = JSON.parse(files.pack)
} catch (error) {
  errors.push(`Vibe pack JSON failed to parse: ${error.message}`)
}

const project = pack?.projects?.find(item => item.id === 'vibe')
if (!project) errors.push('Vibe pack must contain vibe.')
if (project && project.status !== 'Published compiler architecture + intent workbench') {
  errors.push('Vibe status must remain Published compiler architecture + intent workbench.')
}
for (const phrase of ['bounded language', 'full formal verification', 'guaranteed correctness', 'human', 'unstated expectations']) {
  if (project && !String(project.claimBoundary || '').toLowerCase().includes(phrase.toLowerCase())) {
    errors.push(`Vibe claim boundary must preserve: ${phrase}`)
  }
}

if (errors.length) {
  console.error('Vibe boundary validation failed:')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}

console.log('Vibe boundary validation passed.')
