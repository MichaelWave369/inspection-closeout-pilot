const loadingCard = document.getElementById('loading-card')
const record = document.getElementById('record')
const errorCard = document.getElementById('error-card')
const errorMessage = document.getElementById('error-message')

const artifactStateLabels = {
  ready: 'Published',
  'known-locate': 'Known · locate',
  design: 'Design-stage',
  planned: 'Planned',
}

function createElement(tag, className, text) {
  const element = document.createElement(tag)
  if (className) element.className = className
  if (text !== undefined) element.textContent = text
  return element
}

function recordUrl(projectId) {
  return `?id=${encodeURIComponent(projectId)}`
}

function networkUrl(projectId) {
  return `../../network/?project=${encodeURIComponent(projectId)}#projects`
}

function createButton(label, href, { primary = false, external = false } = {}) {
  const anchor = createElement('a', `record-button${primary ? ' primary' : ''}`, label)
  anchor.href = href
  if (external) {
    anchor.target = '_blank'
    anchor.rel = 'noopener'
  }
  return anchor
}

function renderMendalaVisual(stage) {
  const visual = createElement('div', 'mendala-visual')
  const flow = createElement('div', 'mendala-flow')
  visual.appendChild(flow)

  ;[0, 9, 20, 31].forEach(inset => {
    const ring = createElement('div', 'mendala-ring')
    ring.style.setProperty('--inset', `${inset}%`)
    visual.appendChild(ring)
  })

  const core = createElement('div', 'mendala-core', 'M')
  visual.appendChild(core)

  ;['WATER', 'LIGHT', 'AIR', 'ROOT', 'DATA', 'CYCLE'].forEach((label, index) => {
    const pod = createElement('div', 'mendala-pod', label)
    pod.style.setProperty('--angle', `${index * 60}deg`)
    visual.appendChild(pod)
  })

  stage.appendChild(visual)
}

function addGraphEdge(visual, x1, y1, x2, y2) {
  const edge = createElement('div', 'graph-edge')
  const dx = x2 - x1
  const dy = y2 - y1
  edge.style.left = `${x1}%`
  edge.style.top = `${y1}%`
  edge.style.width = `${Math.sqrt(dx * dx + dy * dy)}%`
  edge.style.transform = `rotate(${Math.atan2(dy, dx) * 180 / Math.PI}deg)`
  visual.appendChild(edge)
}

function renderGraphVisual(stage) {
  const visual = createElement('div', 'graph-visual')
  const nodes = [
    { label: 'OBS', x: 8, y: 18 },
    { label: 'MAP', x: 38, y: 8, active: true },
    { label: 'DISS', x: 72, y: 20, dissent: true },
    { label: 'GOV', x: 56, y: 50, active: true },
    { label: 'OPS', x: 82, y: 72 },
    { label: 'REP', x: 43, y: 82 },
    { label: 'LED', x: 10, y: 66 },
  ]

  ;[[8,18,38,8],[38,8,72,20],[72,20,56,50],[56,50,82,72],[82,72,43,82],[43,82,10,66],[10,66,8,18],[38,8,56,50],[10,66,56,50]].forEach(values => addGraphEdge(visual, ...values))

  nodes.forEach(node => {
    const element = createElement('div', `graph-node${node.active ? ' active' : ''}${node.dissent ? ' dissent' : ''}`, node.label)
    element.style.left = `${node.x}%`
    element.style.top = `${node.y}%`
    visual.appendChild(element)
  })

  visual.append(createElement('div', 'trajectory-path'), createElement('div', 'trajectory-cursor'))
  stage.appendChild(visual)
}

function renderCarbonVisual(stage) {
  const visual = createElement('div', 'carbon-visual')
  ;[
    { inset: 3, rotate: 12 },
    { inset: 13, rotate: -28 },
    { inset: 24, rotate: 44 },
  ].forEach(item => {
    const loop = createElement('div', 'carbon-loop')
    loop.style.setProperty('--inset', `${item.inset}%`)
    loop.style.setProperty('--rotate', `${item.rotate}deg`)
    visual.appendChild(loop)
  })

  const human = createElement('div', 'human-core')
  human.append(createElement('div', 'human-head'), createElement('div', 'human-body'))
  visual.append(createElement('div', 'consent-pulse'), human)
  stage.appendChild(visual)
}

function renderDefaultVisual(stage, project) {
  const visual = createElement('div', 'carbon-visual')
  const loop = createElement('div', 'carbon-loop')
  loop.style.setProperty('--inset', '5%')
  loop.style.setProperty('--rotate', '18deg')
  const core = createElement('div', 'mendala-core', project.mark)
  visual.append(loop, core)
  stage.appendChild(visual)
}

function renderAssetVisual(stage, project) {
  const wrapper = createElement('div', 'asset-visual')
  const image = document.createElement('img')
  image.src = project.visual.assetUrl
  image.alt = ''
  image.loading = 'eager'
  image.decoding = 'async'
  image.addEventListener('error', () => {
    wrapper.remove()
    renderDefaultVisual(stage, project)
  }, { once: true })
  wrapper.appendChild(image)
  stage.appendChild(wrapper)
}

function renderVisual(project) {
  const stage = document.getElementById('visual-stage')
  stage.replaceChildren()
  document.getElementById('visual-label').textContent = project.visual?.label || `${project.title} archive visualization`
  document.getElementById('visual-caption').textContent = project.visual?.caption || 'A shell-neutral visual placeholder generated from the canonical project record.'

  switch (project.visual?.kind) {
    case 'asset':
      if (project.visual.assetUrl) renderAssetVisual(stage, project)
      else renderDefaultVisual(stage, project)
      break
    case 'mendala':
      renderMendalaVisual(stage)
      break
    case 'graph-cinema':
      renderGraphVisual(stage)
      break
    case 'carbon-loop':
      renderCarbonVisual(stage)
      break
    default:
      renderDefaultVisual(stage, project)
  }
}

function renderSignals(project) {
  const container = document.getElementById('record-signals')
  container.replaceChildren()
  const signals = project.signals?.length ? project.signals : [
    { label: 'Current state', value: project.status },
    { label: 'Launch tier', value: project.tier ? `${project.tier} — Archive` : 'Indexed' },
    { label: 'Wave', value: project.wave ? `Wave ${project.wave}` : 'Unscheduled' },
    { label: 'Category', value: project.categoryLabel },
  ]

  signals.forEach(signal => {
    const card = createElement('div', 'record-signal')
    card.append(createElement('small', '', signal.label), createElement('strong', '', signal.value))
    container.appendChild(card)
  })
}

function renderActions(project) {
  const container = document.getElementById('record-actions')
  container.replaceChildren()
  container.append(
    createButton('Open Network Story', networkUrl(project.id), { primary: true }),
    createButton('Enter through SL1200', '../sl1200/'),
    createButton('Choose another terminal', '../'),
  )

  ;(project.links || []).forEach(link => {
    container.appendChild(createButton(link.label, link.url, { external: true }))
  })
}

function artifactPreviewUrl(artifact) {
  if (artifact.thumbnailUrl) return artifact.thumbnailUrl
  if (artifact.mediaType?.startsWith('image/') && artifact.url) return artifact.url
  return null
}

function renderArtifacts(project) {
  const container = document.getElementById('artifact-grid')
  container.replaceChildren()
  const artifacts = project.artifacts?.length ? project.artifacts : [
    {
      type: 'Archive status',
      title: 'Richer artifact package not yet assembled',
      status: 'planned',
      description: 'This project is indexed in Archive Core, but its posters, specifications, builds, and public receipts have not yet been connected to this record.',
      action: 'Locate and approve the first canonical public artifact.',
    },
  ]

  artifacts.forEach(artifact => {
    const previewUrl = artifactPreviewUrl(artifact)
    const card = createElement('article', `artifact-card${previewUrl ? ' has-preview' : ''}`)

    if (previewUrl) {
      const preview = createElement('a', 'artifact-preview')
      preview.href = artifact.url || previewUrl
      preview.setAttribute('aria-label', `Open ${artifact.title}`)
      const image = document.createElement('img')
      image.src = previewUrl
      image.alt = `${artifact.title} preview`
      image.loading = 'lazy'
      image.decoding = 'async'
      preview.appendChild(image)
      card.appendChild(preview)
    }

    const top = createElement('div', 'artifact-top')
    top.append(
      createElement('span', 'artifact-type', artifact.type),
      createElement('span', `artifact-state ${artifact.status || 'planned'}`, artifactStateLabels[artifact.status] || artifact.status || 'Planned'),
    )
    card.append(top, createElement('h3', '', artifact.title), createElement('p', '', artifact.description))

    if (artifact.url) {
      const link = createElement('a', 'artifact-link', artifact.linkLabel || 'Open artifact →')
      link.href = artifact.url
      if (/^https?:/i.test(artifact.url)) {
        link.target = '_blank'
        link.rel = 'noopener'
      }
      card.appendChild(link)
    } else {
      card.appendChild(createElement('div', 'artifact-action', artifact.action || 'Artifact is not publicly connected yet.'))
    }

    container.appendChild(card)
  })
}

function renderRelationships(project, projects) {
  const container = document.getElementById('relationship-grid')
  container.replaceChildren()
  const relationships = project.relationships || []

  if (!relationships.length) {
    const empty = createElement('article', 'relationship-card')
    empty.append(
      createElement('span', 'relationship-type', 'Archive mapping'),
      createElement('h3', '', 'Relationships not yet typed'),
      createElement('p', '', 'The project exists in the constellation, but its formal relationships have not yet been added to Archive Core.'),
    )
    container.appendChild(empty)
    return
  }

  relationships.forEach(relationship => {
    const target = projects.find(item => item.id === relationship.projectId)
    const card = createElement(target ? 'a' : 'article', 'relationship-card')
    if (target) card.href = recordUrl(target.id)
    card.append(
      createElement('span', 'relationship-type', relationship.type),
      createElement('h3', '', target?.title || relationship.projectId),
      createElement('p', '', relationship.note),
    )
    if (target) card.appendChild(createElement('span', 'relationship-open', 'Open connected record →'))
    container.appendChild(card)
  })
}

function renderPagination(project, projects) {
  const container = document.getElementById('record-pagination')
  container.replaceChildren()
  const flagship = projects.filter(item => item.archiveFeatured).sort((a, b) => Number(a.archiveOrder ?? 999) - Number(b.archiveOrder ?? 999))
  const pool = project.archiveFeatured && flagship.length > 1 ? flagship : projects.slice().sort((a, b) => a.title.localeCompare(b.title))
  const index = pool.findIndex(item => item.id === project.id)
  if (index < 0 || pool.length < 2) return

  const previous = pool[(index - 1 + pool.length) % pool.length]
  const next = pool[(index + 1) % pool.length]

  const previousLink = createElement('a')
  previousLink.href = recordUrl(previous.id)
  previousLink.append(createElement('small', '', '← Previous record'), createElement('strong', '', previous.title))

  const nextLink = createElement('a')
  nextLink.href = recordUrl(next.id)
  nextLink.append(createElement('small', '', 'Next record →'), createElement('strong', '', next.title))

  container.append(previousLink, nextLink)
}

function renderProject(project, manifest) {
  document.title = `${project.title} | Parallax Archive Record`
  document.querySelector('meta[name="description"]')?.setAttribute('content', project.tagline)
  document.body.dataset.tone = project.tone || 'blue'

  document.getElementById('record-kicker').textContent = `${project.categoryLabel} · ${project.status} · TIER ${project.tier || '—'}`
  document.getElementById('record-title').textContent = project.title
  document.getElementById('record-tagline').textContent = project.tagline
  document.getElementById('record-summary').textContent = project.summary || project.story
  document.getElementById('record-story').textContent = project.story
  document.getElementById('record-boundary').textContent = project.claimBoundary || `This record reflects the project's current stated status: ${project.status}. The listed proof describes known design or implementation evidence and should not be read as a claim that every planned capability is complete or validated.`
  document.getElementById('record-see').textContent = project.see
  document.getElementById('record-proof').textContent = project.proof
  document.getElementById('record-next').textContent = project.next
  document.getElementById('trajectory-state').textContent = project.archiveFeatured ? 'Flagship record' : 'Canonical index'

  renderVisual(project)
  renderSignals(project)
  renderActions(project)
  renderArtifacts(project)
  renderRelationships(project, manifest.projects)
  renderPagination(project, manifest.projects)

  loadingCard.hidden = true
  errorCard.hidden = true
  record.hidden = false
}

function showError(message) {
  loadingCard.hidden = true
  record.hidden = true
  errorCard.hidden = false
  errorMessage.textContent = message
}

async function init() {
  try {
    if (!window.ParallaxArchiveCore) throw new Error('Archive Core loader did not initialize')
    const manifest = await window.ParallaxArchiveCore.load()
    const requested = new URLSearchParams(window.location.search).get('id') || 'parallax-mendala'
    const project = window.ParallaxArchiveCore.findProject(manifest.projects, requested)
    if (!project) throw new Error(`No canonical project record matches “${requested}”.`)
    renderProject(project, manifest)
  } catch (error) {
    console.error(error)
    showError(error.message || 'Archive Core is temporarily unavailable.')
  }
}

init()
