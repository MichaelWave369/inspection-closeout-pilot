const activation = document.getElementById('activation')
const selector = document.getElementById('terminal-selector')
const skipButton = document.getElementById('skip-activation')
const meter = document.getElementById('activation-meter-fill')
const status = document.getElementById('activation-status')
const dialog = document.getElementById('preview-dialog')
const dialogClose = document.getElementById('preview-close')
const previewState = document.getElementById('preview-state')
const previewTitle = document.getElementById('preview-title')
const previewCopy = document.getElementById('preview-copy')
const previewScreen = document.getElementById('preview-screen')

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const entryFromCard = new URLSearchParams(window.location.search).get('entry') === 'card'

const activationSteps = [
  { delay: 220, width: '24%', copy: 'Verifying archive route…' },
  { delay: 720, width: '51%', copy: 'Loading terminal identities…' },
  { delay: 1280, width: '78%', copy: 'Preserving canonical project state…' },
  { delay: 1880, width: '100%', copy: 'Archive Core online.' },
]

let completed = false
const timers = []

function revealSelector({ focus = false } = {}) {
  if (completed) return
  completed = true
  timers.forEach(window.clearTimeout)
  activation.hidden = true
  selector.hidden = false
  history.replaceState(null, '', `${window.location.pathname}${entryFromCard ? '?entry=card' : ''}#terminal-selector`)
  if (focus) document.getElementById('selector-title').focus?.()
}

function runActivation() {
  if (reducedMotion || !entryFromCard) {
    meter.style.width = '100%'
    status.textContent = 'Archive Core online.'
    revealSelector()
    return
  }

  activationSteps.forEach((step, index) => {
    timers.push(window.setTimeout(() => {
      meter.style.width = step.width
      status.textContent = step.copy
      if (index === activationSteps.length - 1) {
        timers.push(window.setTimeout(() => revealSelector(), 520))
      }
    }, step.delay))
  })
}

skipButton.addEventListener('click', () => revealSelector({ focus: true }))

const previews = {
  ibm: {
    state: 'PREVIEW NODE / HISTORICAL SHELL',
    title: 'IBM 5100 Edition',
    copy: 'The archive discovered: a compact research-terminal experience with catalog commands, tape objects, CRT restraint, and a museum-style engineer mode.',
  },
  pat: {
    state: 'FUTURE NODE / PARALLAX NATIVE',
    title: 'Parallax Archive Terminal Mk.1',
    copy: 'The machine Parallax deliberately builds: panoramic Fieldglass, a Ledger Dial, Office Keys, Graph Cinema, visible dissent, and trajectory-aware project navigation.',
  },
}

document.querySelectorAll('.terminal-preview').forEach((button) => {
  button.addEventListener('click', () => {
    const preview = previews[button.dataset.preview]
    previewState.textContent = preview.state
    previewTitle.textContent = preview.title
    previewCopy.textContent = preview.copy
    previewScreen.className = `preview-screen ${button.dataset.preview}`
    dialog.showModal()
  })
})

dialogClose.addEventListener('click', () => dialog.close())
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close()
})

runActivation()
