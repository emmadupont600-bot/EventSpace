/* ==========================================
   EventSpace — Core Application JS
   ========================================== */

const EventSpace = (() => {

  // ---- DEMO USERS (localStorage-based) ----
  const DEMO_USERS = [
    {
      id: 'u1', email: 'particulier@demo.fr', password: 'Demo1234!',
      role: 'particulier', firstName: 'Sophie', lastName: 'Martin',
      phone: '06 12 34 56 78', createdAt: '2025-01-15'
    },
    {
      id: 'u2', email: 'annonceur@demo.fr', password: 'Demo1234!',
      role: 'annonceur', firstName: 'Jean', lastName: 'Leclerc',
      phone: '07 98 76 54 32', createdAt: '2025-02-03',
      venueName: 'Loft Parisien', venueCity: 'Paris'
    }
  ];

  // ---- DEMO VENUES ----
  const DEMO_VENUES = [
    { id: 'v1', ownerId: 'u2', name: 'Loft Parisien', city: 'Paris 11ème', capacity: 80, priceDay: 450, pricehalf: 280, category: 'loft', emoji: '🏠', equipments: ['Wi-Fi', 'Sono', 'Climatisation', 'Cuisine équipée', 'Vide-poches'], available: true, description: 'Magnifique loft industriel de 200m² avec mezzanine, poutres apparentes et baies vitrées. Idéal pour séminaires, shootings ou soirées privées.', rating: 4.9, reviews: 24, minDuration: 4 },
    { id: 'v2', ownerId: 'u2', name: 'Jardin des Chênes', city: 'Lyon 6ème', capacity: 200, priceDay: 890, pricehalf: 550, category: 'jardin', emoji: '🌳', equipments: ['Tente de réception', 'Parking', 'Éclairage extérieur', 'Barbecue', 'Tables & chaises'], available: true, description: 'Domaine de 3000m² avec jardin paysager, kiosque et allées ombragées. Parfait pour mariages et réceptions en plein air.', rating: 4.8, reviews: 18, minDuration: 8 },
    { id: 'v3', ownerId: 'u2', name: 'Studio Lumina', city: 'Bordeaux Centre', capacity: 30, priceDay: 320, pricehalf: 190, category: 'studio', emoji: '📸', equipments: ['Fonds blancs/noir', 'Éclairage professionnel', 'Rail suspendu', 'Lounge', 'Maquillage'], available: true, description: 'Studio photo & vidéo de 120m² équipé professionnellement. Idéal pour shootings mode, produits, portraits.', rating: 5.0, reviews: 11, minDuration: 2 },
    { id: 'v4', ownerId: 'u2', name: 'Salle des Arts', city: 'Paris 8ème', capacity: 120, priceDay: 750, pricehalf: 450, category: 'salle', emoji: '🏛️', equipments: ['Scène', 'Sono', 'Vidéoproj.', 'Loge', 'Bar', 'Climatisation'], available: true, description: 'Ancienne galerie haussmannienne convert en salle de réception standing. Moliéres, ornéments dorés, lumière du jour.', rating: 4.7, reviews: 33, minDuration: 6 },
    { id: 'v5', ownerId: 'u2', name: 'Rooftop Horizon', city: 'Marseille 1er', capacity: 60, priceDay: 580, pricehalf: 350, category: 'rooftop', emoji: '🌆', equipments: ['Vue panoramique', 'Bar', 'Mobilier outdoor', 'Sono', 'Chauffage terrasse'], available: false, description: 'Rooftop de 400m² avec vue à 360° sur la Méditerranée. Idéal pour cocktails, lancements de produits, soirées VIP.', rating: 4.6, reviews: 9, minDuration: 3 }
  ];

  // ---- DEMO BOOKINGS ----
  const DEMO_BOOKINGS = [
    { id: 'b1', venueId: 'v1', userId: 'u1', venueName: 'Loft Parisien', city: 'Paris 11ème', date: '2026-05-15', duration: 8, total: 450, status: 'confirmed', event: 'Anniversaire 30 ans', guests: 45 },
    { id: 'b2', venueId: 'v4', userId: 'u1', venueName: 'Salle des Arts', city: 'Paris 8ème', date: '2026-06-22', duration: 12, total: 750, status: 'pending', event: 'Séminaire entreprise', guests: 90 },
    { id: 'b3', venueId: 'v2', userId: 'u1', venueName: 'Jardin des Chênes', city: 'Lyon 6ème', date: '2026-07-14', duration: 10, total: 890, status: 'pending', event: 'Mariage', guests: 150 }
  ];

  // ---- DEMO MESSAGES ----
  const DEMO_MESSAGES = [
    { id: 'm1', from: 'Loft Parisien', fromId: 'u2', preview: 'Votre réservation du 15 mai est confirmée !', time: 'Il y a 2h', unread: true },
    { id: 'm2', from: 'Studio Lumina', fromId: 'u2', preview: 'N’hésitez pas si vous avez des questions...', time: 'Hier', unread: false },
    { id: 'm3', from: 'Support EventSpace', fromId: 'support', preview: 'Bienvenue sur EventSpace ! Comment pouvons-nous...', time: '20 avr.', unread: false }
  ];

  // ---- STORAGE HELPERS ----
  function _getUsers() {
    const stored = localStorage.getItem('es_users');
    return stored ? JSON.parse(stored) : [...DEMO_USERS];
  }
  function _saveUsers(users) { localStorage.setItem('es_users', JSON.stringify(users)); }
  function _getVenues() {
    const stored = localStorage.getItem('es_venues');
    return stored ? JSON.parse(stored) : [...DEMO_VENUES];
  }
  function _saveVenues(v) { localStorage.setItem('es_venues', JSON.stringify(v)); }
  function _getBookings() {
    const stored = localStorage.getItem('es_bookings');
    return stored ? JSON.parse(stored) : [...DEMO_BOOKINGS];
  }
  function _saveBookings(b) { localStorage.setItem('es_bookings', JSON.stringify(b)); }

  // ---- SESSION ----
  function getSession() {
    const s = sessionStorage.getItem('es_session');
    return s ? JSON.parse(s) : null;
  }
  function setSession(user) {
    const safe = { ...user }; delete safe.password;
    sessionStorage.setItem('es_session', JSON.stringify(safe));
  }
  function clearSession() { sessionStorage.removeItem('es_session'); }
  function requireAuth(expectedRole) {
    const s = getSession();
    if (!s) { window.location.href = 'login.html'; return null; }
    if (expectedRole && s.role !== expectedRole) {
      window.location.href = s.role === 'annonceur' ? 'dashboard-annonceur.html' : 'dashboard-particulier.html';
      return null;
    }
    return s;
  }

  // ---- AUTH ----
  function login(email, password) {
    if (!email || !password) return { success: false, message: 'Veuillez remplir tous les champs.' };
    const users = _getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return { success: false, message: 'Email ou mot de passe incorrect.' };
    setSession(user);
    return { success: true, user };
  }

  function register(data) {
    if (!data.email || !data.password || !data.firstName || !data.lastName)
      return { success: false, message: 'Veuillez remplir tous les champs obligatoires.' };
    const users = _getUsers();
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase()))
      return { success: false, message: 'Un compte existe déjà avec cet email.' };
    const newUser = {
      id: 'u' + Date.now(),
      ...data,
      createdAt: new Date().toISOString().split('T')[0]
    };
    users.push(newUser);
    _saveUsers(users);
    setSession(newUser);
    return { success: true, user: newUser };
  }

  function logout() { clearSession(); window.location.href = 'index.html'; }

  // ---- VENUES ----
  function getVenues(filters) {
    let venues = _getVenues();
    if (filters) {
      if (filters.city) venues = venues.filter(v => v.city.toLowerCase().includes(filters.city.toLowerCase()));
      if (filters.category && filters.category !== 'all') venues = venues.filter(v => v.category === filters.category);
      if (filters.capacity) venues = venues.filter(v => v.capacity >= parseInt(filters.capacity));
      if (filters.maxPrice) venues = venues.filter(v => v.priceDay <= parseInt(filters.maxPrice));
      if (filters.available) venues = venues.filter(v => v.available);
    }
    return venues;
  }
  function getVenuesByOwner(ownerId) { return _getVenues().filter(v => v.ownerId === ownerId); }
  function addVenue(venueData, ownerId) {
    const venues = _getVenues();
    const newVenue = { id: 'v' + Date.now(), ownerId, ...venueData, rating: 0, reviews: 0 };
    venues.push(newVenue);
    _saveVenues(venues);
    return newVenue;
  }
  function updateVenue(id, data) {
    const venues = _getVenues();
    const idx = venues.findIndex(v => v.id === id);
    if (idx !== -1) { venues[idx] = { ...venues[idx], ...data }; _saveVenues(venues); }
  }
  function deleteVenue(id) {
    const venues = _getVenues().filter(v => v.id !== id);
    _saveVenues(venues);
  }

  // ---- BOOKINGS ----
  function getBookings(userId) { return _getBookings().filter(b => b.userId === userId); }
  function getBookingsByVenues(venueIds) { return _getBookings().filter(b => venueIds.includes(b.venueId)); }
  function createBooking(data) {
    const bookings = _getBookings();
    const newB = { id: 'b' + Date.now(), status: 'pending', createdAt: new Date().toISOString(), ...data };
    bookings.push(newB);
    _saveBookings(bookings);
    return newB;
  }
  function updateBookingStatus(id, status) {
    const bookings = _getBookings();
    const idx = bookings.findIndex(b => b.id === id);
    if (idx !== -1) { bookings[idx].status = status; _saveBookings(bookings); }
  }

  // ---- MESSAGES ----
  function getMessages() { return DEMO_MESSAGES; }

  // ---- UTILS ----
  function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' }); }
  function formatPrice(n) { return n.toLocaleString('fr-FR') + ' €'; }
  function getStatusLabel(s) {
    const map = { pending: 'En attente', confirmed: 'Confirmée', cancelled: 'Annulée', completed: 'Terminée' };
    return map[s] || s;
  }

  // ---- NAVBAR INIT ----
  function initNavbar() {
    const nb = document.getElementById('navbar');
    if (nb) {
      window.addEventListener('scroll', () => nb.classList.toggle('scrolled', window.scrollY > 20));
    }
    const ham = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (ham && navLinks) {
      ham.addEventListener('click', () => navLinks.classList.toggle('open'));
    }
    // Tab switcher (how it works)
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        const tab = document.getElementById('tab-' + this.dataset.tab);
        if (tab) tab.classList.add('active');
      });
    });
  }

  // ---- DASHBOARD SIDEBAR MOBILE ----
  function initSidebar() {
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('sidebarClose');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('open'); });
      if (overlay) overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('open'); });
      if (closeBtn) closeBtn.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('open'); });
    }
  }

  // ---- MODAL HELPERS ----
  function openModal(id) { document.getElementById(id)?.classList.add('open'); }
  function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initSidebar();
    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(m => {
      m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
    });
  });

  return {
    login, register, logout, getSession, requireAuth,
    getVenues, getVenuesByOwner, addVenue, updateVenue, deleteVenue,
    getBookings, getBookingsByVenues, createBooking, updateBookingStatus,
    getMessages,
    formatDate, formatPrice, getStatusLabel,
    openModal, closeModal
  };

})();
