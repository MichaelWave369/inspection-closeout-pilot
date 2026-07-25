const machine = document.querySelector('.machine')
const powerSwitch = document.getElementById('power-switch')
const bootScreen = document.getElementById('boot-screen')
const bootOutput = document.getElementById('boot-output')
const skipBoot = document.getElementById('skip-boot')
const terminalScreen = document.getElementById('terminal-screen')
const terminalOutput = document.getElementById('terminal-output')
const terminalForm = document.getElementById('terminal-form')
const terminalInput = document.getElementById('terminal-input')
const engineerScreen = document.getElementById('engineer-screen')
const engineerClose = document.getElementById('engineer-close')
const engineerKey = document.getElementById('engineer-key')
const catalogKey = document.getElementById('catalog-key')
const clearKey = document.getElementById('clear-key')
const modeLabel = document.getElementById('mode-label')
const archiveStatus = document.getElementById('archive-status')
const mountedTape = document.getElementById('mounted-tape')
const tapeSlot = document.getElementById('tape-slot')
const driveLight = document.getElementById('drive-light')
const catalogDialog = document.getElementById('catalog-dialog')
const catalogClose = document.getElementById('catalog-close')
const catalogFilter = document.getElementById('catalog-filter')
const catalogList = document.getElementById('catalog-list')
const catalogDetail = document.getElementById('catalog-detail')
const catalogStatus = document.getElementById('catalog-status')
const engineerCore = document.getElementById('engineer-core')
const engineerCount = document.getElementById('engineer-count')
const engineerPacks = document.getElementById('engineer-packs')

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const MAX_COLUMNS = 64
const MAX_OUTPUT_LINES = 13
const bootLines = [
  'IBM 5100 PORTABLE COMPUTER',
  'PARALLAX ARCHIVE ADAPTER PX-5100',
  '',
  'MEMORY ................................ 64K READY',
  'DISPLAY ........................... 16 X 64 READY',
  'TAPE CONTROLLER ........................ READY',
  'ARCHIVE ROUTE ........................ CONNECTING',
  '',
  'HUMAN AUTHORITY ........................ PRESENT',
  'CANONICAL RECORDS ...................... MOUNTING',
  '',
  'READY',
]

let projects = []
let manifest = null
let selectedProject = null
let mountedProject = null
let terminalLines = []
let bootTimers = []
let powered = true

function wrapLine(value, width = MAX_COLUMNS) {
  const source = String(value ?? '')
  if (!source) return ['']
  const lines = []
  let remaining = source
  while (remaining.length > width) {
    let breakAt = remaining.lastIndexOf(' ', width)
    if (breakAt < width * .45) breakAt = width
    lines.push(remaining.slice(0, breakAt).trimEnd())
    remaining = remaining.slice(breakAt).trimStart()
  }
  lines.push(remaining)
  return lines
}

function appendOutput(value = '') {
  String(value).split('\n').forEach(line => terminalLines.push(...wrapLine(line)))
  terminalLines = terminalLines.slice(-MAX_OUTPUT_LINES)
  terminalOutput.textContent = terminalLines.join('\n')
}

function clearOutput({ greeting = false } = {}) {
  terminalLines = []
  terminalOutput.textContent = ''
  if (greeting) {
    appendOutput('PARALLAX ARCHIVE TERMINAL / PX-5100')
    appendOutput('TYPE HELP FOR AVAILABLE COMMANDS.')
  }
}

function showTerminal({ focus = true } = {}) {
  bootTimers.forEach(window.clearTimeout)
  bootTimers = []
  bootScreen.hidden = true
  engineerScreen.hidden = true
  terminalScreen.hidden = false
  modeLabel.textContent = 'ARCHIVE'
  if (!terminalLines.length) clearOutput({ greeting: true })
  if (focus) terminalInput.focus()
}

function showEngineer() {
  if (!powered) return
  bootScreen.hidden = true
  terminalScreen.hidden = true
  engineerScreen.hidden = false
  modeLabel.textContent = 'ENGINEER'
  engineerClose.focus()
}

function runBoot() {
  bootTimers.forEach(window.clearTimeout)
  bootTimers = []
  bootOutput.textContent = ''
  bootScreen.hidden = false
  terminalScreen.hidden = true
  engineerScreen.hidden = true
  modeLabel.textContent = 'START'

  if (reducedMotion) {
    bootOutput.textContent = bootLines.join('\n')
    showTerminal({ focus: false })
    return
  }

  bootLines.forEach((line, index) => {
    bootTimers.push(window.setTimeout(() => {
      bootOutput.textContent += `${line}\n`
      if (index === bootLines.length - 1) {
        bootTimers.push(window.setTimeout(() => showTerminal(), 650))
      }
    }, 130 + index * 155))
  })
}

async function loadArchiveCore() {
  try {
    manifest = await window.ParallaxArchiveCore.load()
    projects = manifest.projects || []
    archiveStatus.textContent = `ARCHIVE CORE: ${projects.length} RECORDS`
    engineerCore.textContent = `ONLINE / ${manifest.schemaVersion}`
    engineerCount.textContent = String(projects.length)
    engineerPacks.textContent = String((manifest.packs || []).length)
    catalogStatus.textContent = `${projects.length} canonical tape records · Archive Core ${manifest.schemaVersion}`
    renderCatalog()
    return manifest
  } catch (error) {
    console.error('Archive Core failed to load', error)
    archiveStatus.textContent = 'ARCHIVE CORE: FALLBACK READY'
    engineerCore.textContent = 'OFFLINE'
    engineerCount.textContent = '--'
    engineerPacks.textContent = '--'
    catalogStatus.textContent = 'Archive Core unavailable · Standard Network remains available'
    return null
  }
}

const archiveReady = loadArchiveCore()

function recordUrl(project) {
  return `../project/?id=${encodeURIComponent(project.id)}`
}

function networkUrl(project) {
  return `../../network/?project=${encodeURIComponent(project.id)}#projects`
}

function projectTapeCode(project) {
  const mark = String(project.mark || 'PX').replace(/[^A-Z0-9]/gi, '').slice(0, 4).toUpperCase()
  return `${mark}-${project.flagship ? 'FLG' : 'PRX'}`
}

function createText(tag, className, text) {
  const element = document.createElement(tag)
  if (className) element.className = className
  if (text !== undefined) element.textContent = text
  return element
}

function mountTape(project, { announce = true } = {}) {
  if (!project || !powered) return false
  mountedProject = project
  selectedProject = project
  mountedTape.textContent = `${projectTapeCode(project)} / ${project.title.toUpperCase()}`
  tapeSlot.classList.remove('mounted')
  void tapeSlot.offsetWidth
  tapeSlot.classList.add('mounted')
  driveLight.classList.add('active')
  window.setTimeout(() => driveLight.classList.remove('active'), reducedMotion ? 10 : 900)
  showTerminal({ focus: false })
  if (announce) {
    appendOutput(`TAPE ${projectTapeCode(project)} MOUNTED.`)
    appendOutput(project.title.toUpperCase())
    appendOutput(project.tagline)
    appendOutput('TYPE READ TO INSPECT OR RUN TO OPEN RECORD.')
  }
  return true
}

function ejectTape() {
  if (!mountedProject) {
    appendOutput('NO TAPE IS MOUNTED.')
    return
  }
  appendOutput(`TAPE ${projectTapeCode(mountedProject)} EJECTED.`)
  mountedProject = null
  mountedTape.textContent = 'NO TAPE'
  tapeSlot.classList.remove('mounted')
}

function readMountedTape() {
  if (!mountedProject) {
    appendOutput('NO TAPE MOUNTED. USE CATALOG OR LOAD "NAME".')
    return
  }
  appendOutput(`${mountedProject.title.toUpperCase()} / ${mountedProject.status}`)
  appendOutput(mountedProject.story)
  appendOutput(`EVIDENCE: ${mountedProject.proof}`)
  appendOutput('TYPE RUN TO OPEN THE FULL ARCHIVE RECORD.')
}

function openMountedRecord() {
  if (!mountedProject) {
    appendOutput('NO TAPE MOUNTED. USE LOAD "NAME" FIRST.')
    return
  }
  const project = mountedProject
  appendOutput(`OPENING ${project.title.toUpperCase()} RECORD...`)
  window.setTimeout(() => {
    window.location.href = recordUrl(project)
  }, reducedMotion ? 0 : 280)
}

function formatCatalogLines() {
  const ordered = projects.slice().sort((a, b) => Number(b.flagship) - Number(a.flagship) || Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title))
  return [
    `PARALLAX TAPE CATALOG / ${ordered.length} RECORDS`,
    ...ordered.slice(0, 10).map(project => `${projectTapeCode(project).padEnd(8)} ${project.title.toUpperCase().slice(0, 45)}`),
    ordered.length > 10 ? `... ${ordered.length - 10} MORE RECORDS. OPEN CATALOG.` : '',
  ].filter(Boolean).join('\n')
}

function renderCatalog(query = '') {
  catalogList.replaceChildren()
  const needle = query.trim().toLowerCase()
  const visible = projects
    .filter(project => [project.id, project.title, project.mark, project.categoryLabel, project.status, ...(project.aliases || [])].join(' ').toLowerCase().includes(needle))
    .sort((a, b) => Number(b.flagship) - Number(a.flagship) || Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title))

  visible.forEach(project => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'catalog-item'
    button.dataset.projectId = project.id
    button.setAttribute('role', 'option')
    button.setAttribute('aria-selected', String(selectedProject?.id === project.id))
    const mark = createText('span', 'catalog-mark', projectTapeCode(project))
    const copy = document.createElement('span')
    copy.append(createText('strong', '', project.title), createText('small', '', `${project.categoryLabel} · ${project.status}`))
    button.append(mark, copy)
    button.addEventListener('click', () => renderCatalogDetail(project))
    catalogList.appendChild(button)
  })

  if (!visible.length) catalogList.appendChild(createText('p', '', 'NO MATCHING TAPE RECORDS.'))
  catalogStatus.textContent = `${visible.length} of ${projects.length} tape record(s) shown`
}

function renderCatalogDetail(project) {
  selectedProject = project
  catalogDetail.replaceChildren()
  const meta = createText('p', 'catalog-meta', `${projectTapeCode(project)} · ${project.categoryLabel} · ${project.status}${project.flagship ? ' · FLAGSHIP' : ''}`)
  const title = createText('h2', '', project.title)
  const tagline = createText('p', '', project.tagline)
  tagline.style.fontWeight = '800'
  const story = createText('p', '', project.story)
  const facts = document.createElement('div')
  facts.className = 'catalog-facts'
  ;[
    ['WHAT EXISTS', project.proof],
    ['WHAT TO SEE', project.see],
    ['NEXT TRAJECTORY', project.next],
  ].forEach(([label, value]) => {
    const block = document.createElement('div')
    block.append(createText('strong', '', label), createText('span', '', value))
    facts.appendChild(block)
  })

  const actions = document.createElement('div')
  actions.className = 'catalog-actions'
  const mount = document.createElement('button')
  mount.type = 'button'
  mount.className = 'catalog-action'
  mount.textContent = 'MOUNT TAPE'
  mount.addEventListener('click', () => {
    mountTape(project)
    closeCatalog()
  })
  const record = createText('a', 'catalog-action', 'OPEN ARCHIVE RECORD')
  record.href = recordUrl(project)
  const network = createText('a', 'catalog-action secondary', 'STANDARD NETWORK')
  network.href = networkUrl(project)
  actions.append(mount, record, network)
  catalogDetail.append(meta, title, tagline, story, facts, actions)
  catalogStatus.textContent = `${projectTapeCode(project)} · ${project.id}`
  catalogList.querySelectorAll('.catalog-item').forEach(button => {
    button.setAttribute('aria-selected', String(button.dataset.projectId === project.id))
  })
}

async function showCatalog(project = null) {
  if (!powered) return
  const loaded = await archiveReady
  if (!loaded) {
    window.location.href = '../../network/#projects'
    return
  }
  catalogFilter.value = ''
  renderCatalog()
  if (project) renderCatalogDetail(project)
  if (!catalogDialog.open) {
    if (typeof catalogDialog.showModal === 'function') catalogDialog.showModal()
    else catalogDialog.setAttribute('open', '')
  }
  window.setTimeout(() => catalogFilter.focus(), 0)
}

function closeCatalog() {
  if (typeof catalogDialog.close === 'function' && catalogDialog.open) catalogDialog.close()
  else catalogDialog.removeAttribute('open')
}

async function findAndMount(reference) {
  const loaded = await archiveReady
  if (!loaded) {
    appendOutput('ARCHIVE CORE OFFLINE. OPENING STANDARD NETWORK.')
    window.location.href = '../../network/#projects'
    return null
  }

  const normalized = String(reference || '').trim().replace(/^["']|["']$/g, '')
  if (['PARALLAX', 'ARCHIVE', '*'].includes(normalized.toUpperCase())) {
    showCatalog()
    return null
  }

  const project = window.ParallaxArchiveCore.findProject(projects, normalized)
  if (!project) {
    appendOutput(`TAPE NOT FOUND OR REFERENCE AMBIGUOUS: ${normalized}`)
    appendOutput('TYPE CATALOG TO SEARCH ALL RECORDS.')
    return null
  }
  mountTape(project)
  return project
}

async function executeCommand(raw) {
  const command = String(raw || '').trim().replace(/\s+/g, ' ')
  if (!command || !powered) return
  appendOutput(`>${command.toUpperCase()}`)
  const upper = command.toUpperCase()

  const loadMatch = command.match(/^(LOAD|MOUNT)\s+(.+)$/i)
  if (loadMatch) {
    await findAndMount(loadMatch[2])
    return
  }

  const openMatch = command.match(/^OPEN\s+(.+)$/i)
  if (openMatch) {
    const project = await findAndMount(openMatch[1])
    if (project) openMountedRecord()
    return
  }

  switch (upper) {
    case 'HELP':
      appendOutput([
        'COMMANDS:',
        ' CATALOG       SEARCH ALL ARCHIVE TAPES',
        ' LIST          PRINT A SHORT TAPE CATALOG',
        ' LOAD "NAME"  MOUNT A PROJECT TAPE',
        ' READ          INSPECT THE MOUNTED RECORD',
        ' RUN           OPEN THE FULL ARCHIVE RECORD',
        ' EJECT         REMOVE THE CURRENT TAPE',
        ' STATUS        SHOW ARCHIVE STATE',
        ' ENGINEER      OPEN DIAGNOSTICS',
        ' ABOUT         HISTORICAL BOUNDARY',
        ' NETWORK       STANDARD ACCESSIBLE GALLERY',
        ' CLEAR         CLEAR DISPLAY',
        ' EXIT          CHOOSE ANOTHER TERMINAL',
      ].join('\n'))
      break
    case 'CATALOG':
    case 'CAT':
      appendOutput('OPENING PARALLAX TAPE CATALOG...')
      showCatalog()
      break
    case 'LIST':
    case 'LIST TAPES': {
      const loaded = await archiveReady
      appendOutput(loaded ? formatCatalogLines() : 'ARCHIVE CATALOG UNAVAILABLE.')
      break
    }
    case 'READ':
    case 'LIST TAPE':
      readMountedTape()
      break
    case 'RUN':
    case 'RUN TAPE':
      openMountedRecord()
      break
    case 'EJECT':
      ejectTape()
      break
    case 'STATUS':
      appendOutput(`ARCHIVE CORE: ${manifest ? `ONLINE ${manifest.schemaVersion}` : 'OFFLINE'}`)
      appendOutput(`PROJECT RECORDS: ${projects.length || '--'}`)
      appendOutput(`MOUNTED TAPE: ${mountedProject ? projectTapeCode(mountedProject) : 'NONE'}`)
      appendOutput('SHELL MODE: HISTORICALLY INSPIRED SIMULATION')
      break
    case 'ENGINEER':
    case 'DIAG':
      showEngineer()
      break
    case 'ABOUT':
      appendOutput('IBM 5100 ARCHIVE EDITION IS A PARALLAX-BUILT, HISTORICALLY INSPIRED PUBLIC SHELL. ORIGINAL IBM FIRMWARE EMULATION IS A SEPARATE FUTURE AUTHENTICITY LAYER.')
      break
    case 'NETWORK':
      appendOutput('OPENING STANDARD PARALLAX NETWORK...')
      window.location.href = '../../network/'
      break
    case 'CLEAR':
    case 'CLS':
      clearOutput()
      break
    case 'EXIT':
      window.location.href = '../'
      break
    default:
      appendOutput(`COMMAND NOT RECOGNIZED: ${upper}`)
      appendOutput('TYPE HELP FOR AVAILABLE COMMANDS.')
  }
}

function powerOff() {
  powered = false
  powerSwitch.classList.remove('is-on')
  powerSwitch.setAttribute('aria-pressed', 'false')
  machine.classList.add('powered-off')
  bootTimers.forEach(window.clearTimeout)
  closeCatalog()
}

function powerOn() {
  powered = true
  powerSwitch.classList.add('is-on')
  powerSwitch.setAttribute('aria-pressed', 'true')
  machine.classList.remove('powered-off')
  clearOutput()
  runBoot()
}

powerSwitch.addEventListener('click', () => powered ? powerOff() : powerOn())
skipBoot.addEventListener('click', () => showTerminal())
engineerKey.addEventListener('click', showEngineer)
engineerClose.addEventListener('click', () => showTerminal())
catalogKey.addEventListener('click', () => showCatalog(selectedProject))
clearKey.addEventListener('click', () => { clearOutput(); showTerminal() })
terminalForm.addEventListener('submit', async event => {
  event.preventDefault()
  const value = terminalInput.value
  terminalInput.value = ''
  await executeCommand(value)
})

document.querySelectorAll('.tape').forEach(button => {
  button.addEventListener('click', async () => {
    const loaded = await archiveReady
    if (!loaded) {
      window.location.href = '../../network/#projects'
      return
    }
    const project = window.ParallaxArchiveCore.findProject(projects, button.dataset.project)
    mountTape(project)
  })
})

catalogClose.addEventListener('click', closeCatalog)
catalogDialog.addEventListener('click', event => {
  if (event.target === catalogDialog) closeCatalog()
})
catalogFilter.addEventListener('input', () => renderCatalog(catalogFilter.value))
catalogList.addEventListener('keydown', event => {
  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return
  const items = [...catalogList.querySelectorAll('.catalog-item')]
  const index = items.indexOf(document.activeElement)
  const nextIndex = event.key === 'ArrowDown'
    ? Math.min(items.length - 1, index + 1)
    : Math.max(0, index - 1)
  items[nextIndex]?.focus()
  event.preventDefault()
})

document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault()
  showTerminal()
})

runBoot()
