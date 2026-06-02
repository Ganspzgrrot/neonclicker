const defaultState = {
    balance: 0, clickPower: 1, critChance: 5, cps: 0,
    upgrades: {
        click: { cost: 15, level: 1 },
        crit: { cost: 75, level: 5 },
        aqa: { cost: 250, amount: 0, income: 15 },
        s23: { cost: 1200, amount: 0, income: 85 },
        server: { cost: 15000, amount: 0, income: 1200 }
    }
};

let gameState;
let isBoostActive = false;
let globalMultiplier = 1;

// Добавь инпут в объект els
const els = {
    // ... твои старые элементы ...
    score: document.getElementById('score'),
    cps: document.getElementById('cps-val'),
    crit: document.getElementById('crit-val'),
    coin: document.getElementById('main-coin'),
    term: document.getElementById('terminal-output'), // Теперь это контейнер логов
    glitch: document.getElementById('glitch-entity'),
    input: document.getElementById('term-input') // НОВЫЙ ЭЛЕМЕНТ
};

// Фокус на инпуте при клике на терминал
document.querySelector('.terminal-section').addEventListener('click', () => els.input.focus());

// Обработка ввода (ENTER)
els.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const val = els.input.value.trim();
        if (val) {
            logTerminal(val, 'log-user'); // Показываем, что ввел юзер
            processCommand(val.toLowerCase());
        }
        els.input.value = '';
    }
});

// МОЗГ ТЕРМИНАЛА (ИИ И ЧИТЫ)
function processCommand(cmd) {
    // Имитация задержки ответа системы
    setTimeout(() => {
        // --- 1. Базовый "ИИ" (Ответы на фразы) ---
        if (cmd.includes('hello') || cmd.includes('привет')) {
            logTerminal('Система онлайн. Ожидаю команд, оператор.', 'log-sys');
        }
        else if (cmd.includes('help') || cmd.includes('помощь')) {
            logTerminal('Доступные команды ограничены. Ищите уязвимости.', 'log-sys');
            logTerminal('Подсказка: попробуйте смонтировать диск или запустить тесты.', 'log-crit');
        }

        // --- 2. СЕКРЕТНЫЕ БЭКДОРЫ (ЧИТ-КОДЫ) ---

        // Чит 1: Монтирование диска на 500ГБ дает полмиллиона баланса
        else if (cmd === 'mount /dev/toshiba_500') {
            gameState.balance += 500000;
            updateUI();
            logTerminal('DEV_MOUNT_SUCCESS: Внешний накопитель 500GB подключен.', 'log-crit');
            logTerminal('КЕШ ИЗВЛЕЧЕН: +500,000 ₿', 'log-sys');
        }

        // Чит 2: Инъекция энергетика запускает буст бесплатно
        else if (cmd === 'sudo get_adrenaline') {
            logTerminal('ПРОТОКОЛ "АДРЕНАЛИН" ЗАПУЩЕН. СИСТЕМА В РЕЖИМЕ БЕРСЕРКА.', 'log-crit');
            activateOverdrive();
        }

        // Чит 3: Инъекция скрипта автотестирования (100% крит на 30 сек)
        else if (cmd === 'pytest --force-crit') {
            const oldCrit = gameState.critChance;
            gameState.critChance = 100;
            updateUI();
            logTerminal('AQA OVERRIDE: Скрипт PyTest запущен. Шанс крита = 100%.', 'log-err');

            setTimeout(() => {
                gameState.critChance = oldCrit;
                updateUI();
                logTerminal('AQA OVERRIDE: Тесты завершены. Вероятность крита восстановлена.', 'log-sys');
            }, 30000); // Действует 30 секунд
        }

        // Чит 4: Принудительный спавн мода
        else if (cmd === 'forge init the_god') {
            logTerminal('ЗАПУСК ЯДРА FORGE. АНОМАЛИЯ ПРИЗВАНА.', 'log-crit');
            spawnGlitch(); // Вызывает глитч-пакет
        }

        // --- Утилиты ---
        else if (cmd === 'clear') {
            els.term.innerHTML = '';
        }
        else {
            logTerminal(`ERR: Команда не распознана: '${cmd}'`, 'log-err');
        }
    }, 400); // 400мс задержка для реализма
}

// ПЕРЕРАБОТАННАЯ ФУНКЦИЯ БУСТА (Чтобы работала и от кнопки, и от читов)
function activateOverdrive() {
    if (isBoostActive) return;
    isBoostActive = true;

    let t = 30;
    const bBar = document.getElementById('boost-bar');

    // Эффект тряски экрана
    document.querySelector('.game-wrapper').style.animation = 'glitchTwitch 0.2s infinite';

    const bInt = setInterval(() => {
        t -= 0.1;
        bBar.style.width = `${(t / 30) * 100}%`;
        if (t <= 0) {
            clearInterval(bInt);
            clearInterval(cInt);
            isBoostActive = false;
            bBar.style.width = '0%';
            document.querySelector('.game-wrapper').style.animation = ''; // выключаем тряску
            logTerminal('Овердрайв истощен. Системы охлаждаются.');
        }
    }, 100);

    const cInt = setInterval(() => els.coin.click(), 1000 / 15);
}

// Замени старый обработчик кнопки Буста на этот:
document.getElementById('buy-boost').addEventListener('click', () => {
    if (gameState.balance >= 500 && !isBoostActive) {
        gameState.balance -= 500;
        updateUI();
        logTerminal('WARNING: OVERDRIVE ACTIVATED', 'log-err');
        activateOverdrive();
    }
});

function formatNum(num) { return Math.floor(num).toLocaleString('ru-RU'); }

function logTerminal(msg, type = '') {
    const line = document.createElement('div');
    line.className = `log-entry ${type}`;
    line.textContent = `> ${msg}`;
    els.term.appendChild(line);
    if (els.term.children.length > 25) els.term.removeChild(els.term.firstChild);
    els.term.scrollTop = els.term.scrollHeight;
}

function initBootSequence() {
    els.term.innerHTML = '';
    const seq = [
        { m: "Mounting volume: TOSHIBA_500GB... [OK]", t: "log-sys", d: 300 },
        { m: "Initializing AQA Selenium scripts... [OK]", t: "log-sys", d: 700 },
        { m: "Connecting adb to Galaxy S23 Ultra... [OK]", t: "log-sys", d: 1100 },
        { m: "Disabling auto-brightness override... [OK]", t: "log-sys", d: 1400 },
        { m: "Netrunner Uplink Established.", t: "log-crit", d: 1800 }
    ];
    seq.forEach(item => setTimeout(() => logTerminal(item.m, item.t), item.d));
}

function save() { localStorage.setItem('cyberClicker_v4', JSON.stringify(gameState)); }
function load() {
    const d = localStorage.getItem('cyberClicker_v4');
    gameState = d ? JSON.parse(d) : JSON.parse(JSON.stringify(defaultState));
    initBootSequence();
}

function updateUI() {
    els.score.textContent = formatNum(gameState.balance);
    els.cps.textContent = formatNum(gameState.cps * globalMultiplier);
    els.crit.textContent = gameState.critChance;

    ['click', 'crit'].forEach(id => {
        document.querySelector(`#buy-${id} .cost`).textContent = formatNum(gameState.upgrades[id].cost);
        document.querySelector(`#buy-${id} .lvl`).textContent = gameState.upgrades[id].level + (id === 'crit' ? '%' : '');
    });

    ['aqa', 's23', 'server'].forEach(id => {
        document.querySelector(`#buy-${id} .cost`).textContent = formatNum(gameState.upgrades[id].cost);
        document.getElementById(`${id}-amount`).textContent = gameState.upgrades[id].amount;
    });
}

const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize);
resize();

function spawnParticles(x, y, isCrit) {
    const count = isCrit ? 20 : 8;
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * (isCrit ? 15 : 8),
            vy: (Math.random() - 0.5) * (isCrit ? 15 : 8),
            life: 1,
            color: isCrit ? '#ffaa00' : '#00ffcc',
            size: Math.random() * 3 + 1
        });
    }
}

function renderParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.2;
        p.life -= 0.02;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
    }
    requestAnimationFrame(renderParticles);
}
renderParticles();

function spawnFloatingText(x, y, text, isCrit) {
    const el = document.createElement('div');
    el.className = `floating-number ${isCrit ? 'crit' : ''}`;
    el.textContent = text;
    el.style.left = `${x}px`; el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 600);
}

els.coin.addEventListener('click', (e) => {
    const isCrit = Math.random() * 100 < gameState.critChance;
    const val = (isCrit ? gameState.clickPower * 5 : gameState.clickPower) * globalMultiplier;
    gameState.balance += val;

    const rect = els.coin.getBoundingClientRect();
    const cx = e.clientX || rect.left + rect.width / 2;
    const cy = e.clientY || rect.top + rect.height / 2;

    spawnParticles(cx, cy, isCrit);
    spawnFloatingText(cx, cy, isCrit ? `+${formatNum(val)}!` : `+${formatNum(val)}`, isCrit);

    if (Math.random() > 0.95) logTerminal(`Packet intercepted: +${formatNum(val)}`, isCrit ? 'log-crit' : '');
    updateUI();
});

function buy(id, cb) {
    const upg = gameState.upgrades[id];
    if (gameState.balance >= upg.cost) {
        gameState.balance -= upg.cost;
        cb(upg);
        logTerminal(`Purchased block [${id.toUpperCase()}]. Executing...`);
        updateUI(); save();
    } else {
        logTerminal(`ERR: Insufficient funds for [${id.toUpperCase()}]`, 'log-err');
    }
}

document.getElementById('buy-click').addEventListener('click', () => buy('click', u => { gameState.clickPower++; u.level++; u.cost = Math.round(u.cost * 1.5); }));
document.getElementById('buy-crit').addEventListener('click', () => { if (gameState.critChance < 100) buy('crit', u => { gameState.critChance += 5; u.level += 5; u.cost = Math.round(u.cost * 2.2); }); });
document.getElementById('buy-aqa').addEventListener('click', () => buy('aqa', u => { u.amount++; gameState.cps += u.income; u.cost = Math.round(u.cost * 1.3); }));
document.getElementById('buy-s23').addEventListener('click', () => buy('s23', u => { u.amount++; gameState.cps += u.income; u.cost = Math.round(u.cost * 1.35); }));
document.getElementById('buy-server').addEventListener('click', () => buy('server', u => { u.amount++; gameState.cps += u.income; u.cost = Math.round(u.cost * 1.4); }));

document.getElementById('buy-boost').addEventListener('click', () => {
    if (gameState.balance >= 500 && !isBoostActive) {
        gameState.balance -= 500; isBoostActive = true;
        logTerminal('WARNING: OVERDRIVE ACTIVATED', 'log-err');
        updateUI();
        let t = 30;
        const bBar = document.getElementById('boost-bar');
        const bInt = setInterval(() => {
            t -= 0.1; bBar.style.width = `${(t / 30) * 100}%`;
            if (t <= 0) { clearInterval(bInt); clearInterval(cInt); isBoostActive = false; bBar.style.width = '0%'; logTerminal('OVERDRIVE DEPLETED'); }
        }, 100);
        const cInt = setInterval(() => els.coin.click(), 1000 / 15);
    }
});

function spawnGlitch() {
    els.glitch.classList.remove('hidden');
    els.glitch.style.left = `${Math.random() * 80 + 10}vw`;
    els.glitch.style.top = `${Math.random() * 80 + 10}vh`;
    logTerminal('ANOMALY DETECTED IN SECTOR 7', 'log-crit');

    const moveInt = setInterval(() => {
        els.glitch.style.left = `${Math.random() * 80 + 10}vw`;
        els.glitch.style.top = `${Math.random() * 80 + 10}vh`;
    }, 1000);

    const timeout = setTimeout(() => {
        els.glitch.classList.add('hidden'); clearInterval(moveInt);
        logTerminal('Anomaly escaped.');
    }, 6000);

    els.glitch.onclick = () => {
        clearTimeout(timeout); clearInterval(moveInt); els.glitch.classList.add('hidden');
        globalMultiplier = 5;
        logTerminal('DATA EXTRACTED. MULTIPLIER x5 ACTIVE (10s)', 'log-sys');
        els.term.style.color = '#ffaa00';
        setTimeout(() => { globalMultiplier = 1; logTerminal('Multiplier expired.'); els.term.style.color = '#0f0'; updateUI(); }, 10000);
    };
}
setInterval(() => { if (Math.random() > 0.7) spawnGlitch(); }, 60000);

setInterval(() => { if (gameState.cps > 0) { gameState.balance += (gameState.cps * globalMultiplier) / 10; updateUI(); } }, 100);
setInterval(save, 5000);
document.getElementById('reset-btn').addEventListener('click', () => { if (confirm('WIPE ALL DATA?')) { localStorage.removeItem('cyberClicker_v4'); location.reload(); } });

load(); updateUI();