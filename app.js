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
const achievementQueue = [];

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
  const stars = `<path d="m35 50 5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2zM145 48l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2zM152 137l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2zM32 139l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" fill="url(#coin-relief)" stroke="#8f5718" stroke-width="1.5"/>`;
  const rim = `<ellipse cx="90" cy="110" rx="68" ry="91" fill="url(#coin-edge)" stroke="#fff0ad" stroke-width="2"/><ellipse cx="90" cy="110" rx="62" ry="85" fill="url(#coin-gold)" stroke="#98601c" stroke-width="2"/><ellipse cx="90" cy="110" rx="53" ry="76" fill="url(#coin-face)" stroke="#ffe397" stroke-width="2"/><ellipse cx="90" cy="110" rx="48" ry="71" fill="none" stroke="#9c641d" stroke-width="1.5"/><ellipse cx="90" cy="110" rx="45" ry="68" fill="none" stroke="#fff0a0" stroke-opacity=".7" stroke-width="1"/>`;
  const reflection = `<path d="M46 74Q61 31 111 39Q78 51 66 97Z" fill="url(#coin-glint)" opacity=".62"/><path d="M119 151q17-17 15-42 12 34-4 51z" fill="#fff4bd" opacity=".34"/><ellipse cx="90" cy="110" rx="57" ry="80" fill="url(#coin-sheen)" opacity=".22"/>`;
  const defs = `<defs><linearGradient id="coin-gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff5bd"/><stop offset=".13" stop-color="#d99c28"/><stop offset=".28" stop-color="#ffdf72"/><stop offset=".46" stop-color="#a96514"/><stop offset=".62" stop-color="#ffe58a"/><stop offset=".78" stop-color="#c5831d"/><stop offset=".91" stop-color="#fff0a2"/><stop offset="1" stop-color="#885015"/></linearGradient><linearGradient id="coin-edge" x1="0" y1="0" x2="1" y2=".2"><stop stop-color="#774510"/><stop offset=".17" stop-color="#fff0a0"/><stop offset=".31" stop-color="#b87516"/><stop offset=".49" stop-color="#ffe58a"/><stop offset=".68" stop-color="#a05d13"/><stop offset=".84" stop-color="#ffdf70"/><stop offset="1" stop-color="#75430f"/></linearGradient><radialGradient id="coin-face" cx=".32" cy=".22" r=".82"><stop stop-color="#fff4ad"/><stop offset=".24" stop-color="#e8b93e"/><stop offset=".54" stop-color="#bd7b1d"/><stop offset=".78" stop-color="#f2cd59"/><stop offset="1" stop-color="#98601a"/></radialGradient><radialGradient id="coin-relief"><stop stop-color="#ffe58b"/><stop offset=".55" stop-color="#d09226"/><stop offset="1" stop-color="#754513"/></radialGradient><linearGradient id="coin-glint" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".96"/><stop offset=".42" stop-color="#fff3bb" stop-opacity=".48"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><radialGradient id="coin-sheen"><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset=".84" stop-color="#fff4c2" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity=".08"/></radialGradient><filter id="coin-shadow" x="-35%" y="-30%" width="180%" height="180%"><feDropShadow dx="2" dy="7" stdDeviation="4" flood-color="#170d03" flood-opacity=".62"/></filter><filter id="coin-relief-shadow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur"/><feOffset dx="1" dy="2" result="offset"/><feComposite in="offset" in2="SourceAlpha" operator="out" result="shadow"/><feFlood flood-color="#6e4212" flood-opacity=".8" result="color"/><feComposite in="color" in2="shadow" operator="in" result="shadowColor"/><feMerge><feMergeNode in="shadowColor"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
  const heads = `<svg class="coin-face-svg coin-heads" viewBox="0 0 180 220" role="img" aria-label="Kopzijde: nationale zijde van een 1-euromunt">${defs}<g filter="url(#coin-shadow)">${rim}<g filter="url(#coin-relief-shadow)"><ellipse cx="90" cy="110" rx="44" ry="65" fill="none" stroke="#754811" stroke-width="4"/><ellipse cx="90" cy="108" rx="44" ry="65" fill="none" stroke="#ffe88b" stroke-width="2"/>${stars}<path d="M69 129c-5-13-2-28 4-39 5-10 14-18 27-17 11 1 18 10 18 20l-7 5 9 7-4 14-9 2-3 13-12-5-2-8-12-1z" fill="url(#coin-relief)" stroke="#774a13" stroke-width="3"/><path d="M99 77c11 1 18 10 18 20l-7 5 9 7-4 14-9 2-3 13" fill="none" stroke="#fff1a8" stroke-width="2"/></g>${reflection}<text x="90" y="191" text-anchor="middle" fill="#70420e" stroke="#ffd966" stroke-width=".6" paint-order="stroke" font-family="Georgia,serif" font-size="12" font-weight="bold" letter-spacing="2">KOP</text></g></svg>`;
  const tails = `<svg class="coin-face-svg coin-tails" viewBox="0 0 180 220" role="img" aria-label="Muntzijde: Europese zijde met 1 euro">${defs}<g filter="url(#coin-shadow)">${rim}<g filter="url(#coin-relief-shadow)"><ellipse cx="90" cy="110" rx="48" ry="67" fill="none" stroke="#754811" stroke-width="4"/><ellipse cx="90" cy="108" rx="48" ry="67" fill="none" stroke="#ffe88b" stroke-width="2"/>${stars}<path d="M59 92c9-13 20-18 30-18l8 8 10-5 10 8 13-2 9 12-7 9 7 10-11 8 1 11-11 6-8 12-14-5-12 5-9-11-12 2-4-12-11-6 5-11-7-11 8-10-4-10z" fill="url(#coin-relief)" stroke="#704510" stroke-width="3"/><path d="M62 104q20-17 42-7t39 0M61 119q25-14 49-4t31 1M75 83q-6 22 2 44t3 41M97 78q-5 24 3 47t4 35" fill="none" stroke="#fff0a0" stroke-width="1.5" opacity=".9"/></g>${reflection}<text x="90" y="151" text-anchor="middle" fill="#fff0b0" stroke="#774811" stroke-width="1" paint-order="stroke" font-family="Georgia,serif" font-size="15" font-weight="bold">1 EURO</text><text x="90" y="191" text-anchor="middle" fill="#70420e" stroke="#ffd966" stroke-width=".6" paint-order="stroke" font-family="Georgia,serif" font-size="12" font-weight="bold" letter-spacing="2">MUNT</text></g></svg>`;
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
    <div class="eyebrow">Kop of munt</div>
    <div class="hero-art"><div class="coin-stage">${coinMarkup("hero-coin")}<div class="orbit"></div></div><span class="sparkle one">✦</span><span class="sparkle two">✧</span></div>
    <h1>Kop <span>of</span> Munt</h1>
    <p class="tagline">Precision Decision Technology™ (of toch een beetje)</p>
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
      <span class="stage-caption" id="stage-caption">${isCoin ? "Kop... munt... kop... en dan op z'n kant." : "Een briefje, een vrije val en een tafel."}</span>
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
  if (!window.Matter) {
    console.error("Matter.js is unavailable; the toss animation cannot run.");
    showToast("De natuurkundige animatie is niet beschikbaar. Vernieuw de pagina en probeer opnieuw.");
    return;
  }
  busy = true;
  const stage = app.querySelector("#animation-stage");
  const button = app.querySelector("#toss-button");
  const caption = app.querySelector("#stage-caption");
  const isCoin = currentChoice === "coin";
  button.disabled = true;
  button.innerHTML = "<span aria-hidden=\"true\">✦</span> Even kijken...";
  caption.textContent = isCoin ? "Kop! Munt! Kop... en rechtop!" : "Het briefje dwarrelt naar beneden...";
  stage.classList.remove("finished");
  stage.classList.add("animating");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  animateMatterToss(stage, isCoin, reducedMotion).then(() => {
    if (!stage.isConnected) return;
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
    if (newlyUnlocked.length) showAchievementPopup(newlyUnlocked);
  });
}

function animateMatterToss(stage, isCoin, reducedMotion) {
  return new Promise((resolve) => {
    const { Engine, Bodies, Body, Composite } = window.Matter;
    const engine = Engine.create();
    const stageBounds = stage.getBoundingClientRect();
    const width = stageBounds.width;
    const height = stageBounds.height;
    const floorY = height - 96;
    const bodyWidth = isCoin ? 13 : 190;
    const bodyHeight = isCoin ? 132 : 106;
    const target = { x: width / 2, y: floorY - bodyHeight / 2 };
    const object = stage.querySelector(isCoin ? ".coin-object" : ".bill-object");
    const spinner = isCoin ? object.querySelector(".coin-spinner") : null;
    const landingShadow = stage.querySelector(".landing-shadow");
    const duration = isCoin ? 3800 : 3200;
    const body = Bodies.rectangle(target.x, target.y, bodyWidth, bodyHeight, {
      density: isCoin ? 0.0018 : 0.00035,
      friction: 0.38,
      frictionAir: isCoin ? 0.002 : 0.012,
      restitution: isCoin ? 0.38 : 0.48,
      chamfer: { radius: isCoin ? 3 : 5 },
    });
    const floor = Bodies.rectangle(width / 2, floorY + 30, width + 200, 60, {
      isStatic: true,
      friction: 0.72,
      restitution: 0.16,
    });
    Composite.add(engine.world, [body, floor]);
    object.style.left = "50%";
    object.style.top = "50%";
    object.style.bottom = "auto";
    if (reducedMotion) {
      object.style.transform = `translate(-50%, -50%) translateY(${target.y - height / 2}px)`;
      if (spinner) spinner.style.transform = "rotateY(90deg)";
      landingShadow.style.opacity = ".72";
      landingShadow.style.transform = "translateX(-50%) scale(1)";
      Engine.clear(engine);
      resolve();
      return;
    }

    Body.setVelocity(body, { x: isCoin ? 0.8 : 1.4, y: isCoin ? -12 : -9.5 });
    Body.setAngularVelocity(body, isCoin ? 0.075 : 0.12);
    let startTime;
    let frameId;
    let lastTime;
    let watchdog;
    let finished = false;
    if (spinner) spinner.style.animation = `coin-spin-wobble ${duration}ms cubic-bezier(.16,.72,.22,1) both`;

    const finish = () => {
      if (finished) return;
      finished = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(watchdog);
      Engine.clear(engine);
      Composite.clear(engine.world, false, true);
      object.style.transform = `translate(-50%, -50%) translate3d(0, ${target.y - height / 2}px, 0)`;
      landingShadow.style.removeProperty("opacity");
      landingShadow.style.removeProperty("transform");
      if (spinner) {
        spinner.style.animation = "none";
        spinner.style.transform = "rotateY(90deg)";
        object.style.filter = "";
      } else {
        object.style.removeProperty("top");
        object.style.removeProperty("bottom");
        object.style.removeProperty("left");
        object.style.removeProperty("transform");
        object.style.removeProperty("filter");
      }
      resolve();
    };

    const renderFrame = (timestamp) => {
      if (startTime === undefined) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const delta = lastTime === undefined ? 1000 / 60 : Math.min(timestamp - lastTime, 1000 / 60);
      lastTime = timestamp;
      Engine.update(engine, delta);

      const settleStart = duration - 700;
      if (elapsed >= settleStart) {
        const progress = Math.min((elapsed - settleStart) / (duration - settleStart), 1);
        const eased = progress * progress * (3 - 2 * progress);
        Body.setPosition(body, {
          x: body.position.x + (target.x - body.position.x) * eased,
          y: body.position.y + (target.y - body.position.y) * eased,
        });
        Body.setAngle(body, body.angle * (1 - eased));
        Body.setVelocity(body, { x: body.velocity.x * (1 - eased), y: body.velocity.y * (1 - eased) });
        Body.setAngularVelocity(body, body.angularVelocity * (1 - eased));
      }

      const offsetX = body.position.x - width / 2;
      const offsetY = body.position.y - height / 2;
      object.style.transform = `translate(-50%, -50%) translate3d(${offsetX}px, ${offsetY}px, 0) rotateZ(${body.angle}rad)`;
      const impact = Math.min(Math.abs(body.velocity.y) / 18, 1);
      const motionBlur = Math.max(impact, Math.min(Math.abs(body.angularVelocity) * 3, 1));
      object.style.filter = `drop-shadow(0 8px 8px rgba(0,0,0,.4)) blur(${motionBlur * (isCoin ? 1.1 : 0.7)}px)`;
      const shadowHeight = Math.abs(body.position.y - target.y);
      landingShadow.style.opacity = String(Math.max(0.08, 0.7 - shadowHeight / height * 0.6));
      landingShadow.style.transform = `translateX(-50%) scale(${0.6 + impact * 0.4})`;

      if (elapsed < duration) {
        frameId = window.requestAnimationFrame(renderFrame);
        return;
      }

      finish();
    };

    watchdog = window.setTimeout(finish, duration + 250);
    frameId = window.requestAnimationFrame(renderFrame);
  });
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
  if (newlyUnlocked.length) showAchievementPopup(newlyUnlocked);
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

function showAchievementPopup(achievements) {
  achievementQueue.push(...achievements);
  if (!document.querySelector(".achievement-overlay")) showNextAchievementPopup();
}

function showNextAchievementPopup() {
  const achievement = achievementQueue.shift();
  if (!achievement) return;

  showConfetti();
  const overlay = document.createElement("div");
  overlay.className = "achievement-overlay";
  overlay.innerHTML = `<div class="achievement-fireworks" aria-hidden="true"></div>
    <section class="achievement-popup" role="dialog" aria-modal="true" aria-labelledby="achievement-title" aria-describedby="achievement-description">
      <button class="achievement-close" type="button" aria-label="Melding sluiten">×</button>
      <div class="achievement-popup-icon" aria-hidden="true">${achievement.icon}</div>
      <p class="achievement-popup-kicker">Achievement ontgrendeld!</p>
      <h2 id="achievement-title">${escapeHtml(achievement.name)}</h2>
      <p id="achievement-description">${escapeHtml(achievement.desc)}</p>
      <button class="primary-button achievement-dismiss" type="button">Geweldig!</button>
    </section>`;
  document.body.append(overlay);

  const fireworkLayer = overlay.querySelector(".achievement-fireworks");
  const fireworkColors = ["#f7c95b", "#f49ab3", "#9ee2c3", "#b6a0ff", "#fff"];
  for (const [x, y] of [[18, 30], [82, 26], [76, 72]]) {
    const burst = document.createElement("span");
    burst.className = "achievement-firework";
    burst.style.left = `${x}%`;
    burst.style.top = `${y}%`;
    for (let index = 0; index < 14; index += 1) {
      const particle = document.createElement("i");
      particle.className = "achievement-firework-particle";
      particle.style.setProperty("--angle", `${(360 / 14) * index}deg`);
      particle.style.setProperty("--distance", `${-38 - Math.random() * 36}px`);
      particle.style.setProperty("--firework-color", fireworkColors[index % fireworkColors.length]);
      particle.style.animationDelay = `${Math.random() * 0.3}s`;
      burst.append(particle);
    }
    fireworkLayer.append(burst);
  }

  const dismiss = () => {
    overlay.remove();
    window.removeEventListener("keydown", onKeydown);
    showNextAchievementPopup();
  };
  const onKeydown = (event) => {
    if (event.key === "Escape") {
      dismiss();
      return;
    }
    if (event.key === "Tab") {
      const controls = [...overlay.querySelectorAll("button")];
      const firstControl = controls[0];
      const lastControl = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === firstControl) {
        event.preventDefault();
        lastControl.focus();
      } else if (!event.shiftKey && document.activeElement === lastControl) {
        event.preventDefault();
        firstControl.focus();
      }
    }
  };
  overlay.querySelector(".achievement-dismiss").addEventListener("click", dismiss);
  overlay.querySelector(".achievement-close").addEventListener("click", dismiss);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) dismiss();
  });
  window.addEventListener("keydown", onKeydown);
  overlay.querySelector(".achievement-dismiss").focus();
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
    if (newlyUnlocked.length) showAchievementPopup(newlyUnlocked);
  } else if (state.elapsedSeconds % 15 === 0) saveState();
}, 1000);

route();
