const wakeScreen = document.getElementById('wake-screen')
const wakeStatus = document.getElementById('wake-status')
const wakeMeter = document.getElementById('wake-meter-fill')
const skipWake = document.getElementById('skip-wake')
const runtime = document.getElementById('runtime')
const modeLabel = document.getElementById('mode-label')
const runtimeTitle = document.getElementById('runtime-title')
const coreStatus = document.getElementById('core-status')
const recordStatus = document.getElementById('record-status')
const witnessLight = document.getElementById('witness-light')
const witnessState = document.getElementById('witness-state')
const privacyState = document.getElementById('privacy-state')
const projectSearch = document.getElementById('project-search')
const projectList = document.getElementById('project-list')
const ledgerDial = document.getElementById('ledger-dial')
const dialLabel = document.getElementById('dial-label')
const dialIndicator = document.getElementById('dial-indicator')
const footerMode = document.getElementById('footer-mode')
const railProject = document.getElementById('rail-project')
const railBoundary = document.getElementById('rail-boundary')
const railOpen = document.getElementById('rail-open')
const playTrajectory = document.getElementById('play-trajectory')
const graphStage = document.getElementById('graph-stage')
const graphCaption = document.getElementById('graph-caption')

const panels = {
  field: document.getElementById('field-panel'),
  graph: document.getElementById('graph-panel'),
  ledger: document.getElementById('ledger-panel'),
  dissent: document.getElementById('dissent-panel'),
  home: document.getElementById('home-panel'),
}

const modeTitles = {
  field: ['FIELD MODE', 'One archive. Many trajectories.'],
  graph: ['GRAPH MODE', 'Relationships become navigable.'],
  ledger: ['LEDGER MODE', 'Receipts before claims.'],
  dissent: ['DISSENT MODE', 'Limitations remain visible.'],
  home: ['HOME MODE', 'The machine Parallax builds.'],
}

const artifactStateLabels = {
  ready: 'Published',
  'known-locate': 'Known · locate',
  design: 'Design-stage',
  planned: 'Planned',
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const wakeSteps = [
  { delay: 180, width: '19%', copy: 'Aligning Fieldglass…' },
  { delay: 620, width: '42%', copy: 'Connecting Archive Core…' },
  { delay: 1080, width: '67%', copy: 'Mounting Ledger continuity…' },
  { delay: 1510, width: '86%', copy: 'Protecting dissent channel…' },
  { delay: 1940, width: '100%', copy: 'Witness present. Field ready.' },
]

let wakeComplete = false
let wakeTimers = []
let manifest = null
let projects = []
let visibleProjects = []
let selectedProject = null
let currentMode = 'field'
let trajectoryPlaying = false

function createElement(tag, className, text) {
  const element = document.createElement(tag)
  if (className) element.className = className
  if (text !== undefined) element.textContent = text
  return element
}

function cleanBoundary(project) {
  if (project?.claimBoundary) return project.claimBoundary
  return `${project?.title || 'This project'} is represented by its current archive record. Status labels describe documented project state; they do not imply completed validation, field deployment, or independent proof.`
}

function projectMark(project) {
  return String(project?.mark || 'P').slice(0, 5).toUpperCase()
}

function writeRuntimeUrl({ replace = true } = {}) {
  const url = new URL(window.location.href)
  if (selectedProject) url.searchParams.set('project', selectedProject.id)
  else url.searchParams.delete('project')
  url.searchParams.set('mode', currentMode)
  window.history[replace ? 'replaceState' : 'pushState']({ project: selectedProject?.id, mode: currentMode }, '', url)
}

function recordUrl(project) {
  return `../project/?id=${encodeURIComponent(project.id)}`
}

function networkUrl(project) {
  return `../../network/?project=${encodeURIComponent(project.id)}#projects`
}

function setWitness(state, detail, kind = 'active') {
  witnessState.textContent = state
  privacyState.textContent = detail
  witnessLight.style.background = kind === 'error' ? 'var(--danger)' : kind === 'loading' ? 'var(--amber)' : 'var(--green)'
  witnessLight.style.boxShadow = kind === 'error'
    ? '0 0 8px var(--danger), 0 0 24px rgba(255,127,152,.42)'
    : kind === 'loading'
      ? '0 0 8px var(--amber), 0 0 24px rgba(240,189,108,.42)'
      : '0 0 8px var(--green), 0 0 24px rgba(102,223,173,.48)'
}

function revealRuntime({ focus = false } = {}) {
  if (wakeComplete) return
  wakeComplete = true
  wakeTimers.forEach(window.clearTimeout)
  wakeScreen.hidden = true
  runtime.hidden = false
  if (focus) runtimeTitle.focus?.()
}

function runWake() {
  setWitness('WITNESS INITIALIZING', 'PUBLIC PRESENTATION ONLY', 'loading')

  if (reducedMotion) {
    wakeMeter.style.width = '100%'
    wakeStatus.textContent = 'Witness present. Field ready.'
    revealRuntime()
    return
  }

  wakeSteps.forEach((step, index) => {
    wakeTimers.push(window.setTimeout(() => {
      wakeMeter.style.width = step.width
      wakeStatus.textContent = step.copy
      if (index === wakeSteps.length - 1) {
        wakeTimers.push(window.setTimeout(() => revealRuntime(), 440))
      }
    }, step.delay))
  })
}

function resolveInitialState() {
  const params = new URLSearchParams(window.location.search)
  const requestedMode = params.get('mode')
  if (requestedMode && panels[requestedMode]) currentMode = requestedMode

  const requestedProject = params.get('project')
  selectedProject = requestedProject
    ? window.ParallaxArchiveCore.findProject(projects, requestedProject)
    : projects.find(project => project.archiveFeatured) || projects.find(project => project.featured) || projects[0]
}

async function loadArchiveCore() {
  try {
    manifest = await window.ParallaxArchiveCore.load()
    projects = manifest.projects || []
    if (!projects.length) throw new Error('No Archive Core records')

    visibleProjects = projects.slice()
    resolveInitialState()
    ledgerDial.max = String(Math.max(0, projects.length - 1))
    coreStatus.textContent = `ARCHIVE CORE ${manifest.schemaVersion}`
    recordStatus.textContent = `${projects.length} RECORDS`
    setWitness('WITNESS ACTIVE', 'NO ACCOUNT · NO TRACKING')
    renderProjectList()
    selectProject(selectedProject, { updateUrl: false })
    setMode(currentMode, { updateUrl: false })
  } catch (error) {
    console.error('PAT Mk.1 could not load Archive Core', error)
    coreStatus.textContent = 'ARCHIVE CORE OFFLINE'
    recordStatus.textContent = 'STANDARD NETWORK READY'
    setWitness('WITNESS ALERT', 'ARCHIVE CORE LOAD FAILED', 'error')
    runtimeTitle.textContent = 'The field could not be mounted.'
    document.getElementById('project-title').textContent = 'Archive Core unavailable'
    document.getElementById('project-tagline').textContent = 'The standard semantic Network remains available.'
    document.getElementById('project-story').textContent = 'No project state has been guessed or reconstructed locally.'
    document.getElementById('open-record').href = '../../network/#projects'
    document.getElementById('open-network').href = '../../network/#projects'
  }
}

function renderProjectList(query = '') {
  projectList.replaceChildren()
  const needle = query.trim().toLowerCase()
  visibleProjects = projects
    .filter(project => [
      project.id,
      project.title,
      project.mark,
      project.categoryLabel,
      project.status,
      project.tagline,
      ...(project.aliases || []),
    ].join(' ').toLowerCase().includes(needle))
    .sort((a, b) => Number(a.archiveOrder || 999) - Number(b.archiveOrder || 999) || Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title))

  visibleProjects.forEach(project => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'project-item'
    button.dataset.projectId = project.id
    button.setAttribute('role', 'option')
    button.setAttribute('aria-selected', String(selectedProject?.id === project.id))

    const mark = createElement('span', 'project-item-mark', projectMark(project))
    const copy = document.createElement('span')
    copy.append(
      createElement('strong', '', project.title),
      createElement('small', '', `${project.categoryLabel} · ${project.status}`),
    )
    button.append(mark, copy)
    button.addEventListener('click', () => selectProject(project, { updateUrl: true }))
    projectList.appendChild(button)
  })

  if (!visibleProjects.length) {
    projectList.appendChild(createElement('p', '', 'No matching archive records.'))
  }
}

function selectProject(project, { updateUrl = true } = {}) {
  if (!project) return
  selectedProject = project

  const projectIndex = projects.findIndex(item => item.id === project.id)
  ledgerDial.value = String(Math.max(0, projectIndex))
  updateDial(projectIndex)

  projectList.querySelectorAll('.project-item').forEach(button => {
    button.setAttribute('aria-selected', String(button.dataset.projectId === project.id))
  })

  document.getElementById('orbit-core').textContent = projectMark(project)
  document.getElementById('project-meta').textContent = `${project.categoryLabel} · ${project.status}${project.flagship ? ' · FLAGSHIP' : ''}`
  document.getElementById('project-title').textContent = project.title
  document.getElementById('project-tagline').textContent = project.tagline
  document.getElementById('project-story').textContent = project.summary || project.story
  document.getElementById('field-proof').textContent = project.proof
  document.getElementById('field-next').textContent = project.next
  document.getElementById('open-record').href = recordUrl(project)
  document.getElementById('open-network').href = networkUrl(project)

  document.getElementById('ledger-state').textContent = project.status
  document.getElementById('ledger-proof').textContent = project.proof
  document.getElementById('ledger-see').textContent = project.see
  document.getElementById('ledger-next').textContent = project.next
  document.getElementById('ledger-position').textContent = `Record ${String(projectIndex + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`
  document.getElementById('ledger-pack').textContent = project.flagship
    ? 'Flagship content pack with richer claim, artifact, and relationship records.'
    : 'Canonical Archive Core base record.'

  const boundary = cleanBoundary(project)
  document.getElementById('dissent-boundary').textContent = boundary
  document.getElementById('dissent-counter').textContent = project.flagship
    ? 'The richer presentation must not make a design-stage project appear implemented, validated, or independently confirmed.'
    : 'The archive entry is a curated project description. Visitors should inspect linked evidence and status before drawing conclusions.'
  document.getElementById('dissent-repair').textContent = project.next || 'Publish the next inspectable proof and update this record.'
  railProject.textContent = project.title.toUpperCase()
  railBoundary.textContent = boundary

  renderArtifacts(project)
  renderGraph(project)
  graphCaption.textContent = `${project.title} is centered. Related records are shown as typed connections; absence of a relationship is not evidence that none exists.`

  if (updateUrl) writeRuntimeUrl({ replace: false })
}

function updateDial(index) {
  const safeIndex = Math.max(0, Math.min(projects.length - 1, Number(index) || 0))
  const percent = projects.length > 1 ? (safeIndex / (projects.length - 1)) * 100 : 0
  dialIndicator.style.left = `${percent}%`
  dialLabel.textContent = `RECORD ${String(safeIndex + 1).padStart(2, '0')}`
}

function renderArtifacts(project) {
  const strip = document.getElementById('artifact-strip')
  strip.replaceChildren()
  const artifacts = project.artifacts || []

  if (!artifacts.length) {
    const chip = createElement('article', 'artifact-chip')
    chip.append(
      createElement('strong', '', 'Base archive record'),
      createElement('span', '', 'No richer artifact package is connected yet.'),
    )
    strip.appendChild(chip)
    return
  }

  artifacts.forEach(artifact => {
    const chip = createElement('article', 'artifact-chip')
    chip.append(
      createElement('strong', '', artifact.title),
      createElement('span', '', `${artifact.type} · ${artifactStateLabels[artifact.status] || artifact.status}`),
    )
    strip.appendChild(chip)
  })
}

function relationshipProjects(project) {
  const explicit = (project.relationships || [])
    .map(relation => ({
      relation,
      project: projects.find(item => item.id === relation.projectId),
    }))
    .filter(item => item.project)

  if (explicit.length) return explicit.slice(0, 6)

  return projects
    .filter(item => item.id !== project.id && item.category === project.category)
    .slice(0, 5)
    .map(item => ({ relation: { type: 'shared domain', note: `Both records are classified under ${project.categoryLabel}.` }, project: item }))
}

function addGraphEdge(stage, x1, y1, x2, y2) {
  const edge = createElement('span', 'graph-edge')
  const dx = x2 - x1
  const dy = y2 - y1
  edge.style.left = `${x1}%`
  edge.style.top = `${y1}%`
  edge.style.width = `${Math.sqrt(dx * dx + dy * dy)}%`
  edge.style.transform = `rotate(${Math.atan2(dy, dx) * 180 / Math.PI}deg)`
  stage.appendChild(edge)
}

function renderGraph(project) {
  graphStage.replaceChildren()
  const center = { x: 50, y: 50 }
  const relations = relationshipProjects(project)
  const positions = [
    { x: 18, y: 18 },
    { x: 50, y: 12 },
    { x: 82, y: 24 },
    { x: 82, y: 74 },
    { x: 48, y: 86 },
    { x: 16, y: 70 },
  ]

  relations.forEach((item, index) => {
    const position = positions[index]
    addGraphEdge(graphStage, center.x, center.y, position.x, position.y)
  })

  const active = createElement('button', 'graph-node active', projectMark(project))
  active.type = 'button'
  active.style.left = `${center.x}%`
  active.style.top = `${center.y}%`
  active.title = project.title
  active.addEventListener('click', () => setMode('field'))
  graphStage.appendChild(active)

  relations.forEach((item, index) => {
    const position = positions[index]
    const node = createElement('button', `graph-node${item.relation.type?.toLowerCase().includes('dissent') ? ' dissent' : ''}`, projectMark(item.project))
    node.type = 'button'
    node.style.left = `${position.x}%`
    node.style.top = `${position.y}%`
    node.title = `${item.project.title}: ${item.relation.type}`
    node.setAttribute('aria-label', `Select ${item.project.title}, relationship: ${item.relation.type}`)
    node.addEventListener('click', () => selectProject(item.project, { updateUrl: true }))
    graphStage.appendChild(node)
  })

  graphStage.appendChild(createElement('span', 'graph-cursor'))
  graphStage.classList.toggle('playing', trajectoryPlaying)
}

function setMode(mode, { updateUrl = true } = {}) {
  if (!panels[mode]) return
  currentMode = mode

  Object.entries(panels).forEach(([key, panel]) => {
    panel.hidden = key !== mode
  })
  document.querySelectorAll('.office-key').forEach(button => {
    button.classList.toggle('active', button.dataset.mode === mode)
  })

  const [label, title] = modeTitles[mode]
  modeLabel.textContent = label
  runtimeTitle.textContent = title
  footerMode.textContent = mode.toUpperCase()

  if (mode !== 'graph' && trajectoryPlaying) {
    trajectoryPlaying = false
    playTrajectory.setAttribute('aria-pressed', 'false')
    playTrajectory.textContent = 'Play trajectory'
    graphStage.classList.remove('playing')
  }

  if (updateUrl) writeRuntimeUrl({ replace: false })
}

skipWake.addEventListener('click', () => revealRuntime({ focus: true }))

document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault()
  revealRuntime({ focus: true })
})

document.querySelectorAll('.office-key').forEach(button => {
  button.addEventListener('click', () => setMode(button.dataset.mode))
})

projectSearch.addEventListener('input', () => renderProjectList(projectSearch.value))

projectList.addEventListener('keydown', event => {
  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return
  const items = [...projectList.querySelectorAll('.project-item')]
  const index = items.indexOf(document.activeElement)
  const nextIndex = event.key === 'ArrowDown'
    ? Math.min(items.length - 1, index + 1)
    : Math.max(0, index - 1)
  items[nextIndex]?.focus()
  event.preventDefault()
})

ledgerDial.addEventListener('input', () => {
  const index = Number(ledgerDial.value)
  updateDial(index)
  if (projects[index]) selectProject(projects[index], { updateUrl: true })
})

railOpen.addEventListener('click', () => setMode('dissent'))

playTrajectory.addEventListener('click', () => {
  trajectoryPlaying = !trajectoryPlaying
  playTrajectory.setAttribute('aria-pressed', String(trajectoryPlaying))
  playTrajectory.textContent = trajectoryPlaying ? 'Pause trajectory' : 'Play trajectory'
  graphStage.classList.toggle('playing', trajectoryPlaying)
})

window.addEventListener('popstate', () => {
  const params = new URLSearchParams(window.location.search)
  const project = window.ParallaxArchiveCore.findProject(projects, params.get('project'))
  const mode = params.get('mode')
  if (project) selectProject(project, { updateUrl: false })
  if (mode && panels[mode]) setMode(mode, { updateUrl: false })
})

window.addEventListener('keydown', event => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
  const shortcuts = { '1': 'field', '2': 'graph', '3': 'ledger', '4': 'dissent', '5': 'home' }
  if (shortcuts[event.key]) setMode(shortcuts[event.key])
})

runWake()
loadArchiveCore()
