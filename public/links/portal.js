// Φ369 /links/: local, dependency-free filtering only. No analytics or remote scripts.
(() => {
  'use strict'
  const search = document.getElementById('project-search')
  const buttons = Array.from(document.querySelectorAll('[data-filter]'))
  const projects = Array.from(document.querySelectorAll('.project[data-category]'))
  const count = document.getElementById('project-count')
  const empty = document.getElementById('project-empty')
  if (!search || !count || !empty || !projects.length) return

  let selected = 'all'
  const update = () => {
    const term = search.value.trim().toLocaleLowerCase()
    let visible = 0
    for (const project of projects) {
      const categoryMatches = selected === 'all' || project.dataset.category === selected
      const textMatches = (project.textContent || '').toLocaleLowerCase().includes(term)
      const show = categoryMatches && textMatches
      project.hidden = !show
      if (show) visible += 1
    }
    count.textContent = visible + ' of ' + projects.length + ' featured projects'
    empty.hidden = visible > 0
    for (const button of buttons) {
      const active = button.dataset.filter === selected
      button.setAttribute('aria-pressed', String(active))
      button.classList.toggle('active', active)
    }
  }
  for (const button of buttons) {
    button.addEventListener('click', () => {
      selected = button.dataset.filter || 'all'
      update()
    })
  }
  search.addEventListener('input', update)
  update()
})()
