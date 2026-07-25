let categories = []
let projects = []
let activeCategory = 'all'
let activeProject = null

const grid = document.getElementById('project-grid')
const filters = document.getElementById('project-filters')
const search = document.getElementById('project-search')
const resultCount = document.getElementById('result-count')
const dialog = document.getElementById('project-dialog')
const closeDialog = document.getElementById('dialog-close')

function ensureArchiveCore() {
  if (window.ParallaxArchiveCore) return Promise.resolve(window.ParallaxArchiveCore)

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = '../archive/data/archive-core.js'
    script.onload = () => resolve(window.ParallaxArchiveCore)
    script.onerror = () => reject(new Error('Archive Core loader could not be loaded'))
    document.head.appendChild(script)
  })
}

function createFilterButtons() {
  filters.replaceChildren()

  categories.forEach(({ id, label }) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'filter-button'
    button.dataset.category = id
    button.textContent = label
    button.setAttribute('aria-pressed', String(id === activeCategory))
    button.addEventListener('click', () => {
      activeCategory = id
      document.querySelectorAll('.filter-button').forEach(item => {
        item.setAttribute('aria-pressed', String(item === button))
      })
      renderProjects()
    })
    filters.appendChild(button)
  })
}

function projectMatches(project, query) {
  const categoryMatches = activeCategory === 'all' || project.category === activeCategory
  const searchable = [
    project.id,
    project.title,
    project.mark,
    project.categoryLabel,
    project.tagline,
    project.story,
    project.status,
    project.summary,
    ...(project.aliases || []),
  ].join(' ').toLowerCase()

  return categoryMatches && searchable.includes(query)
}

function renderProjects() {
  const query = search.value.trim().toLowerCase()
  const visible = projects
    .filter(project => projectMatches(project, query))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || Number(a.archiveOrder ?? 999) - Number(b.archiveOrder ?? 999) || a.title.localeCompare(b.title))

  grid.replaceChildren()
  resultCount.textContent = `${visible.length} project${visible.length === 1 ? '' : 's'} shown · Archive Core ${projects.length} records`

  if (!visible.length) {
    const empty = document.createElement('div')
    empty.className = 'empty-state'
    empty.textContent = 'No projects match that search yet. Try another category or keyword.'
    grid.appendChild(empty)
    return
  }

  visible.forEach(project => {
    const article = document.createElement('article')
    article.className = 'project-card'
    article.dataset.projectId = project.id

    const art = document.createElement('div')
    art.className = 'project-art'
    art.dataset.tone = project.tone

    const mark = document.createElement('span')
    mark.className = 'project-mark'
    mark.textContent = project.mark

    const status = document.createElement('span')
    status.className = 'project-status'
    status.textContent = project.archiveFeatured ? `${project.status} · Flagship` : project.status

    art.append(mark, status)

    const content = document.createElement('div')
    content.className = 'project-content'

    const category = document.createElement('span')
    category.className = 'project-category'
    category.textContent = project.categoryLabel

    const title = document.createElement('h4')
    title.textContent = project.title

    const tagline = document.createElement('p')
    tagline.textContent = project.tagline

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'project-button'
    button.textContent = 'Open project story'
    button.addEventListener('click', () => openProject(project, { updateUrl: true }))

    content.append(category, title, tagline, button)
    article.append(art, content)
    grid.appendChild(article)
  })
}

function writeProjectUrl(projectId, method = 'pushState') {
  const url = new URL(window.location.href)
  if (projectId) {
    url.searchParams.set('project', projectId)
    url.hash = 'projects'
  } else {
    url.searchParams.delete('project')
  }
  window.history[method]({ projectId }, '', url)
}

function createDialogLink({ label, url, external = false, primary = false }) {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.textContent = label
  if (external) {
    anchor.target = '_blank'
    anchor.rel = 'noopener'
  }
  if (primary) anchor.classList.add('primary-link')
  return anchor
}

function openProject(project, { updateUrl = false } = {}) {
  activeProject = project
  const dialogArt = document.getElementById('dialog-art')
  dialogArt.dataset.tone = project.tone
  document.getElementById('dialog-mark').textContent = project.mark
  document.getElementById('dialog-category').textContent = `${project.categoryLabel} · ${project.status} · Tier ${project.tier || '—'}`
  document.getElementById('dialog-title').textContent = project.title
  document.getElementById('dialog-tagline').textContent = project.tagline
  document.getElementById('dialog-story').textContent = project.story
  document.getElementById('dialog-see').textContent = project.see
  document.getElementById('dialog-proof').textContent = project.proof
  document.getElementById('dialog-next').textContent = project.next

  const links = document.getElementById('dialog-links')
  links.replaceChildren()
  links.appendChild(createDialogLink({
    label: project.archiveFeatured ? 'Open Flagship Archive Record' : 'Open Archive Record',
    url: `../archive/project/?id=${encodeURIComponent(project.id)}`,
    primary: true,
  }))

  ;(project.links || []).forEach(link => {
    links.appendChild(createDialogLink({ label: link.label, url: link.url, external: true }))
  })

  if (updateUrl) writeProjectUrl(project.id)

  if (!dialog.open) {
    if (typeof dialog.showModal === 'function') {
      dialog.showModal()
    } else {
      dialog.setAttribute('open', '')
    }
  }
}

function closeProject({ updateUrl = true } = {}) {
  activeProject = null
  if (typeof dialog.close === 'function' && dialog.open) {
    dialog.close()
  } else {
    dialog.removeAttribute('open')
  }
  if (updateUrl) writeProjectUrl(null, 'replaceState')
}

function findProject(reference) {
  if (window.ParallaxArchiveCore) {
    return window.ParallaxArchiveCore.findProject(projects, reference)
  }

  const needle = reference.trim().toLowerCase()
  return projects.find(project => {
    const values = [project.id, project.title, project.mark, ...(project.aliases || [])]
    return values.some(value => String(value).toLowerCase() === needle)
  })
}

function syncProjectFromUrl() {
  const projectId = new URLSearchParams(window.location.search).get('project')
  if (!projectId) {
    if (activeProject) closeProject({ updateUrl: false })
    return
  }

  const project = findProject(projectId)
  if (project) openProject(project, { updateUrl: false })
}

function showLoadError(error) {
  console.error('Archive Core manifest failed to load', error)
  filters.replaceChildren()
  grid.replaceChildren()
  resultCount.textContent = 'Archive Core unavailable'

  const message = document.createElement('div')
  message.className = 'empty-state'
  message.innerHTML = '<strong>The project manifest could not be loaded.</strong><br>The rest of the Parallax Network remains available above and below this section.'
  grid.appendChild(message)
}

async function initArchive() {
  resultCount.textContent = 'Loading Archive Core…'

  try {
    const archiveCore = await ensureArchiveCore()
    const manifest = await archiveCore.load()
    categories = Array.isArray(manifest.categories) ? manifest.categories : []
    projects = Array.isArray(manifest.projects) ? manifest.projects : []

    if (!categories.length || !projects.length) {
      throw new Error('Manifest contains no categories or projects')
    }

    createFilterButtons()
    renderProjects()
    syncProjectFromUrl()
  } catch (error) {
    showLoadError(error)
  }
}

closeDialog.addEventListener('click', () => closeProject())
dialog.addEventListener('click', event => {
  if (event.target === dialog) closeProject()
})
dialog.addEventListener('cancel', event => {
  event.preventDefault()
  closeProject()
})
search.addEventListener('input', renderProjects)
window.addEventListener('popstate', syncProjectFromUrl)

initArchive()
