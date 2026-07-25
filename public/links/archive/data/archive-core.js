(() => {
  const scriptUrl = document.currentScript?.src || window.location.href
  const dataRoot = new URL('.', scriptUrl)
  let cache = null

  function mergeProject(baseProject, packedProject) {
    return {
      ...(baseProject || {}),
      ...(packedProject || {}),
      aliases: [...new Set([...(baseProject?.aliases || []), ...(packedProject?.aliases || [])])],
      links: packedProject?.links ?? baseProject?.links ?? [],
    }
  }

  function mergeProjects(baseProjects = [], packs = []) {
    const records = new Map(baseProjects.map(project => [project.id, project]))

    packs.forEach(pack => {
      ;(pack.projects || []).forEach(project => {
        records.set(project.id, mergeProject(records.get(project.id), project))
      })
    })

    return [...records.values()]
  }

  async function fetchJson(filename) {
    const response = await fetch(new URL(filename, dataRoot), { cache: 'no-cache' })
    if (!response.ok) throw new Error(`${filename}: HTTP ${response.status}`)
    return response.json()
  }

  async function load({ refresh = false } = {}) {
    if (cache && !refresh) return cache

    const [base, flagship] = await Promise.all([
      fetchJson('projects.json'),
      fetchJson('flagship-pack.json'),
    ])

    const projects = mergeProjects(base.projects, [flagship])
      .sort((a, b) => Number(a.archiveOrder || 999) - Number(b.archiveOrder || 999) || a.title.localeCompare(b.title))

    cache = {
      ...base,
      schemaVersion: '0.2.0',
      updated: flagship.updated || base.updated,
      projects,
      packs: [
        {
          id: 'flagship-wave-1',
          title: flagship.title,
          version: flagship.packVersion,
          projectIds: (flagship.projects || []).map(project => project.id),
        },
      ],
    }

    return cache
  }

  function normalizeReference(value) {
    return String(value || '')
      .trim()
      .replace(/^['"]|['"]$/g, '')
      .replace(/\.PRX$/i, '')
      .replace(/\.TXT$/i, '')
      .toLowerCase()
  }

  function findProject(projects, reference) {
    const needle = normalizeReference(reference)
    if (!needle) return null

    const exact = projects.find(project => {
      const values = [project.id, project.title, project.mark, ...(project.aliases || [])]
      return values.some(value => normalizeReference(value) === needle)
    })
    if (exact) return exact

    const partial = projects.filter(project => {
      const values = [project.id, project.title, project.mark, ...(project.aliases || [])]
      return values.some(value => normalizeReference(value).includes(needle))
    })
    return partial.length === 1 ? partial[0] : null
  }

  window.ParallaxArchiveCore = Object.freeze({
    load,
    mergeProjects,
    findProject,
    normalizeReference,
  })
})()
