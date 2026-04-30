// ===== NAV BURGER =====
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  // Auth nav state
  const session = getSession();
  const loginBtn = document.getElementById('navLoginBtn');
  const regBtn = document.getElementById('navRegisterBtn');
  if (session && loginBtn) {
    loginBtn.textContent = 'Mon espace';
    loginBtn.href = session.role === 'annonceur' ? 'dashboard-annonceur.html' : 'dashboard-particulier.html';
    if (regBtn) regBtn.style.display = 'none';
  }

  renderFeatured();
});

function getSession() {
  try { return JSON.parse(sessionStorage.getItem('es_user') || localStorage.getItem('es_user')); }
  catch { return null; }
}

function renderFeatured() {
  const el = document.getElementById('featuredVenues');
  if (!el) return;
  const top = VENUES.filter(v => v.published).sort((a, b) => b.rating - a.rating).slice(0, 3);
  el.innerHTML = top.map(venueCard).join('');
}

function venueCard(v) {
  return `<div class="venue-card" onclick="location.href='venue.html?id=${v.id}'">
    <img src="${v.img}" alt="${v.name}" loading="lazy" />
    <div class="venue-card-body">
      <div class="venue-card-type">${v.type}</div>
      <h3>${v.name}</h3>
      <div class="venue-card-meta">
        <span>📍 ${v.city}</span>
        <span>👥 ${v.capacity} pers. max</span>
      </div>
      <div class="venue-card-meta" style="margin-top:.3rem">
        <span class="venue-card-rating">⭐ ${v.rating} (${v.reviewCount} avis)</span>
      </div>
      <div class="venue-card-price">${v.price} €/h</div>
    </div>
  </div>`;
}

function heroSearch() {
  const city = document.getElementById('heroCity').value;
  const type = document.getElementById('heroType').value;
  const params = new URLSearchParams();
  if (city) params.set('city', city);
  if (type) params.set('type', type);
  location.href = 'search.html?' + params.toString();
}
