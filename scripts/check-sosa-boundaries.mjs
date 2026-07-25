import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const base = path.join(root, 'public/links/archive/artifacts/sovereign-office-architecture')
const files = {
  architecture: fs.readFileSync(path.join(base, 'architecture-brief.html'), 'utf8'),
  independence: fs.readFileSync(path.join(base, 'independence-boundary-brief.html'), 'utf8'),
  drillHtml: fs.readFileSync(path.join(base, 'council-drill/index.html'), 'utf8'),
  drillJs: fs.readFileSync(path.join(base, 'council-drill/drill.js'), 'utf8'),
  pack: fs.readFileSync(path.join(root, 'public/links/archive/data/sosa-publication-pack.json'), 'utf8'),
}

const required = {
  architecture: [
    'No single intelligence should observe, judge, authorize, execute, and excuse itself.',
    'office names and separated prompts do not automatically prove independence',
    'The Governor checks that authority; it does not invent it.',
    'Freeze Drift',
    'does not prove independent reasoning',
  ],
  independence: [
    'Six offices can still share one blind spot.',
    'A majority vote cannot repair missing authority',
    'No office may authorize itself.',
    'fixed synthetic office outputs',
    'signs nothing, authorizes nothing, executes nothing',
  ],
  drillHtml: [
    'FIXED SYNTHETIC PACKETS · NOT A REAL DECISION SYSTEM',
    'calls no model, accepts no visitor case data, authorizes nothing, executes nothing',
    'agreement is not authority',
    'not legal, operational, safety, or governance authority',
  ],
  drillJs: [
    "fixtureStatus:'demonstration-only'",
    "evidenceClass:'synthetic-example'",
    'humanAuthorityRequired:true',
    'modelIndependenceProven:false',
    'dissentPreserved:true',
    'canonicalAction:false',
    'modelCalled:false',
    'networkCalled:false',
    'persisted:false',
  ],
  pack: [
    'Published architecture + council drill',
    'No office may authorize itself',
    'Validated independence',
    'Not established',
  ],
}

const errors = []
for (const [name, phrases] of Object.entries(required)) {
  for (const phrase of phrases) {
    if (!files[name].includes(phrase)) errors.push(`${name} is missing required boundary phrase: ${phrase}`)
  }
}

for (const office of ['Observer', 'Cartographer', 'Protected Dissenter', 'Governor', 'Operator', 'Repairer']) {
  if (!files.drillJs.includes(`'${office}'`) && !files.drillJs.includes(`"${office}"`)) {
    errors.push(`Council Drill must retain office: ${office}`)
  }
}

for (const scenario of ['bounded-release', 'missing-authority', 'majority-dissent', 'correlated-outputs']) {
  if (!files.drillJs.includes(`id:'${scenario}'`)) errors.push(`Council Drill must retain synthetic scenario: ${scenario}`)
}

for (const forbidden of [
  'fetch(', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'sendBeacon',
  'localStorage', 'sessionStorage', 'indexedDB', 'document.cookie',
  'serviceWorker', 'geolocation', 'navigator.bluetooth', 'navigator.serial',
  'navigator.usb', 'navigator.hid',
]) {
  if (files.drillJs.includes(forbidden)) errors.push(`Council Drill contains forbidden API: ${forbidden}`)
}

if (/https?:\/\//i.test(files.drillHtml)) errors.push('Council Drill HTML must not load external HTTP assets or actions.')
if (/<textarea|contenteditable|type=["'](?:text|email|search|url)["']/i.test(files.drillHtml)) {
  errors.push('Council Drill must not accept free-form visitor case data.')
}
if (/auto(?:matically)?[- ]?authoriz/i.test(files.drillJs)) errors.push('Council Drill must not implement automatic authorization.')

let pack
try {
  pack = JSON.parse(files.pack)
} catch (error) {
  errors.push(`SOSA pack JSON failed to parse: ${error.message}`)
}

const project = pack?.projects?.find(item => item.id === 'sovereign-office-architecture')
if (!project) errors.push('SOSA pack must contain sovereign-office-architecture.')
if (project && project.status !== 'Published architecture + council drill') {
  errors.push('SOSA status must remain Published architecture + council drill.')
}
if (project && !String(project.claimBoundary || '').includes('does not prove model independence')) {
  errors.push('SOSA claim boundary must deny proven model independence.')
}
if (project && !String(project.claimBoundary || '').includes('No office may authorize itself')) {
  errors.push('SOSA claim boundary must prohibit office self-authorization.')
}
if (project && !String(project.claimBoundary || '').includes('majority agreement cannot override')) {
  errors.push('SOSA claim boundary must deny majority-as-authority.')
}

if (errors.length) {
  console.error('SOSA boundary validation failed:')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}

console.log('SOSA boundary validation passed.')
