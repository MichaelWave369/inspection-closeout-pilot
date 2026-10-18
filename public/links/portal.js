// /links/ Card Atlas Gateway. Fully static: no tracking, API keys or remote scripts.
(() => {
  const filters = [...document.querySelectorAll('[data-catalog-filter]')]
  const cards = [...document.querySelectorAll('.catalog-card[data-category]')]
  const search = document.getElementById('catalog-search')
  const count = document.getElementById('catalog-count')
  const empty = document.getElementById('catalog-empty')
  const surprise = document.getElementById('catalog-surprise')
  if (!cards.length || !search || !count || !empty || !surprise) return

  let category = 'all'
  let shown = cards

  function render() {
    const term = search.value.trim().toLocaleLowerCase()
    shown = cards.filter(card => {
      const matchesCategory = category === 'all' || card.dataset.category === category
      const matchesText = (card.textContent || '').toLocaleLowerCase().includes(term)
      const visible = matchesCategory && matchesText
      card.hidden = !visible
      return visible
    })
    count.textContent = shown.length + ' of ' + cards.length + ' curated public projects shown'
    empty.hidden = shown.length > 0
    surprise.disabled = shown.length === 0
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.catalogFilter === category)))
  }

  filters.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.catalogFilter
    render()
  }))
  search.addEventListener('input', render)
  surprise.addEventListener('click', () => {
    if (!shown.length) return
    const chosen = shown[Math.floor(Math.random() * shown.length)]
    // Explicit user gesture only. No background navigation or live-site guessing.
    const anchor = document.createElement('a')
    anchor.href = chosen.href
    anchor.target = '_blank'
    anchor.rel = 'noopener noreferrer'
    anchor.click()
  })
  render()
})()
