// ===== DASHBOARD PARTICULIER =====
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  if (burger && navLinks) burger.addEventListener('click', () => navLinks.classList.toggle('open'));

  const session = JSON.parse(sessionStorage.getItem('es_user') || localStorage.getItem('es_user') || 'null');
  if (!session || session.role !== 'particulier') { location.href = 'login.html'; return; }

  document.getElementById('navUserName').textContent = session.firstName;
  document.getElementById('dashAvatar').textContent = session.firstName[0] + session.lastName[0];

  // Pre-fill profile
  document.getElementById('profileFirst').value = session.firstName;
  document.getElementById('profileLast').value = session.lastName;
  document.getElementById('profileEmail').value = session.email;
  document.getElementById('profilePhone').value = session.phone || '';

  renderReservations();
  renderFavoris();
  renderMessages();

  // Sidebar nav
  document.querySelectorAll('.dash-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const section = link.dataset.section;
      document.querySelectorAll('.dash-link').forEach(l => l.classList.remove('active'));
      document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
      link.classList.add('active');
      document.getElementById(section).classList.add('active');
    });
  });
});

function renderReservations() {
  const el = document.getElementById('reservationsList');
  if (!DEMO_RESERVATIONS.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><p>Aucune réservation pour le moment.</p></div>';
    return;
  }
  el.innerHTML = DEMO_RESERVATIONS.map(r => {
    const v = VENUES.find(v => v.id === r.venueId);
    return `<div class="reservation-item">
      <div>
        <span class="res-status res-${r.status}">${statusLabel(r.status)}</span>
      </div>
      <div class="res-info">
        <h4>${v ? v.name : 'Lieu'}</h4>
        <p>📅 ${r.date} · ${r.start}–${r.end} · ${r.guests} invités · ${r.eventType}</p>
        <p>💶 Total : <strong>${r.total} €</strong></p>
      </div>
      ${r.status === 'pending' ? '<div class="res-actions"><button class="btn btn-ghost" onclick="cancelRes('+r.id+')">Annuler</button></div>' : ''}
    </div>`;
  }).join('');
}

function renderFavoris() {
  const favs = JSON.parse(localStorage.getItem('es_favs') || '[]');
  const el = document.getElementById('favorisList');
  const venues = VENUES.filter(v => favs.includes(v.id));
  if (!venues.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">❤️</div><p>Aucun lieu en favori.</p></div>';
    return;
  }
  el.innerHTML = venues.map(v =>
    `<div class="venue-card" onclick="location.href='venue.html?id=${v.id}'">
      <img src="${v.img}" alt="${v.name}" loading="lazy" />
      <div class="venue-card-body">
        <div class="venue-card-type">${v.type}</div>
        <h3>${v.name}</h3>
        <div class="venue-card-meta"><span>📍 ${v.city}</span><span>👥 ${v.capacity} pers.</span></div>
        <div class="venue-card-price">${v.price} €/h</div>
      </div>
    </div>`
  ).join('');
}

function renderMessages() {
  const el = document.getElementById('messagesList');
  el.innerHTML = DEMO_MESSAGES.map(m =>
    `<div class="msg-item">
      <div class="msg-meta">${m.from} · ${m.date}</div>
      <p>${m.text}</p>
    </div>`
  ).join('');
}

function statusLabel(s) {
  return { pending: 'En attente', confirmed: 'Confirmée', cancelled: 'Annulée' }[s] || s;
}

function cancelRes(id) {
  if (confirm('Annuler cette réservation ?')) {
    const r = DEMO_RESERVATIONS.find(r => r.id === id);
    if (r) { r.status = 'cancelled'; renderReservations(); }
  }
}

function saveProfile(e) {
  e.preventDefault();
  alert('Profil mis à jour ! (démonstration)');
}

function changePassword(e) {
  e.preventDefault();
  const np = document.getElementById('newPass').value;
  const cp = document.getElementById('confirmPass').value;
  const msg = document.getElementById('passMsg');
  if (np !== cp) { msg.textContent = 'Les mots de passe ne correspondent pas.'; msg.style.color = '#e53e3e'; return; }
  msg.textContent = 'Mot de passe mis à jour ! (démonstration)';
  msg.style.color = '#2f855a';
}

function exportData() {
  const session = JSON.parse(sessionStorage.getItem('es_user') || localStorage.getItem('es_user') || '{}');
  const data = { user: session, reservations: DEMO_RESERVATIONS, messages: DEMO_MESSAGES };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'mes-donnees-eventspace.json'; a.click();
}

function requestDeletion() {
  if (confirm('Demander la suppression définitive de votre compte ? Cette action est irréversible.')) {
    alert('Demande enregistrée. Notre équipe traitera votre demande sous 30 jours conformément au RGPD.');
    logout();
  }
}

function logout() {
  sessionStorage.removeItem('es_user');
  localStorage.removeItem('es_user');
  location.href = 'index.html';
}
