// Safety patch for the public creative shell.
// Invalid LOAD/OPEN requests clear the previous program so stale state can never run.
const originalNormalizeReference = normalizeReference
normalizeReference = function normalizeCreativeReference(value) {
  return String(value || '')
    .trim()
    .replace(/,8$/i, '')
    .replace(/^['"]|['"]$/g, '')
    .replace(/\.PRG$/i, '')
}

const originalLoadProject = loadProject
loadProject = async function loadCreativeProjectSafely(reference) {
  selectedProject = null
  await originalLoadProject(reference)
  return selectedProject
}
