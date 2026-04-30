// ===== VENUE DETAIL PAGE =====
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  if (burger && navLinks) burger.addEventListener('click', () => navLinks.classList.toggle('open'));

  const id = parseInt(new URLSearchParams(location.search).get('id'));
  const venue = VENUES.find(v => v.id === id);
  if (!venue) { document.getElementById('venuePage').innerHTML = '<p style="padding:3rem">Lieu introuvable.</p>'; return; }

  document.title = `EventSpace – ${venue.name}`;
  document.getElementById('venueGallery').innerHTML = `<img src="${venue.img}" alt="${venue.name}" />`;
  document.getElementById('venueTitle').textContent = venue.name;
  document.getElementById('venueMeta').innerHTML = `
    <span>📍 ${venue.address}</span>
    <span>👥 Capacité max : ${venue.capacity} personnes</span>
    <span>⭐ ${venue.rating}/5 (${venue.reviewCount} avis)</span>
    <span>🏷️ ${venue.type}</span>
  `;
  document.getElementById('venueDesc').innerHTML = `<p>${venue.description}</p>`;
  document.getElementById('venueAmenities').innerHTML = venue.amenities.map(a => `<span class="amenity-tag">${a}</span>`).join('');
  document.getElementById('bookingPrice').textContent = `${venue.price} €/h`;

  // Reviews
  const reviews = DEMO_REVIEWS.filter(r => r.venueId === id);
  const revEl = document.getElementById('venueReviews');
  if (reviews.length) {
    revEl.innerHTML = reviews.map(r => `
      <div class="review-item">
        <div class="review-header">
          <span class="review-author">${r.author}</span>
          <span>${'⭐'.repeat(r.rating)} — ${r.date}</span>
        </div>
        <p class="review-text">${r.text}</p>
      </div>`).join('');
  } else {
    revEl.innerHTML = '<p style="color:var(--mid);font-size:.9rem">Aucun avis pour le moment.</p>';
  }

  // Booking price calculation
  const dateEl = document.getElementById('bookDate');
  const startEl = document.getElementById('bookStart');
  const endEl = document.getElementById('bookEnd');
  const totalEl = document.getElementById('bookingTotal');
  function updateTotal() {
    if (!startEl.value || !endEl.value) return;
    const diff = (new Date('1970-01-01T'+endEl.value) - new Date('1970-01-01T'+startEl.value)) / 3600000;
    if (diff <= 0) { totalEl.textContent = 'Vérifiez vos horaires'; return; }
    const commission = Math.round(venue.price * diff * 0.08);
    const total = Math.round(venue.price * diff);
    totalEl.innerHTML = `Durée : ${diff}h · Total : <strong>${total} €</strong> <small style="color:var(--mid)">(+${commission} € frais de service)</small>`;
  }
  startEl.addEventListener('change', updateTotal);
  endEl.addEventListener('change', updateTotal);

  // Min date
  dateEl.min = new Date().toISOString().split('T')[0];

  // Fav
  checkFav(id);
});

function checkFav(id) {
  const favs = JSON.parse(localStorage.getItem('es_favs') || '[]');
  const btn = document.getElementById('favBtn');
  if (favs.includes(id)) { btn.textContent = '♥ Favori'; btn.classList.add('active'); }
}

function toggleFav() {
  const id = parseInt(new URLSearchParams(location.search).get('id'));
  let favs = JSON.parse(localStorage.getItem('es_favs') || '[]');
  const btn = document.getElementById('favBtn');
  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
    btn.textContent = '♡ Favoris'; btn.classList.remove('active');
  } else {
    favs.push(id);
    btn.textContent = '♥ Favori'; btn.classList.add('active');
  }
  localStorage.setItem('es_favs', JSON.stringify(favs));
}

function submitBooking(e) {
  e.preventDefault();
  const session = JSON.parse(sessionStorage.getItem('es_user') || localStorage.getItem('es_user') || 'null');
  if (!session) { alert('Connectez-vous pour réserver un lieu.'); location.href = 'login.html'; return; }
  document.getElementById('bookingSuccess').style.display = 'flex';
}
