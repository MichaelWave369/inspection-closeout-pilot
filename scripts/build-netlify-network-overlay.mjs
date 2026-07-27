import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const publicRoot = path.join(root, 'public', 'links')
const outputRoot = path.join(root, 'dist-network-overlay')
const networkRoot = path.join(outputRoot, 'network')

const requiredSources = [
  path.join(publicRoot, 'archive'),
  path.join(publicRoot, 'network'),
  path.join(publicRoot, 'field'),
  path.join(publicRoot, 'gallery.css'),
  path.join(publicRoot, 'gallery.js'),
]

const textExtensions = new Set(['.html', '.js', '.css', '.json', '.svg', '.md', '.txt', '.xml'])

async function assertSource(sourcePath) {
  try {
    await stat(sourcePath)
  } catch {
    throw new Error(`Required source is missing: ${path.relative(root, sourcePath)}`)
  }
}

async function walk(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(fullPath))
    else files.push(fullPath)
  }
  return files
}

function rewriteSharedPaths(text) {
  return text
    .replaceAll('https://michaelwave369.github.io/inspection-closeout-pilot/links/archive/', 'https://www.enterthefield.org/network/')
    .replaceAll('https://michaelwave369.github.io/inspection-closeout-pilot/links/network/', 'https://www.enterthefield.org/network/catalog/')
    .replaceAll('https://michaelwave369.github.io/inspection-closeout-pilot/links/field/', 'https://www.enterthefield.org/network/constellation/')
    .replaceAll('https://enterthefield.org/', 'https://www.enterthefield.org/')
    .replace(/(?:\.\.\/)+archive\//g, '/network/')
    .replace(/(?:\.\.\/)+network\//g, '/network/catalog/')
    .replace(/(?:\.\.\/)+field\//g, '/network/constellation/')
    .replaceAll('/links/archive/', '/network/')
    .replaceAll('/links/network/', '/network/catalog/')
    .replaceAll('/links/field/', '/network/constellation/')
}

async function patchTextFiles() {
  const files = await walk(networkRoot)
  for (const filePath of files) {
    if (!textExtensions.has(path.extname(filePath).toLowerCase())) continue
    const original = await readFile(filePath, 'utf8')
    let patched = rewriteSharedPaths(original)

    const relative = path.relative(networkRoot, filePath).replaceAll('\\', '/')
    if (relative === 'index.html' || relative === 'catalog/index.html' || relative === 'constellation/index.html') {
      patched = patched.replaceAll('href="../"', 'href="/"')
    }

    if (relative === 'gallery.js') {
      patched = patched
        .replaceAll("'/links/network/'", "'/network/catalog/'")
        .replaceAll('"/links/network/"', '"/network/catalog/"')
    }

    if (relative === 'catalog/index.html') {
      patched = patched
        .replaceAll('https://www.enterthefield.org/network/', 'https://www.enterthefield.org/network/catalog/')
        .replaceAll('<title>The Parallax Network | Michael W. Hughes</title>', '<title>Parallax Network Catalog | Enter The Field</title>')
    }

    if (relative === 'constellation/index.html') {
      patched = patched
        .replaceAll('https://www.enterthefield.org/network/', 'https://www.enterthefield.org/network/constellation/')
    }

    if (patched !== original) await writeFile(filePath, patched)
  }
}

async function fileDigest(filePath) {
  const bytes = await readFile(filePath)
  return crypto.createHash('sha256').update(bytes).digest('hex')
}

async function buildManifest() {
  const files = await walk(outputRoot)
  const records = []
  for (const filePath of files) {
    const fileStat = await stat(filePath)
    records.push({
      path: path.relative(outputRoot, filePath).replaceAll('\\', '/'),
      bytes: fileStat.size,
      sha256: await fileDigest(filePath),
    })
  }
  records.sort((a, b) => a.path.localeCompare(b.path))

  const manifest = {
    schema: 'enter-the-field-network-overlay/1.0',
    generatedAt: new Date().toISOString(),
    targetMount: '/network/',
    canonicalSite: 'https://www.enterthefield.org/',
    entryRoute: 'https://www.enterthefield.org/network/?entry=card',
    source: {
      repository: 'MichaelWave369/inspection-closeout-pilot',
      archiveSource: 'public/links/archive',
      catalogSource: 'public/links/network',
      constellationSource: 'public/links/field',
    },
    routeMap: {
      gateway: '/network/',
      catalog: '/network/catalog/',
      constellation: '/network/constellation/',
      ibm5100: '/network/ibm5100/',
      sl1200: '/network/sl1200/',
      patmk1: '/network/patmk1/',
      breadbox64: '/network/breadbox64/',
      gallery128: '/network/gallery128/',
      fieldluggable: '/network/fieldluggable/',
      projectRecord: '/network/project/?id={project-id}',
    },
    fileCount: records.length,
    files: records,
  }

  await writeFile(path.join(outputRoot, 'NETWORK_OVERLAY_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`)
}

async function validateOverlay() {
  const requiredFiles = [
    'network/index.html',
    'network/archive.css',
    'network/archive.js',
    'network/data/archive-core.js',
    'network/project/index.html',
    'network/catalog/index.html',
    'network/constellation/index.html',
    'network/ibm5100/index.html',
    'network/sl1200/index.html',
    'network/patmk1/index.html',
    'network/breadbox64/index.html',
    'network/gallery128/index.html',
    'network/fieldluggable/index.html',
    'network/gallery.css',
    'network/gallery.js',
  ]

  const errors = []
  for (const relative of requiredFiles) {
    try {
      await stat(path.join(outputRoot, relative))
    } catch {
      errors.push(`Missing required overlay file: ${relative}`)
    }
  }

  for (const filePath of await walk(networkRoot)) {
    if (!textExtensions.has(path.extname(filePath).toLowerCase())) continue
    const text = await readFile(filePath, 'utf8')
    const relative = path.relative(outputRoot, filePath).replaceAll('\\', '/')
    for (const stale of ['/links/archive/', '/links/network/', '/links/field/']) {
      if (text.includes(stale)) errors.push(`${relative} contains stale GitHub Pages route: ${stale}`)
    }
  }

  const gateway = await readFile(path.join(networkRoot, 'index.html'), 'utf8')
  for (const required of ['constellation/', 'catalog/', 'href="/"']) {
    if (!gateway.includes(required)) errors.push(`Gateway is missing integrated navigation marker: ${required}`)
  }

  if (errors.length) {
    console.error('Netlify Network overlay validation failed:')
    errors.forEach(error => console.error(`- ${error}`))
    process.exitCode = 1
    return
  }

  console.log('Netlify Network overlay validation passed.')
}

async function main() {
  for (const source of requiredSources) await assertSource(source)

  await rm(outputRoot, { recursive: true, force: true })
  await mkdir(networkRoot, { recursive: true })

  await cp(path.join(publicRoot, 'archive'), networkRoot, { recursive: true })
  await cp(path.join(publicRoot, 'network'), path.join(networkRoot, 'catalog'), { recursive: true })
  await cp(path.join(publicRoot, 'field'), path.join(networkRoot, 'constellation'), { recursive: true })
  await cp(path.join(publicRoot, 'gallery.css'), path.join(networkRoot, 'gallery.css'))
  await cp(path.join(publicRoot, 'gallery.js'), path.join(networkRoot, 'gallery.js'))

  await patchTextFiles()

  const readme = `# Enter The Field — Parallax Network Overlay\n\nThis folder is a self-contained static overlay intended to be merged into the root of the current Enter The Field production export.\n\n## Mount point\n\nCopy the included \`network/\` directory into the deployed site's public root so the gateway resolves at:\n\n- \`/network/\` — six-computer Archive gateway\n- \`/network/catalog/\` — standard catalog view\n- \`/network/constellation/\` — guided Full Constellation view\n\nThe existing main website remains at \`/\`. The gateway's main-site links return to \`/\`.\n\n## Business-card destination\n\nAfter review deployment succeeds, the business-card button should target:\n\n\`https://www.enterthefield.org/network/?entry=card\`\n\nDo not retarget the card until the Netlify review build has been approved and promoted.\n`
  await writeFile(path.join(outputRoot, 'README-NETWORK-OVERLAY.md'), readme)

  await buildManifest()
  await validateOverlay()
}

await main()
