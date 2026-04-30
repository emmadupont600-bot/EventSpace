// ===== STORE — moteur localStorage EventSpace =====
const Store = {

  // --- AUTH ---
  getUsers() {
    return JSON.parse(localStorage.getItem('es_users') || 'null') || [...DEMO_USERS];
  },
  saveUsers(u) { localStorage.setItem('es_users', JSON.stringify(u)); },

  getCurrentUser() {
    return JSON.parse(sessionStorage.getItem('es_user') || localStorage.getItem('es_user') || 'null');
  },
  setCurrentUser(u, remember) {
    (remember ? localStorage : sessionStorage).setItem('es_user', JSON.stringify(u));
  },
  logout() {
    sessionStorage.removeItem('es_user');
    localStorage.removeItem('es_user');
  },

  // --- VENUES ---
  getVenues() {
    return JSON.parse(localStorage.getItem('es_venues') || 'null') || [...VENUES];
  },
  saveVenues(v) { localStorage.setItem('es_venues', JSON.stringify(v)); },
  getVenue(id) { return this.getVenues().find(v => v.id == id) || null; },
  addVenue(venue) {
    const venues = this.getVenues();
    venue.id = Date.now();
    venue.published = true;
    venue.rating = 0;
    venue.reviewCount = 0;
    venues.push(venue);
    this.saveVenues(venues);
    return venue;
  },
  updateVenue(id, changes) {
    const venues = this.getVenues();
    const idx = venues.findIndex(v => v.id == id);
    if (idx >= 0) { venues[idx] = { ...venues[idx], ...changes }; this.saveVenues(venues); }
  },
  deleteVenue(id) {
    const venues = this.getVenues().filter(v => v.id != id);
    this.saveVenues(venues);
  },

  // --- RESERVATIONS ---
  getReservations() {
    return JSON.parse(localStorage.getItem('es_reservations') || 'null') || [...DEMO_RESERVATIONS];
  },
  saveReservations(r) { localStorage.setItem('es_reservations', JSON.stringify(r)); },
  addReservation(res) {
    const list = this.getReservations();
    res.id = Date.now();
    res.createdAt = new Date().toISOString();
    list.push(res);
    this.saveReservations(list);
    return res;
  },
  updateReservation(id, changes) {
    const list = this.getReservations();
    const idx = list.findIndex(r => r.id == id);
    if (idx >= 0) { list[idx] = { ...list[idx], ...changes }; this.saveReservations(list); return list[idx]; }
  },

  // --- MESSAGES / CHAT ---
  _getConvsRaw() {
    const saved = localStorage.getItem('es_convs');
    if (saved) return JSON.parse(saved);
    const demo = [
      { id: 1001, userId: 1, ownerId: 2, venueId: 1, venueName: 'Espace Lumière', lastMsg: 'Réservation confirmée !', lastTs: '2026-05-20T10:00:00Z', unread: 1 },
      { id: 1002, userId: 1, ownerId: 2, venueId: 2, venueName: 'Rooftop Panorama', lastMsg: 'Demande en cours d\'examen.', lastTs: '2026-05-22T14:30:00Z', unread: 1 }
    ];
    localStorage.setItem('es_convs', JSON.stringify(demo));
    return demo;
  },
  _getMsgsRaw() {
    const saved = localStorage.getItem('es_msgs');
    if (saved) return JSON.parse(saved);
    const demo = [
      { id: 1, convId: 1001, from: 'annonceur', text: 'Votre réservation du 14 juin a été confirmée ! N\'hésitez pas à nous contacter.', ts: '2026-05-20T10:00:00Z' },
      { id: 2, convId: 1002, from: 'annonceur', text: 'Bonjour, votre demande est en cours d\'examen. Nous revenons vers vous dans 24h.', ts: '2026-05-22T14:30:00Z' }
    ];
    localStorage.setItem('es_msgs', JSON.stringify(demo));
    return demo;
  },

  getConversations(userId) {
    return this._getConvsRaw().filter(c => c.userId == userId || c.ownerId == userId);
  },
  getMessages(convId) {
    return this._getMsgsRaw().filter(m => m.convId == convId);
  },
  addMessage(convId, msg) {
    const msgs = this._getMsgsRaw();
    msg.id = Date.now() + Math.random();
    msg.ts = new Date().toISOString();
    msg.convId = convId;
    msgs.push(msg);
    localStorage.setItem('es_msgs', JSON.stringify(msgs));
    const convs = this._getConvsRaw();
    const ci = convs.findIndex(c => c.id == convId);
    if (ci >= 0) { convs[ci].lastMsg = msg.text.slice(0, 60); convs[ci].lastTs = msg.ts; }
    localStorage.setItem('es_convs', JSON.stringify(convs));
    return msg;
  },
  getOrCreateConv(userId, ownerId, venueId, venueName) {
    const convs = this._getConvsRaw();
    let conv = convs.find(c => c.userId == userId && c.venueId == venueId);
    if (!conv) {
      conv = { id: Date.now(), userId, ownerId, venueId, venueName, lastMsg: '', lastTs: new Date().toISOString(), unread: 0 };
      convs.push(conv);
      localStorage.setItem('es_convs', JSON.stringify(convs));
    }
    return conv;
  },

  // --- REVIEWS ---
  getReviews(venueId) {
    const saved = localStorage.getItem('es_reviews');
    const all = saved ? JSON.parse(saved) : [...DEMO_REVIEWS];
    return venueId !== undefined ? all.filter(r => r.venueId == venueId) : all;
  },
  addReview(review) {
    const all = this.getReviews();
    review.id = Date.now();
    review.date = new Date().toISOString().slice(0, 10);
    all.push(review);
    localStorage.setItem('es_reviews', JSON.stringify(all));
    return review;
  },

  // --- FAVORITES ---
  getFavorites() {
    const u = this.getCurrentUser();
    if (!u) return [];
    return JSON.parse(localStorage.getItem('es_fav_' + u.id) || '[]');
  },
  toggleFavorite(venueId) {
    const u = this.getCurrentUser();
    if (!u) { location.href = 'login.html'; return false; }
    const favs = this.getFavorites();
    const idx = favs.indexOf(Number(venueId));
    if (idx >= 0) favs.splice(idx, 1);
    else favs.push(Number(venueId));
    localStorage.setItem('es_fav_' + u.id, JSON.stringify(favs));
    return idx < 0;
  },
  isFavorite(venueId) {
    return this.getFavorites().includes(Number(venueId));
  }
};
