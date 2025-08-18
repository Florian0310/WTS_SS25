let user = null;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loginForm')?.addEventListener('submit', login);
  document.getElementById('registerForm')?.addEventListener('submit', register);
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  
});

function showRegister() {
  document.getElementById('loginArea')?.classList.add('hidden');
  document.getElementById('registerArea')?.classList.remove('hidden');
}

function showLogin() {
  document.getElementById('registerArea')?.classList.add('hidden');
  document.getElementById('loginArea')?.classList.remove('hidden');
}

function login(e) {
  e.preventDefault();
  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
  })
  .then(r => r.json())
  .then(d => {
    if (!d.ok) return alert(d.error || 'Login fehlgeschlagen.');
    user = d.user;
    document.getElementById('userName').innerText = user.name || user.kundennr || 'User';
    document.getElementById('loginArea')?.classList.add('hidden');
    document.getElementById('bookingArea')?.classList.remove('hidden'); // UI sichtbar, Logik später
    
  })
  .catch(() => alert('Netzwerkfehler beim Login.'));
}

function register(e) {
  e.preventDefault();
  fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
  })
  .then(r => r.json())
  .then(d => {
    if (!d.ok) return alert(d.error || 'Registrierung fehlgeschlagen.');
    user = d.user;
    document.getElementById('userName').innerText = user.name || user.kundennr;
    document.getElementById('registerArea')?.classList.add('hidden');
    document.getElementById('bookingArea')?.classList.remove('hidden');
    
  })
  .catch(() => alert('Netzwerkfehler bei Registrierung.'));
}

function logout() {
  fetch('/api/logout').finally(() => {
    user = null;
    document.getElementById('bookingArea')?.classList.add('hidden');
    showLogin();
  });
}


function loadSlots() {
  const body = document.querySelector('#slotTable tbody');
  if (body) body.innerHTML = '<tr><td colspan="2">Slots kommen später.</td></tr>';
}

function bookSlot(id) {
  if (!user) return alert('Bitte zuerst einloggen.');
  alert('Buchung kommt später. (Stub)');
}

function cancelSlot(id) {
  alert('Löschen kommt später. (Stub)');
}
