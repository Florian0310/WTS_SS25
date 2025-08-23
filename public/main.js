let user = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginForm').addEventListener('submit', login);
    document.getElementById('registerForm').addEventListener('submit', register);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    loadSlots();
});

function showRegister() {
    document.getElementById('loginArea').classList.add('hidden');
    document.getElementById('registerArea').classList.remove('hidden');
}

function showLogin() {
    document.getElementById('registerArea').classList.add('hidden');
    document.getElementById('loginArea').classList.remove('hidden');
}


function login(e) {
    e.preventDefault();
    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
    }).then(r => r.json()).then(d => {
        if (d.ok) {

            user = d.user;
            document.getElementById('userName').innerText = user.name || user.kundennr;
            document.getElementById('loginArea').classList.add('hidden');
            document.getElementById('bookingArea').classList.remove('hidden');
            loadSlots();
        } else alert(d.error);
    });
}

function register(e) {
    e.preventDefault();
    fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
    }).then(r => r.json()).then(d => {
        if (d.ok) {
            user = d.user;
            document.getElementById('userName').innerText = user.name || user.kundennr;
            document.getElementById('registerArea').classList.add('hidden');
            document.getElementById('bookingArea').classList.remove('hidden');
            loadSlots();
        } else alert(d.error);
    });
}

function logout() {
    fetch('/api/logout').then(() => {
        document.getElementById('bookingArea').classList.add('hidden');
        showLogin();
        user = null;
    });
}

function loadSlots() {
    fetch('/api/slots').then(r => r.json()).then(slots => {
        const tableBody = document.querySelector('#slotTable tbody');
        tableBody.innerHTML = '';
        slots.forEach(s => {
            const row = document.createElement('tr');
            const zeit = document.createElement('td');
            zeit.textContent = s.zeit;
            const action = document.createElement('td');
            if (!s.belegt) {
                const btn = document.createElement('button');
                btn.textContent = 'Buchen';
                btn.addEventListener('click', () => bookSlot(s.id));
                action.appendChild(btn);
                row.className = 'available';
            } else if (user && s.user_id === user.id) {
                const btn = document.createElement('button');
                btn.textContent = 'Löschen';
                btn.addEventListener('click', () => cancelSlot(s.id));
                action.appendChild(btn);
                row.className = 'mine';
            } else {
                action.textContent = 'Belegt';
                row.className = 'booked';
            }
            row.appendChild(zeit);
            row.appendChild(action);
            tableBody.appendChild(row);

        });
    });
}

function bookSlot(id) {
    const art = prompt('Abholung oder Beratung?');
    if (!art) return;
    // Recaptcha v3 könnte hier ausgelöst werden
    fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: id, art })
    }).then(r => r.json()).then(d => {
        if (d.ok) {
            alert('Bitte Mail bestätigen');
            loadSlots();
        } else alert(d.error);
    });
}

function cancelSlot(id) {
    if (!confirm('Termin wirklich löschen?')) return;
    fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: id })
    }).then(r => r.json()).then(d => {
        if (d.ok) {
            loadSlots();
        } else alert(d.error);
    });
}
