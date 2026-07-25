const bootScreen = document.getElementById('boot-screen')
const bootOutput = document.getElementById('boot-output')
const skipBoot = document.getElementById('skip-boot')
const creativeRuntime = document.getElementById('creative-runtime')
const runtimeOutput = document.getElementById('runtime-output')
const commandForm = document.getElementById('command-form')
const commandInput = document.getElementById('command-input')
const programDialog = document.getElementById('program-dialog')
const programClose = document.getElementById('program-close')
const programFilter = document.getElementById('program-filter')
const programList = document.getElementById('program-list')
const programDetail = document.getElementById('program-detail')
const programStatus = document.getElementById('program-status')

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const playlistUrl = 'https://suno.com/playlist/206eaae8-a433-4342-baaf-f50b48b1c84f'
const bootLines = [
  ' **** PARALLAX 64 CREATIVE COMPUTER ****',
  ' 64K CREATIVE RAM SYSTEM  38911 BASIC BYTES FREE',
  '',
  ' ARCHIVE CORE ADAPTER ................. CONNECTING',
  ' SIDESPARK MUSIC BUS ...................... READY',
  ' GAME WORLD DRIVE ........................ READY',
  ' HUMAN IMAGINATION ....................... PRESENT',
  '',
  ' READY.',
]

let bootTimers = []
let projects = []
let selectedProject = null
let visiblePrograms = []
let outputLines = []

function appendOutput(value = '') {
  String(value).split('\n').forEach(line => outputLines.push(line))
  outputLines = outputLines.slice(-17)
  runtimeOutput.textContent = outputLines.join('\n')
}

function showRuntime({ focus = true } = {}) {
  bootTimers.forEach(window.clearTimeout)
  bootScreen.hidden = true
  creativeRuntime.hidden = false
  if (!outputLines.length) {
    appendOutput('PARALLAX 64 CREATIVE EDITION')
    appendOutput('TYPE HELP FOR COMMANDS.')
    appendOutput('READY.')
  }
  if (focus) commandInput.focus()
}

function runBoot() {
  if (reducedMotion) {
    bootOutput.textContent = bootLines.join('\n')
    showRuntime({ focus: false })
    return
  }

  bootLines.forEach((line, index) => {
    bootTimers.push(window.setTimeout(() => {
      bootOutput.textContent += `${line}\n`
      if (index === bootLines.length - 1) {
        bootTimers.push(window.setTimeout(() => showRuntime(), 580))
      }
    }, 130 + index * 180))
  })
}

async function loadArchiveCore() {
  try {
    const manifest = await window.ParallaxArchiveCore.load()
    projects = manifest.projects || []
    programStatus.textContent = `${projects.length} canonical records · Archive Core ${manifest.schemaVersion}`
    renderProgramList('', 'creative')
  } catch (error) {
    console.error('Breadbox 64 could not load Archive Core', error)
    programStatus.textContent = 'Archive Core unavailable · Standard Network remains ready'
  }
}

const archiveReady = loadArchiveCore()

function normalizeReference(value) {
  return String(value || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/,8$/i, '')
    .replace(/\.PRG$/i, '')
}

function findProject(reference) {
  return window.ParallaxArchiveCore.findProject(projects, normalizeReference(reference))
}

function recordUrl(project) {
  return `../project/?id=${encodeURIComponent(project.id)}`
}

function networkUrl(project) {
  return `../../network/?project=${encodeURIComponent(project.id)}#projects`
}

function creativeProjects() {
  return projects.filter(project => project.category === 'creative')
}

function formatDirectory(items = creativeProjects()) {
  return [
    '0 "PARALLAX CREATIVE" 64 2A',
    ...items.map((project, index) => `${String((index + 1) * 4).padStart(3, ' ')} "${project.title.toUpperCase().slice(0, 20)}" PRG`),
    `${Math.max(0, 38911 - items.length * 64)} BLOCKS FREE.`,
    'READY.',
  ].join('\n')
}

function createText(tag, className, text) {
  const element = document.createElement(tag)
  if (className) element.className = className
  if (text !== undefined) element.textContent = text
  return element
}

function renderProgramList(query = '', scope = 'creative') {
  programList.replaceChildren()
  const needle = query.trim().toLowerCase()
  const source = scope === 'all' ? projects : creativeProjects()
  visiblePrograms = source
    .filter(project => [project.id, project.title, project.mark, project.categoryLabel, project.status, project.tagline, ...(project.aliases || [])].join(' ').toLowerCase().includes(needle))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title))

  visiblePrograms.forEach(project => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'program-item'
    button.dataset.projectId = project.id
    button.setAttribute('role', 'option')
    button.setAttribute('aria-selected', String(selectedProject?.id === project.id))

    const mark = createText('span', 'program-mark', `${project.mark}.PRG`)
    const copy = document.createElement('span')
    copy.append(
      createText('strong', '', project.title),
      createText('small', '', `${project.categoryLabel} · ${project.status}`),
    )
    button.append(mark, copy)
    button.addEventListener('click', () => renderProgramDetail(project))
    programList.appendChild(button)
  })

  if (!visiblePrograms.length) programList.appendChild(createText('p', '', 'NO MATCHING PROGRAMS.'))
  programStatus.textContent = `${visiblePrograms.length} program(s) shown · ${scope === 'all' ? 'full archive' : 'creative disk'}`
}

function renderProgramDetail(project) {
  selectedProject = project
  programDetail.replaceChildren()

  const meta = createText('p', 'pixel-label', `${project.mark}.PRG · ${project.categoryLabel} · ${project.status}`)
  const title = createText('h2', '', project.title)
  const tagline = createText('p', '', project.tagline)
  tagline.style.fontWeight = '900'
  const story = createText('p', '', project.summary || project.story)

  const facts = document.createElement('div')
  facts.className = 'program-facts'
  ;[
    ['WHAT EXISTS', project.proof],
    ['NEXT LEVEL', project.next],
  ].forEach(([label, value]) => {
    const block = document.createElement('div')
    block.append(createText('strong', '', label), createText('span', '', value))
    facts.appendChild(block)
  })

  const actions = document.createElement('div')
  actions.className = 'program-actions'

  const load = document.createElement('button')
  load.type = 'button'
  load.textContent = 'LOAD PROGRAM'
  load.addEventListener('click', () => {
    selectedProject = project
    closeProgramDialog()
    showRuntime({ focus: false })
    appendOutput(`LOADING ${project.title.toUpperCase()}...`)
    appendOutput('READY. TYPE RUN.')
  })

  const record = createText('a', '', 'OPEN RECORD')
  record.href = recordUrl(project)
  const network = createText('a', '', 'STANDARD NETWORK')
  network.href = networkUrl(project)
  actions.append(load, record, network)

  programDetail.append(meta, title, tagline, story, facts, actions)
  programList.querySelectorAll('.program-item').forEach(button => {
    button.setAttribute('aria-selected', String(button.dataset.projectId === project.id))
  })
}

async function openProgramDialog({ scope = 'creative', project = null } = {}) {
  try {
    await archiveReady
  } catch {
    window.location.href = '../../network/#games'
    return
  }
  programFilter.value = ''
  programFilter.dataset.scope = scope
  renderProgramList('', scope)
  if (project) renderProgramDetail(project)
  if (!programDialog.open) {
    if (typeof programDialog.showModal === 'function') programDialog.showModal()
    else programDialog.setAttribute('open', '')
  }
  window.setTimeout(() => programFilter.focus(), 0)
}

function closeProgramDialog() {
  if (typeof programDialog.close === 'function' && programDialog.open) programDialog.close()
  else programDialog.removeAttribute('open')
}

async function loadProject(reference) {
  try {
    await archiveReady
  } catch {
    appendOutput('ARCHIVE CORE OFFLINE.')
    return
  }
  const project = findProject(reference)
  if (!project) {
    appendOutput(`?FILE NOT FOUND: ${normalizeReference(reference).toUpperCase()}`)
    appendOutput('READY.')
    return
  }
  selectedProject = project
  appendOutput(`SEARCHING FOR ${project.title.toUpperCase()}`)
  appendOutput('LOADING')
  appendOutput('READY. TYPE RUN.')
}

async function executeCommand(raw) {
  const command = String(raw || '').trim().replace(/\s+/g, ' ')
  if (!command) return
  const upper = command.toUpperCase()
  appendOutput(upper)

  const loadMatch = command.match(/^LOAD\s+(.+?)(?:,8)?$/i)
  if (loadMatch) {
    const reference = normalizeReference(loadMatch[1])
    if (reference === '$') {
      appendOutput(formatDirectory())
      return
    }
    await loadProject(reference)
    return
  }

  const openMatch = command.match(/^OPEN\s+(.+)$/i)
  if (openMatch) {
    await loadProject(openMatch[1])
    if (selectedProject) window.location.href = recordUrl(selectedProject)
    return
  }

  switch (upper) {
    case 'HELP':
      appendOutput([
        'COMMANDS:',
        ' LOAD "$",8       LIST CREATIVE DISK',
        ' LIST             PRINT CREATIVE DIRECTORY',
        ' LOAD "NAME",8   LOAD A PROJECT PROGRAM',
        ' RUN              OPEN LOADED ARCHIVE RECORD',
        ' GAMES            OPEN GAME PROGRAM DIRECTORY',
        ' MUSIC            LAUNCH PARALLAX RADIO',
        ' LAB              SEARCH ALL PROJECT PROGRAMS',
        ' NETWORK          STANDARD ACCESSIBLE NETWORK',
        ' CLEAR            CLEAR DISPLAY',
        ' EXIT             CHOOSE ANOTHER TERMINAL',
        'READY.',
      ].join('\n'))
      break
    case 'LIST':
    case 'DIRECTORY':
    case 'CATALOG':
      try {
        await archiveReady
        appendOutput(formatDirectory())
      } catch {
        appendOutput('DIRECTORY UNAVAILABLE.')
      }
      break
    case 'RUN':
      if (!selectedProject) appendOutput('?NO PROGRAM LOADED\nREADY.')
      else window.location.href = recordUrl(selectedProject)
      break
    case 'GAMES':
    case 'PROGRAMS':
      appendOutput('OPENING CREATIVE PROGRAM DIRECTORY...')
      openProgramDialog({ scope: 'creative', project: selectedProject })
      break
    case 'LAB':
      appendOutput('OPENING FULL CREATIVE LAB...')
      openProgramDialog({ scope: 'all', project: selectedProject })
      break
    case 'MUSIC':
    case 'PLAY':
      appendOutput('LAUNCHING PARALLAX RADIO / MEMETENDO 5000...')
      window.open(playlistUrl, '_blank', 'noopener')
      break
    case 'NETWORK':
      window.location.href = '../../network/#games'
      break
    case 'CLEAR':
    case 'CLS':
      outputLines = []
      runtimeOutput.textContent = ''
      break
    case 'EXIT':
      window.location.href = '../'
      break
    default:
      appendOutput(`?SYNTAX ERROR: ${upper}`)
      appendOutput('READY.')
  }
}

skipBoot.addEventListener('click', () => showRuntime())
document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault()
  showRuntime()
})

commandForm.addEventListener('submit', async event => {
  event.preventDefault()
  const value = commandInput.value
  commandInput.value = ''
  await executeCommand(value)
})

document.querySelectorAll('[data-action]').forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.action
    if (action === 'music') executeCommand('MUSIC')
    else if (action === 'lab') openProgramDialog({ scope: 'all' })
    else openProgramDialog({ scope: 'creative' })
  })
})

document.querySelectorAll('.disk').forEach(button => {
  button.addEventListener('click', async () => {
    try {
      await archiveReady
      const project = findProject(button.dataset.project)
      if (project) openProgramDialog({ scope: 'all', project })
    } catch {
      window.location.href = '../../network/#games'
    }
  })
})

programClose.addEventListener('click', closeProgramDialog)
programDialog.addEventListener('click', event => {
  if (event.target === programDialog) closeProgramDialog()
})
programFilter.addEventListener('input', () => renderProgramList(programFilter.value, programFilter.dataset.scope || 'creative'))
programList.addEventListener('keydown', event => {
  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return
  const items = [...programList.querySelectorAll('.program-item')]
  const index = items.indexOf(document.activeElement)
  const nextIndex = event.key === 'ArrowDown'
    ? Math.min(items.length - 1, index + 1)
    : Math.max(0, index - 1)
  items[nextIndex]?.focus()
  event.preventDefault()
})

runBoot()
