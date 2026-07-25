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

  function packRecord(id, pack) {
    return {
      id,
      title: pack.title,
      version: pack.packVersion,
      projectIds: (pack.projects || []).map(project => project.id),
    }
  }

  async function load({ refresh = false } = {}) {
    if (cache && !refresh) return cache

    const [base, flagship, terminalSystem, mendala, graphCinema, carbonLoop, alphaLedgerOmega, parallaxInstitute, coherenceBridge, roomLight, doubleC, sosa, parallaxCensus, signalBridge] = await Promise.all([
      fetchJson('projects.json'),
      fetchJson('flagship-pack.json'),
      fetchJson('terminal-system-pack.json'),
      fetchJson('mendala-publication-pack.json'),
      fetchJson('graph-cinema-publication-pack.json'),
      fetchJson('carbon-loop-publication-pack.json'),
      fetchJson('alpha-ledger-omega-publication-pack.json'),
      fetchJson('parallax-institute-publication-pack.json'),
      fetchJson('coherence-bridge-publication-pack.json'),
      fetchJson('roomlight-publication-pack.json'),
      fetchJson('double-c-publication-pack.json'),
      fetchJson('sosa-publication-pack.json'),
      fetchJson('parallax-census-publication-pack.json'),
      fetchJson('signalbridge-publication-pack.json'),
    ])

    const projects = mergeProjects(base.projects, [flagship, terminalSystem, mendala, graphCinema, carbonLoop, alphaLedgerOmega, parallaxInstitute, coherenceBridge, roomLight, doubleC, sosa, parallaxCensus, signalBridge])
      .sort((a, b) => Number(a.archiveOrder ?? 999) - Number(b.archiveOrder ?? 999) || a.title.localeCompare(b.title))

    cache = {
      ...base,
      schemaVersion: '0.14.0',
      updated: signalBridge.updated || parallaxCensus.updated || sosa.updated || doubleC.updated || roomLight.updated || coherenceBridge.updated || parallaxInstitute.updated || alphaLedgerOmega.updated || carbonLoop.updated || graphCinema.updated || mendala.updated || terminalSystem.updated || flagship.updated || base.updated,
      projects,
      packs: [
        packRecord('flagship-wave-1', flagship),
        packRecord('terminal-system-publication-1', terminalSystem),
        packRecord('mendala-publication-1', mendala),
        packRecord('graph-cinema-publication-1', graphCinema),
        packRecord('carbon-loop-publication-1', carbonLoop),
        packRecord('alpha-ledger-omega-publication-1', alphaLedgerOmega),
        packRecord('parallax-institute-publication-1', parallaxInstitute),
        packRecord('coherence-bridge-publication-1', coherenceBridge),
        packRecord('roomlight-publication-1', roomLight),
        packRecord('double-c-publication-1', doubleC),
        packRecord('sosa-publication-1', sosa),
        packRecord('parallax-census-publication-1', parallaxCensus),
        packRecord('signalbridge-publication-1', signalBridge),
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
