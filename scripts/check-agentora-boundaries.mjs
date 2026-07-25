import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const base = path.join(root, 'public/links/archive/artifacts/agentora')
const files = {
  architecture: fs.readFileSync(path.join(base, 'architecture-brief.html'), 'utf8'),
  operatorBoundary: fs.readFileSync(path.join(base, 'operator-boundary-brief.html'), 'utf8'),
  workbenchHtml: fs.readFileSync(path.join(base, 'mission-control/index.html'), 'utf8'),
  workbenchJs: fs.readFileSync(path.join(base, 'mission-control/workbench.js'), 'utf8'),
  pack: fs.readFileSync(path.join(root, 'public/links/archive/data/agentora-publication-pack.json'), 'utf8'),
}

const required = {
  architecture: [
    'coordination is not authority',
    'role assignment is not proof of independent judgment',
    'retrieved memory is not truth',
    'heuristic mission score is not an objective verdict',
    'PhiOS owns identity, persona, memory-context packets, and writeback',
    'Cosmos, Open Cosmos, Garden, and World Garden remain optional',
    'Agentora v1.0.0',
  ],
  operatorBoundary: [
    'The operator may start a workflow',
    'action approval defaults to',
    'Different role names',
    'Mission score, confidence, readiness, risk',
    'The Archive workbench does not use Streamlit',
    'a displayed approval, denial, pause, retry, skip, or writeback choice',
  ],
  workbenchHtml: [
    'FIXED SYNTHETIC MISSIONS · NO MODEL CALLS · NO ACTION EXECUTION',
    'does not connect to Agentora, Ollama, PhiOS, AgentCeption, SQLite, a worker, MCP, webhooks, a browser, a desktop, a repository, or a background process',
    'No real mission changes state.',
  ],
  workbenchJs: [
    "id:'clean-mock'",
    "id:'correlated-consensus'",
    "id:'memory-conflict'",
    "id:'browser-outside-allowlist'",
    "id:'worker-fallback'",
    "id:'writeback-erases-dissent'",
    "fixtureStatus:'demonstration-only'",
    "evidenceClass:'synthetic-example'",
    "operatorAuthority:'HUMAN_REVIEW_REQUIRED'",
    "signature:'UNSIGNED_DEMO'",
    'missionStateChanged:false',
    'realApprovalIssued:false',
    'realDenialIssued:false',
    'realPauseIssued:false',
    'agentoraConnected:false',
    'modelCalled:false',
    'memoryRead:false',
    'memoryWritten:false',
    'workerDispatched:false',
    'agentceptionCalled:false',
    'phiosCalled:false',
    'mcpCalled:false',
    'webhookCalled:false',
    'browserControlled:false',
    'desktopControlled:false',
    'fileAccessed:false',
    'repositoryChanged:false',
    'actionExecuted:false',
    'backgroundProcessStarted:false',
    'networkCalled:false',
    'persisted:false',
    'archiveMutation:false',
    'independentJudgmentProven:false',
    'heuristicScoreIsTruth:false',
  ],
  pack: [
    'Published operating architecture + mission workbench',
    'verified public v1.0.0 repository',
    'ask_once + guardrails',
    'Coordination, consensus, memory retrieval, role labels, heuristic scores, and generated summaries remain inspectable aids rather than truth or human authorization',
    'Agentora Protected Judgment Diversity Fixture',
    'Agentora Public Mission Proof 001',
  ],
}

const errors = []
for (const [name, phrases] of Object.entries(required)) {
  for (const phrase of phrases) {
    if (!files[name].includes(phrase)) errors.push(`${name} is missing required Agentora phrase: ${phrase}`)
  }
}

for (const forbidden of [
  'fetch(', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'sendBeacon',
  'localStorage', 'sessionStorage', 'indexedDB', 'document.cookie',
  'serviceWorker', 'geolocation', 'showOpenFilePicker', 'FileReader',
  'eval(', 'new Function(', 'WebAssembly', 'setInterval(', 'BroadcastChannel',
]) {
  if (files.workbenchJs.includes(forbidden)) errors.push(`Agentora Workbench contains forbidden API: ${forbidden}`)
}

if (/https?:\/\//i.test(files.workbenchHtml)) {
  errors.push('Agentora Workbench HTML must not load external HTTP assets or actions.')
}

let pack
try {
  pack = JSON.parse(files.pack)
} catch (error) {
  errors.push(`Agentora pack JSON failed to parse: ${error.message}`)
}

const project = pack?.projects?.find(item => item.id === 'agentora')
if (!project) errors.push('Agentora pack must contain agentora.')
if (project && project.status !== 'Published operating architecture + mission workbench') {
  errors.push('Agentora status must remain Published operating architecture + mission workbench.')
}
for (const phrase of ['model independence', 'objective mission scoring', 'human authorization', 'production suitability', 'fixed synthetic data']) {
  if (project && !String(project.claimBoundary || '').toLowerCase().includes(phrase.toLowerCase())) {
    errors.push(`Agentora claim boundary must preserve: ${phrase}`)
  }
}

if (errors.length) {
  console.error('Agentora boundary validation failed:')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}

console.log('Agentora boundary validation passed.')
