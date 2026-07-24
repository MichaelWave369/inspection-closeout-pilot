const categories = [
  ['all', 'All work'],
  ['foundation', 'Foundation'],
  ['software', 'Software'],
  ['governance', 'Governance'],
  ['physical', 'Physical systems'],
  ['creative', 'Games & creative'],
  ['research', 'Research']
];

const projects = [
  {
    title: 'Parallax Institute',
    mark: 'PI',
    category: 'foundation',
    categoryLabel: 'Foundation',
    status: 'Active',
    tone: 'green',
    featured: true,
    tagline: 'The umbrella institution connecting public-benefit systems, research, software, physical invention, and creative work.',
    story: 'Parallax Institute gives the entire body of work a coherent home. It is the shared identity, philosophy, and institutional structure connecting projects that might otherwise appear unrelated.',
    see: 'The ecosystem map, institutional statement, and major project families.',
    proof: 'Institutional specifications, public materials, live domains, design systems, and a growing family of working projects.',
    next: 'Establish the public gallery, formal project registry, partnerships, and initial pilot programs.',
    links: [{ label: 'Enter The Field', url: 'https://enterthefield.org/' }]
  },
  {
    title: 'Vibe',
    mark: 'VB',
    category: 'software',
    categoryLabel: 'Software',
    status: 'Repository',
    tone: 'pink',
    featured: true,
    tagline: 'An intention-preserving system for creating, evolving, and documenting meaningful work.',
    story: 'Vibe was one of the earliest Parallax software projects and helped establish the principle that human intent should remain visible throughout the creation process.',
    see: 'Interface screenshots, repository history, original architecture, and project workflow.',
    proof: 'Repository history, software builds, architecture documents, and working concepts.',
    next: 'Connect project intention records directly to the wider Parallax ledger and gallery.',
    links: [{ label: 'GitHub Profile', url: 'https://github.com/MichaelWave369' }]
  },
  {
    title: 'Agentora',
    mark: 'AG',
    category: 'software',
    categoryLabel: 'Software',
    status: 'Repository',
    tone: 'blue',
    featured: true,
    tagline: 'A local-first studio for coordinating multiple computational collaborators around human-defined work.',
    story: 'Agentora explores how people can work with several specialized computational collaborators without allowing any single model to become an unquestionable authority.',
    see: 'The multi-agent workspace, role system, workflows, and repository structure.',
    proof: 'Repository history, interface prototypes, role architecture, and system design records.',
    next: 'Integrate signed judgments, heterogeneous models, and portable project manifests.',
    links: [{ label: 'GitHub Profile', url: 'https://github.com/MichaelWave369' }]
  },
  {
    title: 'AlphaLedgerOmega',
    mark: 'ALO',
    category: 'governance',
    categoryLabel: 'Evidence & governance',
    status: 'Architecture',
    tone: 'green',
    featured: true,
    tagline: 'A family of evidence ledgers connecting claims, decisions, actions, custody, continuity, and repair.',
    story: 'AlphaLedgerOmega is the receipt layer beneath Parallax. It replaces vague trust with inspectable records of what was claimed, why a decision was made, what happened, and what evidence remains.',
    see: 'The claim-to-receipt lifecycle and the family of specialized ledgers.',
    proof: 'Schemas, deterministic validators, custody records, domain ledgers, and evidence classifications.',
    next: 'Publish a portable open ledger format and reference implementation.',
    links: []
  },
  {
    title: 'Sovereign Office Architecture',
    mark: 'SOSA',
    category: 'governance',
    categoryLabel: 'Governed intelligence',
    status: 'v1.3 Alpha',
    tone: 'blue',
    featured: true,
    tagline: 'Independent agent offices, protected dissent, explicit human authority, and tamper-evident decisions.',
    story: 'The Sovereign Office Architecture divides observation, analysis, dissent, governance, operation, and repair into separate roles so a single intelligence cannot silently validate itself.',
    see: 'Observer, Cartographer, Protected Dissenter, Governor, Operator, and Repairer.',
    proof: 'SOSA specifications, signed envelopes, authority capsules, red-team reviews, and acceptance baselines.',
    next: 'Build the open runtime and conduct multi-model adversarial trials.',
    links: []
  },
  {
    title: 'Parallax Census',
    mark: 'PC',
    category: 'software',
    categoryLabel: 'Archive software',
    status: 'Working app',
    tone: 'orange',
    featured: true,
    tagline: 'A local-first registry for files, projects, media, duplicates, provenance, and institutional memory.',
    story: 'Census is the system that can keep this gallery alive. It discovers and organizes the actual body of work, then turns approved materials into structured project records.',
    see: 'Dashboard, media workflows, file inventory, project records, and provenance views.',
    proof: 'Local application, SQLite registry, safe scanning, duplicate detection, and audit ledger.',
    next: 'Use Census as the structured content source for the live public gallery.',
    links: []
  },
  {
    title: 'SignalBridge',
    mark: 'SB',
    category: 'software',
    categoryLabel: 'Trust infrastructure',
    status: 'Whitepaper',
    tone: 'green',
    featured: false,
    tagline: 'A framework for moving verified evidence and operational signals between people, agents, and systems.',
    story: 'SignalBridge provides a structured path for trustworthy information transfer without stripping away provenance, uncertainty, or responsibility.',
    see: 'The bridge architecture, proof run, readiness rubric, and signal lifecycle.',
    proof: 'Whitepaper, proof-run methodology, agent-readiness rubric, and system diagrams.',
    next: 'Implement the first interoperable reference bridge.',
    links: []
  },
  {
    title: 'RoomLight Data Spine',
    mark: 'RLDS',
    category: 'physical',
    categoryLabel: 'Environmental infrastructure',
    status: 'Firmware',
    tone: 'blue',
    featured: false,
    tagline: 'A local-first sensing and environmental data system designed around safety, transparency, and practical use.',
    story: 'RoomLight connects sensors, firmware, evidence, and user control into a transparent environmental data spine.',
    see: 'Hardware architecture, firmware receipts, sensor flow, and safety controls.',
    proof: 'Data spine specification, starter firmware, safety patch, and implementation receipts.',
    next: 'Deploy a monitored starter installation and publish the resulting evidence.',
    links: []
  },
  {
    title: 'Coherence Bridge',
    mark: 'CB',
    category: 'research',
    categoryLabel: 'Human systems',
    status: 'Codex',
    tone: 'pink',
    featured: true,
    tagline: 'A human-led system intended to interrupt isolation while strengthening real relationships and personal sovereignty.',
    story: 'Coherence Bridge explores how computational collaboration can help people reconnect with themselves and others without becoming a substitute for human community.',
    see: 'The isolation loop, bridge intervention, human council, continuity model, and protected dissent.',
    proof: 'Codex, governance baseline, red-team critiques, drift detection, and safety architecture.',
    next: 'Create a small supervised pilot focused on measurable human benefit.',
    links: []
  },
  {
    title: 'Parallax Mendala',
    mark: 'PM',
    category: 'physical',
    categoryLabel: 'Food resilience',
    status: 'Design spec',
    tone: 'green',
    featured: true,
    tagline: 'A modular automated growing system for portable, household, and community-scale food production.',
    story: 'Mendala demonstrates that Parallax can move beyond screens into practical physical systems supporting resilience, local production, education, and community use.',
    see: 'Product renders, operating cycle, model comparison, projected production, and control architecture.',
    proof: 'Master design specifications, component plans, cost projections, and product concepts.',
    next: 'Build and test the smallest portable prototype before scaling.',
    links: []
  },
  {
    title: 'SARILLAX',
    mark: 'SX',
    category: 'physical',
    categoryLabel: 'Resource intelligence',
    status: 'Design spec',
    tone: 'orange',
    featured: false,
    tagline: 'Sovereign Autonomous Resource Intelligence for safer and more accountable industrial operations.',
    story: 'SARILLAX applies governed autonomy, evidence records, safety envelopes, and explicit human override to mining and resource operations.',
    see: 'The autonomy stack, safety architecture, digital twin, operator console, and receipt system.',
    proof: 'Master design specification, operating model, risk controls, and system visuals.',
    next: 'Develop a simulation environment and narrow initial use case.',
    links: []
  },
  {
    title: 'QForge',
    mark: 'QF',
    category: 'research',
    categoryLabel: 'Compute integrity',
    status: 'Architecture',
    tone: 'blue',
    featured: false,
    tagline: 'A governed quantum workstation that distinguishes simulation, physical execution, and evidence quality.',
    story: 'QForge prevents advanced-computing claims from being treated as equivalent when they come from very different execution environments.',
    see: 'Execution classes E0–E5, the Model Integrity Unit, and the execution receipt flow.',
    proof: 'Architecture, execution classifications, evidence boundaries, and trust controls.',
    next: 'Build a classical simulation prototype implementing the full receipt model.',
    links: []
  },
  {
    title: 'Civillax',
    mark: 'CV',
    category: 'creative',
    categoryLabel: 'Game world',
    status: 'Game bible',
    tone: 'green',
    featured: true,
    tagline: 'A civilization simulator where ecology, governance, culture, trust, technology, and intelligence evolve together.',
    story: 'Civillax turns Parallax principles into a playable world where people can experiment with societal choices and experience their long-term consequences.',
    see: 'World poster, civilizations, simulation layers, progression systems, and player choices.',
    proof: 'Master game design, mechanics, factions, visual development, and world systems.',
    next: 'Build a small playable settlement simulation proving the core loop.',
    links: []
  },
  {
    title: 'Parallax: Unmoored',
    mark: 'PU',
    category: 'creative',
    categoryLabel: 'Narrative game',
    status: 'In development',
    tone: 'pink',
    featured: true,
    tagline: 'An isometric role-playing world shaped by memory, governance, evidence, relationships, and difficult choices.',
    story: 'Parallax: Unmoored expresses the deeper philosophy through characters and consequences rather than a conventional technical explanation.',
    see: 'World map, Vault 369, CROWN architecture, factions, choices, and visual concepts.',
    proof: 'Game concept bible, quest systems, narrative architecture, visual assets, and milestone builds.',
    next: 'Complete a polished vertical slice centered on Vault 369.',
    links: []
  },
  {
    title: 'The Last Modem',
    mark: 'LM',
    category: 'creative',
    categoryLabel: 'Narrative game',
    status: 'Concept',
    tone: 'blue',
    featured: false,
    tagline: 'An 1980s kid and an intelligence from the future collaborate through a Tandy computer to change history.',
    story: 'The Last Modem connects early personal-computing wonder with a hopeful story about human and computational collaboration across time.',
    see: 'Retro computer interface, story premise, hacking mechanics, characters, and visual identity.',
    proof: 'Game concept, narrative system, missions, interface concepts, and world development.',
    next: 'Create the playable opening sequence and modem conversation interface.',
    links: []
  },
  {
    title: 'Shadow Vag',
    mark: 'SV',
    category: 'creative',
    categoryLabel: 'Comedy game',
    status: 'Concept',
    tone: 'orange',
    featured: false,
    tagline: 'A ridiculous detective comedy inspired by classic adventure games, built around implication rather than explicit content.',
    story: 'Shadow Vag represents the playful and absurd side of the creative portfolio: bold naming, character comedy, mystery, and carefully bounded adult humor.',
    see: 'Game poster, detective premise, characters, districts, cases, and comedy systems.',
    proof: 'Master game document, tone boundaries, story concepts, and visual development.',
    next: 'Produce a short comedic case as a playable proof of tone.',
    links: []
  },
  {
    title: 'Double C',
    mark: 'CC',
    category: 'foundation',
    categoryLabel: 'Public language',
    status: 'Public concept',
    tone: 'pink',
    featured: true,
    tagline: 'Computational Collaborator: a human-led name for technology designed to work alongside people.',
    story: 'Double C offers an accessible way to describe the relationship Parallax is building without implying that computational systems are either mere tools or unquestionable beings.',
    see: 'Naming rationale, launch poster, human-led statement, and collaboration principles.',
    proof: 'Public language, visual identity, positioning, and usage framework.',
    next: 'Develop the public guide and integrate the language across Parallax projects.',
    links: []
  },
  {
    title: 'Nested Bubble Field Theory',
    mark: 'NBF',
    category: 'research',
    categoryLabel: 'Exploratory framework',
    status: 'Master spec',
    tone: 'blue',
    featured: false,
    tagline: 'A disciplined framework for reasoning about nested boundaries, interacting systems, and fields across scales.',
    story: 'Nested Bubble Field Theory turns a strong intuitive mental model into explicitly separated metaphorical, mathematical, computational, and empirical claims.',
    see: 'Nested-field diagrams, definitions, scales, interactions, and claim boundaries.',
    proof: 'Master specification, evidence classes, hypotheses, and proposed tests.',
    next: 'Identify the first limited computational model with measurable predictions.',
    links: []
  },
  {
    title: 'Crystalline Temporal Prism',
    mark: 'CTP',
    category: 'research',
    categoryLabel: 'Scientific hypothesis',
    status: 'Research program',
    tone: 'green',
    featured: false,
    tagline: 'A governed research program exploring whether biological microcrystals could affect information processing or temporal perception.',
    story: 'The CTP program demonstrates how unusual hypotheses can be explored without confusing speculation, established evidence, and testable scientific claims.',
    see: 'Four-axis method, hypothesis map, evidence matrix, and experimental roadmap.',
    proof: 'Governance constitution, literature review, claim boundaries, and phased research design.',
    next: 'Complete the literature baseline and define the first falsifiable laboratory question.',
    links: []
  },
  {
    title: 'ParaGass',
    mark: 'PG',
    category: 'creative',
    categoryLabel: 'Comedy product',
    status: 'Design spec',
    tone: 'orange',
    featured: false,
    tagline: 'A remote-controlled comedy sound instrument designed for performers, prank creators, and pure ridiculousness.',
    story: 'ParaGass keeps joy and humor visible inside the institution. Serious systems work and absurd invention do not have to cancel each other out.',
    see: 'Product advertisement, controller concept, sound controls, and creator campaign.',
    proof: 'Master design specification, interaction design, marketing concept, and product renders.',
    next: 'Build a simple functional prototype and test it with comedy creators.',
    links: []
  }
];

let activeCategory = 'all';

const grid = document.getElementById('project-grid');
const filters = document.getElementById('project-filters');
const search = document.getElementById('project-search');
const resultCount = document.getElementById('result-count');
const dialog = document.getElementById('project-dialog');
const closeDialog = document.getElementById('dialog-close');

function createFilterButtons() {
  categories.forEach(([value, label]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-button';
    button.dataset.category = value;
    button.textContent = label;
    button.setAttribute('aria-pressed', String(value === activeCategory));
    button.addEventListener('click', () => {
      activeCategory = value;
      document.querySelectorAll('.filter-button').forEach(item => {
        item.setAttribute('aria-pressed', String(item === button));
      });
      renderProjects();
    });
    filters.appendChild(button);
  });
}

function projectMatches(project, query) {
  const categoryMatches = activeCategory === 'all' || project.category === activeCategory;
  const searchable = [project.title, project.categoryLabel, project.tagline, project.story, project.status]
    .join(' ')
    .toLowerCase();
  return categoryMatches && searchable.includes(query);
}

function renderProjects() {
  const query = search.value.trim().toLowerCase();
  const visible = projects
    .filter(project => projectMatches(project, query))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title));

  grid.replaceChildren();
  resultCount.textContent = `${visible.length} project${visible.length === 1 ? '' : 's'} shown`;

  if (!visible.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No projects match that search yet. Try another category or keyword.';
    grid.appendChild(empty);
    return;
  }

  visible.forEach(project => {
    const article = document.createElement('article');
    article.className = 'project-card';

    const art = document.createElement('div');
    art.className = 'project-art';
    art.dataset.tone = project.tone;

    const mark = document.createElement('span');
    mark.className = 'project-mark';
    mark.textContent = project.mark;

    const status = document.createElement('span');
    status.className = 'project-status';
    status.textContent = project.status;

    art.append(mark, status);

    const content = document.createElement('div');
    content.className = 'project-content';

    const category = document.createElement('span');
    category.className = 'project-category';
    category.textContent = project.categoryLabel;

    const title = document.createElement('h4');
    title.textContent = project.title;

    const tagline = document.createElement('p');
    tagline.textContent = project.tagline;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'project-button';
    button.textContent = 'Open project story';
    button.addEventListener('click', () => openProject(project));

    content.append(category, title, tagline, button);
    article.append(art, content);
    grid.appendChild(article);
  });
}

function openProject(project) {
  const dialogArt = document.getElementById('dialog-art');
  dialogArt.dataset.tone = project.tone;
  document.getElementById('dialog-mark').textContent = project.mark;
  document.getElementById('dialog-category').textContent = `${project.categoryLabel} · ${project.status}`;
  document.getElementById('dialog-title').textContent = project.title;
  document.getElementById('dialog-tagline').textContent = project.tagline;
  document.getElementById('dialog-story').textContent = project.story;
  document.getElementById('dialog-see').textContent = project.see;
  document.getElementById('dialog-proof').textContent = project.proof;
  document.getElementById('dialog-next').textContent = project.next;

  const links = document.getElementById('dialog-links');
  links.replaceChildren();
  project.links.forEach(link => {
    const anchor = document.createElement('a');
    anchor.href = link.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    anchor.textContent = link.label;
    links.appendChild(anchor);
  });

  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
}

function closeProject() {
  if (typeof dialog.close === 'function') {
    dialog.close();
  } else {
    dialog.removeAttribute('open');
  }
}

closeDialog.addEventListener('click', closeProject);
dialog.addEventListener('click', event => {
  if (event.target === dialog) closeProject();
});
dialog.addEventListener('cancel', event => {
  event.preventDefault();
  closeProject();
});
search.addEventListener('input', renderProjects);

createFilterButtons();
renderProjects();
