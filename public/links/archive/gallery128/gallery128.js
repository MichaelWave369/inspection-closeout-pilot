const startup = document.getElementById('startup')
const startupStatus = document.getElementById('startup-status')
const skipStartup = document.getElementById('skip-startup')
const galleryDesktop = document.getElementById('gallery-desktop')
const gallerySearch = document.getElementById('gallery-search')
const galleryCount = document.getElementById('gallery-count')
const artGrid = document.getElementById('art-grid')
const inspector = document.getElementById('inspector')
const windowTitle = document.getElementById('window-title')
const windowStatus = document.getElementById('window-status')
const windowClose = document.getElementById('window-close')
const aboutGallery = document.getElementById('about-gallery')
const aboutDialog = document.getElementById('about-dialog')
const aboutClose = document.getElementById('about-close')

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const collectionLabels = {
  visual: 'Poster Gallery',
  flagship: 'Flagship Exhibition',
  creative: 'Games & Creative',
  all: 'All Project Records',
}

let projects = []
let visibleProjects = []
let selectedProject = null
let currentCollection = 'visual'
let startupTimer = null

function revealDesktop({ focus = false } = {}) {
  window.clearTimeout(startupTimer)
  startup.hidden = true
  galleryDesktop.hidden = false
  if (focus) gallerySearch.focus()
}

function runStartup() {
  if (reducedMotion) {
    startupStatus.textContent = 'Archive exhibition ready.'
    revealDesktop()
    return
  }
  startupTimer = window.setTimeout(() => {
    startupStatus.textContent = 'Archive exhibition ready.'
    startupTimer = window.setTimeout(() => revealDesktop(), 560)
  }, 1100)
}

async function loadArchiveCore() {
  try {
    const manifest = await window.ParallaxArchiveCore.load()
    projects = manifest.projects || []
    if (!projects.length) throw new Error('No Archive Core records')

    const requested = new URLSearchParams(window.location.search).get('project')
    selectedProject = (requested && window.ParallaxArchiveCore.findProject(projects, requested)) || projects.find(project => project.archiveFeatured) || projects[0]
    windowStatus.textContent = `Archive Core ${manifest.schemaVersion} · ${projects.length} canonical records`
    renderCollection(currentCollection)
    renderInspector(selectedProject)
  } catch (error) {
    console.error('Gallery 128 could not load Archive Core', error)
    windowStatus.textContent = 'Archive Core unavailable · Standard Network remains available'
    inspector.innerHTML = '<p class="inspector-label">ARCHIVE ERROR</p><h2>The exhibition could not be mounted.</h2><p>No artwork or project state has been guessed. Use the standard Network link above.</p>'
  }
}

function createText(tag, className, text) {
  const element = document.createElement(tag)
  if (className) element.className = className
  if (text !== undefined) element.textContent = text
  return element
}

function artifactState(project) {
  const artifacts = project.artifacts || []
  if (!artifacts.length) return { label: 'Archive record', note: 'No connected visual package yet' }
  const ready = artifacts.find(artifact => artifact.status === 'ready')
  if (ready) return { label: 'Published artifact', note: ready.title }
  const known = artifacts.find(artifact => artifact.status === 'known-locate')
  if (known) return { label: 'Known · locate', note: known.title }
  return { label: 'Design-stage', note: artifacts[0].title }
}

function collectionProjects(collection) {
  switch (collection) {
    case 'flagship':
      return projects.filter(project => project.flagship || project.archiveFeatured)
    case 'creative':
      return projects.filter(project => project.category === 'creative')
    case 'visual':
      return projects.filter(project => project.archiveFeatured || project.featured || (project.artifacts || []).some(artifact => artifact.type?.toLowerCase().includes('visual')))
    default:
      return projects
  }
}

function renderCollection(collection = currentCollection) {
  currentCollection = collectionLabels[collection] ? collection : 'all'
  windowTitle.textContent = collectionLabels[currentCollection]
  gallerySearch.value = ''
  renderArtGrid()
}

function renderArtGrid(query = '') {
  artGrid.replaceChildren()
  const needle = query.trim().toLowerCase()
  visibleProjects = collectionProjects(currentCollection)
    .filter(project => [project.id, project.title, project.mark, project.categoryLabel, project.status, project.tagline, ...(project.aliases || [])].join(' ').toLowerCase().includes(needle))
    .sort((a, b) => Number(a.archiveOrder || 999) - Number(b.archiveOrder || 999) || Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title))

  visibleProjects.forEach(project => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'art-item'
    button.dataset.projectId = project.id
    button.setAttribute('role', 'option')
    button.setAttribute('aria-selected', String(selectedProject?.id === project.id))

    const poster = document.createElement('span')
    poster.className = 'art-poster'
    poster.dataset.tone = project.tone || 'blue'
    poster.append(
      createText('span', 'art-mark', project.mark || 'P'),
      createText('span', 'art-placeholder', artifactState(project).label.toUpperCase()),
    )

    button.append(
      poster,
      createText('strong', '', project.title),
      createText('small', '', `${project.categoryLabel} · ${project.status}`),
    )
    button.addEventListener('click', () => renderInspector(project, { updateUrl: true }))
    artGrid.appendChild(button)
  })

  if (!visibleProjects.length) artGrid.appendChild(createText('p', '', 'No exhibition pieces match this search.'))
  galleryCount.textContent = `${visibleProjects.length} item${visibleProjects.length === 1 ? '' : 's'}`
}

function renderInspector(project, { updateUrl = false } = {}) {
  if (!project) return
  selectedProject = project
  inspector.replaceChildren()

  const state = artifactState(project)
  const meta = createText('p', 'inspector-meta', `${project.categoryLabel} · ${project.status} · ${state.label}`)
  const label = createText('p', 'inspector-label', project.archiveFeatured ? 'FEATURED EXHIBITION' : 'ARCHIVE EXHIBITION')
  const title = createText('h2', '', project.title)
  const tagline = createText('p', '', project.tagline)
  tagline.style.fontWeight = '800'
  const story = createText('p', '', project.summary || project.story)

  const facts = document.createElement('div')
  facts.className = 'inspector-facts'
  ;[
    ['VISUAL ARTIFACT STATE', state.note],
    ['WHAT TO SEE', project.see],
    ['CURATOR NEXT STEP', project.next],
  ].forEach(([factLabel, value]) => {
    const block = document.createElement('div')
    block.append(createText('strong', '', factLabel), createText('span', '', value))
    facts.appendChild(block)
  })

  const actions = document.createElement('div')
  actions.className = 'inspector-actions'
  const record = createText('a', '', 'OPEN ARCHIVE RECORD')
  record.href = `../project/?id=${encodeURIComponent(project.id)}`
  const network = createText('a', '', 'STANDARD NETWORK')
  network.href = `../../network/?project=${encodeURIComponent(project.id)}#projects`
  actions.append(record, network)

  inspector.append(meta, label, title, tagline, story, facts, actions)
  artGrid.querySelectorAll('.art-item').forEach(button => {
    button.setAttribute('aria-selected', String(button.dataset.projectId === project.id))
  })

  if (updateUrl) {
    const url = new URL(window.location.href)
    url.searchParams.set('project', project.id)
    url.searchParams.set('collection', currentCollection)
    window.history.pushState({ project: project.id, collection: currentCollection }, '', url)
  }
}

function showFolders() {
  gallerySearch.value = ''
  inspector.innerHTML = '<p class="inspector-label">GALLERY DESKTOP</p><h2>Choose an exhibition folder.</h2><p>Poster Gallery prioritizes visual and featured records. Flagship Exhibition shows the richest Archive Core packages. Every view preserves the same canonical project truth.</p>'
}

skipStartup.addEventListener('click', () => revealDesktop({ focus: true }))
document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault()
  revealDesktop({ focus: true })
})

document.querySelectorAll('[data-collection]').forEach(button => {
  button.addEventListener('click', () => {
    renderCollection(button.dataset.collection)
    if (visibleProjects[0]) renderInspector(visibleProjects[0], { updateUrl: true })
  })
})

gallerySearch.addEventListener('input', () => renderArtGrid(gallerySearch.value))
windowClose.addEventListener('click', showFolders)
aboutGallery.addEventListener('click', () => aboutDialog.showModal())
aboutClose.addEventListener('click', () => aboutDialog.close())
aboutDialog.addEventListener('click', event => {
  if (event.target === aboutDialog) aboutDialog.close()
})

artGrid.addEventListener('keydown', event => {
  if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)) return
  const items = [...artGrid.querySelectorAll('.art-item')]
  const index = items.indexOf(document.activeElement)
  const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1
  items[Math.max(0, Math.min(items.length - 1, index + step))]?.focus()
  event.preventDefault()
})

window.addEventListener('popstate', () => {
  const params = new URLSearchParams(window.location.search)
  const collection = params.get('collection')
  if (collection && collectionLabels[collection]) renderCollection(collection)
  const project = window.ParallaxArchiveCore.findProject(projects, params.get('project'))
  if (project) renderInspector(project)
})

const initialCollection = new URLSearchParams(window.location.search).get('collection')
if (initialCollection && collectionLabels[initialCollection]) currentCollection = initialCollection

runStartup()
loadArchiveCore()
