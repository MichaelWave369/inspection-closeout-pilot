import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const base = path.join(root, 'public/links/archive/artifacts/parallax-census')
const files = {
  architecture: fs.readFileSync(path.join(base, 'architecture-brief.html'), 'utf8'),
  boundary: fs.readFileSync(path.join(base, 'registry-boundary-brief.html'), 'utf8'),
  workbenchHtml: fs.readFileSync(path.join(base, 'registry-workbench/index.html'), 'utf8'),
  workbenchJs: fs.readFileSync(path.join(base, 'registry-workbench/workbench.js'), 'utf8'),
  pack: fs.readFileSync(path.join(root, 'public/links/archive/data/parallax-census-publication-pack.json'), 'utf8'),
}

const required = {
  architecture: [
    'census of project and artifact records—not a population census',
    'does not prove that every Parallax artifact has already been inventoried',
    'becomes canonical only through explicit review',
    'History is not silently rewritten',
  ],
  boundary: [
    'Not a people census',
    'Discovery does not establish',
    'No automatic publication',
    'No real person or private source is assessed',
  ],
  workbenchHtml: [
    'FIXED SYNTHETIC RECORDS · NO PERSONAL DATA · NO ARCHIVE MUTATION',
    'does not crawl the web, accept visitor records, call a model, save state, identify people, or publish anything',
    'No publication occurs here.',
  ],
  workbenchJs: [
    "id:'clean-public'",
    "id:'exact-duplicate'",
    "id:'alias-collision'",
    "id:'private-source'",
    "id:'stale-record'",
    "id:'orphan-artifact'",
    "fixtureStatus:'demonstration-only'",
    "evidenceClass:'synthetic-example'",
    'humanApprovalRequired:true',
    'containsPersonalData:false',
    'visitorRecordAccepted:false',
    'canonicalMutation:false',
    'archivePublished:false',
    'networkCalled:false',
    'modelCalled:false',
    'persisted:false',
  ],
  pack: [
    'Published architecture + workbench',
    'not a population census or identity-profiling system',
    'Every real canonical change requires explicit human approval',
    'Parallax Census v0.1.1–v0.5 Source Lineage',
  ],
}

const errors = []
for (const [name, phrases] of Object.entries(required)) {
  for (const phrase of phrases) {
    if (!files[name].includes(phrase)) errors.push(`${name} is missing required Census phrase: ${phrase}`)
  }
}

for (const forbidden of [
  'fetch(', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'sendBeacon',
  'localStorage', 'sessionStorage', 'indexedDB', 'document.cookie',
  'serviceWorker', 'geolocation', 'navigator.contacts', 'showOpenFilePicker',
]) {
  if (files.workbenchJs.includes(forbidden)) errors.push(`Registry Workbench contains forbidden API: ${forbidden}`)
}

if (/https?:\/\//i.test(files.workbenchHtml)) {
  errors.push('Registry Workbench HTML must not load external HTTP assets or actions.')
}

let pack
try {
  pack = JSON.parse(files.pack)
} catch (error) {
  errors.push(`Parallax Census pack JSON failed to parse: ${error.message}`)
}

const project = pack?.projects?.find(item => item.id === 'parallax-census')
if (!project) errors.push('Census pack must contain parallax-census.')
if (project && project.status !== 'Published architecture + workbench') {
  errors.push('Census status must remain Published architecture + workbench.')
}
if (project && !String(project.claimBoundary || '').includes('not a population census')) {
  errors.push('Census claim boundary must preserve project-and-artifact scope.')
}
if (project && !String(project.claimBoundary || '').includes('explicit human approval')) {
  errors.push('Census claim boundary must preserve human approval.')
}
if (project && !String(project.claimBoundary || '').includes('legal ownership')) {
  errors.push('Census claim boundary must deny implied ownership verification.')
}

if (errors.length) {
  console.error('Parallax Census boundary validation failed:')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}

console.log('Parallax Census boundary validation passed.')
