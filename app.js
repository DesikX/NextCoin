const Home = document.getElementById('home');
const Wallet = document.getElementById('wallet');
const Account = document.getElementById('account');
const sHome = document.getElementById('s-home');
const sWallet = document.getElementById('s-wallet');
const sAccount = document.getElementById('s-account');
const body = document.body;

// Функция для смены активного состояния (чтобы не дублировать код)
function setActiveSection(show, hide1, hide2, activeBtn, inactiveBtn1, inactiveBtn2, gradient) {
    show.style.display = 'block';
    hide1.style.display = 'none';
    hide2.style.display = 'none';
    
    activeBtn.style.borderBottom = '3px solid #000000';
    inactiveBtn1.style.borderBottom = 'none';
    inactiveBtn2.style.borderBottom = 'none';
    
    body.style.background = gradient;
}

sHome.addEventListener('click', () => {
    setActiveSection(Home, Wallet, Account, sHome, sWallet, sAccount, 
        'linear-gradient(to bottom, #4facfe 0%, #0072fe 100%)');
});

sWallet.addEventListener('click', () => {
    setActiveSection(Wallet, Home, Account, sWallet, sHome, sAccount, 
        'linear-gradient(to bottom, #4facfe 0%, #00f2a7 100%)');
});

sAccount.addEventListener('click', () => {
    setActiveSection(Account, Home, Wallet, sAccount, sHome, sWallet, 
        'linear-gradient(to bottom, #ff9a9e 0%, #fecfef 100%)');
});


// --- Переход по клику на курс валюты ---
document.getElementById('usdd').style.cursor = 'pointer';
document.getElementById('eurr').style.cursor = 'pointer';
document.getElementById('btcc').style.cursor = 'pointer';

document.getElementById('usdd').addEventListener('click', () => {
    window.open('https://www.google.com/finance/quote/USD-UAH', '_blank');
});
document.getElementById('eurr').addEventListener('click', () => {
    window.open('https://www.google.com/finance/quote/EUR-UAH', '_blank');
});
document.getElementById('btcc').addEventListener('click', () => {
    window.open('https://www.google.com/finance/quote/BTC-USD', '_blank');
});

// Константы для API
const FIAT_API = 'https://api.exchangerate-api.com/v4/latest/UAH'; // Базовая валюта - Гривна
const CRYPTO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';

async function getRates() {
    try {
        // 1. Получаем валюты (USD и EUR к Гривне)
        const fiatResponse = await fetch(FIAT_API);
        const fiatData = await fiatResponse.json();
        
        // В API курс идет "1 UAH = сколько-то USD", поэтому делим 1 на курс
        const usdToUah = (1 / fiatData.rates.USD).toFixed(2);
        const eurToUah = (1 / fiatData.rates.EUR).toFixed(2);

        // 2. Получаем крипту (BTC к USD)
        const cryptoResponse = await fetch(CRYPTO_API);
        const cryptoData = await cryptoResponse.json();
        const btcPrice = cryptoData.bitcoin.usd;

        // 3. Выводим данные в HTML
        document.getElementById('usd-rate').innerText = usdToUah;
        document.getElementById('eur-rate').innerText = eurToUah;
        document.getElementById('btc-rate').innerText = btcPrice.toLocaleString() + ' ';

    } catch (error) {
        console.error('Ошибка при получении курсов:', error);
        document.getElementById('usd-rate').innerText = 'Ошибка';
    }
}

// Запускаем загрузку при старте приложения
getRates();

// Обновляем данные каждые 5 минут
setInterval(getRates, 300000);

// Система пополнить и вывести деньги с кошелька

const blnsUsd = document.getElementById('blns-usd');
const blnsEur = document.getElementById('blns-eur');
const giveBtn = document.getElementById('give');
const takeBtn = document.getElementById('take');
const optionsGive = document.getElementById('options-give');
const amountGive = document.getElementById('amount-give');
const amountGive2 = document.getElementById('amount-give2');
const confirmGive = document.getElementById('confirm-give');
const closeButtons = document.querySelectorAll('.close');

giveBtn.addEventListener('click', () => {
    optionsGive.style.display = 'block';
});

confirmGive.addEventListener('click', () => {
    // Получаем значения из обоих инпутов
    const amountUsd = parseFloat(amountGive.value);
    const amountEur = parseFloat(amountGive2.value);

    // Проверяем, что хотя бы одно поле заполнено корректно
    const isUsdValid = !isNaN(amountUsd) && amountUsd > 0;
    const isEurValid = !isNaN(amountEur) && amountEur > 0;

    if (!isUsdValid && !isEurValid) {
        alert('Введите корректную сумму для пополнения');
        return;
    }

    // Логика пополнения USD
    if (isUsdValid) {
        const currentUsd = parseFloat(blnsUsd.innerText);
        blnsUsd.innerText = (currentUsd + amountUsd).toFixed(2);
    }

    // Логика пополнения EUR (добавили этот блок)
    if (isEurValid) {
        const currentEur = parseFloat(blnsEur.innerText);
        blnsEur.innerText = (currentEur + amountEur).toFixed(2);
    }

    // Скрываем окно и очищаем оба инпута
    optionsGive.style.display = 'none';
    amountGive.value = '';
    amountGive2.value = '';
});

// Не забудь обновить очистку в кнопке закрытия
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        optionsGive.style.display = 'none'; 
        amountGive.value = '';
        amountGive2.value = ''; // Тоже очищаем
    });
});

// Перебираем все кнопки с классом .close и каждой вешаем событие
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        optionsGive.style.display = 'none'; 
        amountGive.value = '';
    });
});
    

// Добавляем новые переменные в начало файла
const optionsTake = document.getElementById('options-take');
const amountTake = document.getElementById('amount-take');
const amountTake2 = document.getElementById('amount-take2');
const confirmTake = document.getElementById('confirm-take');

// 1. Открытие окна вывода
takeBtn.addEventListener('click', () => {
    optionsTake.style.display = 'block';
});

// 2. Логика подтверждения вывода
confirmTake.addEventListener('click', () => {
    const takeUsd = parseFloat(amountTake.value) || 0;
    const takeEur = parseFloat(amountTake2.value) || 0;

    const currentUsd = parseFloat(blnsUsd.innerText);
    const currentEur = parseFloat(blnsEur.innerText);

    // Проверка: хватает ли денег?
    if (takeUsd > currentUsd || takeEur > currentEur) {
        alert('Недостаточно средств на балансе! ❌');
        return;
    }

    if (takeUsd <= 0 && takeEur <= 0) {
        alert('Введите корректную сумму');
        return;
    }

    // Вычитаем суммы
    if (takeUsd > 0) {
        blnsUsd.innerText = (currentUsd - takeUsd).toFixed(2);
    }
    if (takeEur > 0) {
        blnsEur.innerText = (currentEur - takeEur).toFixed(2);
    }

    // Закрываем и очищаем
    optionsTake.style.display = 'none';
    amountTake.value = '';
    amountTake2.value = '';
});

// 3. Обновляем кнопку закрытия (чтобы закрывала оба окна)
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        optionsGive.style.display = 'none'; 
        optionsTake.style.display = 'none'; // Добавили эту строку
        amountGive.value = '';
        amountGive2.value = '';
        amountTake.value = '';
        amountTake2.value = '';
    });
});


const Buy = document.getElementById('buy');
Buy.addEventListener('click', () => {
    alert('Функция покупки криптовалюты в разработке! 🚀');
});
