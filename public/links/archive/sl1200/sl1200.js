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

function showDos({ focus = true } = {}) {
  window.clearTimeout(bootTimer)
  bootPanel.hidden = true
  archiveDesktop.hidden = true
  dosPanel.hidden = false
  if (!dosHistory.textContent) {
    appendHistory('PARALLAX ARCHIVE DOS v0.1\nType HELP for available commands.\n')
  }
  if (focus) commandInput.focus()
}

function showDesktop() {
  bootPanel.hidden = true
  dosPanel.hidden = true
  archiveDesktop.hidden = false
  document.getElementById('desktop-title').focus?.()
}

function appendHistory(text) {
  dosHistory.textContent += `${text}\n`
  dosHistory.scrollTop = dosHistory.scrollHeight
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

function executeCommand(raw) {
  const command = normalizeCommand(raw)
  if (!command) return

  appendHistory(`C:\\>${command}`)

  switch (command) {
    case 'HELP':
      appendHistory([
        'AVAILABLE COMMANDS',
        '  ARCHIVE   Open the DeskMate archive desktop',
        '  DIR       List mounted archive directories',
        '  ABOUT     Read the SL1200 Origin note',
        '  NETWORK   Open the full standard Network page',
        '  CLEAR     Clear this terminal',
        '  EXIT      Return to terminal selection',
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

commandForm.addEventListener('submit', (event) => {
  event.preventDefault()
  executeCommand(commandInput.value)
  commandInput.value = ''
})

openOrigin.addEventListener('click', () => originDialog.showModal())
originClose.addEventListener('click', () => originDialog.close())
originDialog.addEventListener('click', (event) => {
  if (event.target === originDialog) originDialog.close()
})

document.querySelector('.skip-link').addEventListener('click', (event) => {
  event.preventDefault()
  showDesktop()
})

runBoot()
