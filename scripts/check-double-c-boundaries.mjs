import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const base = path.join(root, 'public/links/archive/artifacts/double-c')
const files = {
  architecture: fs.readFileSync(path.join(base, 'architecture-brief.html'), 'utf8'),
  terminology: fs.readFileSync(path.join(base, 'terminology-boundary-brief.html'), 'utf8'),
  labHtml: fs.readFileSync(path.join(base, 'language-lab/index.html'), 'utf8'),
  labJs: fs.readFileSync(path.join(base, 'language-lab/lab.js'), 'utf8'),
  pack: fs.readFileSync(path.join(root, 'public/links/archive/data/double-c-publication-pack.json'), 'utf8'),
}

const required = {
  architecture: [
    'Computational Collaborator—is the preferred public relationship term',
    'does not establish consciousness, personhood, feelings, independent legal agency, moral status, or trustworthy behavior by default',
    'Human-led means more than branding',
    'Technical language remains available',
    'Longer engagement, emotional attachment, confident tone, or fluent output are not sufficient measures',
  ],
  terminology: [
    'does not establish consciousness, sentience, subjective experience, personhood, emotions, legal agency',
    'A CC may recommend or execute only within a visible mandate',
    'Fluency is not evidence',
    'Do not say a CC “remembers” without explaining what context is retained',
    'The label never outranks the receipts',
  ],
  labHtml: [
    'FIXED EXAMPLES · NO MODEL CALLS · NO PERSONAL ASSESSMENT',
    'does not establish consciousness, personhood, feelings, legal agency, moral status, safety, privacy, or trustworthy behavior',
    'Nothing is saved, sent, scored, or used to contact a service',
    'it does not analyze the visitor',
  ],
  labJs: [
    "fixtureStatus:'demonstration-only'",
    "evidenceClass:'synthetic-example'",
    'humanAuthority:true',
    'visitorTextAccepted:false',
    'modelCalled:false',
    'networkCalled:false',
    'persisted:false',
  ],
  pack: [
    'Published language system + lab',
    'does not establish consciousness, sentience, subjective experience, personhood, feelings, independent legal agency',
    'Calling a system human-led or collaborative does not make it so',
    'Technical terms such as artificial intelligence, machine learning, language model',
  ],
}

const errors = []
for (const [name, phrases] of Object.entries(required)) {
  for (const phrase of phrases) {
    if (!files[name].includes(phrase)) {
      errors.push(`${name} is missing required boundary phrase: ${phrase}`)
    }
  }
}

for (const forbidden of [
  'fetch(', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'sendBeacon',
  'localStorage', 'sessionStorage', 'indexedDB', 'document.cookie',
  'serviceWorker', 'geolocation',
]) {
  if (files.labJs.includes(forbidden)) {
    errors.push(`Double C Language Lab contains forbidden API: ${forbidden}`)
  }
}

if (/https?:\/\//i.test(files.labHtml)) {
  errors.push('Double C Language Lab HTML must not load external HTTP assets or actions.')
}

const combined = Object.values(files).join('\n').toLowerCase()
for (const forbiddenClaim of [
  'the cc is conscious',
  'the computational collaborator is conscious',
  'the cc has feelings',
  'the cc is a person',
  'the cc creates its own authority',
  'the cc decides for itself',
]) {
  if (combined.includes(forbiddenClaim)) {
    errors.push(`Double C public package contains prohibited claim: ${forbiddenClaim}`)
  }
}

let pack
try {
  pack = JSON.parse(files.pack)
} catch (error) {
  errors.push(`Double C pack JSON failed to parse: ${error.message}`)
}

const project = pack?.projects?.find(item => item.id === 'double-c')
if (!project) errors.push('Double C pack must contain double-c.')
if (project && project.status !== 'Published language system + lab') {
  errors.push('Double C status must remain Published language system + lab.')
}
if (project && !String(project.claimBoundary || '').includes('does not establish consciousness')) {
  errors.push('Double C claim boundary must deny implied consciousness and personhood.')
}
if (project && !String(project.claimBoundary || '').includes('visible human authority')) {
  errors.push('Double C claim boundary must preserve visible human authority.')
}

if (errors.length) {
  console.error('Double C boundary validation failed:')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}

console.log('Double C boundary validation passed.')
