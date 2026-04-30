// 1. Инициализация баланса при загрузке
let balance = {
    usd: parseFloat(localStorage.getItem('wallet_usd')) || 0.00,
    eur: parseFloat(localStorage.getItem('wallet_eur')) || 0.00
};

// 2. ГЛАВНАЯ ФУНКЦИЯ: Обновляет и кошелек, и кабинет одновременно
function updateUI() {
    console.log("Обновление интерфейса. Текущий баланс:", balance); // Вывод в консоль для проверки

    // Обновляем Кошелек
    const blnsUsd = document.getElementById('blns-usd');
    const blnsEur = document.getElementById('blns-eur');
    if (blnsUsd) blnsUsd.innerText = balance.usd.toFixed(2);
    if (blnsEur) blnsEur.innerText = balance.eur.toFixed(2);

    // Обновляем Кабинет
    const accUsd = document.getElementById('crypto-balance1');
    const accEur = document.getElementById('crypto-balance2');
    if (accUsd) accUsd.innerText = balance.usd.toFixed(2);
    if (accEur) accEur.innerText = balance.eur.toFixed(2);

    // Сохраняем данные в память браузера
    localStorage.setItem('wallet_usd', balance.usd);
    localStorage.setItem('wallet_eur', balance.eur);
}

// 3. Навигация (переключение секций)
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

// 4. Модальные окна (Пополнение и Вывод)
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

// Кнопки открытия окон
document.getElementById('give')?.addEventListener('click', () => modals.give.style.display = 'block');
document.getElementById('take')?.addEventListener('click', () => modals.take.style.display = 'block');

// Кнопка: Подтвердить пополнение
document.getElementById('confirm-give')?.addEventListener('click', () => {
    const vUsd = parseFloat(inputs.giveUsd.value) || 0;
    const vEur = parseFloat(inputs.giveEur.value) || 0;

    if (vUsd <= 0 && vEur <= 0) return alert('Введите сумму для пополнения');

    balance.usd += vUsd;
    balance.eur += vEur;
    
    updateUI(); // Вызов синхронизации
    closeModals();
});

// Кнопка: Подтвердить вывод
document.getElementById('confirm-take')?.addEventListener('click', () => {
    const vUsd = parseFloat(inputs.takeUsd.value) || 0;
    const vEur = parseFloat(inputs.takeEur.value) || 0;

    if (vUsd > balance.usd || vEur > balance.eur) return alert('Недостаточно средств!');
    if (vUsd <= 0 && vEur <= 0) return alert('Введите сумму для вывода');
    
    balance.usd -= vUsd;
    balance.eur -= vEur;
    
    updateUI(); // Вызов синхронизации
    closeModals();
});

// Закрытие по кнопкам "Отменить"
document.querySelectorAll('.close').forEach(b => b.addEventListener('click', closeModals));

// 5. API Курсов
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

// 6. Ссылки на графики валют
const rateLinks = { 'usdd': 'USD-UAH', 'eurr': 'EUR-UAH', 'btcc': 'BTC-USD' };
Object.entries(rateLinks).forEach(([id, pair]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => window.open(`https://www.google.com/finance/quote/${pair}`, '_blank'));
});

// ЗАПУСК
getRates();
updateUI(); // Принудительно отрисовываем баланс при загрузке страницы