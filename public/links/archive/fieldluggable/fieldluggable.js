const fieldBoot = document.getElementById('field-boot')
const fieldBootOutput = document.getElementById('field-boot-output')
const skipFieldBoot = document.getElementById('skip-field-boot')
const fieldRuntime = document.getElementById('field-runtime')
const nodeState = document.getElementById('node-state')
const coreState = document.getElementById('core-state')
const runtimeTitle = document.getElementById('runtime-title')
const modeLabel = document.getElementById('mode-label')
const signalLight = document.getElementById('signal-light')
const signalLabel = document.getElementById('signal-label')
const assetSearch = document.getElementById('asset-search')
const assetList = document.getElementById('asset-list')
const footerProject = document.getElementById('footer-project')

const panels = {
  mission: document.getElementById('mission-panel'),
  systems: document.getElementById('systems-panel'),
  evidence: document.getElementById('evidence-panel'),
  diagnostic: document.getElementById('diagnostic-panel'),
}

const modeTitles = {
  mission: ['MISSION BOARD', 'Practical systems under inspection.'],
  systems: ['SYSTEM MAP', 'Components, controls, and dependencies.'],
  evidence: ['EVIDENCE BOARD', 'Deployment claims require receipts.'],
  diagnostic: ['NODE DIAGNOSTICS', 'Archive and presentation state.'],
}

const bootLines = [
  'PARALLAX FIELD LUGGABLE / NODE 01',
  'RUGGED ARCHIVE PRESENTATION SYSTEM',
  '',
  'DISPLAY ................................. READY',
  'LOCAL CONTROL ........................... READY',
  'ARCHIVE CORE ........................ CONNECTING',
  'RECEIPT CHANNEL ......................... READY',
  'OPERATOR AUTHORITY .................... PRESENT',
  '',
  'NOTICE: VIEWER STATE IS NOT DEPLOYMENT PROOF.',
  '',
  'FIELD NODE READY.',
]

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const fieldCategories = new Set(['physical', 'software', 'governance', 'research'])
let bootTimers = []
let manifest = null
let projects = []
let visibleProjects = []
let selectedProject = null
let currentScope = 'field'
let currentMode = 'mission'

function revealRuntime({ focus = false } = {}) {
  bootTimers.forEach(window.clearTimeout)
  fieldBoot.hidden = true
  fieldRuntime.hidden = false
  nodeState.textContent = 'NODE ONLINE'
  if (focus) runtimeTitle.focus()
}

function runBoot() {
  if (reducedMotion) {
    fieldBootOutput.textContent = bootLines.join('\n')
    revealRuntime()
    return
  }

  bootLines.forEach((line, index) => {
    bootTimers.push(window.setTimeout(() => {
      fieldBootOutput.textContent += `${line}\n`
      if (index === bootLines.length - 1) {
        bootTimers.push(window.setTimeout(() => revealRuntime(), 620))
      }
    }, 130 + index * 150))
  })
}

function cleanBoundary(project) {
  if (project?.claimBoundary) return project.claimBoundary
  return `${project?.title || 'This project'} is shown at its documented archive status. The Field Luggable does not imply physical deployment, operational validation, customer use, or production readiness.`
}

function readinessLabel(project) {
  const status = String(project?.status || '').toLowerCase()
  if (status.includes('working') || status.includes('firmware') || status.includes('repository')) return 'BUILD EVIDENCE'
  if (status.includes('development') || status.includes('alpha')) return 'ACTIVE BUILD'
  if (status.includes('design') || status.includes('architecture') || status.includes('whitepaper') || status.includes('concept')) return 'DESIGN STAGE'
  return 'ARCHIVE STATE'
}

async function loadArchiveCore() {
  try {
    manifest = await window.ParallaxArchiveCore.load()
    projects = manifest.projects || []
    if (!projects.length) throw new Error('No Archive Core records')

    const params = new URLSearchParams(window.location.search)
    const requestedMode = params.get('mode')
    const requestedScope = params.get('scope')
    if (requestedMode && panels[requestedMode]) currentMode = requestedMode
    if (['field', 'physical', 'systems', 'all'].includes(requestedScope)) currentScope = requestedScope

    const requestedProject = params.get('project')
    selectedProject = (requestedProject && window.ParallaxArchiveCore.findProject(projects, requestedProject))
      || projects.find(project => project.id === 'roomlight-data-spine')
      || projects.find(project => project.category === 'physical')
      || projects[0]

    coreState.textContent = `ARCHIVE CORE ${manifest.schemaVersion}`
    document.getElementById('diag-core').textContent = `ONLINE / ${manifest.schemaVersion}`
    document.getElementById('diag-records').textContent = String(projects.length)
    document.getElementById('diag-packs').textContent = String((manifest.packs || []).length)
    signalLabel.textContent = 'CANONICAL VIEW'

    setScope(currentScope, { updateUrl: false })
    selectProject(selectedProject, { updateUrl: false })
    setMode(currentMode, { updateUrl: false })
    writeUrl({ replace: true })
  } catch (error) {
    console.error('Field Luggable could not load Archive Core', error)
    nodeState.textContent = 'NODE FALLBACK'
    coreState.textContent = 'ARCHIVE CORE OFFLINE'
    signalLight.style.background = 'var(--red)'
    signalLight.style.boxShadow = '0 0 10px var(--red)'
    signalLabel.textContent = 'FALLBACK READY'
    runtimeTitle.textContent = 'Archive Core could not be mounted.'
    document.getElementById('project-title').textContent = 'Standard Network remains available'
    document.getElementById('project-story').textContent = 'No project state has been guessed locally.'
  }
}

function createText(tag, className, text) {
  const element = document.createElement(tag)
  if (className) element.className = className
  if (text !== undefined) element.textContent = text
  return element
}

function scopeProjects(scope = currentScope) {
  switch (scope) {
    case 'physical':
      return projects.filter(project => project.category === 'physical')
    case 'systems':
      return projects.filter(project => ['software', 'governance'].includes(project.category))
    case 'field':
      return projects.filter(project => fieldCategories.has(project.category))
    default:
      return projects
  }
}

function renderAssetList(query = '') {
  assetList.replaceChildren()
  const needle = query.trim().toLowerCase()
  visibleProjects = scopeProjects()
    .filter(project => [project.id, project.title, project.mark, project.categoryLabel, project.status, project.tagline, ...(project.aliases || [])].join(' ').toLowerCase().includes(needle))
    .sort((a, b) => Number(a.archiveOrder || 999) - Number(b.archiveOrder || 999) || Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title))

  visibleProjects.forEach(project => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'asset-item'
    button.dataset.projectId = project.id
    button.setAttribute('role', 'option')
    button.setAttribute('aria-selected', String(selectedProject?.id === project.id))

    const mark = createText('span', 'asset-mark', project.mark || 'PX')
    const copy = document.createElement('span')
    copy.append(
      createText('strong', '', project.title),
      createText('small', '', `${project.categoryLabel} · ${project.status}`),
    )
    button.append(mark, copy)
    button.addEventListener('click', () => selectProject(project, { updateUrl: true }))
    assetList.appendChild(button)
  })

  if (!visibleProjects.length) assetList.appendChild(createText('p', '', 'NO MATCHING FIELD ASSETS.'))
}

function setScope(scope, { updateUrl = true } = {}) {
  currentScope = ['field', 'physical', 'systems', 'all'].includes(scope) ? scope : 'field'
  document.querySelectorAll('.scope-buttons button').forEach(button => {
    button.classList.toggle('active', button.dataset.scope === currentScope)
  })
  assetSearch.value = ''
  renderAssetList()
  if (!visibleProjects.some(project => project.id === selectedProject?.id) && visibleProjects[0]) {
    selectProject(visibleProjects[0], { updateUrl: false })
  }
  if (updateUrl) writeUrl({ replace: false })
}

function selectProject(project, { updateUrl = true } = {}) {
  if (!project) return
  selectedProject = project

  assetList.querySelectorAll('.asset-item').forEach(button => {
    button.setAttribute('aria-selected', String(button.dataset.projectId === project.id))
  })

  document.getElementById('project-meta').textContent = `${project.categoryLabel} · ${project.status}${project.flagship ? ' · FLAGSHIP' : ''}`
  document.getElementById('project-title').textContent = project.title
  document.getElementById('readiness-badge').textContent = readinessLabel(project)
  document.getElementById('project-tagline').textContent = project.tagline
  document.getElementById('project-story').textContent = project.summary || project.story
  document.getElementById('mission-value').textContent = project.see
  document.getElementById('mission-proof').textContent = project.proof
  document.getElementById('mission-next').textContent = project.next
  document.getElementById('open-record').href = `../project/?id=${encodeURIComponent(project.id)}`
  document.getElementById('open-network').href = `../../network/?project=${encodeURIComponent(project.id)}#projects`

  document.getElementById('evidence-status').textContent = project.status
  document.getElementById('evidence-proof').textContent = project.proof
  document.getElementById('evidence-boundary').textContent = cleanBoundary(project)
  document.getElementById('evidence-next').textContent = project.next
  footerProject.textContent = project.title.toUpperCase()

  renderReceipts(project)
  renderSystemsMap(project)

  if (updateUrl) writeUrl({ replace: false })
}

function renderReceipts(project) {
  const strip = document.getElementById('receipt-strip')
  strip.replaceChildren()
  const artifacts = project.artifacts || []
  if (!artifacts.length) {
    strip.appendChild(createText('span', 'receipt-chip', 'BASE ARCHIVE RECORD · NO RICHER RECEIPT PACK CONNECTED'))
    return
  }
  artifacts.forEach(artifact => {
    strip.appendChild(createText('span', 'receipt-chip', `${artifact.type.toUpperCase()} · ${String(artifact.status).toUpperCase()}`))
  })
}

function relatedProjects(project) {
  const explicit = (project.relationships || [])
    .map(relation => ({ relation, project: projects.find(item => item.id === relation.projectId) }))
    .filter(item => item.project)
  if (explicit.length) return explicit.slice(0, 5)

  return projects
    .filter(item => item.id !== project.id && item.category === project.category)
    .slice(0, 4)
    .map(item => ({ relation: { type: 'shared operational domain' }, project: item }))
}

function addEdge(stage, x1, y1, x2, y2) {
  const edge = createText('span', 'system-edge')
  const dx = x2 - x1
  const dy = y2 - y1
  edge.style.left = `${x1}%`
  edge.style.top = `${y1}%`
  edge.style.width = `${Math.sqrt(dx * dx + dy * dy)}%`
  edge.style.transform = `rotate(${Math.atan2(dy, dx) * 180 / Math.PI}deg)`
  stage.appendChild(edge)
}

function renderSystemsMap(project) {
  const stage = document.getElementById('systems-map')
  stage.replaceChildren()
  const center = { x: 50, y: 50 }
  const positions = [{ x: 18, y: 22 }, { x: 50, y: 15 }, { x: 82, y: 25 }, { x: 78, y: 76 }, { x: 23, y: 76 }]
  const relations = relatedProjects(project)

  relations.forEach((item, index) => addEdge(stage, center.x, center.y, positions[index].x, positions[index].y))

  const active = createText('button', 'system-node active', project.mark || 'PX')
  active.type = 'button'
  active.style.left = `${center.x}%`
  active.style.top = `${center.y}%`
  active.title = project.title
  stage.appendChild(active)

  relations.forEach((item, index) => {
    const node = createText('button', 'system-node', item.project.mark || 'PX')
    node.type = 'button'
    node.style.left = `${positions[index].x}%`
    node.style.top = `${positions[index].y}%`
    node.title = `${item.project.title}: ${item.relation.type}`
    node.addEventListener('click', () => selectProject(item.project, { updateUrl: true }))
    stage.appendChild(node)
  })

  document.getElementById('systems-note').textContent = relations.length
    ? `${project.title} is centered. Connected nodes use typed Archive Core relationships when available; otherwise they show same-domain context.`
    : 'No connected records are currently available for this project.'
}

function setMode(mode, { updateUrl = true } = {}) {
  if (!panels[mode]) return
  currentMode = mode
  Object.entries(panels).forEach(([key, panel]) => { panel.hidden = key !== mode })
  document.querySelectorAll('.mode-keys button').forEach(button => {
    button.classList.toggle('active', button.dataset.mode === mode)
  })
  const [label, title] = modeTitles[mode]
  modeLabel.textContent = label
  runtimeTitle.textContent = title
  if (updateUrl) writeUrl({ replace: false })
}

function writeUrl({ replace = true } = {}) {
  const url = new URL(window.location.href)
  if (selectedProject) url.searchParams.set('project', selectedProject.id)
  url.searchParams.set('mode', currentMode)
  url.searchParams.set('scope', currentScope)
  window.history[replace ? 'replaceState' : 'pushState']({ project: selectedProject?.id, mode: currentMode, scope: currentScope }, '', url)
}

skipFieldBoot.addEventListener('click', () => revealRuntime({ focus: true }))
document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault()
  revealRuntime({ focus: true })
})

document.querySelectorAll('.mode-keys button').forEach(button => {
  button.addEventListener('click', () => setMode(button.dataset.mode))
})
document.querySelectorAll('.scope-buttons button').forEach(button => {
  button.addEventListener('click', () => setScope(button.dataset.scope))
})
assetSearch.addEventListener('input', () => renderAssetList(assetSearch.value))
assetList.addEventListener('keydown', event => {
  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return
  const items = [...assetList.querySelectorAll('.asset-item')]
  const index = items.indexOf(document.activeElement)
  const nextIndex = event.key === 'ArrowDown'
    ? Math.min(items.length - 1, index + 1)
    : Math.max(0, index - 1)
  items[nextIndex]?.focus()
  event.preventDefault()
})

window.addEventListener('popstate', () => {
  const params = new URLSearchParams(window.location.search)
  const scope = params.get('scope')
  const mode = params.get('mode')
  if (scope) setScope(scope, { updateUrl: false })
  const project = window.ParallaxArchiveCore.findProject(projects, params.get('project'))
  if (project) selectProject(project, { updateUrl: false })
  if (mode) setMode(mode, { updateUrl: false })
})

window.addEventListener('keydown', event => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
  const shortcuts = { '1': 'mission', '2': 'systems', '3': 'evidence', '4': 'diagnostic' }
  if (shortcuts[event.key]) setMode(shortcuts[event.key])
})

runBoot()
loadArchiveCore()
