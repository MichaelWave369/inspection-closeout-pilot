const coreLoaderUrl = '../data/archive-core.js'

const bootPanel = document.getElementById('boot-panel')
const bootOutput = document.getElementById('boot-output')
const skipBoot = document.getElementById('skip-boot')
const dosPanel = document.getElementById('dos-panel')
const dosHistory = document.getElementById('dos-history')
const commandForm = document.getElementById('command-form')
const commandInput = document.getElementById('command-input')
const openDesktopButton = document.getElementById('open-desktop')
const archiveDesktop = document.getElementById('archive-desktop')
const returnDos = document.getElementById('return-dos')
const originDialog = document.getElementById('origin-dialog')
const openOrigin = document.getElementById('open-origin')
const originClose = document.getElementById('origin-close')
const openProjects = document.getElementById('open-projects')
const desktopFile = document.getElementById('desktop-file')
const desktopView = document.getElementById('desktop-view')
const projectBrowser = document.getElementById('project-browser')
const projectBrowserClose = document.getElementById('project-browser-close')
const projectFilter = document.getElementById('project-filter')
const projectFileList = document.getElementById('project-file-list')
const projectFileDetail = document.getElementById('project-file-detail')
const projectBrowserStatus = document.getElementById('project-browser-status')
const projectCount = document.getElementById('project-count')

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const bootLines = [
  'TANDY PERSONAL COMPUTER / PARALLAX ORIGIN LAYER',
  'MEMORY TEST ................................ 640K OK',
  'DISPLAY ADAPTER ............................ READY',
  'ARCHIVE DRIVE .............................. DETECTED',
  'HUMAN AUTHORITY ............................ PRESENT',
  '',
  'Loading PARALLAX.SYS',
  'Mounting ORIGIN.DSK',
  '',
  'C:\\>_',
]

let bootTimer = null
let bootIndex = 0
let projects = []
let selectedProject = null

function appendHistory(text) {
  dosHistory.textContent += `${text}\n`
  dosHistory.scrollTop = dosHistory.scrollHeight
}

function ensureArchiveCore() {
  if (window.ParallaxArchiveCore) return Promise.resolve(window.ParallaxArchiveCore)

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = coreLoaderUrl
    script.onload = () => resolve(window.ParallaxArchiveCore)
    script.onerror = () => reject(new Error('Archive Core loader could not be loaded'))
    document.head.appendChild(script)
  })
}

async function loadArchiveCore() {
  try {
    const archiveCore = await ensureArchiveCore()
    const manifest = await archiveCore.load()
    projects = Array.isArray(manifest.projects) ? manifest.projects : []
    if (!projects.length) throw new Error('No project records found')

    projectCount.textContent = `${projects.length} FILES`
    projectBrowserStatus.textContent = `${projects.length} canonical project records · Archive Core ${manifest.schemaVersion || '0.1'}`
    renderProjectList()
    return projects
  } catch (error) {
    console.error('Archive Core manifest failed to load', error)
    projectCount.textContent = 'OFFLINE'
    projectBrowserStatus.textContent = 'Archive Core unavailable · use Standard Network'
    throw error
  }
}

const archiveCoreReady = loadArchiveCore()

function showDos({ focus = true } = {}) {
  window.clearTimeout(bootTimer)
  bootPanel.hidden = true
  archiveDesktop.hidden = true
  dosPanel.hidden = false
  if (!dosHistory.textContent) {
    appendHistory('PARALLAX ARCHIVE DOS v0.3\nType HELP for available commands.\n')
  }
  if (focus) commandInput.focus()
}

function showDesktop() {
  bootPanel.hidden = true
  dosPanel.hidden = true
  archiveDesktop.hidden = false
  document.getElementById('desktop-title').focus?.()
}

function runBoot() {
  if (reducedMotion) {
    bootOutput.textContent = bootLines.join('\n')
    showDos({ focus: false })
    return
  }

  const next = () => {
    if (bootIndex >= bootLines.length) {
      bootTimer = window.setTimeout(() => showDos(), 650)
      return
    }
    bootOutput.textContent += `${bootLines[bootIndex]}\n`
    bootIndex += 1
    bootTimer = window.setTimeout(next, bootIndex < 6 ? 190 : 300)
  }
  next()
}

function normalizeCommand(value) {
  return value.trim().replace(/\s+/g, ' ').toUpperCase()
}

function normalizeReference(value) {
  return value
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\.PRX$/i, '')
    .replace(/\.TXT$/i, '')
    .toUpperCase()
}

function projectValues(project) {
  return [project.id, project.title, project.mark, ...(project.aliases || [])]
    .map(value => normalizeReference(String(value)))
}

function findProject(reference) {
  if (window.ParallaxArchiveCore) {
    return window.ParallaxArchiveCore.findProject(projects, reference)
  }

  const needle = normalizeReference(reference)
  if (!needle) return null

  const exact = projects.find(project => projectValues(project).includes(needle))
  if (exact) return exact

  const partial = projects.filter(project => projectValues(project).some(value => value.includes(needle)))
  return partial.length === 1 ? partial[0] : null
}

function formatProjectDirectory() {
  return [
    ' Volume in drive C is PARALLAX',
    ' Directory of C:\\PROJECTS',
    '',
    ...projects
      .slice()
      .sort((a, b) => Number(a.archiveOrder || 999) - Number(b.archiveOrder || 999) || a.title.localeCompare(b.title))
      .map(project => `${project.mark.padEnd(6)} ${project.title.toUpperCase().slice(0, 29).padEnd(29)} ${project.status}`),
    '',
    `${projects.length} project file(s) / one canonical archive core`,
    'Use OPEN <NAME> to inspect a record.',
  ].join('\n')
}

function createText(tag, className, text) {
  const element = document.createElement(tag)
  if (className) element.className = className
  element.textContent = text
  return element
}

function renderProjectDetail(project) {
  selectedProject = project
  projectFileDetail.replaceChildren()

  const meta = createText('p', 'project-file-meta', `${project.categoryLabel} · ${project.status} · TIER ${project.tier || '—'} · WAVE ${project.wave || '—'}`)
  const title = createText('h2', '', project.title)
  const tagline = createText('p', '', project.tagline)
  tagline.style.fontWeight = '900'
  const story = createText('p', '', project.summary || project.story)

  const facts = document.createElement('div')
  facts.className = 'project-file-facts'
  ;[
    ['WHAT EXISTS', project.proof],
    ['WHAT TO SEE', project.see],
    ['NEXT TRAJECTORY', project.next],
  ].forEach(([label, value]) => {
    const block = document.createElement('div')
    block.append(createText('strong', '', label), createText('span', '', value))
    facts.appendChild(block)
  })

  const archiveLink = document.createElement('a')
  archiveLink.className = 'project-open-link'
  archiveLink.href = `../project/?id=${encodeURIComponent(project.id)}`
  archiveLink.textContent = project.archiveFeatured ? 'OPEN FLAGSHIP ARCHIVE RECORD →' : 'OPEN ARCHIVE RECORD →'

  const networkLink = document.createElement('a')
  networkLink.className = 'project-open-link'
  networkLink.href = `../../network/?project=${encodeURIComponent(project.id)}#projects`
  networkLink.textContent = 'OPEN NETWORK STORY →'

  projectFileDetail.append(meta, title, tagline, story, facts, archiveLink, networkLink)
  projectBrowserStatus.textContent = `${project.mark}.PRX · ${project.id} · Archive Core record`

  projectFileList.querySelectorAll('.project-file').forEach(button => {
    button.setAttribute('aria-selected', String(button.dataset.projectId === project.id))
  })
}

function renderProjectList(query = '') {
  projectFileList.replaceChildren()
  const needle = query.trim().toLowerCase()
  const visible = projects
    .filter(project => [project.title, project.mark, project.categoryLabel, project.status, project.summary, ...(project.aliases || [])].join(' ').toLowerCase().includes(needle))
    .sort((a, b) => Number(b.archiveFeatured) - Number(a.archiveFeatured) || Number(a.archiveOrder || 999) - Number(b.archiveOrder || 999) || a.title.localeCompare(b.title))

  visible.forEach(project => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'project-file'
    button.dataset.projectId = project.id
    button.setAttribute('role', 'option')
    button.setAttribute('aria-selected', String(selectedProject?.id === project.id))

    const fileLabel = project.archiveFeatured ? `${project.mark}.FLG` : `${project.mark}.PRX`
    const mark = createText('span', 'project-file-mark', fileLabel)
    const copy = document.createElement('span')
    copy.append(createText('strong', '', project.title), createText('small', '', `${project.categoryLabel} · ${project.status}`))
    button.append(mark, copy)
    button.addEventListener('click', () => renderProjectDetail(project))
    projectFileList.appendChild(button)
  })

  if (!visible.length) {
    projectFileList.appendChild(createText('p', '', 'No matching project files.'))
  }

  projectBrowserStatus.textContent = `${visible.length} of ${projects.length} project file(s) shown`
}

async function showProjectBrowser(project = null) {
  try {
    await archiveCoreReady
  } catch {
    window.location.href = '../../network/#projects'
    return
  }

  projectFilter.value = ''
  renderProjectList()
  if (project) renderProjectDetail(project)

  if (!projectBrowser.open) {
    if (typeof projectBrowser.showModal === 'function') {
      projectBrowser.showModal()
    } else {
      projectBrowser.setAttribute('open', '')
    }
  }
  window.setTimeout(() => projectFilter.focus(), 0)
}

function closeProjectBrowser() {
  if (typeof projectBrowser.close === 'function' && projectBrowser.open) {
    projectBrowser.close()
  } else {
    projectBrowser.removeAttribute('open')
  }
}

async function openProjectFromCommand(reference) {
  try {
    await archiveCoreReady
  } catch {
    appendHistory('Archive Core unavailable. Opening standard Network…')
    window.location.href = '../../network/#projects'
    return
  }

  const project = findProject(reference)
  if (!project) {
    appendHistory(`Project file not found or reference is ambiguous: ${reference}\nUse DIR PROJECTS to list available files.`)
    return
  }

  appendHistory([
    `${project.mark}.${project.archiveFeatured ? 'FLG' : 'PRX'} — ${project.title}`,
    `${project.categoryLabel} / ${project.status}`,
    project.tagline,
    '',
    'Opening project record…',
  ].join('\n'))
  window.setTimeout(() => showProjectBrowser(project), reducedMotion ? 0 : 260)
}

async function executeCommand(raw) {
  const command = normalizeCommand(raw)
  if (!command) return

  appendHistory(`C:\\>${command}`)

  if (command.startsWith('OPEN ')) {
    await openProjectFromCommand(command.slice(5))
    return
  }

  if (command.startsWith('TYPE ') && command !== 'TYPE ABOUT.TXT') {
    await openProjectFromCommand(command.slice(5))
    return
  }

  switch (command) {
    case 'HELP':
      appendHistory([
        'AVAILABLE COMMANDS',
        '  ARCHIVE          Open the DeskMate archive desktop',
        '  PROJECTS         Open canonical project files',
        '  DIR PROJECTS     List every mounted project record',
        '  OPEN <NAME>       Open a project, e.g. OPEN MENDALA',
        '  TYPE <NAME>.PRX   Read a project file',
        '  DIR              List mounted archive directories',
        '  ABOUT            Read the SL1200 Origin note',
        '  NETWORK          Open the full standard Network page',
        '  CLEAR            Clear this terminal',
        '  EXIT             Return to terminal selection',
        '',
        'FLAGSHIP FILES: OPEN MENDALA · OPEN CINEMA · OPEN CARBON',
      ].join('\n'))
      break
    case 'DIR':
    case 'DIR /W':
      appendHistory([
        ' Volume in drive C is PARALLAX',
        ' Directory of C:\\',
        '',
        'PROJECTS   <DIR>   BUILDS     <DIR>',
        'GAMES      <DIR>   MEDIA      <DIR>',
        'ABOUT      TXT     ARCHIVE    EXE',
        'NETWORK    LNK     ORIGIN     DSK',
        '',
        '8 item(s) / archive state preserved',
      ].join('\n'))
      break
    case 'DIR PROJECTS':
    case 'DIR C:\\PROJECTS':
    case 'CD PROJECTS':
      try {
        await archiveCoreReady
        appendHistory(formatProjectDirectory())
      } catch {
        appendHistory('Archive Core project directory is unavailable.')
      }
      break
    case 'PROJECTS':
    case 'PROJECTS.EXE':
      appendHistory('Opening canonical project files…')
      await showProjectBrowser()
      break
    case 'ARCHIVE':
    case 'ARCHIVE.EXE':
    case 'DESKMATE':
      appendHistory('Opening DeskMate / Parallax Archive…')
      window.setTimeout(showDesktop, reducedMotion ? 0 : 350)
      break
    case 'ABOUT':
    case 'TYPE ABOUT.TXT':
      appendHistory('Opening ORIGIN NOTE…')
      originDialog.showModal()
      break
    case 'NETWORK':
    case 'OPEN NETWORK':
      appendHistory('Opening standard Parallax Network…')
      window.location.href = '../../network/'
      break
    case 'CLEAR':
    case 'CLS':
      dosHistory.textContent = ''
      break
    case 'EXIT':
      window.location.href = '../'
      break
    default:
      appendHistory(`Bad command or file name: ${command}\nType HELP for available commands.`)
  }
}

skipBoot.addEventListener('click', () => showDos())
openDesktopButton.addEventListener('click', showDesktop)
returnDos.addEventListener('click', () => showDos())
openProjects.addEventListener('click', () => showProjectBrowser())
desktopFile.addEventListener('click', () => showProjectBrowser())
desktopView.addEventListener('click', () => showProjectBrowser(selectedProject))

commandForm.addEventListener('submit', async event => {
  event.preventDefault()
  const value = commandInput.value
  commandInput.value = ''
  await executeCommand(value)
})

openOrigin.addEventListener('click', () => originDialog.showModal())
originClose.addEventListener('click', () => originDialog.close())
originDialog.addEventListener('click', event => {
  if (event.target === originDialog) originDialog.close()
})

projectBrowserClose.addEventListener('click', closeProjectBrowser)
projectBrowser.addEventListener('click', event => {
  if (event.target === projectBrowser) closeProjectBrowser()
})
projectFilter.addEventListener('input', () => renderProjectList(projectFilter.value))

projectFileList.addEventListener('keydown', event => {
  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return
  const files = [...projectFileList.querySelectorAll('.project-file')]
  const index = files.indexOf(document.activeElement)
  const nextIndex = event.key === 'ArrowDown'
    ? Math.min(files.length - 1, index + 1)
    : Math.max(0, index - 1)
  files[nextIndex]?.focus()
  event.preventDefault()
})

document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault()
  showDesktop()
})

runBoot()
