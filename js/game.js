// Конфигурация локализации
const LOCALIZATION = {
    "Русский": {
        tap: "ТАПАЙ!", upgrade: "Сила клика<br><span>{} 💰</span>",
        passive: "Авто-клик<br><span>{} 💰</span>", rebirth: "Возрождение<br><span>x{} ({})</span>",
        passive_inc: "Пассивный доход: +{}/с", combo: "КОМБО: x{} (x{})",
        reset_btn: "Сброс", reset_title: "Обнуление", reset_ask: "Вы уверены, что хотите обнулить прогресс?",
        yes: "Да", no: "Нет"
    },
    "Беларуская": {
        tap: "ТАПАЙ!", upgrade: "Сіла кліку<br><span>{} 💰</span>",
        passive: "Аўта-клік<br><span>{} 💰</span>", rebirth: "Адраджэнне<br><span>x{} ({})</span>",
        passive_inc: "Пасіўны даход: +{}/с", combo: "КОМБА: x{} (x{})",
        reset_btn: "Скід", reset_title: "Абнуленне", reset_ask: "Вы ўпэўнены, што хочаце абнуліць прагрэс?",
        yes: "Так", no: "Не"
    },
    "Deutsch": {
        tap: "TAP!", upgrade: "Klickkraft<br><span>{} 💰</span>",
        passive: "Auto-Klick<br><span>{} 💰</span>", rebirth: "Wiedergeburt<br><span>x{} ({})</span>",
        passive_inc: "Passives Einkommen: +{}/s", combo: "COMBO: x{} (x{})",
        reset_btn: "Reset", reset_title: "Zurücksetzen", reset_ask: "Bist du sicher, dass du alles zurücksetzen willst?",
        yes: "Ja", no: "Nein"
    }
};

const RANKS = [
    { thresh: 0, icon: "🌱", "Русский": "Новичок", "Беларуская": "Навічок", "Deutsch": "Anfänger", color: "#66ff66" },
    { thresh: 100, icon: "⚡", "Русский": "Искрящий", "Беларуская": "Іскрысты", "Deutsch": "Funke", color: "#00ffff" },
    { thresh: 1000, icon: "🔮", "Русский": "Неоновый Мастер", "Беларуская": "Неонавы Майстар", "Deutsch": "Neon Master", color: "#ff00ff" },
    { thresh: 10000, icon: "👑", "Русский": "Бог Клика", "Беларуская": "Бог Кліку", "Deutsch": "Klick-Gott", color: "#ffff00" }
];

// Состояние игры
let state = {
    score: 0, lifetime_score: 0, click_power: 1, upgrade_cost: 10,
    passive_income: 0, passive_cost: 20, rebirths: 0, current_rank_idx: 0, lang: "Русский"
};

// Загрузка сейвов
if (localStorage.getItem("neon_clicker_save")) {
    state = JSON.parse(localStorage.getItem("neon_clicker_save"));
}

let combo_count = 0;
let last_click_time = 0;

// DOM Элементы
const scoreText = document.getElementById("score-text");
const passiveText = document.getElementById("passive-text");
const clickBtn = document.getElementById("click-btn");
const upgBtn = document.getElementById("upg-btn");
const pasBtn = document.getElementById("pas-btn");
const rebirthBtn = document.getElementById("rebirth-btn");
const resetBtn = document.getElementById("reset-btn");
const comboDisplay = document.getElementById("combo-display");
const rankDisplay = document.getElementById("rank-display");
const langSelect = document.getElementById("lang-select");
const progressBar = document.getElementById("progress-bar");
const modal = document.getElementById("reset-modal");

// Инициализация селектора языка
langSelect.value = state.lang;

function getRebirthCost() {
    return Math.value = 1000 * Math.pow(5, state.rebirths);
}

function getGlobalMultiplier() {
    return 1.0 + (state.rebirths * 0.5);
}

function saveGame() {
    localStorage.setItem("neon_clicker_save", JSON.stringify(state));
}

function updateUI() {
    const strings = LOCALIZATION[state.lang];
    const rCost = getRebirthCost();
    const nextMult = (1.0 + ((state.rebirths + 1) * 0.5)).toFixed(1);

    scoreText.innerText = Math.floor(state.score);
    clickBtn.innerHTML = strings.tap;
    resetBtn.innerText = strings.reset_btn;
    
    const actualPassive = state.passive_income * getGlobalMultiplier();
    passiveText.innerText = strings.passive_inc.replace("{}", actualPassive.toFixed(1));

    upgBtn.innerHTML = strings.upgrade.replace("{}", state.upgrade_cost);
    pasBtn.innerHTML = strings.passive.replace("{}", state.passive_cost);
    rebirthBtn.innerHTML = strings.rebirth.replace("{}", nextMult).replace("{}", rCost);

    // Ранг
    const currentRank = RANKS[state.current_rank_idx];
    rankDisplay.innerText = `${currentRank.icon} ${currentRank[state.lang]}`;
    rankDisplay.style.color = currentRank.color;
    rankDisplay.style.textShadow = `0 0 10px ${currentRank.color}`;

    // Прогресс бар
    if (state.current_rank_idx < RANKS.length - 1) {
        const currentThresh = currentRank.thresh;
        const nextThresh = RANKS[state.current_rank_idx + 1].thresh;
        const progress = ((state.lifetime_score - currentThresh) / (nextThresh - currentThresh)) * 100;
        progressBar.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
    } else {
        progressBar.style.width = "100%";
    }
}

// Клик по главной кнопке
clickBtn.addEventListener("click", (e) => {
    const now = Date.now();
    if (now - last_click_time < 400) {
        combo_count++;
    } else {
        combo_count = 1;
    }
    last_click_time = now;

    // Шанс крита (Фича!)
    let isCrit = Math.random() < 0.08; 
    let critMult = isCrit ? 5 : 1;

    let comboMult = 1.0 + Math.floor(combo_count / 10) * 0.1;
    let payout = Math.floor(state.click_power * comboMult * getGlobalMultiplier() * critMult);

    state.score += payout;
    state.lifetime_score += payout;

    // Текстовый эффект над мышкой
    spawnFloatingText(e.clientX, e.clientY, `+${payout}`, isCrit ? "#ff0055" : "#00ffff", isCrit);
    
    checkRankUp();
    updateUI();
    saveGame();

    // Эффект пульсации кнопки
    clickBtn.style.transform = "scale(0.96)";
    setTimeout(() => clickBtn.style.transform = "scale(1)", 50);
});

function checkRankUp() {
    let nextIdx = state.current_rank_idx + 1;
    if (nextIdx < RANKS.length && state.lifetime_score >= RANKS[nextIdx].thresh) {
        state.current_rank_idx = nextIdx;
        spawnFloatingText(window.innerWidth / 2, window.innerHeight / 2, "RANK UP! 🎉", "#ffff00", true);
    }
}

function spawnFloatingText(x, y, text, color, isCrit) {
    const el = document.createElement("div");
    el.className = "floating-text" + (isCrit ? " crit-text" : "");
    el.innerText = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = color;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

// Апгрейды
upgBtn.addEventListener("click", () => {
    if (state.score >= state.upgrade_cost) {
        state.score -= state.upgrade_cost;
        state.click_power += 1;
        state.upgrade_cost = Math.floor(state.upgrade_cost * 1.5);
        updateUI();
        saveGame();
    }
});

pasBtn.addEventListener("click", () => {
    if (state.score >= state.passive_cost) {
        state.score -= state.passive_cost;
        state.passive_income += 0.5;
        state.passive_cost = Math.floor(state.passive_cost * 1.6);
        updateUI();
        saveGame();
    }
});

rebirthBtn.addEventListener("click", () => {
    const cost = getRebirthCost();
    if (state.score >= cost) {
        state.rebirths += 1;
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

// Смена языка
langSelect.addEventListener("change", (e) => {
    state.lang = e.target.value;
    updateUI();
    saveGame();
});

// Модалка сброса
resetBtn.addEventListener("click", () => {
    document.getElementById("modal-text").innerText = LOCALIZATION[state.lang].reset_ask;
    document.getElementById("confirm-reset").innerText = LOCALIZATION[state.lang].yes;
    document.getElementById("cancel-reset").innerText = LOCALIZATION[state.lang].no;
    modal.style.display = "flex";
});
document.getElementById("cancel-reset").addEventListener("click", () => modal.style.display = "none");
document.getElementById("confirm-reset").addEventListener("click", () => {
    localStorage.removeItem("neon_clicker_save");
    state = { score: 0, lifetime_score: 0, click_power: 1, upgrade_cost: 10, passive_income: 0, passive_cost: 20, rebirths: 0, current_rank_idx: 0, lang: state.lang };
    modal.style.display = "none";
    updateUI();
});

// Пассивный доход раз в секунду
setInterval(() => {
    if (state.passive_income > 0) {
        state.score += (state.passive_income * getGlobalMultiplier()) / 10;
        state.lifetime_score += (state.passive_income * getGlobalMultiplier()) / 10;
        checkRankUp();
        updateUI();
    }
}, 100);

// Сброс комбо
setInterval(() => {
    if (combo_count > 0 && Date.now() - last_click_time > 600) {
        combo_count = 0;
        comboDisplay.innerText = "";
    } else if (combo_count >= 5) {
        let comboMult = 1.0 + Math.floor(combo_count / 10) * 0.1;
        comboDisplay.innerText = LOCALIZATION[state.lang].combo.replace("{}", combo_count).replace("{}", comboMult.toFixed(1));
    }
}, 100);

updateUI();
