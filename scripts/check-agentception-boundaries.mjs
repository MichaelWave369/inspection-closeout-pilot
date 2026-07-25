import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const base = path.join(root, 'public/links/archive/artifacts/agentception')
const files = {
  architecture: fs.readFileSync(path.join(base, 'architecture-brief.html'), 'utf8'),
  boundary: fs.readFileSync(path.join(base, 'delivery-boundary-brief.html'), 'utf8'),
  workbenchHtml: fs.readFileSync(path.join(base, 'delivery-workbench/index.html'), 'utf8'),
  workbenchJs: fs.readFileSync(path.join(base, 'delivery-workbench/workbench.js'), 'utf8'),
  pack: fs.readFileSync(path.join(root, 'public/links/archive/data/agentception-publication-pack.json'), 'utf8'),
}

const required = {
  architecture: [
    'No accessible standalone public AgentCeption repository is currently claimed',
    'A pull request is a review object.',
    'Isolation reduces accidental interference; it does not prove',
    'Failure as evidence',
  ],
  boundary: [
    'Isolation is not a security certificate',
    'Checks are evidence, not proof',
    'Generated ≠ correct',
    'Only the repository’s authorized human and governance process may merge',
    'It does not accept repositories, files, patches, credentials, commands, packages, URLs, or code',
  ],
  workbenchHtml: [
    'FIXED SYNTHETIC JOBS · NO REPOSITORY ACCESS · NO CODE EXECUTION',
    'performs no clone, worktree, shell, test, model, network, pull-request, merge, deployment, or persistence activity',
    'No repository state changes.',
  ],
  workbenchJs: [
    "id:'docs-patch'",
    "id:'dirty-base'",
    "id:'network-dependency'",
    "id:'failing-tests'",
    "id:'stale-conflict'",
    "id:'green-pr-hold'",
    "fixtureStatus:'demonstration-only'",
    "evidenceClass:'synthetic-example'",
    "signature:'UNSIGNED_DEMO'",
    'humanReviewRequired:true',
    'mergeAuthorityGranted:false',
    'deploymentAuthorityGranted:false',
    'realRepositoryAccessed:false',
    'realFileAccessed:false',
    'realWorktreeCreated:false',
    'realBranchCreated:false',
    'realCommitCreated:false',
    'realCommandExecuted:false',
    'realShellOpened:false',
    'dependencyInstalled:false',
    'secretAccessed:false',
    'networkCalled:false',
    'modelCalled:false',
    'testExecuted:false',
    'pullRequestOpened:false',
    'pullRequestUpdated:false',
    'mergePerformed:false',
    'deploymentPerformed:false',
    'outcomeVerified:false',
    'persisted:false',
    'archiveMutation:false',
  ],
  pack: [
    'Published execution architecture + delivery workbench',
    'no standalone public AgentCeption repository or tagged reference runtime is claimed yet',
    'Isolation is not security proof',
    'a pull request is a review object rather than merge authority',
    'AgentCeption Public Delivery Proof 001',
  ],
}

const errors = []
for (const [name, phrases] of Object.entries(required)) {
  for (const phrase of phrases) {
    if (!files[name].includes(phrase)) errors.push(`${name} is missing required AgentCeption phrase: ${phrase}`)
  }
}

for (const forbidden of [
  'fetch(', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'sendBeacon',
  'localStorage', 'sessionStorage', 'indexedDB', 'document.cookie',
  'serviceWorker', 'showOpenFilePicker', 'FileReader', 'eval(', 'new Function(',
]) {
  if (files.workbenchJs.includes(forbidden)) errors.push(`AgentCeption Workbench contains forbidden API: ${forbidden}`)
}

if (/https?:\/\//i.test(files.workbenchHtml)) {
  errors.push('AgentCeption Workbench HTML must not load external HTTP assets or actions.')
}

let pack
try {
  pack = JSON.parse(files.pack)
} catch (error) {
  errors.push(`AgentCeption pack JSON failed to parse: ${error.message}`)
}

const project = pack?.projects?.find(item => item.id === 'agentception')
if (!project) errors.push('AgentCeption pack must contain agentception.')
if (project && project.status !== 'Published execution architecture + delivery workbench') {
  errors.push('AgentCeption status must remain Published execution architecture + delivery workbench.')
}
for (const phrase of ['public AgentCeption implementation', 'secure sandboxing', 'correctness proof', 'human review', 'merge is not deployment', 'verified success']) {
  if (project && !String(project.claimBoundary || '').toLowerCase().includes(phrase.toLowerCase())) {
    errors.push(`AgentCeption claim boundary must preserve: ${phrase}`)
  }
}

if (errors.length) {
  console.error('AgentCeption boundary validation failed:')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}

console.log('AgentCeption boundary validation passed.')
