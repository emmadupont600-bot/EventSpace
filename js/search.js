// ===== SEARCH PAGE =====
document.addEventListener('DOMContentLoaded', () => {
  const p = new URLSearchParams(location.search);
  if (p.get('city')) document.getElementById('fCity').value = p.get('city');
  if (p.get('type')) document.getElementById('fType').value = p.get('type');

  const slider = document.getElementById('fBudget');
  const sliderVal = document.getElementById('fBudgetVal');
  slider.addEventListener('input', () => { sliderVal.textContent = slider.value + ' €/h'; });

  document.getElementById('filtersToggle').addEventListener('click', () => {
    document.getElementById('filtersPanel').classList.toggle('open');
  });
  document.getElementById('filtersClose').addEventListener('click', () => {
    document.getElementById('filtersPanel').classList.remove('open');
  });

  updateNavAuth();
  applyFilters();
});

function updateNavAuth() {
  const user = Store.getCurrentUser();
  const loginBtn = document.getElementById('navLoginBtn');
  const regBtn = document.getElementById('navRegisterBtn');
  if (user && loginBtn) {
    loginBtn.textContent = user.firstName;
    loginBtn.href = user.role === 'annonceur' ? 'dashboard-annonceur.html' : 'dashboard-particulier.html';
    if (regBtn) regBtn.style.display = 'none';
  }
}

function applyFilters() {
  const city = document.getElementById('fCity').value.trim().toLowerCase();
  const type = document.getElementById('fType').value.toLowerCase();
  const cap = parseInt(document.getElementById('fCap').value) || 0;
  const budget = parseInt(document.getElementById('fBudget').value) || 9999;
  const rating = parseFloat(document.getElementById('fRating').value) || 0;
  const sort = document.getElementById('sortBy').value;

  let venues = Store.getVenues().filter(v => v.published);
  if (city) venues = venues.filter(v =>
    v.city.toLowerCase().includes(city) || v.address.toLowerCase().includes(city));
  if (type) venues = venues.filter(v =>
    v.type.toLowerCase().includes(type) || v.description.toLowerCase().includes(type));
  if (cap) venues = venues.filter(v => v.capacity >= cap);
  venues = venues.filter(v => v.price <= budget);
  if (rating) venues = venues.filter(v => v.rating >= rating);
  if (sort === 'price_asc') venues.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') venues.sort((a, b) => b.price - a.price);
  else venues.sort((a, b) => b.rating - a.rating);

  renderResults(venues);
}

function resetFilters() {
  document.getElementById('fCity').value = '';
  document.getElementById('fType').value = '';
  document.getElementById('fCap').value = '';
  document.getElementById('fBudget').value = '1000';
  document.getElementById('fBudgetVal').textContent = '1000 €/h';
  document.getElementById('fRating').value = '0';
  applyFilters();
}

function renderResults(venues) {
  const container = document.getElementById('searchResults');
  const count = document.getElementById('resultCount');
  count.textContent = '(' + venues.length + ' lieu' + (venues.length > 1 ? 'x' : '') + ')';
  if (!venues.length) {
    container.innerHTML = '<div class="empty-state"><div style="font-size:3rem;margin-bottom:12px">🔍</div><h3>Aucun lieu trouvé</h3><p>Essayez de modifier vos filtres.</p></div>';
    return;
  }
  container.innerHTML = venues.map(v => `
    <div class="venue-card" onclick="window.location='venue.html?id=${v.id}'" style="cursor:pointer">
      <div style="position:relative">
        <img class="venue-card-img" src="${v.img}" alt="${v.name}" loading="lazy" width="300" height="188"/>
        <button class="venue-fav-btn ${Store.isFavorite(v.id) ? 'active' : ''}" onclick="event.stopPropagation();toggleFavCard(this,${v.id})" aria-label="Favoris" title="Ajouter aux favoris">♥</button>
      </div>
      <div class="venue-card-body">
        <div class="venue-card-type">${v.type}</div>
        <h3>${v.name}</h3>
        <div class="venue-card-meta"><span>📍 ${v.city}</span><span>👥 ${v.capacity} pers.</span></div>
        <div class="venue-card-meta-row">
          <span class="venue-card-price">${v.price} €/h</span>
          <span class="venue-card-rating">⭐ ${v.rating || 'Nouveau'} ${v.reviewCount ? '(' + v.reviewCount + ')' : ''}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function toggleFavCard(btn, venueId) {
  const added = Store.toggleFavorite(venueId);
  btn.classList.toggle('active', added);
}
