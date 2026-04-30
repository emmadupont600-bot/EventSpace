// ===== SEARCH PAGE =====
document.addEventListener('DOMContentLoaded', () => {
  // Burger
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  if (burger && navLinks) burger.addEventListener('click', () => navLinks.classList.toggle('open'));

  // Filters toggle (mobile)
  const toggle = document.getElementById('filtersToggle');
  const panel = document.getElementById('filtersPanel');
  const close = document.getElementById('filtersClose');
  if (toggle) toggle.addEventListener('click', () => panel.classList.toggle('open'));
  if (close) close.addEventListener('click', () => panel.classList.remove('open'));

  // Budget slider
  const budgetSlider = document.getElementById('fBudget');
  const budgetVal = document.getElementById('fBudgetVal');
  if (budgetSlider) budgetSlider.addEventListener('input', () => budgetVal.textContent = budgetSlider.value + ' €/h');

  // Pre-fill from URL
  const params = new URLSearchParams(location.search);
  if (params.get('city') && document.getElementById('fCity')) document.getElementById('fCity').value = params.get('city');
  if (params.get('type') && document.getElementById('fType')) document.getElementById('fType').value = params.get('type');

  applyFilters();
});

function applyFilters() {
  const city = (document.getElementById('fCity').value || '').toLowerCase();
  const type = document.getElementById('fType').value;
  const cap = parseInt(document.getElementById('fCap').value) || 0;
  const budget = parseInt(document.getElementById('fBudget').value);
  const rating = parseFloat(document.getElementById('fRating').value);
  const sort = document.getElementById('sortBy').value;

  let results = VENUES.filter(v => v.published);
  if (city) results = results.filter(v => v.city.toLowerCase().includes(city) || v.address.toLowerCase().includes(city));
  if (type) results = results.filter(v => v.type === type);
  if (cap) results = results.filter(v => v.capacity >= cap);
  results = results.filter(v => v.price <= budget);
  if (rating) results = results.filter(v => v.rating >= rating);

  if (sort === 'rating') results.sort((a, b) => b.rating - a.rating);
  else if (sort === 'price_asc') results.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') results.sort((a, b) => b.price - a.price);

  document.getElementById('resultCount').textContent = `(${results.length})`;
  const el = document.getElementById('searchResults');

  if (!results.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><p>Aucun lieu ne correspond à vos critères. Essayez de modifier vos filtres.</p></div>';
    return;
  }

  el.innerHTML = results.map(v =>
    `<div class="venue-card" onclick="location.href='venue.html?id=${v.id}'">
      <img src="${v.img}" alt="${v.name}" loading="lazy" />
      <div class="venue-card-body">
        <div class="venue-card-type">${v.type}</div>
        <h3>${v.name}</h3>
        <div class="venue-card-meta"><span>📍 ${v.city}</span><span>👥 ${v.capacity} pers.</span></div>
        <div class="venue-card-meta" style="margin-top:.3rem"><span>⭐ ${v.rating} (${v.reviewCount} avis)</span></div>
        <div class="venue-card-price">${v.price} €/h</div>
      </div>
    </div>`
  ).join('');
}

function resetFilters() {
  document.getElementById('fCity').value = '';
  document.getElementById('fType').value = '';
  document.getElementById('fCap').value = '';
  document.getElementById('fBudget').value = 1000;
  document.getElementById('fBudgetVal').textContent = '1000 €/h';
  document.getElementById('fRating').value = 0;
  applyFilters();
}
