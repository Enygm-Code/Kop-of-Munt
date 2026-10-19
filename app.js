console.log("APP STARTED");
const MESSAGES = [
  "De munt werkt niet mee.",
  "Oei, er is blijkbaar een derde optie.",
  "Er is dus minder dan 50% kans.",
  "Technisch gezien had niemand gelijk.",
  "De natuurkunde heeft vandaag verlof genomen.",
  "Zelfs de munt kon niet kiezen.",
  "Gefeliciteerd, je kreeg het onmogelijke resultaat.",
  "De statistieken hebben de chat verlaten.",
  "Je zat ernaast, maar de munt ook.",
  "Dit stond niet in het handboek.",
  "De kansberekening dient een klacht in.",
  "De munt heeft een compromis gesloten.",
  "Er zijn blijkbaar meer dan twee kanten.",
  "We hebben de handleiding ook niet gelezen.",
  "Verwacht het onverwachte. En dan nog iets anders.",
  "De munt identificeert zich vandaag als derde optie.",
  "Het universum vond dit grappiger.",
  "Deze uitkomst werd mogelijk gemaakt door slechte beslissingen.",
  "Wetenschappers zijn gechoqueerd.",
  "Opnieuw proberen zal waarschijnlijk niet helpen.",
];

const ACHIEVEMENTS = [
  { id: "first", icon: "🥉", name: "Eerste Teleurstelling", desc: "Doe je eerste worp.", goal: 1 },
  { id: "five", icon: "🥈", name: "Toch Nog Eens", desc: "5 pogingen uitgevoerd.", goal: 5 },
  { id: "ten", icon: "🥇", name: "Statistisch Koppig", desc: "10 pogingen uitgevoerd.", goal: 10 },
  { id: "twenty", icon: "🏆", name: "Misschien Volgende Keer", desc: "20 pogingen.", goal: 20 },
  { id: "fifty", icon: "🏆", name: "Wetenschappelijk Onderzoek", desc: "50 pogingen.", goal: 50 },
  { id: "hundred", icon: "🏆", name: "Hardleers", desc: "100 pogingen.", goal: 100 },
  { id: "onefifty", icon: "🏆", name: "Ik Vertrouw Dit Niet", desc: "150 pogingen.", goal: 150 },
  { id: "coin-streak", icon: "🪙", name: "De Muntfluisteraar", desc: "25 keer na elkaar Munt gekozen.", goal: 25 },
  { id: "bill-streak", icon: "💵", name: "Briefjesexpert", desc: "25 keer na elkaar Briefje gekozen.", goal: 25 },
  { id: "time", icon: "⏳", name: "Professionele Tijdverspiller", desc: "10 minuten in de app doorgebracht.", goal: 600 },
  { id: "stats", icon: "📊", name: "Conspiracy Theorist", desc: "Statistiekenpagina bezocht.", goal: 1 },
  { id: "messages", icon: "🔮", name: "Derde Kant Ontdekt", desc: "Alle unieke foutmeldingen gezien.", goal: 20 },
];

const STORAGE_KEY = "kop-of-munt-save-v1";
const app = document.querySelector("#app");
let state = loadState();
let currentChoice = "coin";
let busy = false;
let toastTimer;

function createInitialState() {
  return {
    attempts: 0, coinAttempts: 0, billAttempts: 0, currentStreak: 0,
    longestStreak: 0, currentChoiceStreak: 0, lastChoice: null, statsVisited: false,
    seenMessages: [], unlocked: [], elapsedSeconds: 0,
  };
}

function loadState() {
  const defaults = createInitialState();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      ...defaults, ...saved,
      seenMessages: Array.isArray(saved.seenMessages) ? saved.seenMessages : [],
      unlocked: Array.isArray(saved.unlocked) ? saved.unlocked : [],
    };
  } catch (error) {
    console.error("Could not read saved game data.", error);
    return defaults;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Could not save game data.", error);
    showToast("Je browser kon de statistieken niet opslaan.");
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function coinMarkup(className = "coin-object idle") {
  const stars = `<path d="m35 50 5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2zM145 48l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2zM152 137l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2zM32 139l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" fill="#f8e8a1" stroke="#9c722d" stroke-width="1.5"/>`;
  const rim = `<ellipse cx="90" cy="110" rx="68" ry="91" fill="url(#coin-silver)" stroke="#fff4d3" stroke-width="2"/><ellipse cx="90" cy="110" rx="61" ry="84" fill="url(#coin-gold)" stroke="#a56d2b" stroke-width="2"/><ellipse cx="90" cy="110" rx="50" ry="72" fill="url(#coin-center)" stroke="#f9e3a0" stroke-width="2"/>`;
  const defs = `<defs><linearGradient id="coin-gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff2ad"/><stop offset=".3" stop-color="#eebc43"/><stop offset=".58" stop-color="#a96722"/><stop offset=".8" stop-color="#f8d66b"/><stop offset="1" stop-color="#9b5f20"/></linearGradient><linearGradient id="coin-silver" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff"/><stop offset=".35" stop-color="#d9e0df"/><stop offset=".65" stop-color="#929b9c"/><stop offset=".85" stop-color="#f4f4ed"/><stop offset="1" stop-color="#8d9491"/></linearGradient><radialGradient id="coin-center"><stop stop-color="#ffe38a"/><stop offset=".68" stop-color="#e7b33d"/><stop offset="1" stop-color="#a96c28"/></radialGradient><filter id="coin-shadow" x="-30%" y="-20%" width="170%" height="160%"><feDropShadow dx="4" dy="9" stdDeviation="6" flood-color="#000" flood-opacity=".48"/></filter></defs>`;
  const heads = `<svg class="coin-face-svg coin-heads" viewBox="0 0 180 220" role="img" aria-label="Kopzijde: nationale zijde van een 1-euromunt">${defs}<g filter="url(#coin-shadow)">${rim}<ellipse cx="90" cy="110" rx="44" ry="65" fill="none" stroke="#a87931" stroke-width="2"/>${stars}<path d="M69 129c-5-13-2-28 4-39 5-10 14-18 27-17 11 1 18 10 18 20l-7 5 9 7-4 14-9 2-3 13-12-5-2-8-12-1z" fill="#a56d2b" stroke="#f8e8a1" stroke-width="2"/><path d="M99 77c11 1 18 10 18 20l-7 5 9 7-4 14-9 2-3 13" fill="none" stroke="#fff2ad" stroke-width="2"/><text x="90" y="191" text-anchor="middle" fill="#704b20" font-family="Georgia,serif" font-size="12" font-weight="bold" letter-spacing="2">KOP</text></g></svg>`;
  const tails = `<svg class="coin-face-svg coin-tails" viewBox="0 0 180 220" role="img" aria-label="Muntzijde: Europese zijde met 1 euro">${defs}<g filter="url(#coin-shadow)">${rim}<ellipse cx="90" cy="110" rx="48" ry="67" fill="none" stroke="#a87931" stroke-width="2"/>${stars}<path d="M59 92c9-13 20-18 30-18l8 8 10-5 10 8 13-2 9 12-7 9 7 10-11 8 1 11-11 6-8 12-14-5-12 5-9-11-12 2-4-12-11-6 5-11-7-11 8-10-4-10z" fill="#c58d32" stroke="#f7e5a1" stroke-width="2"/><path d="M62 104q20-17 42-7t39 0M61 119q25-14 49-4t31 1M75 83q-6 22 2 44t3 41M97 78q-5 24 3 47t4 35" fill="none" stroke="#f7e5a1" stroke-width="1.5" opacity=".85"/><text x="90" y="151" text-anchor="middle" fill="#fff0b0" stroke="#936122" stroke-width=".5" font-family="Georgia,serif" font-size="15" font-weight="bold">1 EURO</text><text x="90" y="191" text-anchor="middle" fill="#704b20" font-family="Georgia,serif" font-size="12" font-weight="bold" letter-spacing="2">MUNT</text></g></svg>`;
  return `<div class="${className}" aria-label="1-euromunt met herkenbare kop- en muntzijde"><div class="coin-spinner">${heads}${tails}</div></div>`;
}

function billMarkup(className = "bill-object") {
  return `<svg class="${className}" viewBox="0 0 360 190" role="img" aria-label="Realistisch geïllustreerd bankbiljet van 200 euro">
    <defs>
      <linearGradient id="bill-paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff5a9"/><stop offset=".23" stop-color="#e7d46c"/><stop offset=".52" stop-color="#c7bd62"/><stop offset=".77" stop-color="#eee294"/><stop offset="1" stop-color="#a49a4f"/></linearGradient>
      <linearGradient id="bill-side" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#948748"/><stop offset=".35" stop-color="#f3e594"/><stop offset=".6" stop-color="#958844"/><stop offset="1" stop-color="#d7c964"/></linearGradient>
      <filter id="bill-shadow" x="-20%" y="-30%" width="160%" height="180%"><feDropShadow dx="5" dy="13" stdDeviation="7" flood-color="#000" flood-opacity=".45"/></filter>
      <pattern id="bill-lines" width="7" height="7" patternTransform="rotate(30)" patternUnits="userSpaceOnUse"><path d="M0 0v7" stroke="#827b3f" stroke-opacity=".22" stroke-width="1.3"/></pattern>
    </defs>
    <g filter="url(#bill-shadow)">
      <path d="m17 20 322-9 11 153-322 12z" fill="url(#bill-side)" stroke="#776e39" stroke-width="3"/>
      <path d="m12 15 322-9 11 153-322 12z" fill="url(#bill-paper)" stroke="#fff2a0" stroke-width="2"/>
      <path d="m24 26 297-8 8 129-297 8z" fill="url(#bill-lines)" stroke="#92884c" stroke-width="2"/>
      <path d="m34 34 51-2 6 112-51 2z" fill="#aaa052" opacity=".43"/>
      <path d="m42 134 1-73q20-43 40-2l4 73M47 132l1-65q15-28 28-1l4 67M56 130l1-53q7-14 14 0l2 52" fill="none" stroke="#857c42" stroke-width="3" opacity=".75"/>
      <path d="M97 35q81 18 178-6M96 139q78-21 188-5M107 45q74 14 159-5M109 128q76-17 153-5" fill="none" stroke="#faf0b0" stroke-width="2" opacity=".7"/>
      <path d="m260 35 10 14 17 2-12 12 3 17-15-8-15 8 3-17-12-12 17-2zM293 103l5 8 9 1-7 7 2 9-9-4-8 4 2-9-7-7 9-1z" fill="#fff2a4" stroke="#8d8348" stroke-width="1.5"/>
      <circle cx="189" cy="91" r="33" fill="#d9ce76" stroke="#8c8246" stroke-width="2"/>
      <circle cx="189" cy="91" r="27" fill="none" stroke="#f8edaa" stroke-width="1.5"/>
      <path d="M170 100q-2-20 11-28 17-9 28 4l-7 5 10 4-3 16-9 2-4 12-10-5-1-9z" fill="#968946" opacity=".85"/>
      <text x="43" y="52" fill="#675f32" font-family="Georgia,serif" font-size="24" font-weight="bold">200</text>
      <text x="270" y="139" fill="#675f32" font-family="Georgia,serif" font-size="20" font-weight="bold">200</text>
      <text x="185" y="97" text-anchor="middle" fill="#635b30" font-family="Georgia,serif" font-size="24" font-weight="bold">€</text>
      <text x="121" y="158" fill="#71683a" font-family="Georgia,serif" font-size="9" letter-spacing="2">EURO • ΕΥΡΩ • ЕВРО</text>
      <path d="M25 31 326 22M26 144l300-9" stroke="#fff8c7" stroke-opacity=".58" stroke-width="1.5"/>
    </g>
  </svg>`;
}

function showHome() {
  app.innerHTML = `<section class="home-view">
    <div class="eyebrow">De meest nutteloze beslissingsapp</div>
    <div class="hero-art"><div class="coin-stage">${coinMarkup("hero-coin")}<div class="orbit"></div></div><span class="sparkle one">✦</span><span class="sparkle two">✧</span></div>
    <h1>Kop <span>of</span> Munt</h1>
    <p class="tagline">Kiezen was nog nooit zo onmogelijk.</p>
    <div class="choice-grid">
      <button class="choice-card coin-choice" data-choice="coin">${coinMarkup("choice-coin")}<span class="choice-label">Munt</span><span class="choice-detail">Gooi de munt</span></button>
      <button class="choice-card bill-choice" data-choice="bill">${billMarkup("choice-bill")}<span class="choice-label">Briefje</span><span class="choice-detail">Laat 'm vallen</span></button>
    </div>
    <p class="tiny-warning">Spoiler: de natuurkunde doet niet mee.</p>
  </section>`;
  app.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => showGame(button.dataset.choice));
  });
}

function showGame(choice) {
  currentChoice = choice;
  busy = false;
  const isCoin = choice === "coin";
  app.innerHTML = `<section class="game-view">
    <button class="back-button" id="back-home"><span aria-hidden="true">←</span> Terug</button>
    <h1 class="game-heading">${isCoin ? "Munt opgooien" : "Briefje laten vallen"}</h1>
    <p class="game-subheading">${isCoin ? "Kop of munt? We weten het eigenlijk ook niet." : "Een briefje. Twee kanten. Geen antwoorden."}</p>
    <div class="animation-stage" id="animation-stage"><div class="stage-glow"></div>
      ${isCoin ? coinMarkup() : `${billMarkup()}<div class="bill-edge" aria-label="Het briefje staat op zijn smalle rand"></div>`}
      <div class="table-scene" aria-hidden="true"><div class="table-top"></div><div class="table-apron"></div><div class="table-leg left"></div><div class="table-leg right"></div></div>
      <div class="landing-shadow" aria-hidden="true"></div>
      <span class="stage-caption" id="stage-caption">${isCoin ? "Kop, munt... en dan die tafel." : "Een briefje, een vrije val en een tafel."}</span>
    </div>
    <button class="action-button" id="toss-button"><span aria-hidden="true">${isCoin ? "↗" : "↓"}</span> ${isCoin ? "Gooi de munt" : "Laat vallen"}</button>
    <div id="result-slot"></div>
  </section>`;
  app.querySelector("#back-home").addEventListener("click", showHome);
  app.querySelector("#toss-button").addEventListener("click", runAttempt);
}

function selectMessage() {
  if (Math.random() < 0.04) return 15 + Math.floor(Math.random() * 5);
  return Math.floor(Math.random() * 15);
}

function runAttempt() {
  if (busy) return;
  busy = true;
  const stage = app.querySelector("#animation-stage");
  const button = app.querySelector("#toss-button");
  const caption = app.querySelector("#stage-caption");
  const isCoin = currentChoice === "coin";
  button.disabled = true;
  button.innerHTML = "<span aria-hidden=\"true\">✦</span> Even kijken...";
  caption.textContent = isCoin ? "Kop! Munt! Kop! Munt!" : "Het briefje dwarrelt naar beneden...";
  stage.classList.remove("finished");
  stage.classList.add("animating");

  window.setTimeout(() => {
    stage.classList.remove("animating");
    stage.classList.add("finished");
    caption.textContent = isCoin ? "Op de rand. Kop noch munt. Natuurlijk." : "Op de smalle zijde geland. Natuurlijk.";

    state.attempts += 1;
    state.currentStreak += 1;
    state.longestStreak = Math.max(state.longestStreak, state.currentStreak);
    if (isCoin) state.coinAttempts += 1;
    else state.billAttempts += 1;
    state.currentChoiceStreak = state.lastChoice === currentChoice ? state.currentChoiceStreak + 1 : 1;
    state.lastChoice = currentChoice;

    const messageIndex = selectMessage();
    const message = MESSAGES[messageIndex];
    if (!state.seenMessages.includes(messageIndex)) state.seenMessages.push(messageIndex);
    const newlyUnlocked = unlockEligible();
    saveState();
    showResult(message, currentChoice);
    button.disabled = false;
    button.innerHTML = `<span aria-hidden="true">${isCoin ? "↗" : "↓"}</span> Nog een keer`;
    busy = false;
    if (newlyUnlocked.length) showConfetti();
  }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 50 : (isCoin ? 2450 : 2600));
}

function unlockEligible() {
  const values = {
    first: state.attempts, five: state.attempts, ten: state.attempts,
    twenty: state.attempts, fifty: state.attempts, hundred: state.attempts,
    onefifty: state.attempts,
    "coin-streak": state.lastChoice === "coin" ? state.currentChoiceStreak : 0,
    "bill-streak": state.lastChoice === "bill" ? state.currentChoiceStreak : 0,
    time: state.elapsedSeconds, stats: state.statsVisited ? 1 : 0, messages: state.seenMessages.length,
  };
  const newlyUnlocked = [];
  for (const achievement of ACHIEVEMENTS) {
    if (values[achievement.id] >= achievement.goal && !state.unlocked.includes(achievement.id)) {
      state.unlocked.push(achievement.id);
      newlyUnlocked.push(achievement);
    }
  }
  return newlyUnlocked;
}

function showResult(message, choice) {
  const verdict = choice === "coin" ? "De munt kwam rechtop terecht." : "Het briefje kwam rechtop op zijn rand terecht.";
  const slot = app.querySelector("#result-slot");
  slot.innerHTML = `<section class="result-card"><div class="result-kicker">Resultaat: de derde optie</div>
    <p class="result-message">${escapeHtml(message)}</p><p class="result-verdict">${verdict} Niemand won.</p>
    <div class="result-actions"><button class="secondary-button" id="again-result">Nog eens</button></div>
  </section>`;
  slot.querySelector("#again-result").addEventListener("click", runAttempt);
}

function showStats() {
  state.statsVisited = true;
  const newlyUnlocked = unlockEligible();
  saveState();
  const cards = [
    ["Totaal aantal pogingen", state.attempts],
    ["Muntpogingen", state.coinAttempts],
    ["Briefjespogingen", state.billAttempts],
    ["Rechtop-resultaten", "100%"],
    ["Kop", "0%"],
    ["Munt", "0%"],
    ["Plat briefje", "0%"],
    ["Gemiddelde teleurstelling", "100%"],
    ["Langste reeks zonder geldig resultaat", state.longestStreak],
  ];
  app.innerHTML = `<section class="stats-view">
    <div class="stats-top"><div><h1>Statistieken</h1><p class="intro">Indrukwekkende cijfers. Waardeloze uitkomsten.</p></div><button class="back-button" id="stats-back">← Terug</button></div>
    <div class="stat-grid">${cards.map(([label, value], index) => `<div class="stat-card ${index === 8 ? "stat-wide" : ""}"><span class="stat-number">${escapeHtml(value)}</span><span class="stat-label">${escapeHtml(label)}</span></div>`).join("")}</div>
    <h2 class="section-heading">Prestaties <span style="color:var(--muted);font-size:12px;font-weight:500">${state.unlocked.length}/${ACHIEVEMENTS.length}</span></h2>
    <div class="achievement-list">${ACHIEVEMENTS.map((achievement) => `<div class="achievement ${state.unlocked.includes(achievement.id) ? "unlocked" : ""}"><span class="achievement-icon">${achievement.icon}</span><div><div class="achievement-name">${achievement.name}</div><div class="achievement-desc">${achievement.desc}</div></div></div>`).join("")}</div>
    <button class="secondary-button reset-button" id="reset-stats">Reset statistieken</button>
    <button class="primary-button stats-home" id="stats-home">Terug naar kiezen</button>
  </section>`;
  app.querySelector("#stats-back").addEventListener("click", () => { window.location.hash = "home"; showHome(); });
  app.querySelector("#stats-home").addEventListener("click", () => { window.location.hash = "home"; showHome(); });
  app.querySelector("#reset-stats").addEventListener("click", resetStatistics);
  if (newlyUnlocked.length) showConfetti();
}

function resetStatistics() {
  if (!window.confirm("Weet je zeker dat je alle pogingen, statistieken en prestaties wilt wissen?")) return;
  state = createInitialState();
  saveState();
  window.location.hash = "home";
  showHome();
  showToast("Alle statistieken en prestaties zijn gereset.");
}

function showConfetti() {
  const layer = document.querySelector("#confetti");
  const colors = ["#f7c95b", "#f49ab3", "#9ee2c3", "#b6a0ff", "#fff"];
  for (let i = 0; i < 56; i += 1) {
    const piece = document.createElement("i");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty("--drift", `${Math.random() * 180 - 90}px`);
    piece.style.animationDelay = `${Math.random() * 0.45}s`;
    piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    layer.append(piece);
    window.setTimeout(() => piece.remove(), 2500);
  }
}

function showToast(text) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.append(toast);
  }
  toast.textContent = text;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2200);
}

function route() {
  if (window.location.hash === "#stats") {
    showStats();
    return;
  }
  showHome();
}

document.querySelector("#stats-button").addEventListener("click", () => { window.location.hash = "stats"; });
window.addEventListener("hashchange", route);
window.addEventListener("popstate", route);
window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY) state = loadState();
});

window.setInterval(() => {
  state.elapsedSeconds += 1;
  if (state.elapsedSeconds >= 600 && !state.unlocked.includes("time")) {
    const newlyUnlocked = unlockEligible();
    saveState();
    if (newlyUnlocked.length) showConfetti();
  } else if (state.elapsedSeconds % 15 === 0) saveState();
}, 1000);

route();
