// ===== VENUE DETAIL PAGE =====
let currentVenue = null;
let currentConv = null;
let chatPoll = null;
let selectedStars = 5;

document.addEventListener('DOMContentLoaded', () => {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) { location.href = 'search.html'; return; }
  currentVenue = Store.getVenue(id);
  if (!currentVenue) { location.href = 'search.html'; return; }

  document.title = 'EventSpace – ' + currentVenue.name;
  renderVenue(currentVenue);
  renderReviews(currentVenue.id);
  updateNavAuth();

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('bookDate').min = today;
  ['bookStart', 'bookEnd'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', updateTotal);
  });
});

function updateNavAuth() {
  const user = Store.getCurrentUser();
  const btn = document.getElementById('navLoginBtn');
  if (!btn) return;
  if (user) {
    btn.textContent = user.firstName + ' (' + (user.role === 'annonceur' ? 'Annonceur' : 'Mon espace') + ')';
    btn.href = user.role === 'annonceur' ? 'dashboard-annonceur.html' : 'dashboard-particulier.html';
  }
}

function renderVenue(v) {
  document.getElementById('venueGallery').innerHTML =
    '<img src="' + v.img + '" alt="' + v.name + '" class="venue-gallery-main" loading="eager" width="900" height="420" style="width:100%;height:380px;object-fit:cover;border-radius:12px" />';

  document.getElementById('venueTitle').textContent = v.name;

  const favBtn = document.getElementById('favBtn');
  if (favBtn) favBtn.innerHTML = Store.isFavorite(v.id) ? '❤️ Favori' : '♡ Favoris';

  document.getElementById('venueMeta').innerHTML =
    '<span>📍 ' + v.address + '</span>' +
    '<span>👥 ' + v.capacity + ' personnes max</span>' +
    '<span>⭐ ' + (v.rating || 'Nouveau') + (v.reviewCount ? ' (' + v.reviewCount + ' avis)' : '') + '</span>' +
    '<span class="venue-type-badge">' + v.type + '</span>';

  document.getElementById('venueDesc').innerHTML = '<p>' + v.description + '</p>';

  document.getElementById('venueAmenities').innerHTML =
    '<h3 style="margin-bottom:12px">Équipements inclus</h3>' +
    '<div class="amenities-grid">' +
    v.amenities.map(a => '<div class="amenity-item">✓ ' + a + '</div>').join('') +
    '</div>';

  document.getElementById('bookingPrice').innerHTML = '<strong>' + v.price + ' €</strong>/heure';
}

function updateTotal() {
  const start = document.getElementById('bookStart').value;
  const end = document.getElementById('bookEnd').value;
  const totalEl = document.getElementById('bookingTotal');
  if (!start || !end || !currentVenue) { totalEl.innerHTML = ''; return; }
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let hours = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
  if (hours <= 0) hours += 24;
  const subtotal = Math.round(currentVenue.price * hours);
  const commission = Math.round(subtotal * 0.12);
  const total = subtotal + commission;
  totalEl.innerHTML =
    '<div class="total-breakdown">' +
    '<div class="total-row"><span>' + currentVenue.price + ' € × ' + hours.toFixed(1) + 'h</span><span>' + subtotal + ' €</span></div>' +
    '<div class="total-row"><span>Frais de service (12%)</span><span>' + commission + ' €</span></div>' +
    '<div class="total-row total-final"><strong>Total à payer</strong><strong>' + total + ' €</strong></div>' +
    '</div>';
  totalEl.dataset.total = total;
  totalEl.dataset.hours = hours;
}

function toggleFav() {
  const added = Store.toggleFavorite(currentVenue.id);
  const btn = document.getElementById('favBtn');
  if (btn) btn.innerHTML = added ? '❤️ Favori' : '♡ Favoris';
}

function submitBooking(e) {
  e.preventDefault();
  const user = Store.getCurrentUser();
  if (!user) { location.href = 'login.html'; return; }
  if (user.role === 'annonceur') { alert('Connectez-vous avec un compte particulier pour réserver.'); return; }

  const date = document.getElementById('bookDate').value;
  const start = document.getElementById('bookStart').value;
  const end = document.getElementById('bookEnd').value;
  const guests = parseInt(document.getElementById('bookGuests').value);
  const eventType = document.getElementById('bookType').value;
  const message = document.getElementById('bookMsg').value;
  const totalEl = document.getElementById('bookingTotal');
  const total = parseInt(totalEl.dataset.total) || currentVenue.price;

  if (!date || !start || !end) { alert('Veuillez remplir la date et les horaires.'); return; }
  if (guests > currentVenue.capacity) { alert('Capacité maximale : ' + currentVenue.capacity + ' personnes.'); return; }
  if (end <= start) { alert('L\'heure de fin doit être après l\'heure de début.'); return; }

  // Show payment modal
  document.getElementById('payTotal').textContent = total + ' €';
  document.getElementById('paymentModal').style.display = 'flex';

  document.getElementById('payForm').onsubmit = function(ev) {
    ev.preventDefault();
    const btn = this.querySelector('button[type=submit]');
    btn.textContent = '⏳ Traitement en cours…';
    btn.disabled = true;
    setTimeout(() => {
      Store.addReservation({
        venueId: currentVenue.id, venueName: currentVenue.name,
        userId: user.id, ownerId: currentVenue.ownerId,
        date, start, end, guests, eventType, message, status: 'pending', total
      });
      const conv = Store.getOrCreateConv(user.id, currentVenue.ownerId, currentVenue.id, currentVenue.name);
      Store.addMessage(conv.id, { from: 'system', text: '📅 Demande de réservation : ' + eventType + ' le ' + date + ' de ' + start + ' à ' + end + ' pour ' + guests + ' pers. — ' + total + ' €' });
      setTimeout(() => {
        Store.addMessage(conv.id, { from: 'annonceur', text: 'Bonjour ' + user.firstName + ' ! Merci pour votre demande. Nous l\'examinons et vous répondons dans les 24h. 😊' });
      }, 800);
      document.getElementById('paymentModal').style.display = 'none';
      document.getElementById('bookingSuccess').style.display = 'flex';
    }, 2000);
  };
}

function closePayment() {
  document.getElementById('paymentModal').style.display = 'none';
}

// ===== CHAT =====
function openChat() {
  const user = Store.getCurrentUser();
  if (!user) { location.href = 'login.html'; return; }
  currentConv = Store.getOrCreateConv(user.id, currentVenue.ownerId, currentVenue.id, currentVenue.name);
  document.getElementById('chatVenueName').textContent = currentVenue.name;
  document.getElementById('chatWidget').style.display = 'flex';
  renderMessages();
  if (chatPoll) clearInterval(chatPoll);
  chatPoll = setInterval(renderMessages, 2000);
}

function closeChat() {
  document.getElementById('chatWidget').style.display = 'none';
  if (chatPoll) clearInterval(chatPoll);
}

function renderMessages() {
  if (!currentConv) return;
  const user = Store.getCurrentUser();
  const msgs = Store.getMessages(currentConv.id);
  const container = document.getElementById('chatMessages');
  container.innerHTML = msgs.map(m => {
    if (m.from === 'system') return '<div class="chat-system">' + m.text + '</div>';
    const mine = m.from === 'particulier';
    const t = new Date(m.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return '<div class="chat-msg ' + (mine ? 'mine' : 'theirs') + '"><div class="chat-bubble">' + m.text + '</div><div class="chat-time">' + t + '</div></div>';
  }).join('');
  container.scrollTop = container.scrollHeight;
}

function sendMessage(e) {
  e.preventDefault();
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text || !currentConv) return;
  const user = Store.getCurrentUser();
  Store.addMessage(currentConv.id, { from: 'particulier', fromId: user.id, text });
  input.value = '';
  renderMessages();
  const replies = [
    'Merci pour votre message ! Nous revenons vers vous rapidement.',
    'Parfait, nous avons bien noté votre demande.',
    'Super, on vérifie ça et on vous répond très vite !',
    'Bonjour ! N\'hésitez pas à nous poser toutes vos questions.'
  ];
  setTimeout(() => {
    Store.addMessage(currentConv.id, { from: 'annonceur', text: replies[Math.floor(Math.random() * replies.length)] });
    renderMessages();
  }, 1200);
}

// ===== REVIEWS =====
function renderReviews(venueId) {
  const reviews = Store.getReviews(venueId);
  const container = document.getElementById('venueReviews');
  let html = '';
  if (!reviews.length) {
    html = '<p style="color:#888">Pas encore d\'avis pour ce lieu.</p>';
  } else {
    html = reviews.map(r =>
      '<div class="review-item">' +
      '<div class="review-header">' +
      '<div class="review-avatar">' + r.author[0] + '</div>' +
      '<div><strong>' + r.author + '</strong>' +
      '<div class="review-stars" style="color:#f59e0b">' + '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating) + '</div></div>' +
      '<span class="review-date">' + r.date + '</span>' +
      '</div>' +
      '<p class="review-text">' + r.text + '</p>' +
      '</div>'
    ).join('');
  }
  const user = Store.getCurrentUser();
  const hasResa = user && Store.getReservations().some(r => r.venueId == venueId && r.userId == user.id && r.status === 'confirmed');
  if (hasResa) {
    html += '<div class="review-form-wrap"><h4>Laisser un avis</h4>' +
      '<form onsubmit="submitReview(event)">' +
      '<div class="star-picker" id="starPicker">' +
      [1,2,3,4,5].map(i => '<button type="button" class="star-pick' + (i <= 5 ? ' active' : '') + '" data-val="' + i + '" onclick="setStars(' + i + ')">★</button>').join('') +
      '</div>' +
      '<textarea id="reviewText" rows="3" placeholder="Partagez votre expérience…" required style="width:100%;margin-top:8px;padding:10px;border:1px solid #ddd;border-radius:8px;font-family:inherit;resize:vertical"></textarea>' +
      '<button type="submit" class="btn btn-primary" style="margin-top:10px">Publier l\'avis</button>' +
      '</form></div>';
  }
  container.innerHTML = html;
}

function setStars(n) {
  selectedStars = n;
  document.querySelectorAll('.star-pick').forEach((btn, i) => btn.classList.toggle('active', i < n));
}

function submitReview(e) {
  e.preventDefault();
  const user = Store.getCurrentUser();
  const text = document.getElementById('reviewText').value.trim();
  if (!text) return;
  Store.addReview({ venueId: currentVenue.id, author: user.firstName + ' ' + user.lastName[0] + '.', rating: selectedStars, text });
  renderReviews(currentVenue.id);
}
