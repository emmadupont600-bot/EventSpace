// ===== AUTH =====
let currentTab = 'particulier';

document.addEventListener('DOMContentLoaded', () => {
  const urlRole = new URLSearchParams(location.search).get('role');
  if (urlRole === 'annonceur') {
    if (typeof switchTab === 'function') switchTab('annonceur');
    if (typeof switchRegTab === 'function') switchRegTab('annonceur');
  }
});

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  const hint = document.getElementById('demoHint');
  if (!hint) return;
  if (tab === 'particulier') {
    hint.innerHTML = '👤 Particulier — Email : <code>user@demo.fr</code> | Mot de passe : <code>demo1234</code>';
  } else {
    hint.innerHTML = '🏢 Annonceur — Email : <code>annonceur@demo.fr</code> | Mot de passe : <code>demo5678</code>';
  }
}

function switchRegTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  const annFields = document.getElementById('annonceurFields');
  if (annFields) annFields.style.display = tab === 'annonceur' ? 'block' : 'none';
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pass = document.getElementById('loginPass').value;
  const remember = document.getElementById('rememberMe').checked;
  const errEl = document.getElementById('loginError');
  const users = Store.getUsers();
  const user = users.find(u => u.email === email && u.password === pass && u.role === currentTab);
  if (!user) {
    errEl.textContent = 'Email ou mot de passe incorrect pour ce type de compte.';
    return;
  }
  errEl.textContent = '';
  Store.setCurrentUser(user, remember);
  location.href = user.role === 'annonceur' ? 'dashboard-annonceur.html' : 'dashboard-particulier.html';
}

function handleRegister(e) {
  e.preventDefault();
  const errEl = document.getElementById('registerError');
  const firstName = document.getElementById('regFirstName').value.trim();
  const lastName = document.getElementById('regLastName').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const pass = document.getElementById('regPass').value;
  const role = currentTab;
  if (pass.length < 8) { errEl.textContent = 'Mot de passe trop court (8 caractères min).'; return; }
  const users = Store.getUsers();
  if (users.find(u => u.email === email)) { errEl.textContent = 'Cet email est déjà utilisé.'; return; }
  const newUser = { id: Date.now(), role, email, password: pass, firstName, lastName, phone: '' };
  if (role === 'annonceur') {
    const vnEl = document.getElementById('regVenueName');
    const siEl = document.getElementById('regSiret');
    newUser.venueName = vnEl ? vnEl.value.trim() : '';
    newUser.siret = siEl ? siEl.value.trim() : '';
  }
  users.push(newUser);
  Store.saveUsers(users);
  Store.setCurrentUser(newUser, false);
  errEl.textContent = '';
  location.href = role === 'annonceur' ? 'dashboard-annonceur.html' : 'dashboard-particulier.html';
}

function togglePass(id) {
  const el = document.getElementById(id);
  el.type = el.type === 'password' ? 'text' : 'password';
}

function logout() {
  Store.logout();
  location.href = 'index.html';
}
