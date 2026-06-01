// web/js/game.js

// Конфигурация рангов
const RANKS = [
    { thresh: 0, icon: "⭐", name: "Новичок", color: "#b3b3b3" },
    { thresh: 100, icon: "⚡", name: "Адепт", color: "#33ccff" },
    { thresh: 1000, icon: "🔥", name: "Мастер", color: "#ff8000" },
    { thresh: 10000, icon: "🔮", name: "Грандмастер", color: "#b333ff" },
    { thresh: 100000, icon: "👑", name: "Легенда", color: "#ffcc00" }
];

// Начальное состояние игры
const DEFAULT_STATE = {
    score: 0,
    lifetime_score: 0,
    click_power: 1,
    upgrade_cost: 10,
    passive_income: 0,
    passive_cost: 20,
    current_rank_idx: 0,
    rebirths: 0
};

// Загрузка сейвов из памяти браузера
let state = JSON.parse(localStorage.getItem('neon_clicker_save')) || { ...DEFAULT_STATE };

let combo_count = 0;
let last_click_time = 0;

// Кешируем элементы интерфейса
const scoreLabel = document.getElementById('score-label');
const passiveLabel = document.getElementById('passive-label');
const progressBar = document.getElementById('progress-bar');
const rankLabel = document.getElementById('rank-label');
const comboLabel = document.getElementById('combo-label');
const clickBtn = document.getElementById('click-btn');
const upgradeBtn = document.getElementById('upgrade-btn');
const passiveBtn = document.getElementById('passive-btn');
const rebirthBtn = document.getElementById('rebirth-btn');
const resetBtn = document.getElementById('reset-btn');

function saveGame() {
    localStorage.setItem('neon_clicker_save', JSON.stringify(state));
}

function getRebirthCost() {
    return 50000 * (state.rebirths + 1);
}

function getGlobalMultiplier() {
    return 1.0 + (state.rebirths * 0.5);
}

// Отрисовка данных на экране
function updateUI() {
    scoreLabel.innerText = Math.floor(state.score);
    
    const actualPassive = state.passive_income * getGlobalMultiplier();
    passiveLabel.innerText = `Пассивный доход: +${actualPassive.toFixed(1)}/сек`;
    
    upgradeBtn.innerHTML = `Клик +1<br>Цена: ${state.upgrade_cost}`;
    passiveBtn.innerHTML = `Автоклик +0.5<br>Цена: ${state.passive_cost}`;
    
    const nextMult = 1.0 + ((state.rebirths + 1) * 0.5);
    rebirthBtn.innerHTML = `Ребёрс (x${nextMult})<br>Цена: ${getRebirthCost()}`;

    // Обработка комбо-панели
    if (combo_count >= 5) {
        const comboMult = 1.0 + Math.floor(combo_count / 10) * 0.1;
        comboLabel.innerText = `🔥 Комбо: ${combo_count} (x${comboMult.toFixed(1)})`;
    } else {
        comboLabel.innerText = "";
    }

    // Ранг и прогресс-бар
    const curRank = RANKS[state.current_rank_idx];
    rankLabel.innerText = `${curRank.icon} ${curRank.name}`;
    rankLabel.style.color = curRank.color;

    if (state.current_rank_idx < RANKS.length - 1) {
        const nextRank = RANKS[state.current_rank_idx + 1];
        const diff = nextRank.thresh - curRank.thresh;
        const progress = ((state.lifetime_score - curRank.thresh) / diff) * 100;
        progressBar.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
    } else {
        progressBar.style.width = '100%';
    }
}

// Клик по главной кнопке
clickBtn.addEventListener('click', (e) => {
    const now = Date.now();
    if (now - last_click_time < 400) {
        combo_count++;
    } else {
        combo_count = 1;
    }
    last_click_time = now;

    const comboMult = 1.0 + Math.floor(combo_count / 10) * 0.1;
    const payout = Math.floor(state.click_power * comboMult * getGlobalMultiplier());

    state.score += payout;
    state.lifetime_score += payout;

    // Анимация пульсации счета
    scoreLabel.style.transform = 'scale(1.1)';
    setTimeout(() => scoreLabel.style.transform = 'scale(1)', 50);

    // Цвет вылетающих цифр зависит от комбо и реберсов
    let textColor = '#33ccff';
    if (combo_count >= 10) textColor = '#ff6600';
    else if (state.rebirths > 0) textColor = '#cc33ff';

    spawnFloatingText(e.clientX, e.clientY, `+${payout}`, textColor);
    
    checkRankUp();
    updateUI();
    saveGame();
});

function spawnFloatingText(x, y, text, color) {
    const lbl = document.createElement('div');
    lbl.className = 'floating-text';
    lbl.innerText = text;
    lbl.style.color = color;
    lbl.style.left = `${x - 20}px`;
    lbl.style.top = `${y - 20}px`;
    document.body.appendChild(lbl);
    setTimeout(() => lbl.remove(), 350);
}

function spawnNegativeText(text) {
    const rect = scoreLabel.getBoundingClientRect();
    const lbl = document.createElement('div');
    lbl.className = 'negative-text';
    lbl.innerText = text;
    lbl.style.left = `${rect.left + rect.width / 2 - 15}px`;
    lbl.style.top = `${rect.bottom}px`;
    document.body.appendChild(lbl);
    setTimeout(() => lbl.remove(), 400);
}

function flashButton(btn, originalColor) {
    btn.style.backgroundColor = '#fff';
    setTimeout(() => btn.style.backgroundColor = originalColor, 80);
}

// Покупка улучшений
upgradeBtn.addEventListener('click', () => {
    if (state.score >= state.upgrade_cost) {
        const cost = state.upgrade_cost;
        state.score -= cost;
        state.click_power += 1;
        state.upgrade_cost = Math.floor(state.upgrade_cost * 1.5);
        
        spawnNegativeText(`-${cost}`);
        flashButton(upgradeBtn, '#0d8243');
        updateUI();
        saveGame();
    }
});

passiveBtn.addEventListener('click', () => {
    if (state.score >= state.passive_cost) {
        const cost = state.passive_cost;
        state.score -= cost;
        state.passive_income += 0.5;
        state.passive_cost = Math.floor(state.passive_cost * 1.6);

        spawnNegativeText(`-${cost}`);
        flashButton(passiveBtn, '#1a6680');
        updateUI();
        saveGame();
    }
});

rebirthBtn.addEventListener('click', () => {
    const cost = getRebirthCost();
    if (state.score >= cost) {
        state.rebirths += 1;
        spawnNegativeText(`-${cost}`);
        flashButton(rebirthBtn, '#991a80');

        // Сброс показателей, кроме общего счета и реберсов
        state.score = 0;
        state.click_power = 1;
        state.upgrade_cost = 10;
        state.passive_income = 0;
        state.passive_cost = 20;
        state.current_rank_idx = 0;
        combo_count = 0;

        updateUI();
        saveGame();
    }
});

function checkRankUp() {
    const nextIdx = state.current_rank_idx + 1;
    if (nextIdx < RANKS.length && state.lifetime_score >= RANKS[nextIdx].thresh) {
        state.current_rank_idx = nextIdx;
    }
}

// Полный вайп прогресса
resetBtn.addEventListener('click', () => {
    if (confirm("Сбросить вообще весь прогресс на сайте?")) {
        state = { ...DEFAULT_STATE };
        localStorage.removeItem('neon_clicker_save');
        combo_count = 0;
        updateUI();
    }
});

// Таймер тиков пассивного дохода (10 раз в секунду для плавности)
setInterval(() => {
    if (state.passive_income > 0) {
        const actualPassive = state.passive_income * getGlobalMultiplier();
        state.score += actualPassive * 0.1;
        state.lifetime_score += actualPassive * 0.1;
        checkRankUp();
        updateUI();
    }
}, 100);

// Сгорание комбо-множителя
setInterval(() => {
    if (combo_count > 0 && (Date.now() - last_click_time > 600)) {
        combo_count = 0;
        updateUI();
    }
}, 100);

// Старт игры
updateUI();