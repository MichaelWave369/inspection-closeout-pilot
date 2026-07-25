import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const dataDirectory = path.resolve('public/links/archive/data')
const projectRouteBase = new URL('https://archive.invalid/links/archive/project/')

function requireText(value, label, errors) {
  if (typeof value !== 'string' || !value.trim()) {
    errors.push(`${label} must be a non-empty string`)
  }
}

function localPublicPath(reference) {
  if (typeof reference !== 'string' || !reference.trim()) return null
  if (/^(?:[a-z]+:|#|\/\/)/i.test(reference)) return null

  const url = new URL(reference, projectRouteBase)
  const pathname = decodeURIComponent(url.pathname).replace(/^\/+/, '')
  return path.resolve('public', pathname)
}

async function validateLocalReference(reference, label, errors) {
  const filePath = localPublicPath(reference)
  if (!filePath) return

  try {
    await access(filePath)
  } catch {
    errors.push(`${label} points to a missing public file: ${reference}`)
  }
}

async function validateProject(project, sourceName, projectIndex, errors) {
  const prefix = `${sourceName} project[${projectIndex}]`
  requireText(project?.id, `${prefix}.id`, errors)
  requireText(project?.title, `${prefix}.title`, errors)
  requireText(project?.status, `${prefix}.status`, errors)

  if (project?.visual?.kind === 'asset') {
    requireText(project.visual.assetUrl, `${prefix}.visual.assetUrl`, errors)
    await validateLocalReference(project.visual.assetUrl, `${prefix}.visual.assetUrl`, errors)
  }

  const artifactIds = new Set()
  for (const [artifactIndex, artifact] of (project?.artifacts || []).entries()) {
    const artifactPrefix = `${prefix}.artifacts[${artifactIndex}]`
    requireText(artifact?.title, `${artifactPrefix}.title`, errors)
    requireText(artifact?.status, `${artifactPrefix}.status`, errors)

    if (artifact?.id) {
      if (artifactIds.has(artifact.id)) {
        errors.push(`${artifactPrefix}.id duplicates “${artifact.id}” within project “${project.id}”`)
      }
      artifactIds.add(artifact.id)
    }

    if (artifact?.status === 'ready' && !artifact?.url) {
      errors.push(`${artifactPrefix} is marked ready but has no url`)
    }

    await validateLocalReference(artifact?.url, `${artifactPrefix}.url`, errors)
    await validateLocalReference(artifact?.thumbnailUrl, `${artifactPrefix}.thumbnailUrl`, errors)
  }
}

async function validateJsonFile(filename) {
  const filePath = path.join(dataDirectory, filename)
  const errors = []
  let document

  try {
    document = JSON.parse(await readFile(filePath, 'utf8'))
  } catch (error) {
    return [`${filename} is not valid JSON: ${error.message}`]
  }

  if (!Array.isArray(document.projects)) {
    return [`${filename}.projects must be an array`]
  }

  const projectIds = new Set()
  for (const [index, project] of document.projects.entries()) {
    await validateProject(project, filename, index, errors)

    if (project?.id) {
      if (projectIds.has(project.id)) {
        errors.push(`${filename} contains duplicate project id “${project.id}”`)
      }
      projectIds.add(project.id)
    }
  }

  return errors
}

const filenames = (await readdir(dataDirectory))
  .filter(filename => filename.endsWith('.json'))
  .sort()

const errors = []
for (const filename of filenames) {
  errors.push(...await validateJsonFile(filename))
}

if (errors.length) {
  console.error('Archive Core validation failed:')
  errors.forEach(error => console.error(`- ${error}`))
  process.exitCode = 1
} else {
  console.log(`Archive Core validation passed: ${filenames.length} JSON files checked.`)
}
