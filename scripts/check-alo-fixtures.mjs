import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve('public/links/archive/artifacts/alpha-ledger-omega/inspector/fixtures')
const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'))
const errors = []
const families = new Set(['Proteo', 'Element', 'Atom', 'Circuit', 'Neuro', 'Material', 'Spatial', 'Energy', 'DataCenter'])
const required = ['schema','receiptId','family','fixtureStatus','evidenceClass','occurredAt','actor.id','actor.type','authority.capsuleId','authority.scope','authority.status','subject.projectId','subject.objectId','event.type','event.summary','source.sourceId','source.type','source.custody','source.locator','stateBefore','stateAfter','claims.supports','claims.doesNotSupport','uncertainty','dissent','repair.required','repair.condition','integrity.algorithm','integrity.manifestId']
const ids = new Set()
const files = new Set()

function valueAt(object, dottedPath) {
  return dottedPath.split('.').reduce((value, key) => value?.[key], object)
}

if (manifest.schema !== 'alo.fixture-manifest.v0.1') errors.push('Manifest schema must be alo.fixture-manifest.v0.1.')
if (manifest.manifestId !== 'alo-public-demo-manifest-v0.1') errors.push('Unexpected manifest ID.')
if (!Array.isArray(manifest.fixtures) || !manifest.fixtures.length) errors.push('Manifest must contain fixtures.')

for (const entry of manifest.fixtures || []) {
  if (ids.has(entry.id)) errors.push(`Duplicate fixture ID: ${entry.id}`)
  if (files.has(entry.file)) errors.push(`Duplicate fixture file: ${entry.file}`)
  ids.add(entry.id)
  files.add(entry.file)

  let raw
  try {
    raw = await readFile(path.join(root, entry.file), 'utf8')
  } catch {
    errors.push(`Fixture file is missing: ${entry.file}`)
    continue
  }

  const digest = createHash('sha256').update(raw).digest('hex')
  if (digest !== entry.sha256) errors.push(`${entry.file}: SHA-256 mismatch. Expected ${entry.sha256}, received ${digest}.`)

  let receipt
  try {
    receipt = JSON.parse(raw)
  } catch {
    errors.push(`${entry.file}: invalid JSON.`)
    continue
  }

  for (const field of required) {
    const value = valueAt(receipt, field)
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)) errors.push(`${entry.file}: missing required field ${field}.`)
  }

  if (receipt.schema !== 'alo.receipt.v0.1') errors.push(`${entry.file}: unsupported receipt schema.`)
  if (receipt.fixtureStatus !== 'demonstration-only') errors.push(`${entry.file}: fixtureStatus must remain demonstration-only.`)
  if (receipt.evidenceClass !== 'synthetic-example') errors.push(`${entry.file}: evidenceClass must remain synthetic-example.`)
  if (!families.has(receipt.family)) errors.push(`${entry.file}: unknown ledger family ${receipt.family}.`)
  if (receipt.family !== entry.family) errors.push(`${entry.file}: manifest family does not match receipt family.`)
  if (receipt.subject?.projectId !== entry.projectId) errors.push(`${entry.file}: manifest project does not match receipt subject.`)
  if (receipt.integrity?.algorithm !== 'SHA-256') errors.push(`${entry.file}: integrity algorithm must be SHA-256.`)
  if (receipt.integrity?.manifestId !== manifest.manifestId) errors.push(`${entry.file}: receipt points to the wrong manifest.`)
  if (!receipt.claims?.doesNotSupport?.some(item => /real|physical|truth|correct|privacy|occurred|availability|validity/i.test(item))) errors.push(`${entry.file}: unsupported-claim boundary is too weak.`)
  if (!receipt.dissent?.length) errors.push(`${entry.file}: protected dissent is required in every public demonstration fixture.`)
}

if (errors.length) {
  console.error('ALO fixture validation failed:')
  errors.forEach(error => console.error(`- ${error}`))
  process.exitCode = 1
} else {
  console.log(`ALO fixture validation passed: ${manifest.fixtures.length} manifest-verified synthetic receipts checked.`)
}
