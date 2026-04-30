// ===== AUTH =====
let currentTab = 'particulier';

document.addEventListener('DOMContentLoaded', () => {
  // Pre-fill role from URL
  const urlRole = new URLSearchParams(location.search).get('role');
  if (urlRole === 'annonceur') {
    switchTab && switchTab('annonceur');
    switchRegTab && switchRegTab('annonceur');
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

  const user = DEMO_USERS.find(u => u.email === email && u.password === pass && u.role === currentTab);
  if (!user) {
    errEl.textContent = 'Email ou mot de passe incorrect pour ce type de compte.';
    return;
  }
  errEl.textContent = '';
  const store = remember ? localStorage : sessionStorage;
  store.setItem('es_user', JSON.stringify(user));
  location.href = user.role === 'annonceur' ? 'dashboard-annonceur.html' : 'dashboard-particulier.html';
}

function handleRegister(e) {
  e.preventDefault();
  const errEl = document.getElementById('registerError');
  const pass = document.getElementById('regPass').value;
  if (pass.length < 8) { errEl.textContent = 'Le mot de passe doit contenir au moins 8 caractères.'; return; }
  errEl.textContent = '';
  alert('Compte créé avec succès ! (démonstration — aucune donnée persistée) \nVous pouvez vous connecter avec les comptes de démo.');
  location.href = 'login.html';
}

function togglePass(id) {
  const el = document.getElementById(id);
  el.type = el.type === 'password' ? 'text' : 'password';
}

function logout() {
  sessionStorage.removeItem('es_user');
  localStorage.removeItem('es_user');
  location.href = 'index.html';
}
