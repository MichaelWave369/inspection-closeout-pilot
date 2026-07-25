import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const base = path.join(root, 'public/links/archive/artifacts/phios')
const files = {
  architecture: fs.readFileSync(path.join(base, 'architecture-brief.html'), 'utf8'),
  boundary: fs.readFileSync(path.join(base, 'context-boundary-brief.html'), 'utf8'),
  workbenchHtml: fs.readFileSync(path.join(base, 'context-workbench/index.html'), 'utf8'),
  workbenchJs: fs.readFileSync(path.join(base, 'context-workbench/workbench.js'), 'utf8'),
  pack: fs.readFileSync(path.join(root, 'public/links/archive/data/phios-publication-pack.json'), 'utf8'),
}

const required = {
  architecture: [
    'PhiOS is the sovereign operator shell above PhiKernel',
    'PhiKernel is a source of truth inside the software runtime',
    'Identity and persona fields are collaboration context',
    'writeback is a proposed continuity event',
    'non-truth-bearing interpretive or curation layers',
    'not validated measures of mental health',
  ],
  boundary: [
    'An identity field may name a user-selected profile',
    'It does not verify legal identity',
    'A persona is a bounded collaboration configuration',
    'Memory retrieval is not truth',
    'Mission writeback is a proposed continuity event',
    'Readiness states such as ready, caution, or hold are advisory heuristic summaries',
    'does not accept personal information',
  ],
  workbenchHtml: [
    'FIXED SYNTHETIC CONTEXT · NO PERSONAL DATA · NO RUNTIME ACCESS',
    'does not accept visitor information, access PhiOS or PhiKernel, read or write memory, create a real persona, call MCP, dispatch a collaborator, compare adapters, promote a runtime, invoke a model, or save state',
    'No context or runtime changes occur.',
  ],
  workbenchJs: [
    "id:'bounded-context'",
    "id:'stale-conflict'",
    "id:'private-memory'",
    "id:'persona-overreach'",
    "id:'dissent-writeback'",
    "id:'adapter-promotion'",
    "fixtureStatus:'demonstration-only'",
    "evidenceClass:'synthetic-example'",
    "operatorAuthority:'HUMAN_REVIEW_REQUIRED'",
    "signature:'UNSIGNED_DEMO'",
    'identityVerified:false',
    'personhoodClaimed:false',
    'personaApplied:false',
    'personalDataAccepted:false',
    'phiosConnected:false',
    'phikernelConnected:false',
    'agentoraConnected:false',
    'mcpCalled:false',
    'modelCalled:false',
    'memoryRead:false',
    'memoryWritten:false',
    'fileAccessed:false',
    'networkCalled:false',
    'pulseExecuted:false',
    'collaboratorDispatched:false',
    'adapterCompared:false',
    'adapterPromoted:false',
    'runtimeChanged:false',
    'writebackApplied:false',
    'persisted:false',
    'archiveMutation:false',
    'observatoryOutputIsTruth:false',
    'coherenceScoreIsClinical:false',
    'humanApprovalRequired:true',
  ],
  pack: [
    'Published shell architecture + context workbench',
    'PhiOS shell above PhiKernel',
    'Shadow advisory only',
    'PhiKernel is authoritative only inside its declared software runtime contract',
    'Identity labels and persona settings remain human-declared collaboration context',
    'PhiOS Public Context and Rollout Proof Suite',
  ],
}

const errors = []
for (const [name, phrases] of Object.entries(required)) {
  for (const phrase of phrases) {
    if (!files[name].includes(phrase)) errors.push(`${name} is missing required PhiOS phrase: ${phrase}`)
  }
}

for (const forbidden of [
  'fetch(', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'sendBeacon',
  'localStorage', 'sessionStorage', 'indexedDB', 'document.cookie',
  'serviceWorker', 'geolocation', 'showOpenFilePicker', 'FileReader',
  'eval(', 'new Function(', 'WebAssembly',
]) {
  if (files.workbenchJs.includes(forbidden)) errors.push(`PhiOS Workbench contains forbidden API: ${forbidden}`)
}

if (/https?:\/\//i.test(files.workbenchHtml)) {
  errors.push('PhiOS Workbench HTML must not load external HTTP assets or actions.')
}

let pack
try {
  pack = JSON.parse(files.pack)
} catch (error) {
  errors.push(`PhiOS pack JSON failed to parse: ${error.message}`)
}

const project = pack?.projects?.find(item => item.id === 'phios')
if (!project) errors.push('PhiOS pack must contain phios.')
if (project && project.status !== 'Published shell architecture + context workbench') {
  errors.push('PhiOS status must remain Published shell architecture + context workbench.')
}
for (const phrase of ['legal identity', 'personhood', 'mental-health assessment', 'physical law', 'complete or truthful memory', 'explicit human review']) {
  if (project && !String(project.claimBoundary || '').toLowerCase().includes(phrase.toLowerCase())) {
    errors.push(`PhiOS claim boundary must preserve: ${phrase}`)
  }
}

if (errors.length) {
  console.error('PhiOS boundary validation failed:')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}

console.log('PhiOS boundary validation passed.')
