import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const archiveRoot = path.join(root, 'public/links/archive')
const forbiddenName = ['Agent', 'Ception'].join('')
const forbiddenId = forbiddenName.toLowerCase()
const textExtensions = new Set(['.html', '.js', '.json', '.svg', '.css', '.md', '.txt'])
const errors = []

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
      continue
    }
    if (!textExtensions.has(path.extname(entry.name).toLowerCase())) continue

    const content = fs.readFileSync(fullPath, 'utf8')
    if (content.toLowerCase().includes(forbiddenId)) {
      errors.push(`Public Archive contains external collaborator-owned project name: ${path.relative(root, fullPath)}`)
    }
  }
}

walk(archiveRoot)

const projectsPath = path.join(archiveRoot, 'data/projects.json')
try {
  const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8')).projects || []
  if (projects.some(project => String(project.id || '').toLowerCase() === forbiddenId)) {
    errors.push('Base Archive registry must not contain an external collaborator-owned project record.')
  }
} catch (error) {
  errors.push(`Could not inspect base Archive registry: ${error.message}`)
}

if (errors.length) {
  console.error('External ownership boundary validation failed:')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}

console.log('External collaborator ownership boundary validation passed.')
