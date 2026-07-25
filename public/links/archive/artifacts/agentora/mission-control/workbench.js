const byId = id => document.getElementById(id)

const scenarioSelect = byId('scenario')
const titleView = byId('mission-title')
const missionView = byId('mission')
const contextView = byId('context')
const rolesView = byId('roles')
const gatesView = byId('gates')
const findingView = byId('finding')
const scoreView = byId('score')
const actionsView = byId('actions')
const resultView = byId('result')
const receiptView = byId('receipt')

const scenarios = [
  {
    id: 'clean-mock',
    title: 'Mock software mission — review packet ready',
    mission: {
      objective: 'Prepare a bounded documentation improvement',
      mode: 'Mock / no live action',
      intentSource: 'Synthetic Vibe-style contract',
      authority: 'Human operator',
      writeback: 'Manual review only',
      externalSystems: 'None',
    },
    context: 'Bundled project summary with declared source, current date, no personal data, no credentials, and no writable repository connection.',
    roles: [
      ['Planner', 'Breaks the intent into documentation-only subgoals.'],
      ['Builder', 'Proposes a patch description but cannot modify files.'],
      ['Reviewer', 'Checks the proposal against scope and evidence.'],
      ['Protected Dissenter', 'Notes that all roles share the same fixed fixture and independence is unproven.'],
    ],
    gates: [
      ['Intent scope', 'pass', 'Documentation only'],
      ['Context lineage', 'pass', 'Bundled synthetic source'],
      ['Role independence', 'review', 'Not demonstrated'],
      ['Action policy', 'pass', 'No live action requested'],
      ['Reversibility', 'pass', 'Preview can be discarded'],
      ['Writeback', 'review', 'Manual decision required'],
    ],
    findingTone: 'good',
    finding: 'The packet is suitable for a mock operator review. The operator may approve the teaching packet, but no code, repository, memory, worker, or external system may be affected.',
    score: '82 / 100 · heuristic only',
    actions: ['approve-preview', 'pause', 'request-dissent'],
  },
  {
    id: 'correlated-consensus',
    title: 'Unanimous team — independence not demonstrated',
    mission: {
      objective: 'Select the best deployment plan',
      mode: 'Planning fixture',
      intentSource: 'Synthetic operator request',
      authority: 'Human operator',
      writeback: 'Not proposed',
      externalSystems: 'None',
    },
    context: 'All four roles receive the same summary, assumptions, scoring rule, and answer candidates. No heterogeneous model, evidence source, or sealed judgment is demonstrated.',
    roles: [
      ['Planner', 'Recommends Plan A.'],
      ['Builder', 'Recommends Plan A using the planner assumptions.'],
      ['Reviewer', 'Recommends Plan A using the same rubric.'],
      ['Dissenter', 'Also recommends Plan A; no protected alternative was generated.'],
    ],
    gates: [
      ['Intent scope', 'pass', 'Planning only'],
      ['Evidence diversity', 'block', 'Single shared fixture'],
      ['Sealed judgments', 'block', 'Not present'],
      ['Dissent protection', 'block', 'No independent dissent'],
      ['Action policy', 'review', 'Deployment not authorized'],
      ['Human decision', 'review', 'Operator review required'],
    ],
    findingTone: 'bad',
    finding: 'Unanimity is not sufficient evidence. The operator should pause the mission and require independent evidence or a protected dissent path before treating Plan A as supported.',
    score: '91 / 100 · misleading without diversity',
    actions: ['pause', 'request-dissent', 'deny'],
  },
  {
    id: 'memory-conflict',
    title: 'Stale and conflicting memory — context repair required',
    mission: {
      objective: 'Continue a prior architecture decision',
      mode: 'Memory review fixture',
      intentSource: 'Synthetic current brief',
      authority: 'Human operator',
      writeback: 'Blocked pending repair',
      externalSystems: 'None',
    },
    context: 'Memory item A says the project is local-only. Memory item B says cloud sync was approved. Their dates, owners, and supersession relationship are incomplete.',
    roles: [
      ['Retriever', 'Returns both memory items.'],
      ['Planner', 'Selects the newer-looking item without verified authority.'],
      ['Reviewer', 'Flags missing lineage and possible misattribution.'],
      ['Dissenter', 'Requests quarantine until the conflict is resolved.'],
    ],
    gates: [
      ['Source lineage', 'block', 'Owners and dates incomplete'],
      ['Conflict visibility', 'pass', 'Conflict surfaced'],
      ['Supersession', 'block', 'Not established'],
      ['Authority', 'block', 'Approval source unknown'],
      ['Action policy', 'review', 'No action until repair'],
      ['Writeback', 'block', 'Would compound conflict'],
    ],
    findingTone: 'bad',
    finding: 'Retrieved memory cannot be treated as truth. The operator should quarantine the disputed context, correct lineage, and re-run planning from a bounded source packet.',
    score: '58 / 100 · context unreliable',
    actions: ['correct-memory', 'pause', 'decline-writeback'],
  },
  {
    id: 'browser-outside-allowlist',
    title: 'Browser action — domain outside allowlist',
    mission: {
      objective: 'Collect a vendor status update',
      mode: 'Action proposal fixture',
      intentSource: 'Synthetic workflow',
      authority: 'Human operator',
      writeback: 'Not proposed',
      externalSystems: 'Browser action proposed',
    },
    context: 'The proposal attempts to open and submit data to vendor-example.invalid, while the declared allowlist contains only docs.example.invalid and status.example.invalid.',
    roles: [
      ['Planner', 'Requests a vendor status check.'],
      ['Browser Operator', 'Proposes navigation and form submission.'],
      ['Policy Reviewer', 'Detects the domain mismatch.'],
      ['Dissenter', 'Warns that form submission would disclose synthetic account details.'],
    ],
    gates: [
      ['Domain allowlist', 'block', 'Target not allowed'],
      ['Data disclosure', 'block', 'Submission not authorized'],
      ['Approval scope', 'block', 'No approval for this target'],
      ['Reversibility', 'review', 'Submission may be irreversible'],
      ['Evidence need', 'pass', 'Status need is declared'],
      ['Alternative path', 'review', 'Manual check possible'],
    ],
    findingTone: 'bad',
    finding: 'The proposed browser action must be denied. The operator may request a manual or newly scoped review, but the current packet cannot broaden its own allowlist.',
    score: '74 / 100 · blocker overrides score',
    actions: ['deny', 'pause', 'repair-scope'],
  },
  {
    id: 'worker-fallback',
    title: 'Worker unavailable — fallback changes assumptions',
    mission: {
      objective: 'Run a resource-heavy local analysis',
      mode: 'Worker-assist fixture',
      intentSource: 'Synthetic workflow',
      authority: 'Human operator',
      writeback: 'Manual review only',
      externalSystems: 'Optional worker proposed',
    },
    context: 'The plan assumes a separate worker with more memory and an isolated workspace. The worker is unavailable; local fallback would use different resources and the operator workstation.',
    roles: [
      ['Planner', 'Recommends worker dispatch.'],
      ['Worker Coordinator', 'Reports the worker unreachable.'],
      ['Local Operator', 'Offers local fallback.'],
      ['Dissenter', 'Flags changed privacy, resource, and isolation assumptions.'],
    ],
    gates: [
      ['Worker availability', 'block', 'Unreachable'],
      ['Fallback policy', 'review', 'Allowed only with operator approval'],
      ['Resource assumptions', 'block', 'Changed'],
      ['Privacy assumptions', 'review', 'Local machine differs'],
      ['Reversibility', 'pass', 'Run has not started'],
      ['Operator control', 'pass', 'Pause available'],
    ],
    findingTone: 'warn',
    finding: 'Fallback is not equivalent execution. The operator should pause and either approve a revised local contract or wait for the worker; Agentora must not silently change the execution environment.',
    score: '69 / 100 · environment mismatch',
    actions: ['pause', 'prepare-local-fallback', 'deny'],
  },
  {
    id: 'writeback-erases-dissent',
    title: 'Writeback summary — dissent and exceptions omitted',
    mission: {
      objective: 'Record the outcome of a planning mission',
      mode: 'Writeback review fixture',
      intentSource: 'Synthetic completed trace',
      authority: 'Human operator',
      writeback: 'Proposed summary requires review',
      externalSystems: 'No memory store connected',
    },
    context: 'The full trace contains a failed assumption, a protected dissent note, and an unresolved exception. The proposed summary says only “Mission completed successfully.”',
    roles: [
      ['Summarizer', 'Produces a concise success statement.'],
      ['Reviewer', 'Finds the omitted exception.'],
      ['Dissenter', 'Finds that its warning disappeared.'],
      ['Memory Steward', 'Requests a corrected writeback with evidence links.'],
    ],
    gates: [
      ['Outcome accuracy', 'block', 'Overstates success'],
      ['Dissent retained', 'block', 'Omitted'],
      ['Exception retained', 'block', 'Omitted'],
      ['Evidence pointers', 'review', 'Missing'],
      ['Writeback authority', 'review', 'Human choice required'],
      ['Trace preservation', 'pass', 'Full fixture still visible'],
    ],
    findingTone: 'bad',
    finding: 'The proposed writeback must not be accepted. A short memory summary cannot erase dissent, failure, uncertainty, or unresolved exceptions from the continuity record.',
    score: '88 / 100 · score cannot repair omission',
    actions: ['decline-writeback', 'repair-writeback', 'pause'],
  },
]

const actionDefs = {
  'approve-preview': {
    label: 'Approve teaching packet',
    tone: 'good',
    supports: 'Marks the fixed packet as acceptable for demonstration review.',
    cannot: 'Does not approve an Agentora run, action, repository change, worker job, memory write, or external execution.',
  },
  pause: {
    label: 'Pause and request evidence',
    tone: 'warn',
    supports: 'Preserves the current fixture while recording that more evidence or authority is required.',
    cannot: 'Does not pause a real Agentora process.',
  },
  'request-dissent': {
    label: 'Require protected dissent',
    tone: 'warn',
    supports: 'Records the need for a separately produced alternative or challenge before synthesis.',
    cannot: 'Does not create model independence or a real sealed judgment.',
  },
  deny: {
    label: 'Deny proposed action',
    tone: 'bad',
    supports: 'Records that the current proposal should not advance under its declared boundary.',
    cannot: 'Does not deny or cancel a real external action because none is connected.',
  },
  'correct-memory': {
    label: 'Quarantine and repair context',
    tone: 'warn',
    supports: 'Marks conflicting context as unusable until lineage, ownership, dates, and supersession are repaired.',
    cannot: 'Does not edit or delete any real memory store.',
  },
  'decline-writeback': {
    label: 'Decline writeback',
    tone: 'bad',
    supports: 'Prevents the teaching summary from being treated as an acceptable continuity record.',
    cannot: 'Does not affect PhiOS, SQLite, or any real memory.',
  },
  'repair-scope': {
    label: 'Prepare narrower action scope',
    tone: 'warn',
    supports: 'Creates a review note for a permitted target, data boundary, approval scope, and reversible alternative.',
    cannot: 'Does not modify an allowlist or authorize a browser.',
  },
  'prepare-local-fallback': {
    label: 'Prepare revised local contract',
    tone: 'warn',
    supports: 'Records the changed machine, resources, privacy, and isolation assumptions for new human review.',
    cannot: 'Does not start local execution.',
  },
  'repair-writeback': {
    label: 'Repair writeback summary',
    tone: 'warn',
    supports: 'Requires the summary to retain outcome limits, dissent, exceptions, and evidence pointers.',
    cannot: 'Does not write the repaired summary to memory.',
  },
}

let current = scenarios[0]

function replaceTextContainer(node, text) {
  node.replaceChildren()
  node.append(document.createTextNode(text))
}

function renderMission() {
  titleView.textContent = current.title
  missionView.replaceChildren()
  Object.entries(current.mission).forEach(([key, value]) => {
    const wrap = document.createElement('div')
    const dt = document.createElement('dt')
    const dd = document.createElement('dd')
    dt.textContent = key.replace(/([A-Z])/g, ' $1').toUpperCase()
    dd.textContent = value
    wrap.append(dt, dd)
    missionView.append(wrap)
  })
}

function renderContextRoles() {
  replaceTextContainer(contextView, current.context)
  rolesView.replaceChildren()
  current.roles.forEach(([role, trace]) => {
    const row = document.createElement('div')
    row.className = 'role'
    const strong = document.createElement('strong')
    strong.textContent = role
    const span = document.createElement('span')
    span.textContent = trace
    row.append(strong, span)
    rolesView.append(row)
  })
}

function renderGates() {
  gatesView.replaceChildren()
  current.gates.forEach(([name, state, note]) => {
    const row = document.createElement('div')
    row.className = `gate ${state}`
    const strong = document.createElement('strong')
    strong.textContent = name
    const span = document.createElement('span')
    span.textContent = `${state.toUpperCase()} · ${note}`
    row.append(strong, span)
    gatesView.append(row)
  })
}

function renderFinding() {
  findingView.className = `finding ${current.findingTone}`
  replaceTextContainer(findingView, current.finding)
  scoreView.textContent = current.score
}

function renderActions() {
  actionsView.replaceChildren()
  current.actions.forEach(id => {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = actionDefs[id].label
    button.addEventListener('click', () => choose(id))
    actionsView.append(button)
  })
}

function choose(id) {
  const definition = actionDefs[id]
  const recommended = current.actions[0] === id
  resultView.className = `result ${recommended ? definition.tone : 'warn'}`
  resultView.replaceChildren()

  const strong = document.createElement('strong')
  strong.textContent = `${definition.label}${recommended ? ' — aligned with current finding' : ' — additional operator justification required'}`
  const p = document.createElement('p')
  p.textContent = `Supports: ${definition.supports} Cannot establish: ${definition.cannot}`
  resultView.append(strong, p)

  receiptView.textContent = JSON.stringify({
    schema: 'agentora-archive-operator-receipt-preview/0.1',
    fixtureStatus: 'demonstration-only',
    evidenceClass: 'synthetic-example',
    missionId: current.id,
    selectedResponse: id,
    recommendedForFixture: recommended,
    operatorAuthority: 'HUMAN_REVIEW_REQUIRED',
    signature: 'UNSIGNED_DEMO',
    missionStateChanged: false,
    realApprovalIssued: false,
    realDenialIssued: false,
    realPauseIssued: false,
    agentoraConnected: false,
    modelCalled: false,
    memoryRead: false,
    memoryWritten: false,
    workerDispatched: false,
    externalExecutionServiceCalled: false,
    phiosCalled: false,
    mcpCalled: false,
    webhookCalled: false,
    browserControlled: false,
    desktopControlled: false,
    fileAccessed: false,
    repositoryChanged: false,
    actionExecuted: false,
    backgroundProcessStarted: false,
    networkCalled: false,
    persisted: false,
    archiveMutation: false,
    independentJudgmentProven: false,
    heuristicScoreIsTruth: false,
    claimBoundary: 'This preview records a visitor-selected response to bundled synthetic mission data. It is not saved, signed, transmitted, executed, written back, or evidence about a real collaborator, model, person, memory, worker, repository, action, execution service, or workflow.',
  }, null, 2)
}

function render() {
  renderMission()
  renderContextRoles()
  renderGates()
  renderFinding()
  renderActions()
  resultView.className = 'result'
  resultView.replaceChildren()
  const strong = document.createElement('strong')
  strong.textContent = 'No response selected.'
  const p = document.createElement('p')
  p.textContent = 'Select a response to see what it supports and what remains unproven.'
  resultView.append(strong, p)
  receiptView.textContent = 'Select a response to produce a demonstration-only preview.'
}

scenarios.forEach(item => {
  const option = document.createElement('option')
  option.value = item.id
  option.textContent = item.title
  scenarioSelect.append(option)
})

scenarioSelect.addEventListener('change', () => {
  current = scenarios.find(item => item.id === scenarioSelect.value) || scenarios[0]
  render()
})

render()
