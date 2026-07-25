(() => {
  const data = window.ParallaxConstellationData
  const core = window.ParallaxArchiveCore

  const byId = id => document.getElementById(id)
  const journeyGrid = byId('journey-grid')
  const journeyDetail = byId('journey-detail')
  const filtersView = byId('evidence-filters')
  const mapStatus = byId('map-status')
  const edgeLayer = byId('edge-layer')
  const nodeLayer = byId('node-layer')
  const capsule = byId('capsule')
  const proofStagesView = byId('proof-stages')
  const proofIdView = byId('proof-id')
  const proofMissionView = byId('proof-mission')
  const proofSystemView = byId('proof-system')
  const proofTitleView = byId('proof-stage-title')
  const proofSummaryView = byId('proof-stage-summary')
  const proofEvidenceView = byId('proof-evidence')
  const proofLimitView = byId('proof-limit')
  const proofResultView = byId('proof-result')
  const receiptView = byId('receipt-preview')

  let projectsById = new Map()
  let nodesById = new Map()
  let selectedJourney = null
  let selectedEvidence = 'all'
  let selectedNodeId = null
  let selectedProofStage = 0
  let completedThrough = -1

  function el(tag, options = {}) {
    const node = document.createElement(tag)
    if (options.className) node.className = options.className
    if (options.text !== undefined) node.textContent = options.text
    if (options.href) node.href = options.href
    if (options.type) node.type = options.type
    return node
  }

  function projectUrl(id) {
    return `../archive/project/?id=${encodeURIComponent(id)}`
  }

  function evidenceLabel(id) {
    return data.evidenceClasses.find(item => item.id === id)?.label || id
  }

  function renderJourneys() {
    journeyGrid.replaceChildren()
    data.journeys.forEach(journey => {
      const button = el('button', { className: 'journey-card', type: 'button' })
      button.dataset.journeyId = journey.id
      button.append(
        el('span', { className: 'journey-number', text: journey.number }),
        el('h3', { text: journey.title }),
        el('p', { text: journey.subtitle }),
        el('span', { text: `${journey.nodes.length} connected records →` }),
      )
      button.addEventListener('click', () => selectJourney(journey.id))
      journeyGrid.append(button)
    })
  }

  function selectJourney(id) {
    selectedJourney = data.journeys.find(item => item.id === id) || null
    document.querySelectorAll('.journey-card').forEach(button => {
      button.classList.toggle('active', button.dataset.journeyId === id)
    })

    journeyDetail.replaceChildren()
    if (!selectedJourney) return

    const copy = el('div')
    copy.append(
      el('p', { className: 'eyebrow', text: `Guided journey ${selectedJourney.number}` }),
      el('h3', { text: selectedJourney.title }),
      el('p', { text: selectedJourney.story }),
      el('p', { text: `Outcome: ${selectedJourney.outcome}` }),
    )
    const sequence = el('div', { className: 'journey-sequence' })
    selectedJourney.nodes.forEach((nodeId, index) => {
      const project = projectsById.get(nodeId)
      sequence.append(el('a', { href: projectUrl(nodeId), text: `${index + 1}. ${project?.title || nodeId}` }))
    })
    journeyDetail.append(copy, sequence)
    applyMapState()

    const firstVisible = selectedJourney.nodes.find(nodeId => nodePassesFilter(nodesById.get(nodeId)))
    if (firstVisible) selectNode(firstVisible)
  }

  function renderFilters() {
    filtersView.replaceChildren()
    const filters = [{ id: 'all', label: 'All evidence states' }, ...data.evidenceClasses]
    filters.forEach(filter => {
      const button = el('button', { className: 'filter-button', text: filter.label, type: 'button' })
      button.dataset.filterId = filter.id
      button.classList.toggle('active', filter.id === selectedEvidence)
      button.addEventListener('click', () => {
        selectedEvidence = filter.id
        filtersView.querySelectorAll('.filter-button').forEach(item => {
          item.classList.toggle('active', item.dataset.filterId === selectedEvidence)
        })
        applyMapState()
        const currentNode = nodesById.get(selectedNodeId)
        if (!nodePassesFilter(currentNode)) {
          const replacement = data.nodes.find(nodePassesFilter)
          if (replacement) selectNode(replacement.id)
        }
      })
      filtersView.append(button)
    })
  }

  function nodePassesFilter(node) {
    if (!node) return false
    return selectedEvidence === 'all' || node.evidence.includes(selectedEvidence)
  }

  function nodeCenter(node) {
    return { x: node.x + 84, y: node.y + 39 }
  }

  function renderMap() {
    edgeLayer.replaceChildren()
    nodeLayer.replaceChildren()
    nodesById = new Map(data.nodes.map(node => [node.id, node]))

    const ns = 'http://www.w3.org/2000/svg'
    data.relationships.forEach((relationship, index) => {
      const from = nodesById.get(relationship.from)
      const to = nodesById.get(relationship.to)
      if (!from || !to) return
      const start = nodeCenter(from)
      const end = nodeCenter(to)
      const line = document.createElementNS(ns, 'line')
      line.setAttribute('x1', String(start.x))
      line.setAttribute('y1', String(start.y))
      line.setAttribute('x2', String(end.x))
      line.setAttribute('y2', String(end.y))
      line.setAttribute('class', 'edge')
      line.dataset.edgeIndex = String(index)
      line.dataset.from = relationship.from
      line.dataset.to = relationship.to
      edgeLayer.append(line)
    })

    data.nodes.forEach(node => {
      const project = projectsById.get(node.id)
      const button = el('button', { className: 'map-node', type: 'button' })
      button.style.left = `${node.x}px`
      button.style.top = `${node.y}px`
      button.dataset.nodeId = node.id
      button.setAttribute('aria-label', `Inspect ${project?.title || node.id}`)
      button.append(
        el('span', { className: 'node-mark', text: project?.mark || project?.title?.slice(0, 2).toUpperCase() || 'P' }),
        el('strong', { text: project?.title || node.id }),
        el('small', { text: node.maturity }),
      )
      button.addEventListener('click', () => selectNode(node.id))
      nodeLayer.append(button)
    })
    applyMapState()
  }

  function applyMapState() {
    const journeySet = new Set(selectedJourney?.nodes || [])
    let visible = 0

    nodeLayer.querySelectorAll('.map-node').forEach(button => {
      const node = nodesById.get(button.dataset.nodeId)
      const passes = nodePassesFilter(node)
      if (passes) visible += 1
      button.classList.toggle('hidden-by-filter', !passes)
      button.classList.toggle('dim', Boolean(selectedJourney) && !journeySet.has(node.id))
      button.classList.toggle('active', button.dataset.nodeId === selectedNodeId)
    })

    edgeLayer.querySelectorAll('.edge').forEach(line => {
      const from = line.dataset.from
      const to = line.dataset.to
      const fromPasses = nodePassesFilter(nodesById.get(from))
      const toPasses = nodePassesFilter(nodesById.get(to))
      const highlighted = Boolean(selectedJourney) && journeySet.has(from) && journeySet.has(to)
      line.classList.toggle('highlight', highlighted)
      line.classList.toggle('dim', !fromPasses || !toPasses || (Boolean(selectedJourney) && !highlighted))
    })

    const filterName = selectedEvidence === 'all' ? 'all evidence states' : evidenceLabel(selectedEvidence)
    mapStatus.textContent = `${visible} of ${data.nodes.length} canonical systems shown · ${filterName}${selectedJourney ? ` · journey: ${selectedJourney.title}` : ''}`
  }

  function selectNode(id) {
    const node = nodesById.get(id)
    const project = projectsById.get(id)
    if (!node || !project) return
    selectedNodeId = id
    applyMapState()
    renderCapsule(node, project)
  }

  function renderCapsule(node, project) {
    capsule.replaceChildren()
    const mark = el('div', { className: 'capsule-mark', text: project.mark || project.title.slice(0, 2).toUpperCase() })
    const status = el('p', { className: 'capsule-status', text: project.status || 'Canonical Archive record' })
    const title = el('h3', { text: project.title })
    const tagline = el('p', { className: 'capsule-tagline', text: project.tagline || project.summary || '' })
    const dl = el('dl')

    const fields = [
      ['Ownership', node.owner],
      ['Ownership basis', node.ownershipBasis],
      ['Source state', node.sourceState],
      ['Current maturity', node.maturity],
      ['Last reviewed', data.updated],
    ]
    fields.forEach(([label, value]) => {
      const wrap = el('div')
      wrap.append(el('dt', { text: label }), el('dd', { text: value }))
      dl.append(wrap)
    })

    const evidenceWrap = el('div')
    evidenceWrap.append(el('dt', { text: 'Evidence classes' }))
    const evidenceDd = el('dd')
    const tags = el('div', { className: 'evidence-tags' })
    node.evidence.forEach(item => tags.append(el('span', { className: 'evidence-tag', text: evidenceLabel(item) })))
    evidenceDd.append(tags)
    evidenceWrap.append(evidenceDd)
    dl.append(evidenceWrap)

    const related = data.relationships.filter(item => item.from === node.id || item.to === node.id)
    const relationWrap = el('div')
    relationWrap.append(el('dt', { text: 'Declared relationships' }))
    const relationDd = el('dd')
    relationDd.textContent = related.length
      ? related.map(item => {
          const otherId = item.from === node.id ? item.to : item.from
          return `${projectsById.get(otherId)?.title || otherId}: ${item.label}`
        }).join(' · ')
      : 'No curated relationships in this version.'
    relationWrap.append(relationDd)
    dl.append(relationWrap)

    const boundary = el('div', { className: 'capsule-boundary', text: project.claimBoundary || 'Open the canonical record for the current claim boundary.' })
    const actions = el('div', { className: 'capsule-actions' })
    actions.append(el('a', { href: projectUrl(node.id), text: 'Open canonical record →' }))
    const sourceLink = (project.links || []).find(link => /^https:\/\//.test(link.url || ''))
    if (sourceLink) {
      const link = el('a', { href: sourceLink.url, text: `${sourceLink.label || 'Open source'} ↗` })
      link.target = '_blank'
      link.rel = 'noopener'
      actions.append(link)
    }

    capsule.append(mark, status, title, tagline, dl, boundary, actions)
  }

  function renderProofRun() {
    const proof = data.proofRun
    proofIdView.textContent = `${proof.id} · ${proof.evidenceClass}`
    proofMissionView.textContent = proof.mission
    proofStagesView.replaceChildren()

    proof.stages.forEach((stage, index) => {
      const button = el('button', { className: 'proof-stage', type: 'button' })
      button.dataset.stageIndex = String(index)
      const label = el('span')
      label.append(el('strong', { text: stage.system }), el('small', { text: stage.status }))
      button.append(el('span', { className: 'stage-number', text: String(index + 1).padStart(2, '0') }), label)
      button.addEventListener('click', () => selectProofStage(index))
      proofStagesView.append(button)
    })

    document.querySelectorAll('[data-proof-action]').forEach(button => {
      button.addEventListener('click', () => chooseProofAction(button.dataset.proofAction))
    })
    selectProofStage(0)
  }

  function renderProofStage({ reset = true } = {}) {
    const proof = data.proofRun
    const stage = proof.stages[selectedProofStage]
    proofSystemView.textContent = `${String(selectedProofStage + 1).padStart(2, '0')} / ${proof.stages.length} · ${stage.system} · ${stage.status}`
    proofTitleView.textContent = stage.title
    proofSummaryView.textContent = `Mission authority: ${proof.authority}`
    proofEvidenceView.textContent = stage.evidence
    proofLimitView.textContent = stage.limit
    proofStagesView.querySelectorAll('.proof-stage').forEach(button => {
      const itemIndex = Number(button.dataset.stageIndex)
      button.classList.toggle('active', itemIndex === selectedProofStage)
      button.classList.toggle('complete', itemIndex <= completedThrough)
    })
    if (reset) resetProofResult()
  }

  function selectProofStage(index) {
    const proof = data.proofRun
    selectedProofStage = Math.max(0, Math.min(index, proof.stages.length - 1))
    renderProofStage({ reset: true })
  }

  function resetProofResult() {
    proofResultView.replaceChildren()
    proofResultView.append(
      el('strong', { text: 'No response selected.' }),
      el('p', { text: 'Choose a bounded response to generate an unsigned demonstration receipt.' }),
    )
    receiptView.textContent = 'Select a response to produce a demonstration-only receipt preview.'
  }

  const proofActions = {
    advance: {
      label: 'Advance teaching trace',
      result: 'The local teaching cursor advances to the next fixed stage. No system state changes.',
    },
    hold: {
      label: 'Hold at current gate',
      result: 'The fixture records a hold so missing evidence, authority, or repair can remain visible.',
    },
    dissent: {
      label: 'Attach protected dissent',
      result: 'The fixture preserves a dissent note without changing the canonical stage evidence.',
    },
    reject: {
      label: 'Reject publication candidate',
      result: 'The fixture records rejection of the present publication candidate. Nothing is deleted or unpublished.',
    },
  }

  function chooseProofAction(actionId) {
    const definition = proofActions[actionId]
    if (!definition) return
    const proof = data.proofRun
    const actedStageIndex = selectedProofStage
    const actedStage = proof.stages[actedStageIndex]

    if (actionId === 'advance') {
      completedThrough = Math.max(completedThrough, actedStageIndex)
      selectedProofStage = Math.min(actedStageIndex + 1, proof.stages.length - 1)
      renderProofStage({ reset: false })
    }

    proofResultView.replaceChildren()
    proofResultView.append(el('strong', { text: definition.label }), el('p', { text: definition.result }))

    receiptView.textContent = JSON.stringify({
      schema: 'parallax-full-constellation-proof-preview/0.1',
      constellationVersion: data.version,
      fixtureStatus: 'demonstration-only',
      evidenceClass: proof.evidenceClass,
      proofRunId: proof.id,
      mission: proof.mission,
      actedStageId: actedStage.id,
      actedStageSystem: actedStage.system,
      displayedStageId: proof.stages[selectedProofStage].id,
      selectedAction: actionId,
      teachingTraceAdvanced: actionId === 'advance',
      heldAtGate: actionId === 'hold',
      protectedDissentAttached: actionId === 'dissent',
      publicationCandidateRejected: actionId === 'reject',
      relationshipMapProvesIntegration: false,
      ownershipLegallyVerified: false,
      canonicalProjectClaimsChanged: false,
      humanApprovalRequired: true,
      signalBridgeCalled: false,
      vibeCompilerInvoked: false,
      phiosConnected: false,
      memoryRead: false,
      memoryWritten: false,
      agentoraConnected: false,
      modelCalled: false,
      workerDispatched: false,
      sosaJudgmentsGenerated: false,
      realHumanAuthorizationIssued: false,
      aloReceiptWritten: false,
      censusRecordMutated: false,
      archiveMutation: false,
      repositoryAccessed: false,
      branchMerged: false,
      deploymentPerformed: false,
      publicOutcomeVerified: false,
      networkCalled: false,
      persisted: false,
      signature: 'UNSIGNED_DEMO',
      claimBoundary: 'This receipt records a visitor-selected response to a fixed synthetic cross-system trace. It is not generated by the named systems, is not saved or signed, and does not prove ownership, interoperability, execution, correctness, admission, deployment, or public success.',
    }, null, 2)
  }

  async function initialize() {
    if (!data || !core) throw new Error('Constellation data or Archive Core is unavailable.')
    const archive = await core.load()
    projectsById = new Map(archive.projects.map(project => [project.id, project]))
    const missing = data.nodes.map(node => node.id).filter(id => !projectsById.has(id))
    if (missing.length) throw new Error(`Canonical Archive records are missing: ${missing.join(', ')}`)

    renderJourneys()
    renderFilters()
    renderMap()
    renderProofRun()
    selectJourney(data.journeys[0].id)
    selectNode(data.journeys[0].nodes[0])
  }

  initialize().catch(error => {
    mapStatus.textContent = 'Constellation failed to load.'
    journeyGrid.replaceChildren(el('div', { className: 'fatal', text: `The guided layer could not load its canonical Archive records: ${error.message}` }))
  })
})()
