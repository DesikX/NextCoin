// --- 1. АВТОРИЗАЦИЯ И ИНИЦИАЛИЗАЦИЯ ---
const authScreen = document.getElementById('auth-screen');
const mainApp = document.getElementById('main-app');

// Проверяем, вошел ли кто-то ранее
let currentUser = JSON.parse(localStorage.getItem('sessionUser')) || null;

if (currentUser) {
    showApp();
}

function showApp() {
    if (authScreen) authScreen.style.display = 'none';
    if (mainApp) mainApp.style.display = 'flex'; // Используем flex для прилипания футера[cite: 2]
    
    // Заполняем личные данные
    const userDisplay = document.getElementById('username');
    const emailDisplay = document.getElementById('email');
    if (userDisplay) userDisplay.innerText = currentUser.email.split('@')[0];
    if (emailDisplay) emailDisplay.innerText = currentUser.email;

    updateUI();
}

// --- 2. ГЛАВНАЯ ФУНКЦИЯ СИНХРОНИЗАЦИИ ---
function updateUI() {
    if (!currentUser) return;

    console.log("Синхронизация для пользователя:", currentUser.email);

    // Обновляем Кошелек[cite: 1]
    const blnsUsd = document.getElementById('blns-usd');
    const blnsEur = document.getElementById('blns-eur');
    if (blnsUsd) blnsUsd.innerText = currentUser.usd.toFixed(2);
    if (blnsEur) blnsEur.innerText = currentUser.eur.toFixed(2);

    // Обновляем Кабинет[cite: 1]
    const accUsd = document.getElementById('crypto-balance1');
    const accEur = document.getElementById('crypto-balance2');
    if (accUsd) accUsd.innerText = currentUser.usd.toFixed(2);
    if (accEur) accEur.innerText = currentUser.eur.toFixed(2);

    // Сохраняем данные[cite: 3]
    localStorage.setItem('sessionUser', JSON.stringify(currentUser));

    // Обновляем этого пользователя в общем списке всех юзеров
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const index = users.findIndex(u => u.email === currentUser.email);
    if (index !== -1) {
        users[index] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// --- 3. ЛОГИКА ВХОДА И РЕГИСТРАЦИИ[cite: 3] ---

// Переключение окон
document.getElementById('toggle-auth')?.addEventListener('click', () => {
    document.getElementById('login-actions').style.display = 'none';
    document.getElementById('reg-actions').style.display = 'block';
    document.getElementById('auth-title').innerText = 'Регистрация';
});

document.getElementById('toggle-login')?.addEventListener('click', () => {
    document.getElementById('reg-actions').style.display = 'none';
    document.getElementById('login-actions').style.display = 'block';
    document.getElementById('auth-title').innerText = 'Вход';
});

// Регистрация
document.getElementById('btn-register')?.addEventListener('click', () => {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;
    
    if(!email || !pass) return alert("Заполните поля!");

    let users = JSON.parse(localStorage.getItem('users')) || [];
    if(users.find(u => u.email === email)) return alert("Пользователь уже существует!");

    const newUser = { email, pass, usd: 0.00, eur: 0.00 };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert("Аккаунт создан! Войдите.");
    document.getElementById('toggle-login').click();
});

// Вход
document.getElementById('btn-login')?.addEventListener('click', () => {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.pass === pass);

    if (user) {
        currentUser = user;
        localStorage.setItem('sessionUser', JSON.stringify(user));
        showApp();
    } else {
        alert("Ошибка входа!");
    }
});

// Выход
document.getElementById('btn-logout')?.addEventListener('click', () => {
    localStorage.removeItem('sessionUser');
    location.reload();
});

// --- 4. НАВИГАЦИЯ ---
const sections = {
    home: document.getElementById('home'),
    wallet: document.getElementById('wallet'),
    account: document.getElementById('account')
};
const navBtns = {
    home: document.getElementById('s-home'),
    wallet: document.getElementById('s-wallet'),
    account: document.getElementById('s-account')
};

function setActiveSection(activeKey, gradient) {
    Object.keys(sections).forEach(key => {
        if (sections[key]) sections[key].style.display = (key === activeKey) ? 'block' : 'none';
        if (navBtns[key]) navBtns[key].style.borderBottom = (key === activeKey) ? '3px solid #000000' : 'none';
    });
    document.body.style.background = gradient;
}

if (navBtns.home) navBtns.home.addEventListener('click', (e) => { e.preventDefault(); setActiveSection('home', 'linear-gradient(to bottom, #4facfe 0%, #0072fe 100%)'); });
if (navBtns.wallet) navBtns.wallet.addEventListener('click', (e) => { e.preventDefault(); setActiveSection('wallet', 'linear-gradient(to bottom, #4facfe 0%, #00f2a7 100%)'); });
if (navBtns.account) navBtns.account.addEventListener('click', (e) => { e.preventDefault(); setActiveSection('account', 'linear-gradient(to bottom, #ff9a9e 0%, #fecfef 100%)'); });

// --- 5. МОДАЛЬНЫЕ ОКНА И ОПЕРАЦИИ ---
const modals = {
    give: document.getElementById('options-give'),
    take: document.getElementById('options-take')
};
const inputs = {
    giveUsd: document.getElementById('amount-give'),
    giveEur: document.getElementById('amount-give2'),
    takeUsd: document.getElementById('amount-take'),
    takeEur: document.getElementById('amount-take2')
};

function closeModals() {
    if (modals.give) modals.give.style.display = 'none';
    if (modals.take) modals.take.style.display = 'none';
    Object.values(inputs).forEach(i => { if (i) i.value = ''; });
}

document.getElementById('give')?.addEventListener('click', () => modals.give.style.display = 'block');
document.getElementById('take')?.addEventListener('click', () => modals.take.style.display = 'block');

// Подтверждение пополнения
document.getElementById('confirm-give')?.addEventListener('click', () => {
    const vUsd = parseFloat(inputs.giveUsd.value) || 0;
    const vEur = parseFloat(inputs.giveEur.value) || 0;

    if (vUsd <= 0 && vEur <= 0) return alert('Введите сумму');

    currentUser.usd += vUsd;
    currentUser.eur += vEur;
    
    updateUI(); 
    closeModals();
});

// Подтверждение вывода
document.getElementById('confirm-take')?.addEventListener('click', () => {
    const vUsd = parseFloat(inputs.takeUsd.value) || 0;
    const vEur = parseFloat(inputs.takeEur.value) || 0;

    if (vUsd > currentUser.usd || vEur > currentUser.eur) return alert('Недостаточно средств!');
    
    currentUser.usd -= vUsd;
    currentUser.eur -= vEur;
    
    updateUI(); 
    closeModals();
});

document.querySelectorAll('.close').forEach(b => b.addEventListener('click', closeModals));

// --- 6. API И ССЫЛКИ ---
async function getRates() {
    try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/UAH');
        const data = await res.json();
        const usdRate = document.getElementById('usd-rate');
        const eurRate = document.getElementById('eur-rate');
        if (usdRate) usdRate.innerText = (1 / data.rates.USD).toFixed(2);
        if (eurRate) eurRate.innerText = (1 / data.rates.EUR).toFixed(2);
    } catch (e) { console.error("Ошибка API"); }
}

const rateLinks = { 'usdd': 'USD-UAH', 'eurr': 'EUR-UAH', 'btcc': 'BTC-USD' };
Object.entries(rateLinks).forEach(([id, pair]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => window.open(`https://www.google.com/finance/quote/${pair}`, '_blank'));
});

// Запуск
getRates();