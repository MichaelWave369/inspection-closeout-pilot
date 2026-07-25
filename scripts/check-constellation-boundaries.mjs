import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const root = process.cwd()
const fieldRoot = path.join(root, 'public/links/field')
const files = {
  html: fs.readFileSync(path.join(fieldRoot, 'index.html'), 'utf8'),
  css: fs.readFileSync(path.join(fieldRoot, 'field.css'), 'utf8'),
  js: fs.readFileSync(path.join(fieldRoot, 'field.js'), 'utf8'),
  dataJs: fs.readFileSync(path.join(fieldRoot, 'constellation-data.js'), 'utf8'),
  projects: fs.readFileSync(path.join(root, 'public/links/archive/data/projects.json'), 'utf8'),
}

const errors = []
const requiredHtml = [
  'Enter the Field v0.4 — Full Constellation',
  'Relationship ≠ integration',
  'Presentation ≠ proof',
  'Discovery ≠ ownership',
  'Mock run ≠ execution',
  'Ownership capsules are public provenance statements',
  'No system is contacted. No model is called. No memory is read.',
  'The map is governed like the projects it describes.',
]
const requiredJs = [
  "schema: 'parallax-full-constellation-proof-preview/0.1'",
  "fixtureStatus: 'demonstration-only'",
  'relationshipMapProvesIntegration: false',
  'ownershipLegallyVerified: false',
  'canonicalProjectClaimsChanged: false',
  'humanApprovalRequired: true',
  'signalBridgeCalled: false',
  'vibeCompilerInvoked: false',
  'phiosConnected: false',
  'memoryRead: false',
  'memoryWritten: false',
  'agentoraConnected: false',
  'modelCalled: false',
  'workerDispatched: false',
  'sosaJudgmentsGenerated: false',
  'realHumanAuthorizationIssued: false',
  'aloReceiptWritten: false',
  'censusRecordMutated: false',
  'archiveMutation: false',
  'repositoryAccessed: false',
  'branchMerged: false',
  'deploymentPerformed: false',
  'publicOutcomeVerified: false',
  'networkCalled: false',
  'persisted: false',
  "signature: 'UNSIGNED_DEMO'",
]

for (const phrase of requiredHtml) {
  if (!files.html.includes(phrase)) errors.push(`Full Constellation HTML is missing: ${phrase}`)
}
for (const phrase of requiredJs) {
  if (!files.js.includes(phrase)) errors.push(`Full Constellation JavaScript is missing: ${phrase}`)
}

for (const forbidden of [
  'XMLHttpRequest', 'WebSocket', 'EventSource', 'sendBeacon', 'localStorage',
  'sessionStorage', 'indexedDB', 'document.cookie', 'serviceWorker', 'geolocation',
  'showOpenFilePicker', 'FileReader', 'eval(', 'new Function(', 'WebAssembly',
  'BroadcastChannel', 'setInterval(',
]) {
  if (files.js.includes(forbidden)) errors.push(`Full Constellation JavaScript contains forbidden API: ${forbidden}`)
}

if (/https?:\/\//i.test(files.html)) {
  errors.push('Full Constellation HTML must not load external HTTP assets or actions.')
}

let data
try {
  const context = { window: {} }
  vm.createContext(context)
  vm.runInContext(files.dataJs, context, { timeout: 1000 })
  data = context.window.ParallaxConstellationData
} catch (error) {
  errors.push(`Constellation data failed to evaluate: ${error.message}`)
}

let baseProjects = []
try {
  baseProjects = JSON.parse(files.projects).projects || []
} catch (error) {
  errors.push(`Base project registry failed to parse: ${error.message}`)
}

if (data) {
  if (data.version !== '0.4.0') errors.push('Constellation version must remain 0.4.0 for this release.')
  if (!Array.isArray(data.journeys) || data.journeys.length !== 5) errors.push('Constellation must contain exactly five guided journeys.')
  if (!Array.isArray(data.nodes) || data.nodes.length !== 15) errors.push('Constellation must contain exactly fifteen canonical nodes.')
  if (!Array.isArray(data.relationships) || data.relationships.length < 20) errors.push('Constellation must contain at least twenty declared relationships.')
  if (!Array.isArray(data.evidenceClasses) || data.evidenceClasses.length !== 6) errors.push('Constellation must contain exactly six evidence classes.')
  if (!data.proofRun?.stages || data.proofRun.stages.length !== 10) errors.push('Proof Run 001 must contain exactly ten stages.')

  const nodeIds = new Set((data.nodes || []).map(node => node.id))
  const evidenceIds = new Set((data.evidenceClasses || []).map(item => item.id))
  const duplicateIds = (data.nodes || []).map(node => node.id).filter((id, index, all) => all.indexOf(id) !== index)
  if (duplicateIds.length) errors.push(`Duplicate Constellation node IDs: ${duplicateIds.join(', ')}`)

  for (const node of data.nodes || []) {
    if (node.ownershipClass !== 'parallax-owned') errors.push(`${node.id} must remain explicitly parallax-owned in this guided release.`)
    if (!String(node.owner || '').includes('Michael W. Hughes / Parallax')) errors.push(`${node.id} is missing the canonical owner statement.`)
    if (!node.ownershipBasis || !node.sourceState || !node.maturity) errors.push(`${node.id} is missing ownership, source, or maturity metadata.`)
    if (!Array.isArray(node.evidence) || !node.evidence.length) errors.push(`${node.id} must have at least one evidence class.`)
    for (const evidence of node.evidence || []) {
      if (!evidenceIds.has(evidence)) errors.push(`${node.id} uses unknown evidence class: ${evidence}`)
    }
  }

  for (const journey of data.journeys || []) {
    if (!journey.nodes?.length) errors.push(`${journey.id} has no nodes.`)
    for (const nodeId of journey.nodes || []) {
      if (!nodeIds.has(nodeId)) errors.push(`${journey.id} references unknown node: ${nodeId}`)
    }
  }

  for (const relationship of data.relationships || []) {
    if (!nodeIds.has(relationship.from)) errors.push(`Relationship has unknown from node: ${relationship.from}`)
    if (!nodeIds.has(relationship.to)) errors.push(`Relationship has unknown to node: ${relationship.to}`)
    if (!relationship.label) errors.push(`Relationship ${relationship.from} → ${relationship.to} is missing a label.`)
  }

  const requiredStageIds = [
    'human-mandate', 'signalbridge', 'vibe', 'phios', 'agentora',
    'sosa', 'human-authorization', 'alo', 'census', 'archive',
  ]
  const stageIds = (data.proofRun?.stages || []).map(stage => stage.id)
  if (JSON.stringify(stageIds) !== JSON.stringify(requiredStageIds)) {
    errors.push('Proof Run stage order or IDs changed from the governed ten-stage chain.')
  }
  const dissent = data.proofRun?.stages?.find(stage => stage.id === 'sosa')
  if (!String(dissent?.evidence || '').includes('Protected dissent')) errors.push('SOSA stage must preserve protected dissent.')
  if (!String(data.ownershipStatement || '').includes('not legal title opinions')) errors.push('Constellation ownership statement must preserve the legal-title boundary.')

  const baseIds = new Set(baseProjects.map(project => project.id))
  const packIds = new Set([
    'mendala', 'graph-cinema', 'carbon-loop', 'alpha-ledger-omega', 'parallax-institute',
    'coherence-bridge', 'roomlight-data-spine', 'double-c', 'sovereign-office-architecture',
    'parallax-census', 'signalbridge', 'vibe', 'agentora', 'phios',
    'parallax-archive-terminal-system',
  ])
  for (const nodeId of nodeIds) {
    if (!baseIds.has(nodeId) && !packIds.has(nodeId)) errors.push(`Constellation node is not a known canonical Archive ID: ${nodeId}`)
  }
}

if (errors.length) {
  console.error('Full Constellation boundary validation failed:')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}

console.log('Full Constellation boundary validation passed.')
