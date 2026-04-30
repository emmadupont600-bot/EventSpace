// ===== DASHBOARD ANNONCEUR =====
let editingVenueId = null;
let currentCalYear, currentCalMonth;

document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  if (burger && navLinks) burger.addEventListener('click', () => navLinks.classList.toggle('open'));

  const session = JSON.parse(sessionStorage.getItem('es_user') || localStorage.getItem('es_user') || 'null');
  if (!session || session.role !== 'annonceur') { location.href = 'login.html'; return; }

  document.getElementById('navUserName').textContent = session.firstName;
  document.getElementById('dashAvatar').textContent = session.firstName[0] + session.lastName[0];

  // Pre-fill profile
  ['First','Last','Email','Phone','Siret','Iban'].forEach(f => {
    const el = document.getElementById('ann'+f);
    if (!el) return;
    const key = f.toLowerCase() === 'first' ? 'firstName' : f.toLowerCase() === 'last' ? 'lastName' : f.toLowerCase();
    if (session[key]) el.value = session[key];
  });

  loadOverview();
  renderAnnVenues();
  renderDemandes();
  renderAvis();
  loadFinances();
  initCalendar();

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

function loadOverview() {
  document.getElementById('kpiViews').textContent = '1 247';
  document.getElementById('kpiBookings').textContent = DEMO_RESERVATIONS.filter(r => r.status === 'confirmed').length;
  const revenue = DEMO_RESERVATIONS.filter(r => r.status === 'confirmed').reduce((a, r) => a + r.total, 0);
  document.getElementById('kpiRevenue').textContent = revenue + ' €';
  document.getElementById('kpiRating').textContent = '4.8 ⭐';
  const demandes = DEMO_RESERVATIONS.filter(r => r.status === 'pending');
  const el = document.getElementById('overviewDemandes');
  el.innerHTML = demandes.length
    ? `<p style="color:var(--mid);font-size:.9rem;margin-top:.5rem">⚠️ ${demandes.length} demande(s) en attente de réponse.</p>`
    : '';
}

function renderAnnVenues() {
  const el = document.getElementById('annVenuesList');
  const myVenues = VENUES.filter(v => v.ownerId === 2);
  if (!myVenues.length) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">🏠</div><p>Aucun lieu publié.</p></div>'; return; }
  el.innerHTML = myVenues.map(v =>
    `<div class="venue-card">
      <img src="${v.img}" alt="${v.name}" loading="lazy" />
      <div class="venue-card-body">
        <div class="venue-card-type">${v.type} · ${v.published ? '✅ Publié' : '⏸️ Non publié'}</div>
        <h3>${v.name}</h3>
        <div class="venue-card-meta"><span>📍 ${v.city}</span><span>👥 ${v.capacity}</span><span>${v.price} €/h</span></div>
        <div style="display:flex;gap:.5rem;margin-top:.8rem">
          <button class="btn btn-outline" style="flex:1;font-size:.82rem" onclick="editVenue(${v.id})">✏️ Modifier</button>
          <button class="btn btn-ghost" style="font-size:.82rem" onclick="togglePublish(${v.id})">${v.published ? 'Dépublier' : 'Publier'}</button>
        </div>
      </div>
    </div>`
  ).join('');
}

function openAddVenue() {
  editingVenueId = null;
  document.getElementById('venueForm').reset();
  document.getElementById('addVenueModal').style.display = 'flex';
}

function closeAddVenue() {
  document.getElementById('addVenueModal').style.display = 'none';
}

function editVenue(id) {
  const v = VENUES.find(v => v.id === id);
  if (!v) return;
  editingVenueId = id;
  document.getElementById('vName').value = v.name;
  document.getElementById('vAddress').value = v.address;
  document.getElementById('vDesc').value = v.description;
  document.getElementById('vPrice').value = v.price;
  document.getElementById('vCap').value = v.capacity;
  document.getElementById('vType').value = v.type;
  document.getElementById('vAmenities').value = v.amenities.join(', ');
  document.getElementById('vImg').value = v.img;
  document.getElementById('vPublished').checked = v.published;
  document.getElementById('addVenueModal').style.display = 'flex';
}

function saveVenue(e) {
  e.preventDefault();
  const newVenue = {
    id: editingVenueId || VENUES.length + 1,
    ownerId: 2,
    name: document.getElementById('vName').value,
    address: document.getElementById('vAddress').value,
    city: document.getElementById('vAddress').value.split(',').pop().trim().replace(/[0-9]/g, '').trim() || 'France',
    description: document.getElementById('vDesc').value,
    price: parseInt(document.getElementById('vPrice').value),
    capacity: parseInt(document.getElementById('vCap').value),
    type: document.getElementById('vType').value,
    amenities: document.getElementById('vAmenities').value.split(',').map(s => s.trim()).filter(Boolean),
    img: document.getElementById('vImg').value || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    published: document.getElementById('vPublished').checked,
    rating: 0, reviewCount: 0
  };
  if (editingVenueId) {
    const idx = VENUES.findIndex(v => v.id === editingVenueId);
    if (idx !== -1) VENUES[idx] = newVenue;
  } else {
    VENUES.push(newVenue);
  }
  closeAddVenue();
  renderAnnVenues();
  alert('Lieu enregistré !');
}

function togglePublish(id) {
  const v = VENUES.find(v => v.id === id);
  if (v) { v.published = !v.published; renderAnnVenues(); }
}

function renderDemandes() {
  const el = document.getElementById('demandesList');
  const pending = DEMO_RESERVATIONS.filter(r => r.status === 'pending');
  if (!pending.length) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">📨</div><p>Aucune demande en attente.</p></div>'; return; }
  el.innerHTML = pending.map(r => {
    const v = VENUES.find(v => v.id === r.venueId);
    return `<div class="reservation-item">
      <div><span class="res-status res-pending">En attente</span></div>
      <div class="res-info">
        <h4>${v ? v.name : 'Lieu'} — ${r.eventType}</h4>
        <p>📅 ${r.date} · ${r.start}–${r.end} · ${r.guests} invités · ${r.total} €</p>
      </div>
      <div class="res-actions">
        <button class="btn btn-primary" style="font-size:.82rem" onclick="acceptDemande(${r.id})">✅ Accepter</button>
        <button class="btn btn-ghost" style="font-size:.82rem" onclick="refusDemande(${r.id})">❌ Refuser</button>
      </div>
    </div>`;
  }).join('');
}

function acceptDemande(id) {
  const r = DEMO_RESERVATIONS.find(r => r.id === id);
  if (r) { r.status = 'confirmed'; renderDemandes(); loadOverview(); loadFinances(); alert('Réservation confirmée !'); }
}

function refusDemande(id) {
  if (confirm('Refuser cette demande ?')) {
    const r = DEMO_RESERVATIONS.find(r => r.id === id);
    if (r) { r.status = 'cancelled'; renderDemandes(); }
  }
}

function renderAvis() {
  const el = document.getElementById('avisList');
  const reviews = DEMO_REVIEWS;
  if (!reviews.length) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">⭐</div><p>Aucun avis.</p></div>'; return; }
  el.innerHTML = reviews.map(r => `
    <div class="review-item">
      <div class="review-header">
        <span class="review-author">${r.author}</span>
        <span>${'⭐'.repeat(r.rating)} — ${r.date}</span>
      </div>
      <p class="review-text">${r.text}</p>
    </div>`).join('');
}

function loadFinances() {
  const confirmed = DEMO_RESERVATIONS.filter(r => r.status === 'confirmed');
  const total = confirmed.reduce((a, r) => a + r.total, 0);
  const pending = DEMO_RESERVATIONS.filter(r => r.status === 'pending').reduce((a, r) => a + r.total, 0);
  document.getElementById('finTotal').textContent = total + ' €';
  document.getElementById('finPending').textContent = pending + ' €';
  document.getElementById('finCommission').textContent = Math.round(total * 0.08) + ' €';
}

function downloadInvoices() { alert('Téléchargement des factures disponible dans la version complète.'); }

function initCalendar() {
  const now = new Date();
  currentCalYear = now.getFullYear();
  currentCalMonth = now.getMonth();
  renderCalendar();
}

function renderCalendar() {
  const title = document.getElementById('calTitle');
  const grid = document.getElementById('calGrid');
  if (!title || !grid) return;
  const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  title.textContent = `${months[currentCalMonth]} ${currentCalYear}`;
  const days = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  const bookedDates = DEMO_RESERVATIONS.filter(r => r.status === 'confirmed').map(r => r.date);
  let html = days.map(d => `<div class="cal-header">${d}</div>`).join('');
  const first = new Date(currentCalYear, currentCalMonth, 1);
  const last = new Date(currentCalYear, currentCalMonth + 1, 0);
  let startDay = first.getDay() === 0 ? 6 : first.getDay() - 1;
  for (let i = 0; i < startDay; i++) html += '<div class="cal-day other-month"></div>';
  for (let d = 1; d <= last.getDate(); d++) {
    const dateStr = `${currentCalYear}-${String(currentCalMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isBooked = bookedDates.includes(dateStr);
    const isToday = dateStr === new Date().toISOString().split('T')[0];
    const cls = isBooked ? 'booked' : 'available';
    html += `<div class="cal-day ${cls}${isToday?' today':''}" title="${dateStr}">${d}</div>`;
  }
  grid.innerHTML = html;
}

function prevMonth() {
  if (currentCalMonth === 0) { currentCalMonth = 11; currentCalYear--; }
  else currentCalMonth--;
  renderCalendar();
}

function nextMonth() {
  if (currentCalMonth === 11) { currentCalMonth = 0; currentCalYear++; }
  else currentCalMonth++;
  renderCalendar();
}

function saveAnnProfile(e) { e.preventDefault(); alert('Profil annonceur mis à jour ! (démonstration)'); }
function exportAnnData() {
  const session = JSON.parse(sessionStorage.getItem('es_user') || localStorage.getItem('es_user') || '{}');
  const blob = new Blob([JSON.stringify({ user: session, venues: VENUES.filter(v => v.ownerId===2), reservations: DEMO_RESERVATIONS }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'donnees-annonceur-eventspace.json'; a.click();
}
function requestAnnDeletion() {
  if (confirm('Demander la suppression de votre compte annonceur ?')) {
    alert('Demande enregistrée. Traitement sous 30 jours (RGPD).');
    logout();
  }
}
function logout() {
  sessionStorage.removeItem('es_user');
  localStorage.removeItem('es_user');
  location.href = 'index.html';
}
