// ====== Helpers ======
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showScreen(id){
  $$(".screen").forEach(s => s.classList.remove("isActive"));
  const el = $(id);
  if(el) el.classList.add("isActive");

  clearFeedback();
  const aFb = $("#arenaFeedback");
  if(aFb) aFb.textContent = "";
    if(id === "#screen-menu"){
    
    updateLessonHint();
  }

}

function setFeedback(text, ok){
  const box = $("#feedbackBox");
  if(!box) return;
  box.textContent = text;
  box.classList.remove("ok","bad");
  box.classList.add(ok ? "ok" : "bad");
}

function clearFeedback(){
  const box = $("#feedbackBox");
  if(!box) return;
  box.textContent = "";
  box.classList.remove("ok","bad");
}

function normalize(s){
  return String(s ?? "")
    .trim()
    .toLowerCase()
    
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
  
    .replace(/æ/g, "ae")
    .replace(/œ/g, "oe");
}


function shuffleInPlace(arr){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function nowYear(){
  return String(new Date().getFullYear());
}

function todayKey(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}

function allLessons(){
  return Array.from({length:37}, (_,i)=>i+1);
}

function loadSelectedLessons(){
  try{
    const arr = JSON.parse(localStorage.getItem(LESSONS_KEY) || "null");
    if(!arr) return allLessons(); 
    return Array.isArray(arr) ? arr.filter(n => Number.isInteger(n) && n>=1 && n<=37) : allLessons();
  }catch{
    return allLessons();
  }
}

function saveSelectedLessons(arr){
  const clean = Array.from(new Set(arr))
    .filter(n => Number.isInteger(n) && n>=1 && n<=37)
    .sort((a,b)=>a-b);

  localStorage.setItem(LESSONS_KEY, JSON.stringify(clean));
  updateLessonHint();
}

function updateLessonHint(){
  const el = $("#lessonHint");
  if(!el) return;
  const sel = loadSelectedLessons();
  el.textContent = sel.length ? `Aktiv: ${sel.join(", ")}` : `Keine Lektion ausgewählt.`;
}

function renderLessonChips(){
  const row = $("#lessonRow");
  if(row) row.innerHTML = ""; 
  updateLessonHint();
}


function setLessonsRange(a,b){
  const arr = [];
  for(let i=a;i<=b;i++) arr.push(i);
  saveSelectedLessons(arr);
  renderLessonChips();
}


// ====== Footer Year ======
const cy = $("#copyrightYear");
if(cy) cy.textContent = nowYear();

// ====== Storage Keys ======
const LEVEL_KEY  = "latinTrainerLevel";
const TICKET_KEY = "latinTrainerTickets";
const ARENA_INDEX_KEY = "latinTrainerArenaIndex";

const STATS_KEY = "latinTrainerStats_v1";
const PRACTICE_DAYS_KEY = "latinTrainerPracticeDays_v1";
const MISTAKES_KEY = "latinTrainerMistakes_v1";

const BADGE_LAST_KEY = "latinTrainerLastBadgeLevel_v1";
const BADGE_TITLE_KEY = "latinTrainerBadgeTitle_v1";

// Arena Highscore
const ARENA_HS_KEY = "latinTrainerArenaHighscore_v1";

// Teacher PIN
const TEACHER_PIN_KEY = "latinTrainerTeacherPin_v1";
const TEACHER_UNLOCK_KEY = "latinTrainerTeacherUnlocked_v1";
const LESSONS_KEY = "latinTrainerSelectedLessons_v1";


// ====== Abzeichen Definition ======
function badgeForLevel(level){
  const n = Math.floor(level / 10) * 10;
  if(n < 10) return null;

  const map = {
 10:  { title: "Bronze", emoji: "🟤" },
  20:  { title: "Silber", emoji: "⚪" },
  30:  { title: "Gold", emoji: "🟡" },
  40:  { title: "Platin", emoji: "🔷" },
  50:  { title: "Diamant", emoji: "💎" },
  60:  { title: "Titan", emoji: "🟣" },
  70:  { title: "Obsidian", emoji: "🔥" },
  };

  return map[n] || { title: `Gladiator Stufe ${n}`, emoji: "🏅" };
}

// ====== Overlay (Abzeichen) ======
function hideBadgeOverlay(){
  const ov = $("#badgeOverlay");
  if(!ov) return;
  ov.classList.add("hidden");
}

function showBadgeOverlay(title, emoji){
  const ov = $("#badgeOverlay");
  if(!ov) return;

  $("#badgeOverlayTitle").textContent = "Neues Abzeichen!";
  $("#badgeOverlayEmoji").textContent = emoji || "🏅";
  $("#badgeOverlayText").innerHTML = `Du hast das Abzeichen <strong>${title}</strong> erhalten!`;

  ov.classList.remove("hidden");
}

$("#btnBadgeContinue")?.addEventListener("click", hideBadgeOverlay);
hideBadgeOverlay();

// ====== Level + Tickets ======
function getLevel(){
  return Number(localStorage.getItem(LEVEL_KEY) || "1");
}
function setLevel(v){
  const safe = Math.max(1, Number(v) || 1);
  localStorage.setItem(LEVEL_KEY, String(safe));
  const el = $("#levelValue");
  if(el) el.textContent = String(safe);
  return safe;
}

function getTickets(){
  return Number(localStorage.getItem(TICKET_KEY) || "0");
}
function setTickets(v){
  const safe = Math.max(0, Number(v) || 0);
  localStorage.setItem(TICKET_KEY, String(safe));
  const el = $("#ticketValue");
  if(el) el.textContent = String(safe);
  updateArenaButton();
  return safe;
}

setLevel(getLevel());
setTickets(getTickets());

// ====== Stats ======
function emptyStats(){
  return {
    verben: { mcq:{attempts:0,wrong:0}, input:{attempts:0,wrong:0} },
    substantive: { mcq:{attempts:0,wrong:0}, input:{attempts:0,wrong:0} },
    satzanalyse: { analysis:{attempts:0,wrong:0} }
  };
}

function loadStats(){
  try{
    const obj = JSON.parse(localStorage.getItem(STATS_KEY) || "null");
    if(!obj) return emptyStats();
    return obj;
  }catch{
    return emptyStats();
  }
}

function saveStats(st){
  localStorage.setItem(STATS_KEY, JSON.stringify(st));
}

function markPracticeDay(){
  const key = todayKey();
  let days = [];
  try{ days = JSON.parse(localStorage.getItem(PRACTICE_DAYS_KEY) || "[]"); }catch{ days=[]; }
  if(!Array.isArray(days)) days = [];
  if(!days.includes(key)){
    days.push(key);
    localStorage.setItem(PRACTICE_DAYS_KEY, JSON.stringify(days));
  }
}

function getPracticeDaysCount(){
  try{
    const days = JSON.parse(localStorage.getItem(PRACTICE_DAYS_KEY) || "[]");
    return Array.isArray(days) ? days.length : 0;
  }catch{
    return 0;
  }
}

// ====== Fehler speichern ======
function loadMistakes(){
  try{
    const arr = JSON.parse(localStorage.getItem(MISTAKES_KEY) || "[]");
    return Array.isArray(arr) ? arr : [];
  }catch{
    return [];
  }
}

function saveMistakes(arr){
  localStorage.setItem(MISTAKES_KEY, JSON.stringify(arr));
  updateMistakeCount();
}

function makeTaskId(mode, r){
  const base = {
    mode,
    type: r.type,
    title: r.title,
    prompt: r.prompt,
    options: r.options || null,
    correct: r.correct || null,
    answer: r.answer || null,
    sentence: r.sentence || null,
    correctTokens: r.correctTokens || null
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(base)))).slice(0, 60);
}

function addMistake(mode, r){
  const id = makeTaskId(mode, r);
  const list = loadMistakes();
  if(list.some(x => x.id === id)) return;

  list.push({ id, mode, task: r });
  saveMistakes(list);
}

function removeMistakeById(id){
  const list = loadMistakes().filter(x => x.id !== id);
  saveMistakes(list);
}

function updateMistakeCount(){
  const c = loadMistakes().length;
  const el = $("#mistakeCount");
  if(el) el.textContent = String(c);
}
updateMistakeCount();

// ====== Abzeichen oben ======
function setTopBadgeTitle(t){
  const el = $("#badgeTitleTop");
  if(el) el.textContent = t || "—";
  localStorage.setItem(BADGE_TITLE_KEY, t || "—");
}

function initTopBadge(){
  const t = localStorage.getItem(BADGE_TITLE_KEY) || "—";
  setTopBadgeTitle(t);
}
initTopBadge();

// ====== Game Data ======
const gameData = {
  verben: [
    { lesson: 1, type:"mcq", title:"Wähle die richtige Form aus!",
      prompt:"Merkmale: 1. Ps. Sg. Ind. Akt. — Welche Form(en) passen?",
      options:["amo","amas","amamus"], correct:["amo"],
      explain:"1. Person Singular Präsens Aktiv: amo."
    },
    { lesson: 1, type:"input", title:"Setze die passende Form ein!",
      prompt:"Puella ____ (amare) equum.", answer:"amat",
      explain:"3. Person Singular Präsens Aktiv: amat."
    },
    { lesson: 1, type:"mcq", title:"Wähle die richtige Form aus!",
      prompt:"Merkmale: 3. Ps. Pl. Ind. Akt. — Welche Form(en) passen?",
      options:["amant","amat","amatis"], correct:["amant"],
      explain:"3. Person Plural Präsens Aktiv: amant."
    },
    { lesson: 1, type:"input", title:"Setze die passende Form ein!",
      prompt:"Servi ____ (laborare).", answer:"laborant",
      explain:"3. Person Plural Präsens Aktiv: laborant."
    },
    { lesson: 1, type:"mcq", title:"Wähle die richtige Form aus!",
      prompt:"Merkmale: 2. Ps. Pl. Ind. Akt. — Welche Form(en) passen?",
      options:["amatis","amamus","amant"], correct:["amatis"],
      explain:"2. Person Plural Präsens Aktiv: amatis."
    },
    { lesson: 1, type:"input", title:"Setze die passende Form ein!",
      prompt:"Puella ____ (delere) gladium.", answer:"delet",
      explain:"3. Person Singular Präsens Aktiv: delet."
    },
    { lesson: 1, type:"mcq", title:"Wähle die richtige Form aus!",
      prompt:"Merkmale: 3. Ps. Sg. Ind. Akt. — Welche Form(en) passen?",
      options:["est","sunt","es"], correct:["est"],
      explain:"3. Person Singular Präsens Aktiv: est."
    },
    

{
  lesson: 1,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 2. Ps. Sg. Ind. Akt. — Welche Form(en) passen?",
  options: ["est", "sunt", "es"],
  correct: ["es"],
  explain: "3. Person Singular Präsens Aktiv: es."
},
{
  lesson: 1,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Puella ____ (ridere).",
  answer: "ridet",
  explain: "3. Person Singular Präsens Aktiv: ridet."
},

{
  lesson: 1,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 3. Ps. Pl. Ind. Akt. — Welche Form(en) passen?",
  options: ["est", "sunt", "es"],
  correct: ["sunt"],
  explain: "3. Person Plural Präsens Aktiv: sunt."
},
{
  lesson: 1,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Servi ____ (ridere).",
  answer: "rident",
  explain: "3. Person Plural Präsens Aktiv: rident."
},

{
  lesson: 1,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 1. Ps. Pl. Ind. Akt. — Welche Form(en) passen?",
  options: ["ridemus", "rideo", "rident"],
  correct: ["ridemus"],
  explain: "1. Person Plural Präsens Aktiv: ridemus."
},

{
  lesson: 1,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Dominus servum ____ (monere).",
  answer: "monet",
  explain: "3. Person Singular Präsens Aktiv: monet."
},

{
  lesson: 1,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 2. Ps. Pl. Ind. Akt. — Welche Form(en) passen?",
  options: ["tacemus", "rident", "tacetis"],
  correct: ["tacetis"],
  explain: "2. Person Plural Präsens Aktiv: tacetis."
},


{
  lesson: 1,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 1. Ps. Sg. Ind. Akt. — Welche Form passt?",
  options: ["taceo", "tacet", "tacent"],
  correct: ["taceo"],
  explain: "1. Person Singular Präsens Aktiv: taceo."
},
{
  lesson: 1,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Lydus servus ___ . (tacere)",
  answer: "tacet",
  explain: "3. Person Singular Präsens Aktiv: tacet."
},

{
  lesson: 1,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 3. Ps. Sg. Ind. Akt. — Welche Form passt?",
  options: ["sedet", "sedent", "sedeo"],
  correct: ["sedet"],
  explain: "3. Person Singular Präsens Aktiv: sedet."
},

{
  lesson: 1,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Servi domino ___ . (parere)",
  answer: "parent",
  explain: "3. Person Plural Präsens Aktiv: parent."
},


{
  lesson: 1,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 1. Ps. Pl. Ind. Akt. — Welche Form passt?",
  options: ["respondemus", "respondent", "respondeo"],
  correct: ["respondemus"],
  explain: "1. Person Plural Präsens Aktiv: respondemus."
},

{
  lesson: 1,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Lydus linguam ___ . (docere)",
  answer: "docet",
  explain: "3. Person Singular Präsens Aktiv: docet."
},



{
  lesson: 6,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 1. Ps. Sg. Präs. Akt. — Welche Form passt?",
  options: ["habet", "habeo", "habent"],
  correct: ["habeo"],
  explain: "1. Person Singular Präsens Aktiv: habeo."
},
{
  lesson: 6,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Servus tabulam ___ . (habere)",
  answer: "habet",
  explain: "3. Person Singular Präsens Aktiv: habet."
},

{
  lesson: 6,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 3. Ps. Sg. Präs. Akt. — Welche Form passt?",
  options: ["vides", "videt", "vident"],
  correct: ["videt"],
  explain: "3. Person Singular Präsens Aktiv: videt."
},
{
  lesson: 6,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Dominus servum ___ . (videre)",
  answer: "videt",
  explain: "3. Person Singular Präsens Aktiv: videt."
},

{
  lesson: 6,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 3. Ps. Pl. Präs. Akt. — Welche Form passt?",
  options: ["amat", "amant", "amās"],
  correct: ["amant"],
  explain: "3. Person Plural Präsens Aktiv: amant."
},
{
  lesson: 6,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Servi dominum ___ . (videre)",
  answer: "vident",
  explain: "3. Person Plural Präsens Aktiv: vident."
},

{
  lesson: 6,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 2. Ps. Sg. Präs. Akt. — Welche Form passt?",
  options: ["rogat", "rogas", "rogant"],
  correct: ["rogas"],
  explain: "2. Person Singular Präsens Aktiv: rogas."
},
{
  lesson: 6,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Tu magistrum ___ . (rogare)",
  answer: "rogas",
  explain: "2. Person Singular Präsens Aktiv: rogas."
},

{
  lesson: 6,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 1. Ps. Pl. Präs. Akt. — Welche Form passt?",
  options: ["intrant", "intrat", "intramus"],
  correct: ["intramus"],
  explain: "1. Person Plural Präsens Aktiv: intramus."
},
{
  lesson: 6,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Nos scholam ___ . (intrare)",
  answer: "intramus",
  explain: "1. Person Plural Präsens Aktiv: intramus."
},

{
  lesson: 6,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 3. Ps. Sg. Präs. Akt. — Welche Form passt?",
  options: ["parant", "parat", "paras"],
  correct: ["parat"],
  explain: "3. Person Singular Präsens Aktiv: parat."
},
{
  lesson: 6,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Servus cibum ___ . (parare)",
  answer: "parat",
  explain: "3. Person Singular Präsens Aktiv: parat."
},

{
  lesson: 6,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 2. Ps. Pl. Präs. Akt. — Welche Form passt?",
  options: ["vocant", "vocatis", "vocas"],
  correct: ["vocatis"],
  explain: "2. Person Plural Präsens Aktiv: vocatis."
},
{
  lesson: 6,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Vos servum ___ . (vocare)",
  answer: "vocatis",
  explain: "2. Person Plural Präsens Aktiv: vocatis."
},

{
  lesson: 6,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 1. Ps. Sg. Präs. Akt. — Welche Form passt?",
  options: ["laborat", "laboramus", "laboro"],
  correct: ["laboro"],
  explain: "1. Person Singular Präsens Aktiv: laboro."
},
{
  lesson: 6,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Ego in schola ___ . (laborare)",
  answer: "laboro",
  explain: "1. Person Singular Präsens Aktiv: laboro."
},

{
  lesson: 6,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 3. Ps. Pl. Präs. Akt. — Welche Form passt?",
  options: ["pugnat", "pugnatīs", "pugnant"],
  correct: ["pugnant"],
  explain: "3. Person Plural Präsens Aktiv: pugnant."
},
{
  lesson: 6,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Servi amicos ___ . (audire)",
  answer: "audiunt",
  explain: "3. Person Plural Präsens Aktiv: audiunt."
},

{
  lesson: 10,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 3. Ps. Sg. Präs. Akt. — Welche Form passt?",
  options: ["superant", "superat", "superas"],
  correct: ["superat"],
  explain: "3. Person Singular Präsens Aktiv: superat."
},
{
  lesson: 6,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Dominus donum ___ . (videre)",
  answer: "videt",
  explain: "3. Person Singular Präsens Aktiv: videt."
},


{
  lesson: 11,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 1. Ps. Sg. Präs. Akt. — Welche Form passt?",
  options: ["venio", "venit", "veniunt"],
  correct: ["venio"],
  explain: "1. Person Singular Präsens Aktiv: venio."
},
{
  lesson: 11,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Ego ad forum ___ . (venīre)",
  answer: "venio",
  explain: "1. Person Singular Präsens Aktiv: venio."
},

{
  lesson: 11,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 3. Ps. Sg. Präs. Akt. — Welche Form passt?",
  options: ["habitat", "habitant", "habitas"],
  correct: ["habitat"],
  explain: "3. Person Singular Präsens Aktiv: habitat."
},
{
  lesson: 11,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Discipulus in insula ___ . (habitare)",
  answer: "habitat",
  explain: "3. Person Singular Präsens Aktiv: habitat."
},

{
  lesson: 11,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 3. Ps. Pl. Präs. Akt. — Welche Form passt?",
  options: ["exspectant", "exspectat", "exspectas"],
  correct: ["exspectant"],
  explain: "3. Person Plural Präsens Aktiv: exspectant."
},
{
  lesson: 11,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Discipuli ad forum ___ . (exspectare)",
  answer: "exspectant",
  explain: "3. Person Plural Präsens Aktiv: exspectant."
},

{
  lesson: 11,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 1. Ps. Sg. Präs. Akt. — Welche Form passt?",
  options: ["impero", "imperant", "imperas"],
  correct: ["impero"],
  explain: "3. Person Singular Präsens Aktiv: impero."
},
{
  lesson: 11,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Magister ad discipulos ___ . (venire)",
  answer: "venit",
  explain: "3. Person Singular Präsens Aktiv: venit."
},

{
  lesson: 11,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 1. Ps. Sg. Präs. Akt. — Welche Form passt?",
  options: ["desidero", "desiderat", "desiderant"],
  correct: ["desidero"],
  explain: "1. Person Singular Präsens Aktiv: desidero"
},
{
  lesson: 11,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Ego donum ___ . (desiderare)",
  answer: "desidero",
  explain: "1. Person Singular Präsens Aktiv: desidero."
},

{
  lesson: 11,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 2. Ps. Pl. Präs. Akt. — Welche Form passt?",
  options: ["auditis", "audiunt", "audis"],
  correct: ["auditis"],
  explain: "2. Person Plural Präsens Aktiv: auditis."
},
{
  lesson: 11,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Vos verba ___ . (audire)",
  answer: "auditis",
  explain: "2. Person Plural Präsens Aktiv: auditis."
},

{
  lesson: 11,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 1. Ps. Pl. Präs. Akt. — Welche Form passt?",
  options: ["portamus", "portant", "portatis"],
  correct: ["portamus"],
  explain: "1. Person Plural Präsens Aktiv: portamus."
},
{
  lesson: 11,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Nos dona ad forum ___ . (portare)",
  answer: "portamus",
  explain: "1. Person Plural Präsens Aktiv: portamus."
},

{
  lesson: 11,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 1. Ps. Sg. Präs. Akt. — Welche Form passt?",
  options: ["clamo", "clamat", "clamant"],
  correct: ["clamo"],
  explain: "1. Person Singular Präsens Aktiv: clamo."
},
{
  lesson: 11,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Ego in foro ___ . (stare)",
  answer: "sto",
  explain: "1. Person Singular Präsens Aktiv: sto."
},

{
  lesson: 11,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 3. Ps. Pl. Präs. Akt. — Welche Form passt?",
  options: ["dubitas", "dubitat", "dubitant"],
  correct: ["dubitant"],
  explain: "3. Person Plural Präsens Aktiv: dubitant."
},
{
  lesson: 11,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Discipuli de donis ___ . (ridere)",
  answer: "rident",
  explain: "3. Person Plural Präsens Aktiv: rident."
},

{
  lesson: 11,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Merkmale: 2. Ps. Pl. Präs. Akt. — Welche Form passt?",
  options: ["aedificamus", "aedifico", "aedificatis"],
  correct: ["aedificatis"],
  explain: "3. Person Plural Präsens Aktiv: aedificatis."
},
{
  lesson: 11,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Discipuli templos ___ . (aedificare)",
  answer: "aedificant",
  explain: "3. Person Plural Präsens Aktiv: aedificant."
},

{
  lesson: 12,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: 3.Ps.Pl.Präs. — Welche Form passt?",
  options: ["probant", "probat", "probatis"],
  correct: ["probant"],
  explain: "3.Pers.Pl.Präs.: probant."
},

{
  lesson: 12,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: 3.Ps.Sg.Impf. — Welche Form passt?",
  options: ["probat", "probabat", "probavit"],
  correct: ["probabat"],
  explain: "3.Ps.Sg.Impf.: probabat."
},

{
  lesson: 12,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: 1.Ps.Sg.Präs. — Welche Form passt?",
  options: ["indicao", "indico", "indicabam"],
  correct: ["indico"],
  explain: "1.Ps.Sg.Präs.: indico."
},

{
  lesson: 12,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: 1.Ps.Sg.Perf. — Welche Form passt?",
  options: ["indicavi", "indicavam", "indicavo"],
  correct: ["indicavi"],
  explain: "1.Ps.Sg.Perf.: indicavi."
},

{
  lesson: 12,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: 2.Ps.Pl.Impf. — Welche Form passt?",
  options: ["manebas", "manebatis", "manuistis"],
  correct: ["manebatis"],
  explain: "2.Ps.Pl.Impf.: manebatis."
},

{
  lesson: 13,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: 2.Ps.Pl.Perf. — Welche Form passt?",
  options: ["clamavitis", "clamavistis", "clamavisti"],
  correct: ["clamavistis"],
  explain: "2.Ps.Pl.Perf.: clamavistis."
},

{
  lesson: 13,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: 1.Ps.Pl.Perf. — Welche Form passt?",
  options: ["erravimus", "erravabamus", "erramus"],
  correct: ["erravimus"],
  explain: "1.Ps.Pl.Perf.: erravimus."
},

{
  lesson: 13,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: 1.Ps.Pl.Präs. — Welche Form passt?",
  options: ["invenimus", "invenmus", "inveniomus"],
  correct: ["invenimus"],
  explain: "1.Ps.Pl.Präs.: invenimus."
},

{
  lesson: 13,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: 3.Ps.Sg.Präs. — Welche Form passt?",
  options: ["liberat", "liberant", "liberatis"],
  correct: ["liberat"],
  explain: "3.Ps.Sg.Präs.: liberat."
},

{
  lesson: 13,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: 2.Ps.Pl.Präs. — Welche Form passt?",
  options: ["liberas", "lieberatis", "liberatis"],
  correct: ["liberatis"],
  explain: "2.Ps.Pl.Präs.: liberatis."
},

{
  lesson: 14,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: 3.Ps.Pl.Präs. — Welche Form passt?",
  options: ["narrant", "narro", "narram"],
  correct: ["narrant"],
  explain: "3.Ps.Pl.Präs.: narrant."
},


  

{
  lesson: 15,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: 1.Ps.Sg.Präs. — Welche Form passt?",
  options: ["servo", "servatis", "servamus"],
  correct: ["servo"],
  explain: "1.Ps.Sg.Präs.: servo."
},

{
  lesson: 15,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: 3.Ps.Pl.Präs. — Welche Form passt?",
  options: ["servatis", "servamus", "servant"],
  correct: ["servant"],
  explain: "3.Ps.Pl.Präs.: servant."
},

{
  lesson: 15,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: 1.Ps.Sg.Impf. — Welche Form passt?",
  options: ["serbam", "serbabam", "servabam"],
  correct: ["servabam"],
  explain: "1.Ps.Sg.Impf.: servabam."
},

{
  lesson: 15,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: 2.Ps.Pl.Perf. — Welche Form passt?",
  options: ["servistis", "servitis", "servavistis"],
  correct: ["servavistis"],
  explain: "2.Ps.Pl.Perf.: servavistis."
},



{
  lesson: 16,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 16,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 16,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 16,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 16,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 17,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 17,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},


{
  lesson: 17,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 17,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},


{
  lesson: 17,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 18,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 18,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 18,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 18,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 18,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 19,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 19,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 19,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 19,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 19,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 20,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 20,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 20,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 20,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 20,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 21,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 21,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 21,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 21,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 21,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 22,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 22,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 22,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 22,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 22,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 23,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 23,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 23,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 23,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 23,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 24,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 24,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 24,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 24,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 24,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 25,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 25,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 25,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 25,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 25,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},


















    



  ],

  substantive: [
    { lesson: 1, type:"mcq", title:"Wähle die richtige Form aus!",
      prompt:"Angabe: Akk. Sg. — Welche Form(en) passen?",
      options:["puellam","puellae","puella"], correct:["puellam"],
      explain:"Akkusativ Singular von puella: puellam."
    },
    { lesson: 1, type:"input", title:"Setze die passende Form ein!",
      prompt:"Marcus ____ videt. (die Puella, Akk. Sg.)", answer:"puellam",
      explain:"Objekt im Akkusativ Singular: puellam."
    },
  
    



{
  lesson: 1,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Nom. Sg. — Welche Form passt?",
  options: ["puella", "puellam", "puellae"],
  correct: ["puella"],
  explain: "Nominativ Singular: puella."
},
{
  lesson: 1,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "____ ridet. (Puella, Nom. Sg.)",
  answer: "puella",
  explain: "Subjekt im Nominativ Singular: puella."
},

{
  lesson: 1,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Akk. Sg. — Welche Form passt?",
  options: ["serva", "servae", "servam"],
  correct: ["servam"],
  explain: "Akkusativ Singular: servam."
},
{
  lesson: 1,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Dominus ____ monet. (Serva, Akk. Sg.)",
  answer: "servam",
  explain: "Objekt im Akkusativ Singular: servam."
},

{
  lesson: 1,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Dat. Sg. — Welche Form passt?",
  options: ["familia", "familiae", "familiam"],
  correct: ["familiae"],
  explain: "Dativ Singular: familiae."
},
{
  lesson: 1,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Dominus ____ respondet. (Familia, Dat. Sg.)",
  answer: "familiae",
  explain: "Dativobjekt im Singular: familiae."
},

{
  lesson: 1,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Nom. Pl. — Welche Form passt?",
  options: ["servi", "servos", "servorum"],
  correct: ["servi"],
  explain: "Nominativ Plural: servi."
},
{
  lesson: 1,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "____ respondent. (Servus, Nom. Pl.)",
  answer: "servi",
  explain: "Subjekt im Nominativ Plural: servi."
},

{
  lesson: 1,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Akk. Pl. — Welche Form passt?",
  options: ["equos", "equi", "equorum"],
  correct: ["equos"],
  explain: "Akkusativ Plural: equos."
},
{
  lesson: 1,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Servi ____ timent. (Equus, Akk. Pl.)",
  answer: "equos",
  explain: "Objekt im Akkusativ Plural: equos."
},

{
  lesson: 1,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Dat. Pl. — Welche Form passt?",
  options: ["amicis", "amici", "amicos"],
  correct: ["amicis"],
  explain: "Dativ Plural: amicis."
},
{
  lesson: 1,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Servus ____ parere debet. (Amicus, Dat. Pl.)",
  answer: "amicis",
  explain: "Dativobjekt im Plural: amicis."
},

{
  lesson: 1,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Nom. Sg. — Welche Form passt?",
  options: ["dominus", "dominum", "domini"],
  correct: ["dominus"],
  explain: "Nominativ Singular: dominus."
},
{
  lesson: 1,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "____ servum docet. (Dominus, Nom. Sg.)",
  answer: "dominus",
  explain: "Subjekt im Nominativ Singular: dominus."
},

{
  lesson: 1,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Akk. Sg. — Welche Form passt?",
  options: ["silvam", "silva", "silvae"],
  correct: ["silvam"],
  explain: "Akkusativ Singular: silvam."
},
{
  lesson: 1,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Servus ____ videt. (Silva, Akk. Sg.)",
  answer: "silvam",
  explain: "Objekt im Akkusativ Singular: silvam."
},

{
  lesson: 1,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Nom. Pl. — Welche Form passt?",
  options: ["amicae", "amicam", "amicis"],
  correct: ["amicae"],
  explain: "Nominativ Plural: amicae."
},
{
  lesson: 1,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "____ gaudent. (Amica, Nom. Pl.)",
  answer: "amicae",
  explain: "Subjekt im Nominativ Plural: amicae."
},



{
  lesson: 6,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Nom. Sg. — Welche Form passt?",
  options: ["cibus", "cibi", "cibum"],
  correct: ["cibus"],
  explain: "Nominativ Singular: cibus."
},
{
  lesson: 6,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "____ placet. (Cibus, Nom. Sg.)",
  answer: "cibus",
  explain: "Subjekt im Nominativ Singular: cibus."
},

{
  lesson: 6,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Akk. Sg. — Welche Form passt?",
  options: ["aqua", "aquae", "aquam"],
  correct: ["aquam"],
  explain: "Akkusativ Singular: aquam."
},
{
  lesson: 6,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Servus ____ portat. (Aqua, Akk. Sg.)",
  answer: "aquam",
  explain: "Objekt im Akkusativ Singular: aquam."
},

{
  lesson: 6,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Sg. — Welche Form passt?",
  options: ["copiae", "copiam", "copia"],
  correct: ["copiae"],
  explain: "Genitiv Singular: copiae."
},


{
  lesson: 6,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Dat. Sg. — Welche Form passt?",
  options: ["populus", "populo", "populum"],
  correct: ["populo"],
  explain: "Dativ Singular: populo."
},
{
  lesson: 6,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Deus ____ imperat. (Populus, Dat. Sg.)",
  answer: "populo",
  explain: "Dativobjekt im Singular: populo."
},

{
  lesson: 6,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Abl. Sg. — Welche Form passt?",
  options: ["vento", "ventus", "ventum"],
  correct: ["vento"],
  explain: "Ablativ Singular: vento."
},
{
  lesson: 6,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Ventus ____ delet. (aedificium, Akk. Sg.)",
  answer: "aedificium",
  explain: "Akkusativ Singular: aedificium."
},

{
  lesson: 6,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Nom. Pl. — Welche Form passt?",
  options: ["dei", "deos", "deorum"],
  correct: ["dei"],
  explain: "Nominativ Plural: dei."
},
{
  lesson: 6,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "____ populum docent. (Deus, Nom. Pl.)",
  answer: "dei",
  explain: "Subjekt im Nominativ Plural: dei."
},

{
  lesson: 6,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Akk. Pl. — Welche Form passt?",
  options: ["insulas", "insulae", "insularum"],
  correct: ["insulas"],
  explain: "Akkusativ Plural: insulas."
},
{
  lesson: 6,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Populus ____ videt. (Insula, Akk. Pl.)",
  answer: "insulas",
  explain: "Objekt im Akkusativ Plural: insulas."
},

{
  lesson: 6,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["lacrimarum", "lacrimas", "lacrimae"],
  correct: ["lacrimarum"],
  explain: "Genitiv Plural: lacrimarum."
},
{
  lesson: 6,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Sonus ____ movet. (Lacrima, Gen. Pl.)",
  answer: "lacrimarum",
  explain: "Genitiv Plural: lacrimarum."
},

{
  lesson: 6,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Dat. Pl. — Welche Form passt?",
  options: ["fluviis", "fluvii", "fluvios"],
  correct: ["fluviis"],
  explain: "Dativ Plural: fluviis."
},
{
  lesson: 6,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Aqua ____ placet. (Flavius, Dat. Sg.)",
  answer: "Flavio",
  explain: "Dativ Singular: Flavio."
},



{
  lesson: 11,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Nom. Sg. — Welche Form passt?",
  options: ["discipulus", "discipuli", "discipulum"],
  correct: ["discipulus"],
  explain: "Nominativ Singular: discipulus."
},
{
  lesson: 11,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "____ in forum venit. (Discipulus, Nom. Sg.)",
  answer: "discipulus",
  explain: "Subjekt im Nominativ Singular: discipulus."
},

{
  lesson: 11,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Akk. Sg. — Welche Form passt?",
  options: ["forum", "fori", "foro"],
  correct: ["forum"],
  explain: "Akkusativ Singular: forum."
},
{
  lesson: 11,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Discipulus ad ____ venit. (Forum, Akk. Sg.)",
  answer: "forum",
  explain: "Akkusativ Singular: forum."
},

{
  lesson: 11,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Dat. Sg. — Welche Form passt?",
  options: ["dea", "deae", "deam"],
  correct: ["deae"],
  explain: "Dativ Singular: deae."
},
{
  lesson: 11,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Discipulus ____ donum dat. (Dea, Dat. Sg.)",
  answer: "deae",
  explain: "Dativobjekt im Singular: deae."
},

{
  lesson: 11,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Nom. Pl. — Welche Form passt?",
  options: ["dona", "donum", "donorum"],
  correct: ["dona"],
  explain: "Nominativ Plural: dona."
},
{
  lesson: 11,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "____ in basilica sunt. (Donum, Nom. Pl.)",
  answer: "dona",
  explain: "Subjekt im Nominativ Plural: dona."
},

{
  lesson: 11,
  type:"mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Sg. — Welche Form passt?",
  options: ["templi", "templum", "templo"],
  correct: ["templi"],
  explain: "Genitiv Singular: templi."
},
{
  lesson: 11,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Statua in ____ est. (Templum, Abl. Sg.)",
  answer: "templo",
  explain: "Ablativ Singular: templo."
},

{
  lesson: 11,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Abl. Sg. — Welche Form passt?",
  options: ["aedificio", "aedificium", "aedificii"],
  correct: ["aedificio"],
  explain: "Ablativ Singular: aedificio."
},
{
  lesson: 11,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Discipulus ex ____ venit. (Aedificium, Abl. Sg.)",
  answer: "aedificio",
  explain: "Ablativ Singular: aedificio."
},

{
  lesson: 11,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Akk. Pl. — Welche Form passt?",
  options: ["statuae", "statuas", "statuis"],
  correct: ["statuas"],
  explain: "Akkusativ Plural: statuas."
},
{
  lesson: 11,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Discipuli ____ vident. (Statua, Akk. Pl.)",
  answer: "statuas",
  explain: " Akkusativ Plural: statuas."
},

{
  lesson: 11,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Dat. Pl. — Welche Form passt?",
  options: ["discipulis", "discipuli", "discipulos"],
  correct: ["discipulis"],
  explain: "Dativ Plural: discipulis."
},
{
  lesson: 11,
  type: "input",
  title: "Setze die passende Form ein!",
  prompt: "Magister ____ dona indicat. (Discipulus, Dat. Pl.)",
  answer: "discipulis",
  explain: "Dativobjekt im Plural: discipulis."
},

{
  lesson: 11,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 12,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 12,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 12,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 12,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 12,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 13,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 13,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 13,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 13,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 13,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 14,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 14,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 14,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 14,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 14,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 15,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 15,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 15,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 15,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 15,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 16,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 16,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 16,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 16,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 16,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 17,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 17,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 17,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 17,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 17,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 18,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 18,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 18,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 18,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 18,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 19,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 19,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 19,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 19,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 19,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 20,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 20,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 20,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 20,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 20,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 21,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 21,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 21,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 21,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 21,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},

{
  lesson: 22,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 22,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 22,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 22,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 22,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 23,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 23,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 23,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 23,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 23,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 24,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 24,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 24,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 24,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 24,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 25,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 25,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 25,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 25,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},
{
  lesson: 25,
  type: "mcq",
  title: "Wähle die richtige Form aus!",
  prompt: "Angabe: Gen. Pl. — Welche Form passt?",
  options: ["verborum", "verba", "verbis"],
  correct: ["verborum"],
  explain: "Genitiv Plural: verborum."
},











  ],

  satzanalyse: [
  

  {
    lesson: 1,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Prädikat des Satzes!",
    sentence:["Puella","servum","monet."],
    correctTokens:[2],
    hint:"Hinweis: Es gibt genau 1 Prädikat.",
    explain:"Prädikat: monet."
  },

  {
    lesson: 1,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Subjekt des Satzes!",
    sentence:["Servus","dominum","timet."],
    correctTokens:[0],
    hint:"Hinweis: Es gibt genau 1 Subjekt.",
    explain:"Subjekt: servus."
  },

  {
    lesson: 1,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Akkusativobjekt des Satzes!",
    sentence:["Dominus","servam","docet."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Akkusativobjekt.",
    explain:"Akkusativobjekt: servam."
  },

  {
    lesson: 1,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Dativobjekt des Satzes!",
    sentence:["Servus","familiae","parere","debet."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Dativobjekt.",
    explain:"Dativobjekt = familiae."
  },

  {
    lesson: 1,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Prädikat des Satzes!",
    sentence:["Servi","respondent."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Prädikat.",
    explain:"Prädikat: respondent."
  },

  {
    lesson: 1,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Subjekt des Satzes!",
    sentence:["Amicae","gaudent."],
    correctTokens:[0],
    hint:"Hinweis: Es gibt genau 1 Subjekt.",
    explain:"Subjekt = amicae."
  },

  {
    lesson: 1,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Akkusativobjekt des Satzes!",
    sentence:["Servus","equum","tenet."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Akkusativobjekt.",
    explain:"Akkusativobjekt = equum."
  },

  {
    lesson: 1,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Dativobjekt des Satzes!",
    sentence:["Dominus","servo","respondet."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Dativobjekt.",
    explain:"Dativobjekt = servo."
  },

  {
    lesson: 1,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Prädikat des Satzes!",
    sentence:["Familia","in","villa","sedet."],
    correctTokens:[3],
    hint:"Hinweis: Es gibt genau 1 Prädikat.",
    explain:"Prädikat = sedet."
  },

  {
    lesson: 1,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Subjekt des Satzes!",
    sentence:["Dominus","respondet."],
    correctTokens:[0],
    hint:"Hinweis: Es gibt genau 1 Subjekt.",
    explain:"Subjekt = dominus."
  },

  {
    lesson: 1,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Akkusativobjekt des Satzes!",
    sentence:["Servus","gladium","tenet."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Akkusativobjekt.",
    explain:"Akkusativobjekt = gladium."
  },

  {
    lesson: 1,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Dativobjekt des Satzes!",
    sentence:["Servus","domino","parere","debet."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Dativobjekt.",
    explain:"Dativobjekt = domino."
  },

  {
    lesson: 1,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Prädikat des Satzes!",
    sentence:["Servi","tacent."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Prädikat.",
    explain:"Prädikat = tacent."
  },

  {
    lesson: 1,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Subjekt des Satzes!",
    sentence:["Avus","sedet."],
    correctTokens:[0],
    hint:"Hinweis: Es gibt genau 1 Subjekt.",
    explain:"Subjekt = avus."
  },

  {
    lesson: 1,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Akkusativobjekt des Satzes!",
    sentence:["Puella","linguam","docet."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Akkusativobjekt.",
    explain:"Akkusativobjekt = linguam."
  },

  {
    lesson: 1,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Prädikat des Satzes!",
    sentence:["Servus","respondet."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Prädikat.",
    explain:"Prädikat = respondet."
  },

  {
    lesson: 1,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Subjekt des Satzes!",
    sentence:["Familia","gaudet."],
    correctTokens:[0],
    hint:"Hinweis: Es gibt genau 1 Subjekt.",
    explain:"Subjekt = familia."
  },

  {
    lesson: 1,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Akkusativobjekt des Satzes!",
    sentence:["Dominus","servos","monet."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Akkusativobjekt.",
    explain:"Akkusativobjekt = servos."
  },

  {
    lesson: 1,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Dativobjekt des Satzes!",
    sentence:["Dominus","amicis","respondet."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Dativobjekt.",
    explain:"Dativobjekt = amicis."
  },

  {
    lesson: 1,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Prädikat des Satzes!",
    sentence:["Servi","gaudent."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Prädikat.",
    explain:"Prädikat = gaudent."
  },
 

  {
    lesson: 6,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Subjekt des Satzes!",
    sentence:["Populus","cibum","habet."],
    correctTokens:[0],
    hint:"Hinweis: Es gibt genau 1 Subjekt.",
    explain:"Subjekt: populus."
  },

  {
    lesson: 6,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Akkusativobjekt des Satzes!",
    sentence:["Populus","cibum","habet."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Akkusativobjekt.",
    explain:"Akkusativobjekt: cibum."
  },

  {
    lesson: 6,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Prädikat des Satzes!",
    sentence:["Servus","aquam","portat."],
    correctTokens:[2],
    hint:"Hinweis: Es gibt genau 1 Prädikat.",
    explain:"Prädikat: portat."
  },

  {
    lesson: 6,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Subjekt des Satzes!",
    sentence:["Turba","insulam","videt."],
    correctTokens:[0],
    hint:"Hinweis: Es gibt genau 1 Subjekt.",
    explain:"Subjekt = turba."
  },

  {
    lesson: 6,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Akkusativobjekt des Satzes!",
    sentence:["Turba","insulam","videt."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Akkusativobjekt.",
    explain:"Akkusativobjekt = insulam."
  },

  {
    lesson: 6,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Dativobjekt des Satzes!",
    sentence:["Dominus","servo","respondet."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Dativobjekt.",
    explain:"Dativobjekt: servo."
  },

  {
    lesson: 6,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Prädikat des Satzes!",
    sentence:["Dominus","servo","respondet."],
    correctTokens:[2],
    hint:"Hinweis: Es gibt genau 1 Prädikat.",
    explain:"Prädikat = respondet."
  },

  {
    lesson: 6,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Subjekt des Satzes!",
    sentence:["Deus","populo","imperat."],
    correctTokens:[0],
    hint:"Hinweis: Es gibt genau 1 Subjekt.",
    explain:"Subjekt = deus."
  },

  {
    lesson: 6,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Dativobjekt des Satzes!",
    sentence:["Deus","populo","imperat."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Dativobjekt.",
    explain:"Dativobjekt = populo."
  },

  {
    lesson: 6,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Prädikat des Satzes!",
    sentence:["Deus","populo","imperat."],
    correctTokens:[2],
    hint:"Hinweis: Es gibt genau 1 Prädikat.",
    explain:"Prädikat = imperat."
  },





  {
    lesson: 6,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Akkusativobjekt des Satzes!",
    sentence:["Servus","gladium","tenet."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Akkusativobjekt.",
    explain:"Akkusativobjekt = gladium."
  },

  {
    lesson: 6,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Prädikat des Satzes!",
    sentence:["Servus","gladium","tenet."],
    correctTokens:[2],
    hint:"Hinweis: Es gibt genau 1 Prädikat.",
    explain:"Prädikat = tenet."
  },



  {
    lesson: 6,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Subjekt des Satzes!",
    sentence:["Familia","cenam","parat."],
    correctTokens:[0],
    hint:"Hinweis: Es gibt genau 1 Subjekt.",
    explain:"Subjekt = familia."
  },

  {
    lesson: 6,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Akkusativobjekt des Satzes!",
    sentence:["Familia","cenam","parat."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Akkusativobjekt.",
    explain:"Akkusativobjekt = cenam."
  },

  {
    lesson: 6,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Prädikat des Satzes!",
    sentence:["Familia","cenam","parat."],
    correctTokens:[2],
    hint:"Hinweis: Es gibt genau 1 Prädikat.",
    explain:"Prädikat = parat."
  },

  {
    lesson: 6,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Dativobjekt des Satzes!",
    sentence:["Dominus","servis","imperat."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Dativobjekt.",
    explain:"Dativobjekt = servis."
  },

  {
    lesson: 11,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Subjekt des Satzes!",
    sentence:["Discipulus","hodie","forum","videt."],
    correctTokens:[0],
    hint:"Hinweis: Es gibt genau 1 Subjekt.",
    explain:"Subjekt: discipulus."
  },

  {
    lesson: 11,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Prädikat des Satzes!",
    sentence:["Discipulus","hodie","forum","videt."],
    correctTokens:[3],
    hint:"Hinweis: Es gibt genau 1 Prädikat.",
    explain:"Prädikat: videt."
  },

  {
    lesson: 11,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Akkusativobjekt des Satzes!",
    sentence:["Discipulus","hodie","forum","videt."],
    correctTokens:[2],
    hint:"Hinweis: Es gibt genau 1 Akkusativobjekt.",
    explain:"Akkusativobjekt: forum."
  },

  {
    lesson: 11,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Dativobjekt des Satzes!",
    sentence:["Discipulus","deae","donum","dat."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Dativobjekt.",
    explain:"Dativobjekt: deae."
  },

  {
    lesson: 11,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Genitivobjekt des Satzes!",
    sentence:["Statua","deae","in","templo","est."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Genitiv.",
    explain:"Genitiv: deae."
  },

  {
    lesson: 11,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Subjekt des Satzes!",
    sentence:["Statua","in","templo","stat."],
    correctTokens:[0],
    hint:"Hinweis: Es gibt genau 1 Subjekt.",
    explain:"Subjekt = statua."
  },

  {
    lesson: 11,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Prädikat des Satzes!",
    sentence:["Statua","in","templo","stat."],
    correctTokens:[3],
    hint:"Hinweis: Es gibt genau 1 Prädikat.",
    explain:"Prädikat = stat."
  },

  {
    lesson: 11,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere den Ablativ des Satzes!",
    sentence:["Discipulus","cum","amico","in","foro","manet."],
    correctTokens:[2,4],
    hint:"Hinweis: Es gibt genau 2 Ablative.",
    explain:"Ablativ = amico, foro"
  },

  {
    lesson: 11,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Prädikat des Satzes!",
    sentence:["Discipulus","cum","amico","in","foro","manet."],
    correctTokens:[5],
    hint:"Hinweis: Es gibt genau 1 Prädikat.",
    explain:"Prädikat = manet."
  },

  {
    lesson: 11,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Subjekt des Satzes!",
    sentence:["Discipuli","in","basilica","verba","audiunt."],
    correctTokens:[0],
    hint:"Hinweis: Es gibt genau 1 Subjekt.",
    explain:"Subjekt = discipuli."
  },

  {
    lesson: 11,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Akkusativobjekt des Satzes!",
    sentence:["Discipuli","in","basilica","verba","audiunt."],
    correctTokens:[3],
    hint:"Hinweis: Es gibt genau 1 Akkusativobjekt.",
    explain:"Akkusativobjekt = verba."
  },

  {
    lesson: 11,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Prädikat des Satzes!",
    sentence:["Discipuli","in","basilica","verba","audiunt."],
    correctTokens:[4],
    hint:"Hinweis: Es gibt genau 1 Prädikat.",
    explain:"Prädikat = audiunt."
  },

  {
    lesson: 11,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Dativobjekt des Satzes!",
    sentence:["Discipulus","magistro","consilium","indicat."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Dativobjekt.",
    explain:"Dativobjekt = magistro."
  },

  {
    lesson: 11,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Akkusativobjekt des Satzes!",
    sentence:["Discipulus","magistro","consilium","indicat."],
    correctTokens:[2],
    hint:"Hinweis: Es gibt genau 1 Akkusativobjekt.",
    explain:"Akkusativobjekt = consilium."
  },




  {
    lesson: 11,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Subjekt des Satzes!",
    sentence:["Discipuli","donum","deae","dant."],
    correctTokens:[0],
    hint:"Hinweis: Es gibt genau 1 Subjekt.",
    explain:"Subjekt = discipuli."
  },

  {
    lesson: 11,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Dativobjekt des Satzes!",
    sentence:["Discipuli","donum","deae","dant."],
    correctTokens:[2],
    hint:"Hinweis: Es gibt genau 1 Dativobjekt.",
    explain:"Dativobjekt = deae."
  },

  {
    lesson: 11,
    type:"analysis",
    title:"Satzanalyse",
    prompt:"Markiere das Akkusativobjekt des Satzes!",
    sentence:["Discipuli","donum","deae","dant."],
    correctTokens:[1],
    hint:"Hinweis: Es gibt genau 1 Akkusativobjekt.",
    explain:"Akkusativobjekt = donum."
  }




]





   
  
  
  
};

// ====== Deck-System ======
const DECK_KEY_PREFIX = "latinTrainerDeck_";

function loadDeck(mode, totalCount){
  const key = DECK_KEY_PREFIX + mode;
  let deck = [];
  try{ deck = JSON.parse(localStorage.getItem(key) || "[]"); }catch{ deck = []; }

  if(!Array.isArray(deck) || deck.length === 0){
    deck = Array.from({length: totalCount}, (_,i)=>i);
    shuffleInPlace(deck);
    localStorage.setItem(key, JSON.stringify(deck));
  }

  deck = deck.filter(i => Number.isInteger(i) && i >= 0 && i < totalCount);

  if(deck.length === 0){
    deck = Array.from({length: totalCount}, (_,i)=>i);
    shuffleInPlace(deck);
  }

  localStorage.setItem(key, JSON.stringify(deck));
  return deck;
}

function saveDeck(mode, deck){
  const key = DECK_KEY_PREFIX + mode;
  localStorage.setItem(key, JSON.stringify(deck));
}

function drawFromDeck(mode, count){
  const baseAll = gameData[mode] || [];
  const selectedLessons = new Set(loadSelectedLessons());

  if(selectedLessons.size === 0) return [];

  const base = baseAll.filter(t => selectedLessons.has(Number(t.lesson)));
  const total = base.length;
  if(total === 0) return [];

  
  const selKey = Array.from(selectedLessons).sort((a,b)=>a-b).join("-");
  const key = DECK_KEY_PREFIX + mode + "_" + selKey;

  let deck = [];
  try{ deck = JSON.parse(localStorage.getItem(key) || "[]"); }catch{ deck = []; }

  if(!Array.isArray(deck) || deck.length === 0){
    deck = Array.from({length: total}, (_,i)=>i);
    shuffleInPlace(deck);
    localStorage.setItem(key, JSON.stringify(deck));
  }

  deck = deck.filter(i => Number.isInteger(i) && i >= 0 && i < total);

  if(deck.length < count){
    deck = Array.from({length: total}, (_,i)=>i);
    shuffleInPlace(deck);
  }

  const pickedIdx = deck.slice(0, count);
  const remaining = deck.slice(count);
  localStorage.setItem(key, JSON.stringify(remaining));

  return pickedIdx.map(i => base[i]);
}


// ====== Game State ======
let currentMode = null;
let rounds = [];
let roundIndex = 0;
let injuries = 0;
let streak = 0;

let selected = new Set();
let selectedTokens = new Set();
let lastSolution = { answer: "", explain: "" };

// ====== Render Trainer ======
function startMode(mode){
  if(mode === "arena"){ tryStartArena(); return; }
    if(loadSelectedLessons().length === 0){
    alert("Bitte wähle mindestens eine Lektion aus.");
    return;
  }


  currentMode = mode;
  roundIndex = 0;
  injuries = 0;
  streak = 0;
  $("#streakValue").textContent = "0";

  markPracticeDay();

  if(mode === "verben" || mode === "substantive"){
    rounds = drawFromDeck(mode, 5);
  } else {
    const count = Math.min(6, gameData.satzanalyse.length);
    rounds = drawFromDeck("satzanalyse", count);
  }

  $("#modeTitle").textContent =
    mode === "verben" ? "Verben"
    : mode === "substantive" ? "substantive"
    : "Satzanalyse";

  $("#injuryNow").textContent = "0";
  $("#roundNow").textContent = "1";
  $("#roundTotal").textContent = String(rounds.length);

  showScreen("#screen-game");
  renderRound();
}

function renderRound(){
  clearFeedback();
  selected.clear();
  selectedTokens.clear();
  const ui = $("#userInput");
  if(ui) ui.value = "";

  const r = rounds[roundIndex];
  $("#roundNow").textContent = String(roundIndex + 1);
  $("#taskTypeTitle").textContent = r.title;

  $("#mcqArea").classList.add("hidden");
  $("#inputArea").classList.add("hidden");
  $("#analysisArea").classList.add("hidden");

  if(r.type === "mcq"){
    $("#mcqArea").classList.remove("hidden");
    $("#mcqPrompt").textContent = r.prompt;

    const wrap = $("#mcqOptions");
    wrap.innerHTML = "";

    r.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "optionBtn";
      btn.type = "button";
      btn.textContent = opt;

      btn.addEventListener("click", () => {
        if(selected.has(opt)){
          selected.delete(opt);
          btn.classList.remove("isSelected");
        } else {
          selected.add(opt);
          btn.classList.add("isSelected");
        }
      });

      wrap.appendChild(btn);
    });

  } else if(r.type === "input"){
    $("#inputArea").classList.remove("hidden");
    $("#inputPrompt").textContent = r.prompt;

  } else if(r.type === "analysis"){
    $("#analysisArea").classList.remove("hidden");
    $("#analysisPrompt").textContent = r.prompt;

    const sentenceEl = $("#analysisSentence");
    sentenceEl.innerHTML = "";

    r.sentence.forEach((tok, idx) => {
      const span = document.createElement("span");
      span.className = "token";
      span.textContent = tok;

      span.addEventListener("click", () => {
        if(selectedTokens.has(idx)){
          selectedTokens.delete(idx);
          span.classList.remove("isSelected");
        } else {
          selectedTokens.add(idx);
          span.classList.add("isSelected");
        }
      });

      sentenceEl.appendChild(span);
    });

    $("#analysisHint").textContent = r.hint || "";
  }
}

// ====== Win/Lose ======
function loseTrainer(){
  const old = getLevel();
  const newLvl = setLevel(old - 1);

  const sb = $("#solutionBox");
  if(sb) sb.style.display = "block";
  const sa = $("#solutionAnswer");
  const se = $("#solutionExplain");
  if(sa) sa.textContent = lastSolution.answer || "—";
  if(se) se.textContent = lastSolution.explain || "";

  const lt = $("#loseText");
  if(lt){
    lt.innerHTML =
      `Du hast zu viele Verletzungen erlitten. 😕<br>` +
      `Du steigst 1 Level ab.<br>` +
      `<strong>Neue Stufe: ${newLvl}</strong>`;
  }

  showScreen("#screen-lose");
}

function maybeAwardTicket(level){
  if(level % 5 === 0) setTickets(getTickets() + 1);
}

function maybeAwardBadge(level){
  const badge = badgeForLevel(level);
  if(!badge) return;

  const lastShown = Number(localStorage.getItem(BADGE_LAST_KEY) || "0");
  const currentBadgeLevel = Math.floor(level / 10) * 10;

  if(currentBadgeLevel > lastShown){
    localStorage.setItem(BADGE_LAST_KEY, String(currentBadgeLevel));
    setTopBadgeTitle(badge.title);
    showBadgeOverlay(badge.title, badge.emoji);
  } else {
    setTopBadgeTitle(localStorage.getItem(BADGE_TITLE_KEY) || "—");
  }
}

function winTrainer(){
  const old = getLevel();
  const newLvl = setLevel(old + 1);

  maybeAwardTicket(newLvl);
  maybeAwardBadge(newLvl);

  const wt = $("#winText");
  if(wt){
    wt.innerHTML =
      `Du bist 1 Level aufgestiegen! 🎉<br>` +
      `<strong>Neue Stufe: ${newLvl}</strong><br>` +
      `Du kannst stolz auf deine Lateinkenntnisse sein!`;
  }

  const sb = $("#solutionBox");
  if(sb) sb.style.display = "none";

  showScreen("#screen-win");
}

function addInjuryAndMaybeLose(){
  injuries += 1;
  $("#injuryNow").textContent = String(injuries);
  streak = 0;
  $("#streakValue").textContent = String(streak);
  if(injuries >= 2) loseTrainer();
}

function nextRound(){
  roundIndex += 1;
  if(roundIndex >= rounds.length) winTrainer();
  else renderRound();
}

// ====== Checks + Stats + Mistakes ======
function captureSolution(r){
  if(!r) return;
  if(r.type === "mcq"){
    lastSolution.answer = (r.correct || []).join(", ");
    lastSolution.explain = r.explain || "";
  } else if(r.type === "input"){
    lastSolution.answer = r.answer || "";
    lastSolution.explain = r.explain || "";
  } else if(r.type === "analysis"){
    lastSolution.answer = "Richtig markiert: " + (r.correctTokens || []).join(", ");
    lastSolution.explain = r.explain || "";
  }
}

function setEqSet(aSet, bSet){
  if(aSet.size !== bSet.size) return false;
  for(const x of aSet) if(!bSet.has(x)) return false;
  return true;
}

function incStats(mode, type, ok){
  const st = loadStats();
  if(!st[mode]) st[mode] = {};
  if(!st[mode][type]) st[mode][type] = { attempts:0, wrong:0 };

  st[mode][type].attempts += 1;
  if(!ok) st[mode][type].wrong += 1;

  saveStats(st);
}

function checkMcq(){
  const r = rounds[roundIndex];
  captureSolution(r);
  markPracticeDay();

  const correctSet = new Set(r.correct || []);
  const ok = setEqSet(selected, correctSet);

  incStats(currentMode, "mcq", ok);

  if(ok){
    streak += 1;
    $("#streakValue").textContent = String(streak);
    setFeedback("Richtig! ✅", true);
    setTimeout(nextRound, 450);
  } else {
    addMistake(currentMode, r);
    setFeedback("Leider falsch. ❌ Versuch es nochmal!", false);
    selected.clear();
    $$("#mcqOptions .optionBtn").forEach(b => b.classList.remove("isSelected"));
    addInjuryAndMaybeLose();
  }
  updateMistakeCount();
}

function checkInput(){
  const r = rounds[roundIndex];
  captureSolution(r);
  markPracticeDay();

  const typed = normalize($("#userInput").value);
  const ans = normalize(r.answer);
  const ok = !!typed && typed === ans;

  incStats(currentMode, "input", ok);

  if(ok){
    streak += 1;
    $("#streakValue").textContent = String(streak);
    setFeedback("Richtig! ✅", true);
    setTimeout(nextRound, 450);
  } else {
    addMistake(currentMode, r);
    setFeedback("Leider falsch. ❌ Versuch es nochmal!", false);
    const ui = $("#userInput");
    if(ui){
      ui.value = "";
      ui.focus();
    }
    addInjuryAndMaybeLose();
  }
  updateMistakeCount();
}

function checkAnalysis(){
  const r = rounds[roundIndex];
  captureSolution(r);
  markPracticeDay();

  const correct = new Set(r.correctTokens || []);
  const ok = setEqSet(selectedTokens, correct);

  incStats(currentMode, "analysis", ok);

  if(ok){
    streak += 1;
    $("#streakValue").textContent = String(streak);
    setFeedback("Richtig markiert! ✅", true);
    setTimeout(nextRound, 450);
  } else {
    addMistake(currentMode, r);
    setFeedback("Nicht ganz. ❌ Versuch es nochmal!", false);
    selectedTokens.clear();
    $$("#analysisSentence .token").forEach(t => t.classList.remove("isSelected"));
    addInjuryAndMaybeLose();
  }
  updateMistakeCount();
}

// ====== Navigation Buttons ======
$("#btnToRules")?.addEventListener("click", () => showScreen("#screen-rules"));
$("#btnToMenu")?.addEventListener("click", () => showScreen("#screen-menu"));

$("#btnToggleLessons")?.addEventListener("click", () => {
  $("#lessonPanel")?.classList.toggle("hidden");
});

$("#btnLessonsAll")?.addEventListener("click", () => { saveSelectedLessons(allLessons()); renderLessonChips(); });
$("#btnLessonsNone")?.addEventListener("click", () => { saveSelectedLessons([]); renderLessonChips(); });
$("#btnLessons14")?.addEventListener("click", () => setLessonsRange(1,5));
$("#btnLessons58")?.addEventListener("click", () => setLessonsRange(6,10));
$("#btnLessons914")?.addEventListener("click", () => setLessonsRange(11,15));
$("#btnLessons1520")?.addEventListener("click", () => setLessonsRange(16,20));
$("#btnLessons2025")?.addEventListener("click", () => setLessonsRange(21,25));
$("#btnLessons2530")?.addEventListener("click", () => setLessonsRange(26,30));
$("#btnLessons3037")?.addEventListener("click", () => setLessonsRange(31,37));


$$("[data-mode]").forEach(btn => btn.addEventListener("click", () => startMode(btn.dataset.mode)));

$("#btnBackToMenu")?.addEventListener("click", () => showScreen("#screen-menu"));
$("#btnLoseToMenu")?.addEventListener("click", () => {
  const sb = $("#solutionBox");
  if(sb) sb.style.display = "none";
  showScreen("#screen-menu");
});
$("#btnWinToMenu")?.addEventListener("click", () => showScreen("#screen-menu"));

$("#btnCheckMcq")?.addEventListener("click", checkMcq);
$("#btnCheckInput")?.addEventListener("click", checkInput);
$("#btnCheckAnalysis")?.addEventListener("click", checkAnalysis);

// ====== Hold-to-Reset ======
let resetTimer = null;
let isHoldingReset = false;

function doReset(){
  localStorage.setItem(LEVEL_KEY, "1");
  localStorage.setItem(TICKET_KEY, "0");

  Object.keys(localStorage).forEach(k => {
    if(k.startsWith(DECK_KEY_PREFIX)) localStorage.removeItem(k);
  });

  localStorage.removeItem(ARENA_INDEX_KEY);

  localStorage.removeItem(STATS_KEY);
  localStorage.removeItem(PRACTICE_DAYS_KEY);
  localStorage.removeItem(MISTAKES_KEY);
  localStorage.removeItem(BADGE_LAST_KEY);
  localStorage.removeItem(BADGE_TITLE_KEY);

  localStorage.removeItem(ARENA_HS_KEY);
  localStorage.removeItem(TEACHER_PIN_KEY);
  localStorage.removeItem(TEACHER_UNLOCK_KEY);

  localStorage.removeItem(ANKI_SELECTED_LESSONS_KEY);
localStorage.removeItem(ANKI_PROGRESS_KEY);
localStorage.removeItem(ANKI_CUSTOM_DECKS_KEY);
localStorage.removeItem(ANKI_CUSTOM_CARDS_KEY);
localStorage.removeItem(ANKI_PRACTICE_DAYS_KEY);

  setLevel(1);
  setTickets(0);
  setTopBadgeTitle("—");
  updateMistakeCount();
  hideBadgeOverlay();
  updateArenaHighscoreUI();

  alert("Fortschritt zurückgesetzt. Stufe = 1, Tickets = 0.");
}

const resetBtn = $("#btnResetLevel");
if(resetBtn){
  const startHold = () => {
    isHoldingReset = true;
    resetTimer = setTimeout(() => {
      if(isHoldingReset) doReset();
    }, 1200);
  };
  const endHold = () => {
    isHoldingReset = false;
    clearTimeout(resetTimer);
  };

  resetBtn.addEventListener("pointerdown", startHold);
  resetBtn.addEventListener("pointerup", endHold);
  resetBtn.addEventListener("pointerleave", endHold);

  resetBtn.addEventListener("mousedown", startHold);
  resetBtn.addEventListener("mouseup", endHold);
  resetBtn.addEventListener("mouseleave", endHold);
  resetBtn.addEventListener("touchstart", startHold, {passive:true});
  resetBtn.addEventListener("touchend", endHold);
}

// ====== Arena (Tickets + Targets) ======
const arenaTargets = [
  { title: "Sammle alle Akk. Sg.-Formen ein!", correctForms: ["puellam","servum","donum"] },
  { title: "Sammle alle Nom. Sg.-Formen ein!", correctForms: ["puella","amicus","donum"] },
  { title: "Sammle alle Gen. Pl.-Formen ein!", correctForms: ["puellarum","amicorum","donorum"] },
  { title: "Sammle alle 1. Ps. Sg.-Formen ein!", correctForms: ["amo","ludo","deleo","venio"] },

  { title: "Sammle alle Akk. Sg.-Formen ein!", correctForms: ["puellam","servum","donum","aquam"] },
  { title: "Sammle alle Nom. Sg.-Formen ein!", correctForms: ["puella","servus","dominus","amicus"] },
  { title: "Sammle alle Dat. Sg.-Formen ein!", correctForms: ["puellae","servo","domino","amico"] },
  { title: "Sammle alle Abl. Sg.-Formen ein!", correctForms: ["amico","aedificio","templo","foro"] },
  { title: "Sammle alle Gen. Sg.-Formen ein!", correctForms: ["templi","aedificii","verbi","populi"] },

  
  { title: "Sammle alle Nom. Pl.-Formen ein!", correctForms: ["servi","amicae","dona","discipuli"] },
  { title: "Sammle alle Akk. Pl.-Formen ein!", correctForms: ["equos","insulas","statuas","deos"] },
  { title: "Sammle alle Dat./Abl. Pl.-Formen ein!", correctForms: ["amicis","discipulis","fluviis"] },
  { title: "Sammle alle Gen. Pl.-Formen ein!", correctForms: ["puellarum","amicorum","donorum"] },


  { title: "Sammle alle 1. Ps. Sg.-Formen ein!", correctForms: ["habeo","laboro","venio","desidero"] },
  { title: "Sammle alle 2. Ps. Sg.-Formen ein!", correctForms: ["rogas","spectas","audis"] },
  { title: "Sammle alle 3. Ps. Sg.-Formen ein!", correctForms: ["habet","videt","parat","superat"] },
  { title: "Sammle alle 1. Ps. Pl.-Formen ein!", correctForms: ["intramus","portamus","respondemus"] },
  { title: "Sammle alle 2. Ps. Pl.-Formen ein!", correctForms: ["vocatis","auditis","videtis", "amatis"] },
  { title: "Sammle alle 3. Ps. Pl.-Formen ein!", correctForms: ["amant","pugnant","dubitant","exspectant"] }


];

function getArenaIndex(){
  return Number(localStorage.getItem(ARENA_INDEX_KEY) || "0");
}
function setArenaIndex(v){
  const safe = Math.max(0, Number(v) || 0);
  localStorage.setItem(ARENA_INDEX_KEY, String(safe));
  return safe;
}
function nextArenaTarget(){
  let idx = getArenaIndex();
  if(idx >= arenaTargets.length) idx = 0;
  const t = arenaTargets[idx];
  setArenaIndex(idx + 1);
  return t;
}

function updateArenaButton(){
  const t = getTickets();
  const btn = $("#btnArena") || document.querySelector('[data-mode="arena"]');
  if(!btn) return;
  btn.disabled = t <= 0;
  btn.textContent = t > 0 ? `🛡️ Arena (Ticket: ${t})` : "🛡️ Arena (kein Ticket)";
}
updateArenaButton();

// ====== Arena Highscore ======
function getArenaHighscore(){
  return Number(localStorage.getItem(ARENA_HS_KEY) || "0");
}
function setArenaHighscore(v){
  const safe = Math.max(0, Number(v) || 0);
  localStorage.setItem(ARENA_HS_KEY, String(safe));
  updateArenaHighscoreUI();
  return safe;
}
function updateArenaHighscoreUI(){
  const el = $("#arenaHighscoreTop");
  if(el) el.textContent = `🏆 Highscore: ${getArenaHighscore()}`;
}
updateArenaHighscoreUI();

function tryStartArena(){
  if(getTickets() <= 0){
    alert("Du hast kein Ticket. Du bekommst 1 Ticket pro 5 Level!");
    return;
  }
  setTickets(getTickets() - 1);
  startArena();
}

function buildArenaTokenPool(targetCorrectSet){
  const mcqPool = [...gameData.verben, ...gameData.substantive].filter(x => x.type === "mcq");
  const allOptions = mcqPool.flatMap(x => x.options || []);
  const unique = Array.from(new Set(allOptions));
  const correct = Array.from(targetCorrectSet);
  return Array.from(new Set([...unique, ...correct]));
}

let arena = {
  running:false,
  time:30,
  lives:5,
  score:0,
  combo:1,
  target:null,
  targetCorrectSet:new Set(),
  tokenPool:[],
  drops:[],
  player:{ x:260, w:120, h:22, y:318, speed:12 },
  spawnHandle:null,
  rafHandle:null,
  timerInterval:null,
  pointerActive:false,
};

function spawnDrop(canvasWidth){
  const pCorrect = 0.5; 

  const useCorrect =
    Math.random() < pCorrect && arena.correctTokens.length > 0;

  const list = useCorrect ? arena.correctTokens : arena.wrongTokens;
  if(!list || list.length === 0) return;

  const token = list[Math.floor(Math.random() * list.length)];
  const r = Math.max(24, Math.min(42, 12 + token.length * 3));

  arena.drops.push({
    text: token,
    x: Math.random() * (canvasWidth - 60) + 30,
    y: -30,
    vy: 2.6 + Math.random()*1.9,
    r
  });
}


function startArena(){
  markPracticeDay();

  const target = nextArenaTarget();
  arena.target = target;

  arena.running = true;
  arena.time = 30;
  arena.lives = 5;
  arena.score = 0;
  arena.combo = 1;
  arena.drops = [];
  arena.player.x = 260;

  arena.targetCorrectSet = new Set(target.correctForms.map(normalize));
  arena.correctTokens = Array.from(arena.targetCorrectSet).map(normalize);

const fullPool = buildArenaTokenPool(arena.targetCorrectSet).map(normalize);
arena.wrongTokens = fullPool.filter(t => !arena.targetCorrectSet.has(t));

  arena.tokenPool = buildArenaTokenPool(arena.targetCorrectSet);

  $("#arenaTime").textContent = String(arena.time);
  $("#arenaLives").textContent = String(arena.lives);
  $("#arenaScore").textContent = String(arena.score);
  $("#arenaCombo").textContent = String(arena.combo);
  $("#arenaTarget").textContent = target.title;
  $("#arenaFeedback").textContent = "Sammle richtige Formen ein – weiche falschen aus!";

  updateArenaHighscoreUI();

  showScreen("#screen-arena");

  const canvas = $("#arenaCanvas");
  const ctx = canvas.getContext("2d");

  function clampPlayer(){
    arena.player.x = Math.max(arena.player.w/2, Math.min(canvas.width - arena.player.w/2, arena.player.x));
  }

  function onKey(e){
    if(!arena.running) return;
    if(e.key === "ArrowLeft") arena.player.x -= arena.player.speed;
    if(e.key === "ArrowRight") arena.player.x += arena.player.speed;
    clampPlayer();
  }

  function canvasXFromEvent(e){
    const rect = canvas.getBoundingClientRect();
    return (e.clientX - rect.left) * (canvas.width / rect.width);
  }

  function onPointerDown(e){
    if(!arena.running) return;
    arena.pointerActive = true;
    canvas.setPointerCapture?.(e.pointerId);
    arena.player.x = canvasXFromEvent(e);
    clampPlayer();
  }
  function onPointerMove(e){
    if(!arena.running) return;
    if(!arena.pointerActive) return;
    arena.player.x = canvasXFromEvent(e);
    clampPlayer();
  }
  function onPointerUp(){
    arena.pointerActive = false;
  }

  window.addEventListener("keydown", onKey);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerUp);

  function endArena(msg){
    arena.running = false;

    const hs = getArenaHighscore();
    if(arena.score > hs){
      setArenaHighscore(arena.score);
      $("#arenaFeedback").textContent = `${msg} (Punkte: ${arena.score}) — 🏆 Neuer Highscore!`;
    } else {
      $("#arenaFeedback").textContent = `${msg} (Punkte: ${arena.score})`;
    }

    clearInterval(arena.spawnHandle);
    clearInterval(arena.timerInterval);

    window.removeEventListener("keydown", onKey);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerUp);
    canvas.removeEventListener("pointerleave", onPointerUp);

    updateArenaHighscoreUI();
  }

  function update(){
    arena.drops.forEach(d => d.y += d.vy);

    arena.drops = arena.drops.filter(d => {
      const px1 = arena.player.x - arena.player.w/2;
      const px2 = arena.player.x + arena.player.w/2;
      const py1 = arena.player.y;
      const py2 = arena.player.y + arena.player.h;

      const hit = (d.x >= px1 && d.x <= px2 && d.y + d.r >= py1 && d.y - d.r <= py2);

      if(hit){
        const tok = normalize(d.text);
        if(arena.targetCorrectSet.has(tok)){
          const add = arena.combo;
          arena.score += add;
          arena.combo = Math.min(9, arena.combo + 1);
          $("#arenaFeedback").textContent = `✅ Richtig! +${add}`;
        } else {
          arena.lives -= 1;
          arena.combo = 1;
          $("#arenaLives").textContent = String(arena.lives);
          $("#arenaFeedback").textContent = "❌ Falsch! Leben -1";
        }
        $("#arenaScore").textContent = String(arena.score);
        $("#arenaCombo").textContent = String(arena.combo);
        return false;
      }

      return d.y < canvas.height + 50;
    });

    if(arena.lives <= 0) endArena("Schade 😕 — keine Leben mehr!");
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width, canvas.height);

    ctx.font = "40px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🛡️", arena.player.x, arena.player.y + 10);

    ctx.font = "16px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    arena.drops.forEach(d => {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      ctx.stroke();
      ctx.fillText(d.text, d.x, d.y);
    });

    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = "12px system-ui";
    ctx.fillText(target.title, 10, 10);
  }

  function loop(){
    if(!arena.running) return;
    update();
    draw();
    arena.rafHandle = requestAnimationFrame(loop);
  }

  arena.timerInterval = setInterval(() => {
    if(!arena.running) return;
    arena.time -= 1;
    $("#arenaTime").textContent = String(arena.time);
    if(arena.time <= 0) endArena("⏱️ Zeit vorbei!");
  }, 1000);

  arena.spawnHandle = setInterval(() => {
    if(arena.running) spawnDrop(canvas.width);
  }, 650);

  $("#btnArenaExit").onclick = () => {
    arena.running = false;
    clearInterval(arena.spawnHandle);
    clearInterval(arena.timerInterval);
    showScreen("#screen-menu");
  };

  loop();
}

// ====== Statistik Screen ======
function pct(wrong, attempts){
  if(attempts <= 0) return 0;
  return Math.round((wrong/attempts)*100);
}

function statLabel(key){
  return {
    mcq: "Auswahlaufgaben",
    input: "Lückentexte",
    analysis: "Satzanalyse"
  }[key] || key;
}


function statBlock(title, obj){
  const entries = Object.entries(obj || {});
  if(entries.length === 0) return `<h3>${title}</h3><p>Keine Daten.</p>`;

  const rows = entries.map(([k,v]) => {
    const a = v.attempts || 0;
    const w = v.wrong || 0;
    return `<li><strong>${statLabel(k)}</strong>
: ${w} Fehler bei ${a} Versuchen (${pct(w,a)}%)</li>`;
  }).join("");

  let worst = null;
  let best = null;
  entries.forEach(([k,v])=>{
    const a=v.attempts||0, w=v.wrong||0;
    if(a<=0) return;
    const rate = w/a;
    if(!worst || rate > worst.rate) worst = {k, rate, a, w};
    if(!best || rate < best.rate) best = {k, rate, a, w};
  });

  const worstText = worst
    ? `Am schwierigsten wirkt <strong>${statLabel(worst.k)}</strong> (${pct(worst.w, worst.a)}% Fehler).`
    : `Noch nicht genug Daten für „schwierig“.`;

  const bestText = best
    ? `Am besten sitzt <strong>${statLabel(best.k)}</strong>  (${pct(best.w, best.a)}% Fehler).`
    : `Noch nicht genug Daten für „stark“.`;

  const hint =
    worst?.k === "Auswahl" ? "Tipp"
    : worst?.k === "Einsetzen" ? "Tipp"
    : worst?.k === "Satzanalyse" ? "Tipp"
    : "";

  return `
    <h3>${title}</h3>
    <ul>${rows}</ul>
    <p>${worstText}<br>${bestText}</p>
    ${hint ? `<p><strong>${hint}</strong></p>` : ``}
  `;
}

function openStats(){
  const st = loadStats();
  $("#statsDays").textContent = String(getPracticeDaysCount());

  const html = `
    ${statBlock("Verben", st.verben)}
    <hr style="border:none;border-top:2px solid rgba(0,0,0,0.06); margin:12px 0;">
    ${statBlock("Substantive", st.substantive)}
    <hr style="border:none;border-top:2px solid rgba(0,0,0,0.06); margin:12px 0;">
    ${statBlock("Satzanalyse", st.satzanalyse)}
  `;
  $("#statsBox").innerHTML = html;

  showScreen("#screen-stats");
}

$("#btnStats")?.addEventListener("click", openStats);
$("#btnStatsBack")?.addEventListener("click", () => showScreen("#screen-menu"));

// ====== Fehler üben Screen ======
let mistakesQueue = [];
let mistakeIndex = 0;

let mSelected = new Set();
let mSelectedTokens = new Set();

function openMistakes(){
  mistakesQueue = loadMistakes();
  mistakeIndex = 0;

  if(mistakesQueue.length === 0){
    $("#mistakesHint").innerHTML = "Aktuell hast du keine gespeicherten Fehler. 🎉";
    $("#mistakesTitle").textContent = "—";
    $("#mistakesFeedback").textContent = "";
    $("#mistakesMcqArea").classList.add("hidden");
    $("#mistakesInputArea").classList.add("hidden");
    $("#mistakesAnalysisArea").classList.add("hidden");
    showScreen("#screen-mistakes");
    return;
  }

  $("#mistakesHint").innerHTML =
    `Du hast <strong>${mistakesQueue.length}</strong> Fehler-Aufgabe(n). Löse sie hier richtig, dann verschwinden sie.`;

  showScreen("#screen-mistakes");
  renderMistake();
}

function renderMistake(){
  $("#mistakesFeedback").textContent = "";
  mSelected.clear();
  mSelectedTokens.clear();
  $("#mistakesUserInput") && ($("#mistakesUserInput").value = "");

  const item = mistakesQueue[mistakeIndex];
  if(!item){
    updateMistakeCount();
    $("#mistakesHint").innerHTML = "Super! Du hast alle Fehler-Aufgaben gelöst. 🎉";
    $("#mistakesTitle").textContent = "—";
    $("#mistakesMcqArea").classList.add("hidden");
    $("#mistakesInputArea").classList.add("hidden");
    $("#mistakesAnalysisArea").classList.add("hidden");
    return;
  }

  const r = item.task;
  $("#mistakesTitle").textContent = `Aufgabe ${mistakeIndex+1} / ${mistakesQueue.length} — (${item.mode})`;

  $("#mistakesMcqArea").classList.add("hidden");
  $("#mistakesInputArea").classList.add("hidden");
  $("#mistakesAnalysisArea").classList.add("hidden");

  if(r.type === "mcq"){
    $("#mistakesMcqArea").classList.remove("hidden");
    $("#mistakesMcqPrompt").textContent = r.prompt;
    const wrap = $("#mistakesMcqOptions");
    wrap.innerHTML = "";

    r.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "optionBtn";
      btn.type = "button";
      btn.textContent = opt;

      btn.addEventListener("click", () => {
        if(mSelected.has(opt)){
          mSelected.delete(opt);
          btn.classList.remove("isSelected");
        } else {
          mSelected.add(opt);
          btn.classList.add("isSelected");
        }
      });

      wrap.appendChild(btn);
    });

  } else if(r.type === "input"){
    $("#mistakesInputArea").classList.remove("hidden");
    $("#mistakesInputPrompt").textContent = r.prompt;

  } else if(r.type === "analysis"){
    $("#mistakesAnalysisArea").classList.remove("hidden");
    $("#mistakesAnalysisPrompt").textContent = r.prompt;
    $("#mistakesAnalysisHint").textContent = r.hint || "";

    const sentenceEl = $("#mistakesAnalysisSentence");
    sentenceEl.innerHTML = "";
    r.sentence.forEach((tok, idx) => {
      const span = document.createElement("span");
      span.className = "token";
      span.textContent = tok;

      span.addEventListener("click", () => {
        if(mSelectedTokens.has(idx)){
          mSelectedTokens.delete(idx);
          span.classList.remove("isSelected");
        } else {
          mSelectedTokens.add(idx);
          span.classList.add("isSelected");
        }
      });
      sentenceEl.appendChild(span);
    });
  }
}

function mistakesOkForTask(r){
  if(r.type === "mcq"){
    const correctSet = new Set(r.correct || []);
    return setEqSet(mSelected, correctSet);
  }
  if(r.type === "input"){
    const typed = normalize($("#mistakesUserInput").value);
    const ans = normalize(r.answer);
    return !!typed && typed === ans;
  }
  if(r.type === "analysis"){
    const correct = new Set(r.correctTokens || []);
    return setEqSet(mSelectedTokens, correct);
  }
  return false;
}

function solveMistake(){
  const item = mistakesQueue[mistakeIndex];
  if(!item) return;
  const r = item.task;

  const ok = mistakesOkForTask(r);

  if(ok){
    $("#mistakesFeedback").textContent = "✅ Richtig! Diese Aufgabe wird entfernt.";
    $("#mistakesFeedback").className = "feedback ok";

    removeMistakeById(item.id);

    mistakesQueue = loadMistakes();
    if(mistakeIndex >= mistakesQueue.length) mistakeIndex = mistakesQueue.length;

    setTimeout(renderMistake, 450);
  } else {
    $("#mistakesFeedback").textContent = "❌ Noch falsch. Versuch es nochmal!";
    $("#mistakesFeedback").className = "feedback bad";
  }
}

$("#btnMistakes")?.addEventListener("click", openMistakes);
$("#btnMistakesBack")?.addEventListener("click", () => showScreen("#screen-menu"));

$("#btnMistakesCheckMcq")?.addEventListener("click", solveMistake);
$("#btnMistakesCheckInput")?.addEventListener("click", solveMistake);
$("#btnMistakesCheckAnalysis")?.addEventListener("click", solveMistake);

// ====== Elternbereich (FAQ) ======
const parentsFaqData = [
  { q: "Was wird im Modus „Verben“ geübt?",
    a: "Hier wird die Bestimmung von Verbformen geübt (Person/Nummer/Tempus)."
  },
  { q: "Was wird im Modus „Substantive“ geübt?",
    a: "Hier geht es um Kasus und Formen (Nom./Gen./Dat./Akk.)."
  },
  { q: "Was passiert bei „Satzanalyse“?",
    a: "Hier werden einzelne Fälle abgefragt."
  },

  { q: "Was bedeuten „Fehler üben“ und „Statistik“?",
    a: "„Fehler üben“ zeigt Aufgaben, die zuvor falsch waren. Diese können hier wiederholt werden. „Statistik“ zeigt die Übungstage und Fehlerquote in den Bereichen an."
  }
];

function renderParentsFaq(){
  const box = $("#parentsFaq");
  if(!box) return;

  box.innerHTML = parentsFaqData.map((item, idx) => `
    <div class="faqItem">
      <button class="faqQ" type="button"
        data-faq="${idx}"
        aria-expanded="false"
        aria-controls="faqA_${idx}">
        <span>${item.q}</span>
        <span class="faqChevron" aria-hidden="true">▾</span>
      </button>
      <div class="faqA hidden" id="faqA_${idx}" role="region" aria-label="Antwort">
        ${item.a}
      </div>
    </div>
  `).join("");

  
  const closeAll = () => {
    box.querySelectorAll(".faqA").forEach(a => a.classList.add("hidden"));
    box.querySelectorAll(".faqQ").forEach(q => q.setAttribute("aria-expanded","false"));
  };

  box.querySelectorAll(".faqQ").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = btn.getAttribute("data-faq");
      const ans = $("#faqA_" + i);
      if(!ans) return;

      const isOpen = !ans.classList.contains("hidden");
      closeAll();
      if(!isOpen){
        ans.classList.remove("hidden");
        btn.setAttribute("aria-expanded","true");
      }
    });
  });
}

function openParents(){
  renderParentsFaq();
  showScreen("#screen-parents");
}

$("#btnParents")?.addEventListener("click", openParents);
$("#btnParentsBack")?.addEventListener("click", () => showScreen("#screen-menu"));

// ====== Lehrkräftebereich (PIN) ======
function getTeacherPin(){
  return localStorage.getItem(TEACHER_PIN_KEY) || "1809";
}
function setTeacherPin(pin){
  localStorage.setItem(TEACHER_PIN_KEY, String(pin));
}
function isTeacherUnlocked(){
  return localStorage.getItem(TEACHER_UNLOCK_KEY) === "1";
}
function setTeacherUnlocked(v){
  localStorage.setItem(TEACHER_UNLOCK_KEY, v ? "1" : "0");
}

function updateTeacherUI(){
  const locked = $("#teacherLocked");
  const unlocked = $("#teacherUnlocked");
  if(!locked || !unlocked) return;

  if(isTeacherUnlocked()){
    locked.classList.add("hidden");
    unlocked.classList.remove("hidden");
  } else {
    locked.classList.remove("hidden");
    unlocked.classList.add("hidden");
  }

  const fb = $("#teacherPinFeedback");
  if(fb){
    fb.textContent = "";
    fb.className = "feedback";
  }
  const afb = $("#teacherAreaFeedback");
  if(afb){
    afb.textContent = "";
    afb.className = "feedback";
  }
}

function openTeachers(){
  updateTeacherUI();
  showScreen("#screen-teachers");
  
  setTimeout(() => $("#teacherPinInput")?.focus(), 50);
}

$("#btnTeachers")?.addEventListener("click", openTeachers);
$("#btnTeachersBack")?.addEventListener("click", () => showScreen("#screen-menu"));

function tryUnlockTeacher(){
  const inp = $("#teacherPinInput");
  const fb = $("#teacherPinFeedback");
  const typed = String(inp?.value || "").trim();

  if(!fb) return;

  if(typed && typed === getTeacherPin()){
    setTeacherUnlocked(true);
    fb.textContent = "✅ PIN korrekt. Bereich entsperrt.";
    fb.className = "feedback ok";
    updateTeacherUI();
  } else {
    fb.textContent = "❌ Falscher PIN.";
    fb.className = "feedback bad";
  }
}

$("#btnTeacherUnlock")?.addEventListener("click", tryUnlockTeacher);

// Enter-Taste im PIN Feld
$("#teacherPinInput")?.addEventListener("keydown", (e) => {
  if(e.key === "Enter") tryUnlockTeacher();
});

$("#btnTeacherSavePin")?.addEventListener("click", () => {
  const inp = $("#teacherNewPin");
  const fb = $("#teacherAreaFeedback");
  const pin = String(inp?.value || "").trim();

  if(!fb) return;

  if(pin.length < 3){
    fb.textContent = "❌ PIN zu kurz (mind. 3 Zeichen).";
    fb.className = "feedback bad";
    return;
  }

  setTeacherPin(pin);
  fb.textContent = "✅ Neuer PIN gespeichert (nur in diesem Browser).";
  fb.className = "feedback ok";
  if(inp) inp.value = "";
});

$("#btnTeacherLock")?.addEventListener("click", () => {
  setTeacherUnlocked(false);
  updateTeacherUI();
});

// ====== Arena/Stats/Mistakes Buttons ======
$("#btnArenaExit")?.addEventListener("click", () => showScreen("#screen-menu"));

// ====== Initial UI ======
updateArenaButton();
updateMistakeCount();
updateArenaHighscoreUI();





const btnLernspiele = document.getElementById("btnLernspiele");
const btnDeklination = document.getElementById("btnDeklination");
const btnQuizfragen = document.getElementById("btnQuizfragen");
const btnBackToStep1 = document.getElementById("btnBackToStep1");
const btnExit = document.getElementById("btnLernspieleExit");

const menuStep1 = document.getElementById("menuStep1");
const menuStep2 = document.getElementById("menuStep2");
const frame = document.getElementById("lernspieleFrame");

if (btnLernspiele) {
  btnLernspiele.addEventListener("click", () => {
    showScreen("#screen-lernspiele");
  });
}


if (btnDeklination) {
  btnDeklination.addEventListener("click", () => {
    menuStep1.style.display = "none";
    menuStep2.style.display = "block";

   
    frame.src = "";
    frame.style.display = "none";
  });
}


if (btnQuizfragen) {
  btnQuizfragen.addEventListener("click", () => {
    frame.src = "https://learningapps.org/watch?v=pihbo00mk26";
    frame.style.display = "block";
    document.getElementById("lernspieleFooter")?.classList.remove("hidden");
  });
}


if (btnBackToStep1) {
  btnBackToStep1.addEventListener("click", () => {
    menuStep2.style.display = "none";
    menuStep1.style.display = "block";

    frame.src = "";
    frame.style.display = "none";
    document.getElementById("lernspieleFooter")?.classList.add("hidden");
  });
}

if (btnExit) {
  btnExit.addEventListener("click", () => {
    showScreen("#screen-menu");

  
    menuStep2.style.display = "none";
    menuStep1.style.display = "block";
    frame.src = "";
    frame.style.display = "none";
    document.getElementById("lernspieleFooter")?.classList.add("hidden");
  });
}

// ==============================
// ANKI / VOKABELN
// ==============================

// ===== Storage Keys =====
const ANKI_SELECTED_LESSONS_KEY = "latinTrainerAnkiSelectedLessons_v1";
const ANKI_PROGRESS_KEY = "latinTrainerAnkiProgress_v1";
const ANKI_CUSTOM_DECKS_KEY = "latinTrainerAnkiCustomDecks_v1";
const ANKI_CUSTOM_CARDS_KEY = "latinTrainerAnkiCustomCards_v1";
const ANKI_PRACTICE_DAYS_KEY = "latinTrainerAnkiPracticeDays_v1";

// ===== Eigene Vokabeldaten nach Lektionen =====

const vocabData = [
  { lesson: 1, front: "puella", back: "das Mädchen" },
  { lesson: 1, front: "serva", back: "die Sklavin, die Dienerin" },
  { lesson: 1, front: "silva", back: "der Wald" },
   { lesson: 1, front: "via", back: "der Weg, die Straße" },
    { lesson: 1, front: "villa", back: "das Haus, das Landhaus" },
     { lesson: 1, front: "avus", back: "der Großvater" },
   { lesson: 1, front: "campus", back: "das Feld, der freie Platz" },
   { lesson: 1, front: "eqqus", back: "das Pferd" },
    { lesson: 1, front: "murus", back: "die Mauer" },
     { lesson: 1, front: "servus", back: "der Sklave, der Diener" },
      { lesson: 1, front: "vicus", back: "das Dorf, die Gasse" },
       { lesson: 1, front: "et", back: "und, auch" },
        { lesson: 1, front: "familia", back: "die Familie" },
         { lesson: 2, front: "esse", back: "sein, sich befinden" },
         { lesson: 2, front: "est", back: "er (sie, es) ist" },
         { lesson: 2, front: "sunt", back: "sie sind" },
         { lesson: 2, front: "amica", back: "die Freundin" },
         { lesson: 2, front: "ridere", back: "lachen, auslachen" },
         { lesson: 2, front: "non", back: "nicht" },
         { lesson: 2, front: "cur?", back: "warum?" },
         { lesson: 2, front: "parere", back: "gehorchen" },
         { lesson: 2, front: "monere", back: "mahnen, ermahnen" },
         { lesson: 2, front: "debere", back: "müssen, sollen" },
         { lesson: 2, front: "quid?", back: "was?" },
         { lesson: 2, front: "timere", back: "fürchten, Angst haben" },
         { lesson: 2, front: "oculus", back: "das Auge" },
         { lesson: 2, front: "dolere", back: "schmerzen, wehtun" },
         { lesson: 2, front: "nunc", back: "Adverb" },
         { lesson: 2, front: "Lydus servus", back: "der Sklave Lydus" },
         { lesson: 2, front: "tacere", back: "schweigen, verschweigen" },
];

// ===== Helper =====
function ankiTodayKey(){
  return todayKey();
}

function ankiNowTs(){
  return Date.now();
}

function daysToMs(days){
  return days * 24 * 60 * 60 * 1000;
}

function minutesToMs(min){
  return min * 60 * 1000;
}

function getAnkiAllLessons(){
  return Array.from({ length: 37 }, (_, i) => i + 1);
}

function loadAnkiSelectedLessons(){
  try{
    const arr = JSON.parse(localStorage.getItem(ANKI_SELECTED_LESSONS_KEY) || "null");
    if(!arr) return [];
    return Array.isArray(arr)
      ? arr.filter(n => Number.isInteger(n) && n >= 1 && n <= 37)
      : [];
  }catch{
    return [];
  }
}

function saveAnkiSelectedLessons(arr){
  const clean = Array.from(new Set(arr))
    .filter(n => Number.isInteger(n) && n >= 1 && n <= 37)
    .sort((a,b) => a-b);

  localStorage.setItem(ANKI_SELECTED_LESSONS_KEY, JSON.stringify(clean));
  updateAnkiLessonHint();
}

function loadAnkiPracticeDays(){
  try{
    const arr = JSON.parse(localStorage.getItem(ANKI_PRACTICE_DAYS_KEY) || "[]");
    return Array.isArray(arr) ? arr : [];
  }catch{
    return [];
  }
}

function markAnkiPracticeDay(){
  const key = ankiTodayKey();
  const days = loadAnkiPracticeDays();
  if(!days.includes(key)){
    days.push(key);
    localStorage.setItem(ANKI_PRACTICE_DAYS_KEY, JSON.stringify(days));
  }
}

function getAnkiPracticeDaysCount(){
  return loadAnkiPracticeDays().length;
}

function getAnkiCounts(){
  const cards = getSelectedAnkiCards();
  const now = ankiNowTs();

  let newCount = 0;
  let learningCount = 0;
  let reviewCount = 0;

  cards.forEach(card => {
    const p = getCardProgress(card.id);
    const state = p.state || "new";

    if(p.due && p.due > now) return;

    if(state === "new"){
      newCount += 1;
    } else if(state === "learning" || state === "relearning"){
      learningCount += 1;
    } else if(state === "review"){
      reviewCount += 1;
    } else {
      newCount += 1;
    }
  });

  return { newCount, learningCount, reviewCount };
}

function updateAnkiCountsUI(){
  const counts = getAnkiCounts();

  const newEl = $("#ankiNewCount");
  const learningEl = $("#ankiLearningCount");
  const reviewEl = $("#ankiReviewCount");

  if(newEl) newEl.textContent = String(counts.newCount);
  if(learningEl) learningEl.textContent = String(counts.learningCount);
  if(reviewEl) reviewEl.textContent = String(counts.reviewCount);
}

function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function deleteAnkiCard(cardId){
  const cards = loadAnkiCustomCards();
  const card = cards.find(c => c.id === cardId);
  if(!card) return;

  const ok = confirm(`Karte "${card.front} → ${card.back}" wirklich löschen?`);
  if(!ok) return;

  const newCards = cards.filter(c => c.id !== cardId);
  saveAnkiCustomCards(newCards);

  const progress = loadAnkiProgress();
  delete progress[cardId];
  saveAnkiProgress(progress);

  renderAnkiCardList();
  renderAnkiDeckList();
  setAnkiCreateFeedback("Karte gelöscht. ✅", true);
}

function editAnkiCard(cardId){
  const cards = loadAnkiCustomCards();
  const card = cards.find(c => c.id === cardId);
  if(!card) return;

  const newFront = prompt("Neue Vorderseite:", card.front);
  if(newFront === null) return;

  const newBack = prompt("Neue Rückseite:", card.back);
  if(newBack === null) return;

  const front = String(newFront).trim();
  const back = String(newBack).trim();

  if(!front || !back){
    setAnkiCreateFeedback("Vorder- und Rückseite dürfen nicht leer sein.", false);
    return;
  }

  card.front = front;
  card.back = back;

  saveAnkiCustomCards(cards);
  renderAnkiCardList();
  setAnkiCreateFeedback("Karte bearbeitet. ✅", true);
}

function setAnkiImportFeedback(text, ok){
  const el = $("#ankiImportFeedback");
  if(!el) return;
  el.textContent = text;
  el.className = "feedback " + (ok ? "ok" : "bad");
}

function refreshAnkiCustomLessonSelect(){
  const select = $("#ankiCustomLessonSelect");
  if(!select) return;

  select.innerHTML = `<option value="">Optionale Lektion zuordnen</option>`;

  for(let i = 1; i <= 37; i++){
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `Lektion ${i}`;
    select.appendChild(opt);
  }
}
// ===== Progress =====
function loadAnkiProgress(){
  try{
    const obj = JSON.parse(localStorage.getItem(ANKI_PROGRESS_KEY) || "{}");
    return obj && typeof obj === "object" ? obj : {};
  }catch{
    return {};
  }
}

function saveAnkiProgress(obj){
  localStorage.setItem(ANKI_PROGRESS_KEY, JSON.stringify(obj));
}

function getCardProgress(cardId){
  const all = loadAnkiProgress();
  if(!all[cardId]){
  all[cardId] = {
  interval: 0,
  ease: 2.5,
  due: 0,
  reps: 0,
  lapses: 0,
  lastRating: null,
  state: "new",
  step: 0
};
    saveAnkiProgress(all);
  }
  return all[cardId];
}

function setCardProgress(cardId, data){
  const all = loadAnkiProgress();
  all[cardId] = data;
  saveAnkiProgress(all);
}

// ===== Custom Decks / Cards =====
function loadAnkiDecks(){
  try{
    const arr = JSON.parse(localStorage.getItem(ANKI_CUSTOM_DECKS_KEY) || "[]");
    return Array.isArray(arr) ? arr : [];
  }catch{
    return [];
  }
}

function saveAnkiDecks(arr){
  localStorage.setItem(ANKI_CUSTOM_DECKS_KEY, JSON.stringify(arr));
}

function loadAnkiCustomCards(){
  try{
    const arr = JSON.parse(localStorage.getItem(ANKI_CUSTOM_CARDS_KEY) || "[]");
    return Array.isArray(arr) ? arr : [];
  }catch{
    return [];
  }
}

function saveAnkiCustomCards(arr){
  localStorage.setItem(ANKI_CUSTOM_CARDS_KEY, JSON.stringify(arr));
}

function refreshAnkiDeckSelect(){
  const select = $("#ankiDeckSelect");
  if(!select) return;

  const decks = loadAnkiDecks();
  select.innerHTML = `<option value="">Stapel auswählen…</option>`;

  decks.forEach(deck => {
    const opt = document.createElement("option");
    opt.value = deck.id;
    opt.textContent = deck.name;
    select.appendChild(opt);
  });
}

function renderAnkiDeckList(){
  const wrap = $("#ankiDeckList");
  if(!wrap) return;

  const decks = loadAnkiDecks();
  const cards = loadAnkiCustomCards();

  if(decks.length === 0){
    wrap.innerHTML = `<p class="smallHint">Noch keine eigenen Stapel vorhanden.</p>`;
    return;
  }

  wrap.innerHTML = "";

  decks.forEach(deck => {
    const count = cards.filter(c => c.deckId === deck.id).length;

    const item = document.createElement("div");
    item.className = "ankiDeckItem";

    item.innerHTML = `
      <div class="ankiDeckItemTop">
        <div class="ankiDeckName">${deck.name}</div>
      </div>
      <div class="ankiDeckMeta">${count} Karte(n)</div>
      <div class="ankiDeckActions">
        <button class="btn btnPrimary btnSmall" data-deck-learn="${deck.id}">Lernen</button>
        <button class="btn btnGhost btnSmall" data-deck-delete="${deck.id}">Löschen</button>
      </div>
    `;

    wrap.appendChild(item);
  });

  wrap.querySelectorAll("[data-deck-learn]").forEach(btn => {
    btn.addEventListener("click", () => {
      const deckId = btn.getAttribute("data-deck-learn");
      startAnkiLearnCustomDeck(deckId);
    });
  });

  wrap.querySelectorAll("[data-deck-delete]").forEach(btn => {
    btn.addEventListener("click", () => {
      const deckId = btn.getAttribute("data-deck-delete");
      deleteAnkiDeck(deckId);
    });
  });
}

function renderAnkiCardList(){
  const wrap = $("#ankiCardList");
  if(!wrap) return;

  const cards = loadAnkiCustomCards();

  if(cards.length === 0){
    wrap.innerHTML = `<p class="smallHint">Noch keine eigenen Karten vorhanden.</p>`;
    return;
  }

  wrap.innerHTML = "";

  cards.forEach(card => {
    const item = document.createElement("div");
    item.className = "ankiCardItem";

    item.innerHTML = `
      <div class="ankiDeckItemTop">
        <div class="ankiDeckName">${card.deckName || "Eigener Stapel"}</div>
      </div>

      <div class="ankiCardFrontBack">
        <div>
          <div class="ankiCardLabel">Vorderseite</div>
          <div class="ankiCardValue">${escapeHtml(card.front)}</div>
        </div>
        <div>
          <div class="ankiCardLabel">Rückseite</div>
          <div class="ankiCardValue">${escapeHtml(card.back)}</div>
        </div>
      </div>

      <div class="ankiDeckActions">
        <button class="btn btnGhost btnSmall" data-card-edit="${card.id}">Bearbeiten</button>
        <button class="btn btnGhost btnSmall" data-card-delete="${card.id}">Löschen</button>
      </div>
    `;

    wrap.appendChild(item);
  });

  wrap.querySelectorAll("[data-card-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      const cardId = btn.getAttribute("data-card-edit");
      editAnkiCard(cardId);
    });
  });

  wrap.querySelectorAll("[data-card-delete]").forEach(btn => {
    btn.addEventListener("click", () => {
      const cardId = btn.getAttribute("data-card-delete");
      deleteAnkiCard(cardId);
    });
  });
}

function deleteAnkiDeck(deckId){
  const decks = loadAnkiDecks();
  const cards = loadAnkiCustomCards();

  const deck = decks.find(d => d.id === deckId);
  if(!deck) return;

  const ok = confirm(`Stapel "${deck.name}" wirklich löschen? Alle Karten darin werden ebenfalls gelöscht.`);
  if(!ok) return;

  const newDecks = decks.filter(d => d.id !== deckId);
  const newCards = cards.filter(c => c.deckId !== deckId);

  saveAnkiDecks(newDecks);
  saveAnkiCustomCards(newCards);

  // Fortschritt der gelöschten Karten ebenfalls entfernen
  const progress = loadAnkiProgress();
  Object.keys(progress).forEach(cardId => {
    if(cardId.startsWith("custom_")){
      const stillExists = newCards.some(c => c.id === cardId);
      if(!stillExists){
        delete progress[cardId];
      }
    }
  });
  saveAnkiProgress(progress);

refreshAnkiDeckSelect();
renderAnkiDeckList();
renderAnkiCardList();
setAnkiCreateFeedback("Stapel gelöscht. ✅", true);
}

function startAnkiLearnCustomDeck(deckId){
  const decks = loadAnkiDecks();
  const deck = decks.find(d => d.id === deckId);

  if(!deck){
    alert("Stapel nicht gefunden.");
    return;
  }

  ankiActiveCustomDeckId = deckId;

  const cards = getSelectedAnkiCards();
  if(cards.length === 0){
    alert("Dieser Stapel enthält noch keine Karten.");
    ankiActiveCustomDeckId = null;
    return;
  }

  markAnkiPracticeDay();

  ankiQueue = getDueAnkiCards();
  ankiIndex = 0;

  showScreen("#screen-anki-learn");

  if(ankiQueue.length === 0){
    $("#ankiCardFront").textContent = "Keine fälligen Karten";
    $("#ankiCardBack").textContent = `Im Stapel "${deck.name}" ist aktuell nichts zu wiederholen.`;
    $("#ankiCardBack").classList.remove("hidden");
    $("#ankiDeckInfo").textContent = `Eigener Stapel: ${deck.name}`;
    updateAnkiCountsUI();
    $("#ankiShowAnswerWrap")?.classList.add("hidden");
    $("#ankiRatingWrap")?.classList.add("hidden");
    return;
  }

  renderAnkiCard();
}

// ===== Built-in + Custom Cards zusammenführen =====
function buildAnkiBaseCards(){
  const builtIn = vocabData.map((card, idx) => ({
    id: `lesson_${card.lesson}_${idx}`,
    source: "lesson",
    lesson: Number(card.lesson),
    front: card.front,
    back: card.back,
    deckId: null,
    deckName: `Lektion ${card.lesson}`
  }));

const custom = loadAnkiCustomCards().map(card => ({
  id: card.id,
  source: "custom",
  lesson: card.lesson ?? null,
  front: card.front,
  back: card.back,
  deckId: card.deckId,
  deckName: card.deckName || "Eigener Stapel"
}));

  return [...builtIn, ...custom];
}

function renderAnkiCustomDeckOverview(){
  const wrap = $("#ankiCustomDeckOverview");
  if(!wrap) return;

  const decks = loadAnkiDecks();
  const cards = loadAnkiCustomCards();

  if(decks.length === 0){
    wrap.innerHTML = `<p class="smallHint">Noch keine eigenen oder importierten Stapel vorhanden.</p>`;
    return;
  }

  wrap.innerHTML = "";

  decks.forEach(deck => {
    const deckCards = cards.filter(c => c.deckId === deck.id);
    const lessonSet = Array.from(new Set(deckCards.map(c => c.lesson).filter(v => v != null))).sort((a,b)=>a-b);

    const item = document.createElement("div");
    item.className = "ankiDeckItem";

    item.innerHTML = `
      <div class="ankiDeckItemTop">
        <div class="ankiDeckName">${escapeHtml(deck.name)}</div>
      </div>
      <div class="ankiDeckMetaRow">
        <span>${deckCards.length} Karte(n)</span>
        <span>${lessonSet.length ? `Lektionen: ${lessonSet.join(", ")}` : `Keine Lektion zugeordnet`}</span>
      </div>
      <div class="ankiDeckActions">
        <button class="btn btnPrimary btnSmall" data-custom-overview-learn="${deck.id}">Lernen</button>
        <button class="btn btnGhost btnSmall" data-custom-overview-export="${deck.id}">Exportieren</button>
        <button class="btn btnGhost btnSmall" data-custom-overview-delete="${deck.id}">Löschen</button>
      </div>
    `;

    wrap.appendChild(item);
  });

  wrap.querySelectorAll("[data-custom-overview-learn]").forEach(btn => {
    btn.addEventListener("click", () => {
      startAnkiLearnCustomDeck(btn.getAttribute("data-custom-overview-learn"));
    });
  });

  wrap.querySelectorAll("[data-custom-overview-export]").forEach(btn => {
    btn.addEventListener("click", () => {
      exportAnkiDeck(btn.getAttribute("data-custom-overview-export"));
    });
  });

  wrap.querySelectorAll("[data-custom-overview-delete]").forEach(btn => {
    btn.addEventListener("click", () => {
      deleteAnkiDeck(btn.getAttribute("data-custom-overview-delete"));
      renderAnkiCustomDeckOverview();
    });
  });
}

function exportAnkiDeck(deckId){
  const decks = loadAnkiDecks();
  const cards = loadAnkiCustomCards();

  const deck = decks.find(d => d.id === deckId);
  if(!deck) return;

  const deckCards = cards
    .filter(c => c.deckId === deck.id)
    .map(c => ({
      front: c.front,
      back: c.back,
      lesson: c.lesson ?? null
    }));

  const payload = {
    name: deck.name,
    cards: deckCards
  };

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${deck.name.replace(/[^\w\-]+/g, "_") || "stapel"}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

function importAnkiDeckFromFile(file){
  if(!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try{
      const data = JSON.parse(String(reader.result || "{}"));

      if(!data || typeof data !== "object"){
        throw new Error("Ungültige JSON-Struktur.");
      }

      const name = String(data.name || "").trim();
      const cards = Array.isArray(data.cards) ? data.cards : [];

      if(!name){
        throw new Error("Der Stapelname fehlt.");
      }

      if(cards.length === 0){
        throw new Error("Der Stapel enthält keine Karten.");
      }

      const cleanedCards = cards
        .map(card => ({
          front: String(card.front || "").trim(),
          back: String(card.back || "").trim(),
          lesson: card.lesson == null || card.lesson === "" ? null : Number(card.lesson)
        }))
        .filter(card =>
          card.front &&
          card.back &&
          (card.lesson == null || (Number.isInteger(card.lesson) && card.lesson >= 1 && card.lesson <= 37))
        );

      if(cleanedCards.length === 0){
        throw new Error("Keine gültigen Karten gefunden.");
      }

      const decks = loadAnkiDecks();
      let deckName = name;

      const existingNames = new Set(decks.map(d => normalize(d.name)));
      let counter = 2;
      while(existingNames.has(normalize(deckName))){
        deckName = `${name} (${counter})`;
        counter++;
      }

      const deckId = "deck_" + Date.now();
      decks.push({ id: deckId, name: deckName });
      saveAnkiDecks(decks);

      const allCards = loadAnkiCustomCards();
      cleanedCards.forEach((card, idx) => {
        allCards.push({
          id: `custom_${Date.now()}_${idx}`,
          deckId,
          deckName,
          front: card.front,
          back: card.back,
          lesson: card.lesson
        });
      });

      saveAnkiCustomCards(allCards);

      refreshAnkiDeckSelect();
      renderAnkiDeckList();
      renderAnkiCardList();
      renderAnkiCustomDeckOverview();

      setAnkiImportFeedback(`Stapel "${deckName}" importiert. ✅`, true);
    }catch(err){
      setAnkiImportFeedback(`Import fehlgeschlagen: ${err.message}`, false);
    }
  };

  reader.onerror = () => {
    setAnkiImportFeedback("Datei konnte nicht gelesen werden.", false);
  };

  reader.readAsText(file, "utf-8");
}

$("#btnAnkiCustomDecks")?.addEventListener("click", () => {
  renderAnkiCustomDeckOverview();
  setAnkiImportFeedback("", true);
  showScreen("#screen-anki-custom-decks");
});

$("#btnAnkiCustomDecksBack")?.addEventListener("click", () => {
  showScreen("#screen-anki-menu");
});

$("#btnImportAnkiJson")?.addEventListener("click", () => {
  $("#ankiImportFile")?.click();
});

$("#ankiImportFile")?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  importAnkiDeckFromFile(file);
  e.target.value = "";
});

function getSelectedAnkiCards(){
  const selectedLessons = new Set(loadAnkiSelectedLessons());
  const base = buildAnkiBaseCards();

  return base.filter(card => {
    if(card.source === "lesson"){
      if(ankiActiveCustomDeckId) return false;
      return selectedLessons.has(Number(card.lesson));
    }

  if(card.source === "custom"){
  if(ankiActiveCustomDeckId){
    return card.deckId === ankiActiveCustomDeckId;
  }


  if(card.lesson == null) return true;
  return selectedLessons.has(Number(card.lesson));
}

    return false;
  });
}
function getDueAnkiCards(){
  const cards = getSelectedAnkiCards();
  const now = ankiNowTs();

  return cards.filter(card => {
    const p = getCardProgress(card.id);
    return !p.due || p.due <= now;
  });
}

// ===== Statistik =====
function getAnkiStats(){
  const cards = buildAnkiBaseCards();
  const progress = loadAnkiProgress();
  const now = ankiNowTs();

  let shortTerm = 0;
  let longTerm = 0;
  let due = 0;

  cards.forEach(card => {
    const p = progress[card.id] || {
      interval: 0,
      due: 0
    };

  const state = p.state || "new";
const interval = p.interval || 0;

if(state === "review" && interval >= 7){
  longTerm += 1;
} else if(state === "learning" || state === "relearning" || interval > 0){
  shortTerm += 1;
}

    if(!p.due || p.due <= now) due += 1;
  });

  return {
    days: getAnkiPracticeDaysCount(),
    shortTerm,
    longTerm,
    total: cards.length,
    due
  };
}

function openAnkiStats(){
  const st = getAnkiStats();
  $("#ankiStatsDays").textContent = String(st.days);
  $("#ankiStatsShort").textContent = String(st.shortTerm);
  $("#ankiStatsLong").textContent = String(st.longTerm);
  $("#ankiStatsTotal").textContent = String(st.total);
  $("#ankiStatsDue").textContent = String(st.due);

  showScreen("#screen-anki-stats");
}

// ===== Lektionen UI =====
function updateAnkiLessonHint(){
  const el = $("#ankiLessonHint");
  if(!el) return;

  const selected = loadAnkiSelectedLessons();
  if(!selected.length){
    el.textContent = "Keine Lektion ausgewählt.";
    return;
  }

  el.textContent = `Aktiv: ${selected.join(", ")}`;
}

function renderAnkiLessonChips(){
  const row = $("#ankiLessonRow");
  if(!row) return;

  row.innerHTML = "";
  const selected = new Set(loadAnkiSelectedLessons());

  getAnkiAllLessons().forEach(lesson => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lessonChip" + (selected.has(lesson) ? " isOn" : "");
    btn.textContent = String(lesson);

    btn.addEventListener("click", () => {
      const arr = loadAnkiSelectedLessons();
      if(selected.has(lesson)){
        saveAnkiSelectedLessons(arr.filter(x => x !== lesson));
      } else {
        saveAnkiSelectedLessons([...arr, lesson]);
      }
      renderAnkiLessonChips();
    });

    row.appendChild(btn);
  });

  updateAnkiLessonHint();
}

// ===== Lern-Session =====
let ankiQueue = [];
let ankiIndex = 0;
let ankiCurrentCard = null;
let ankiActiveCustomDeckId = null;

function renderAnkiCard(){
  const fb = $("#ankiFeedback");
  if(fb){
    fb.textContent = "";
    fb.className = "feedback";
  }

  updateAnkiCountsUI();

  $("#ankiCardBack")?.classList.add("hidden");
  $("#ankiRatingWrap")?.classList.add("hidden");
  $("#ankiShowAnswerWrap")?.classList.remove("hidden");

  if(ankiIndex >= ankiQueue.length){
  ankiCurrentCard = null;

  $("#ankiCardFront").textContent = "Fertig! 🎉";
  $("#ankiCardBack").textContent = "Heute sind keine fälligen Karten mehr offen.";
  $("#ankiCardBack").classList.remove("hidden");

  $("#ankiDeckInfo").textContent = "Sitzung abgeschlossen";

  // ALLES verstecken
  $("#ankiShowAnswerWrap")?.classList.add("hidden");
  $("#ankiRatingWrap")?.classList.add("hidden");

  return;
}

  const card = ankiQueue[ankiIndex];
  ankiCurrentCard = card;

  $("#ankiCardFront").textContent = card.front;
  $("#ankiCardBack").textContent = card.back;
 

  if(card.source === "lesson"){
    $("#ankiDeckInfo").textContent = `Lektion ${card.lesson}`;
  } else {
    $("#ankiDeckInfo").textContent = `Eigener Stapel: ${card.deckName || "—"}`;
  }
}

function startAnkiLearn(){

  ankiActiveCustomDeckId = null;
  const selectedLessons = loadAnkiSelectedLessons();
  const hasLessonCards = vocabData.some(v => selectedLessons.includes(Number(v.lesson)));
  const customCards = loadAnkiCustomCards();

  if(selectedLessons.length === 0 && customCards.length === 0){
    alert("Bitte wähle mindestens eine Lektion aus oder erstelle eigene Karten.");
    return;
  }

  if(selectedLessons.length > 0 && !hasLessonCards && customCards.length === 0){
    alert("Für die ausgewählten Lektionen sind noch keine Vokabelkarten im Code hinterlegt.");
    return;
  }

  markAnkiPracticeDay();

  ankiQueue = getDueAnkiCards();
  ankiIndex = 0;

  if(ankiQueue.length === 0){
    showScreen("#screen-anki-learn");
    $("#ankiCardFront").textContent = "Keine fälligen Karten";
    $("#ankiCardBack").textContent = "Aktuell ist nichts zu wiederholen.";
    $("#ankiCardBack").classList.remove("hidden");
    $("#ankiDeckInfo").textContent = "Alles gelernt";
   updateAnkiCountsUI();
    $("#ankiShowAnswerWrap")?.classList.add("hidden");
    $("#ankiRatingWrap")?.classList.add("hidden");
    return;
  }

  showScreen("#screen-anki-learn");
  renderAnkiCard();
}

function showAnkiAnswer(){
  if(!ankiCurrentCard) return;
  $("#ankiCardBack")?.classList.remove("hidden");
  $("#ankiShowAnswerWrap")?.classList.add("hidden");
  $("#ankiRatingWrap")?.classList.remove("hidden");
}

function applyAnkiRating(card, rating){
  const p = getCardProgress(card.id);
  const now = ankiNowTs();

  // Zustände:
  // new = noch nie richtig gelernt
  // learning = in Lernphase
  // review = normale Wiederholung
  // relearning = nach Fehler wieder kurz lernen

  let state = p.state || "new";
  let step = Number.isInteger(p.step) ? p.step : 0;
  let interval = Number(p.interval || 0);
  let ease = Number(p.ease || 2.5);

  const learningSteps = [10]; // Minuten
  const relearningSteps = [10]; // Minuten

 
  const scheduleInMinutes = (min) => {
    p.due = now + minutesToMs(min);
    p.interval = 0;
  };

  const scheduleInDays = (days) => {
    p.due = now + daysToMs(days);
    p.interval = days;
  };

  // ===== NEW =====
  if(state === "new"){
    if(rating === "again"){
      state = "learning";
      step = 0;
      scheduleInMinutes(learningSteps[0]);
      ease = Math.max(1.3, ease - 0.2);
      p.lapses = (p.lapses || 0) + 1;
    }

    if(rating === "hard"){
      state = "learning";
      step = 0;
      scheduleInMinutes(learningSteps[0]);
      ease = Math.max(1.3, ease - 0.15);
    }

    if(rating === "good"){
      state = "review";
      step = 0;
      scheduleInDays(1);
    }

    if(rating === "easy"){
      state = "review";
      step = 0;
      ease += 0.05;
      scheduleInDays(3);
    }
  }

  // ===== LEARNING =====
  else if(state === "learning"){
    if(rating === "again"){
      step = 0;
      scheduleInMinutes(learningSteps[0]);
      ease = Math.max(1.3, ease - 0.2);
      p.lapses = (p.lapses || 0) + 1;
    }

    if(rating === "hard"){
      step = 0;
      scheduleInMinutes(learningSteps[0]);
      ease = Math.max(1.3, ease - 0.15);
    }

    if(rating === "good"){
      if(step < learningSteps.length - 1){
        step += 1;
        scheduleInMinutes(learningSteps[step]);
      } else {
        state = "review";
        step = 0;
        scheduleInDays(1);
      }
    }

    if(rating === "easy"){
      state = "review";
      step = 0;
      ease += 0.05;
      scheduleInDays(3);
    }
  }

  // ===== REVIEW =====
  else if(state === "review"){
    if(rating === "again"){
      state = "relearning";
      step = 0;
      scheduleInMinutes(relearningSteps[0]);
      ease = Math.max(1.3, ease - 0.2);
      p.lapses = (p.lapses || 0) + 1;
    }

    if(rating === "hard"){
      interval = Math.max(1, Math.round(Math.max(1, interval) * 1.2));
      ease = Math.max(1.3, ease - 0.05);
      scheduleInDays(interval);
    }

    if(rating === "good"){
      interval = Math.max(1, Math.round(Math.max(1, interval) * ease));
      scheduleInDays(interval);
    }

    if(rating === "easy"){
      ease += 0.05;
      interval = Math.max(2, Math.round(Math.max(1, interval) * ease * 1.3));
      scheduleInDays(interval);
    }
  }

  // ===== RELEARNING =====
  else if(state === "relearning"){
    if(rating === "again"){
      step = 0;
      scheduleInMinutes(relearningSteps[0]);
      ease = Math.max(1.3, ease - 0.2);
      p.lapses = (p.lapses || 0) + 1;
    }

    if(rating === "hard"){
      step = 0;
      scheduleInMinutes(relearningSteps[0]);
      ease = Math.max(1.3, ease - 0.15);
    }

    if(rating === "good"){
      state = "review";
      step = 0;
      interval = Math.max(1, Math.round(Math.max(1, (p.interval || 1)) * 0.6));
      scheduleInDays(interval);
    }

    if(rating === "easy"){
      state = "review";
      step = 0;
      interval = Math.max(1, Math.round(Math.max(1, (p.interval || 1)) * 1.0));
      ease += 0.03;
      scheduleInDays(interval);
    }
  }

  p.state = state;
  p.step = step;
  p.ease = ease;
  p.reps = (p.reps || 0) + 1;
  p.lastRating = rating;

  setCardProgress(card.id, p);
} 
function rateAnkiCard(rating){
  if(!ankiCurrentCard) return;

  markAnkiPracticeDay();
  applyAnkiRating(ankiCurrentCard, rating);

  if(rating === "again"){
    ankiQueue.push(ankiCurrentCard);
  }

ankiIndex += 1;
updateAnkiCountsUI();
renderAnkiCard();
}

// ===== Karten erstellen =====
function setAnkiCreateFeedback(text, ok){
  const el = $("#ankiCreateFeedback");
  if(!el) return;
  el.textContent = text;
  el.className = "feedback " + (ok ? "ok" : "bad");
}

function createAnkiDeck(){
  const inp = $("#ankiDeckNameInput");
  const name = String(inp?.value || "").trim();
  if(!name){
    setAnkiCreateFeedback("Bitte einen Stapelnamen eingeben.", false);
    return;
  }

  const decks = loadAnkiDecks();
  if(decks.some(d => normalize(d.name) === normalize(name))){
    setAnkiCreateFeedback("Diesen Stapel gibt es schon.", false);
    return;
  }

  decks.push({
    id: "deck_" + Date.now(),
    name
  });

saveAnkiDecks(decks);
refreshAnkiDeckSelect();
renderAnkiDeckList();
renderAnkiCardList();
setAnkiCreateFeedback("Stapel angelegt. ✅", true);
inp.value = "";

}

function addCustomAnkiCard(){
  const front = String($("#ankiCustomFront")?.value || "").trim();
  const back = String($("#ankiCustomBack")?.value || "").trim();
  const deckId = String($("#ankiDeckSelect")?.value || "").trim();
  const lessonValue = String($("#ankiCustomLessonSelect")?.value || "").trim();
  const lesson = lessonValue ? Number(lessonValue) : null;

  if(!front || !back){
    setAnkiCreateFeedback("Bitte Vorder- und Rückseite eingeben.", false);
    return;
  }

  if(!deckId){
    setAnkiCreateFeedback("Bitte einen Stapel auswählen.", false);
    return;
  }

  const decks = loadAnkiDecks();
  const deck = decks.find(d => d.id === deckId);
  if(!deck){
    setAnkiCreateFeedback("Der gewählte Stapel wurde nicht gefunden.", false);
    return;
  }

  const cards = loadAnkiCustomCards();
  cards.push({
    id: "custom_" + Date.now(),
    deckId: deck.id,
    deckName: deck.name,
    front,
    back,
    lesson
  });

  saveAnkiCustomCards(cards);
  renderAnkiDeckList();
  renderAnkiCardList();
  renderAnkiCustomDeckOverview();
  setAnkiCreateFeedback("Karte gespeichert. ✅", true);

  $("#ankiCustomFront").value = "";
  $("#ankiCustomBack").value = "";
  $("#ankiDeckSelect").value = "";
  $("#ankiCustomLessonSelect").value = "";
}





saveAnkiCustomCards(cards);
renderAnkiDeckList()
renderAnkiCardList();
setAnkiCreateFeedback("Karte gespeichert. ✅", true);

  $("#ankiCustomFront").value = "";
  $("#ankiCustomBack").value = "";
  $("#ankiCustomLessonSelect").value = "";


// ===== Navigation =====
// ===== Anki Zugang / Rätsel =====
function isAnkiUnlocked(){
  return localStorage.getItem("ankiUnlocked") === "true";
}

function unlockAnki(){
  localStorage.setItem("ankiUnlocked", "true");
}

function resetAnkiRiddleUI(){
  const input = $("#ankiRiddleInput");
  const feedback = $("#ankiRiddleFeedback");

  if(input) input.value = "";
  if(feedback){
    feedback.textContent = "";
    feedback.className = "feedback";
  }
}

function openAnkiMenu(){
  renderAnkiLessonChips();
  refreshAnkiDeckSelect();
  $("#ankiLessonPanel")?.classList.remove("hidden");
  showScreen("#screen-anki-menu");
}

// Button im Hauptmenü
$("#btnAnki")?.addEventListener("click", () => {
  if(localStorage.getItem("ankiUnlocked") === "true"){
    openAnkiMenu();
  } else {
    const input = $("#ankiRiddleInput");
    const feedback = $("#ankiRiddleFeedback");

    if(input) input.value = "";
    if(feedback) feedback.textContent = "";

    showScreen("#screen-anki-lock");
  }
});

// Menü intern
$("#btnToggleAnkiLessons")?.addEventListener("click", () => {
  $("#ankiLessonPanel")?.classList.toggle("hidden");
});

$("#btnAnkiLessonsAll")?.addEventListener("click", () => {
  saveAnkiSelectedLessons(getAnkiAllLessons());
  renderAnkiLessonChips();
});

$("#btnAnkiLessonsNone")?.addEventListener("click", () => {
  saveAnkiSelectedLessons([]);
  renderAnkiLessonChips();
});

$("#btnAnkiLearn")?.addEventListener("click", startAnkiLearn);
$("#btnAnkiStats")?.addEventListener("click", openAnkiStats);
$("#btnAnkiCreate")?.addEventListener("click", () => {
  refreshAnkiDeckSelect();
  refreshAnkiCustomLessonSelect();
  renderAnkiDeckList();
  renderAnkiCardList();
  setAnkiCreateFeedback("", true);
  showScreen("#screen-anki-create");
});

$("#btnAnkiMenuBack")?.addEventListener("click", () => showScreen("#screen-menu"));
$("#btnAnkiLearnBack")?.addEventListener("click", () => {
  ankiActiveCustomDeckId = null;
  showScreen("#screen-anki-menu");
});
$("#btnAnkiStatsBack")?.addEventListener("click", () => showScreen("#screen-anki-menu"));
$("#btnAnkiCreateBack")?.addEventListener("click", () => showScreen("#screen-anki-menu"));

$("#btnAnkiShowAnswer")?.addEventListener("click", showAnkiAnswer);

$("#btnAnkiAgain")?.addEventListener("click", () => rateAnkiCard("again"));
$("#btnAnkiHard")?.addEventListener("click", () => rateAnkiCard("hard"));
$("#btnAnkiGood")?.addEventListener("click", () => rateAnkiCard("good"));
$("#btnAnkiEasy")?.addEventListener("click", () => rateAnkiCard("easy"));

$("#btnCreateAnkiDeck")?.addEventListener("click", createAnkiDeck);
$("#btnAddAnkiCard")?.addEventListener("click", addCustomAnkiCard);

// ===== Initial =====
renderAnkiLessonChips();
refreshAnkiDeckSelect();
