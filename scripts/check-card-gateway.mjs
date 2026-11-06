import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// Printed business cards cannot change their QR target; this route is permanent.
const base = resolve('public/links')
const html = readFileSync(resolve(base, 'index.html'), 'utf8')
const cssPath = resolve(base, 'portal.css')
const jsPath = resolve(base, 'portal.js')
const vcfPath = resolve(base, 'michael-hughes.vcf')
for (const path of [cssPath, jsPath, vcfPath]) {
  assert.ok(existsSync(path), 'Required QR gateway asset missing: ' + path)
}
for (const required of [
  'href="michael-hughes.vcf"',
  'href="tel:+15308385844"',
  'href="mailto:enterthefieldmichael@gmail.com"',
  'href="https://phi-field.com/"',
  'https://www.enterthefield.org/',
  'https://github.com/MichaelWave369',
  'https://github.com/MichaelWave369/PhiOS',
  'https://github.com/MichaelWave369/PhiMadaPrime',
  'https://github.com/MichaelWave369/GenEWrist',
  'https://github.com/MichaelWave369/BTM',
  'https://github.com/MichaelWave369/PhiBall369',
  'https://github.com/MichaelWave369/GMED',
  'href="portal.css"',
  'src="portal.js"',
  'id="project-grid"',
  'id="project-count"',
  'id="project-search"',
  'data-filter="all"',
]) {
  assert.ok(html.includes(required), 'QR card contract missing: ' + required)
}
assert.ok(!/gumroad|parallax/i.test(html), 'Retired destinations must not dominate the current QR landing page')
assert.ok(!html.includes('ghchart.rshah.org'), 'Unwanted third-party activity embed')
const projects = (html.match(/class="project"/g) || []).length
assert.ok(projects >= 12, 'QR gallery has too few featured current projects')
const css = readFileSync(cssPath, 'utf8')
const js = readFileSync(jsPath, 'utf8')
const vcf = readFileSync(vcfPath, 'utf8')
assert.ok(css.includes('prefers-reduced-motion'), 'Reduced motion rules must remain')
assert.ok(css.includes('@media (max-width:590px)'), 'Small screen layout must remain')
assert.ok(js.includes("setAttribute('aria-pressed'"), 'Filter accessibility state missing')
assert.ok(vcf.includes('URL:https://phi-field.com/'), 'Contact card needs current main domain')
assert.ok(vcf.includes('URL:https://michaelwave369.github.io/inspection-closeout-pilot/links/'), 'Contact card must retain printed QR URL')
const config = readFileSync(resolve('vite.config.js'), 'utf8')
assert.ok(config.includes("base: '/inspection-closeout-pilot/'"), 'Printed QR route prefix changed')
console.log('Φ369 QR gateway contract passed: printed path, contact links, current portals, ' + projects + ' public projects')
