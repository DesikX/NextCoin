// --- 1. SERVICE WORKER (Обновление кэша) ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(reg => {
            reg.onupdatefound = () => {
                const installingWorker = reg.installing;
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        if (confirm("Доступно обновление! Перезагрузить для применения изменений?")) {
                            location.reload();
                        }
                    }
                };
            };
        });
    });
}

// --- 2. ИНИЦИАЛИЗАЦИЯ ОБЩЕГО БАЛАНСА ---
// Берем данные из памяти браузера или ставим 0, если данных нет
let balance = {
    usd: parseFloat(localStorage.getItem('wallet_usd')) || 0.00,
    eur: parseFloat(localStorage.getItem('wallet_eur')) || 0.00
};

// --- 3. ГЛАВНАЯ ФУНКЦИЯ СИНХРОНИЗАЦИИ ---
// Она обновляет и Кошелек, и Кабинет одновременно
function updateUI() {
    // Защита от ошибок в расчетах (NaN)
    balance.usd = Number(balance.usd) || 0;
    balance.eur = Number(balance.eur) || 0;

    // Обновляем текст в Кошельке[cite: 1]
    const blnsUsd = document.getElementById('blns-usd');
    const blnsEur = document.getElementById('blns-eur');
    if (blnsUsd) blnsUsd.innerText = balance.usd.toFixed(2);
    if (blnsEur) blnsEur.innerText = balance.eur.toFixed(2);

    // Обновляем текст в Кабинете[cite: 1]
    const accUsd = document.getElementById('crypto-balance1');
    const accEur = document.getElementById('crypto-balance2');
    if (accUsd) accUsd.innerText = balance.usd.toFixed(2);
    if (accEur) accEur.innerText = balance.eur.toFixed(2);

    // Сохраняем состояние в localStorage[cite: 3]
    localStorage.setItem('wallet_usd', balance.usd);
    localStorage.setItem('wallet_eur', balance.eur);
}

// --- 4. НАВИГАЦИЯ (Переключение секций) ---
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
        if (navBtns[key]) navBtns[key].style.borderBottom = (key === activeKey) ? '3px solid #000' : 'none';
    });
    document.body.style.background = gradient;
}

navBtns.home?.addEventListener('click', (e) => { e.preventDefault(); setActiveSection('home', 'linear-gradient(to bottom, #4facfe 0%, #0072fe 100%)'); });
navBtns.wallet?.addEventListener('click', (e) => { e.preventDefault(); setActiveSection('wallet', 'linear-gradient(to bottom, #4facfe 0%, #00f2a7 100%)'); });
navBtns.account?.addEventListener('click', (e) => { e.preventDefault(); setActiveSection('account', 'linear-gradient(to bottom, #ff9a9e 0%, #fecfef 100%)'); });

// --- 5. ОПЕРАЦИИ С БАЛАНСОМ ---
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
    Object.values(modals).forEach(m => { if (m) m.style.display = 'none'; });
    Object.values(inputs).forEach(i => { if (i) i.value = ''; });
}

document.getElementById('give')?.addEventListener('click', () => modals.give.style.display = 'block');
document.getElementById('take')?.addEventListener('click', () => modals.take.style.display = 'block');

// Кнопка подтверждения пополнения
document.getElementById('confirm-give')?.addEventListener('click', () => {
    const vUsd = parseFloat(inputs.giveUsd.value) || 0;
    const vEur = parseFloat(inputs.giveEur.value) || 0;

    if (vUsd <= 0 && vEur <= 0) return alert('Введите сумму');

    balance.usd += vUsd;
    balance.eur += vEur;
    
    updateUI(); // Синхронизируем всё[cite: 1]
    closeModals();
});

// Кнопка подтверждения вывода
document.getElementById('confirm-take')?.addEventListener('click', () => {
    const vUsd = parseFloat(inputs.takeUsd.value) || 0;
    const vEur = parseFloat(inputs.takeEur.value) || 0;

    if (vUsd > balance.usd || vEur > balance.eur) return alert('Недостаточно средств на балансе!');
    if (vUsd <= 0 && vEur <= 0) return alert('Введите корректную сумму');

    balance.usd -= vUsd;
    balance.eur -= vEur;
    
    updateUI(); // Синхронизируем всё[cite: 1]
    closeModals();
});

document.querySelectorAll('.close').forEach(b => b.addEventListener('click', closeModals));

// --- 6. API КУРСОВ И ССЫЛКИ ---
async function getRates() {
    try {
        // 1. Запрос фиатных курсов (USD, EUR к гривне)
        const fiatRes = await fetch('https://api.exchangerate-api.com/v4/latest/UAH');
        const fiatData = await fiatRes.json();

        // 2. Запрос курса Биткоина (BTC к доллару)
        const cryptoRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const cryptoData = await cryptoRes.json();

        // Находим элементы в HTML
        const usdRate = document.getElementById('usd-rate');
        const eurRate = document.getElementById('eur-rate');
        const btcRate = document.getElementById('btc-rate');

        // Выводим данные
        if (usdRate) usdRate.innerText = (1 / fiatData.rates.USD).toFixed(2);
        if (eurRate) eurRate.innerText = (1 / fiatData.rates.EUR).toFixed(2);
        
        // Добавляем проверку и вывод для BTC[cite: 1]
        if (btcRate && cryptoData.bitcoin) {
            btcRate.innerText = cryptoData.bitcoin.usd.toLocaleString(); 
        }

    } catch (e) { 
        console.error("Ошибка при получении курсов валют", e); 
        const btcRate = document.getElementById('btc-rate');
        if (btcRate) btcRate.innerText = "Ошибка";
    }
}

const rateLinks = { 'usdd': 'USD-UAH', 'eurr': 'EUR-UAH', 'btcc': 'BTC-USD' };
Object.entries(rateLinks).forEach(([id, pair]) => {
    document.getElementById(id)?.addEventListener('click', () => window.open(`https://www.google.com/finance/quote/${pair}`, '_blank'));
});

// --- 7. ЗАПУСК ПРИЛОЖЕНИЯ ---
getRates();
updateUI(); // Отрисовываем баланс при старте страницы[cite: 3]