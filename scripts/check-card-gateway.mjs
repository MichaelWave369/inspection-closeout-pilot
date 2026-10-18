import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// Guard the physical-business-card destination. A printed QR cannot be patched.
const base = resolve('public/links')
const html = readFileSync(resolve(base, 'index.html'), 'utf8')
const css = resolve(base, 'portal.css')
const js = resolve(base, 'portal.js')
const contact = resolve(base, 'michael-hughes.vcf')
for (const path of [css, js, contact]) {
  assert.ok(existsSync(path), 'Required card gateway asset missing: ' + path)
}
for (const required of [
  'href="michael-hughes.vcf"',
  'href="tel:+15308385844"',
  'href="mailto:enterthefieldmichael@gmail.com"',
  'https://michaelwave369.github.io/FieldAtlas/',
  'https://www.enterthefield.org/network/?entry=card',
  'href="./field/"',
  'href="./archive/"',
  'href="portal.css"',
  'src="portal.js"',
  'id="catalog-grid"',
  'id="catalog-count"',
  'id="catalog-search"',
  'data-catalog-filter="all"',
]) {
  assert.ok(html.includes(required), 'Missing printed-card contract: ' + required)
}
assert.ok(!html.includes('10,230'), 'Stale hard-coded contribution total found')
assert.ok(!html.includes('ghchart.rshah.org'), 'Third-party activity image unexpectedly embedded')
const cards = (html.match(/class="catalog-card"/g) || []).length
assert.ok(cards >= 8, 'Featured project catalog is unexpectedly thin')
const baseConfig = readFileSync(resolve('vite.config.js'), 'utf8')
assert.ok(baseConfig.includes("base: '/inspection-closeout-pilot/'"), 'QR deployment prefix changed')
console.log('Card gateway contract passed: QR route, contacts, FieldAtlas, ' + cards + ' featured projects')
