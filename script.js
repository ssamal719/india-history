// Config
const GOOGLE_TRANSLATE_KEY = ""; // optionally add key for reliable translations
const LANGUAGES = [
  {code:'en',name:'English'},
  {code:'hi',name:'Hindi'},
  {code:'or',name:'Odia'},
  {code:'bn',name:'Bengali'},
  {code:'ta',name:'Tamil'},
  {code:'te',name:'Telugu'},
  {code:'ml',name:'Malayalam'},
  {code:'kn',name:'Kannada'},
  {code:'mr',name:'Marathi'},
  {code:'gu',name:'Gujarati'},
  {code:'pa',name:'Punjabi'},
  {code:'as',name:'Assamese'},
  {code:'ur',name:'Urdu'}
];

let EVENTS = null;

// Helpers
const qs = s => document.querySelector(s);
function pad(n){ return String(n).padStart(2,'0'); }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function setStatus(t){ qs('#status').innerText = t; }

// Load events.json
async function loadEvents(){
  setStatus('Loading events dataset...');
  const res = await fetch('events.json');
  EVENTS = await res.json();
  setStatus('Loaded dataset. Choose state and language.');
  populateStateSelect();
  populateLangSelect();
  qs('#dateInput').value = todayISO();
}

// Populate selects
function populateStateSelect(){
  const sel = qs('#stateSelect');
  sel.innerHTML = '';
  Object.keys(EVENTS).forEach(s => {
    const o = document.createElement('option'); o.value = s; o.innerText = s; sel.appendChild(o);
  });
}

function populateLangSelect(){
  const sel = qs('#langSelect');
  sel.innerHTML = '';
  LANGUAGES.forEach(l => {
    const o = document.createElement('option'); o.value = l.code; o.innerText = l.name; sel.appendChild(o);
  });
}

// Filter events by state + date
function getEventsFor(state, dateISO){
  const d = new Date(dateISO); const mm = d.getMonth()+1; const dd = d.getDate();
  const all = EVENTS[state] || [];
  return all.filter(e => Number(e.month) === mm && Number(e.day) === dd);
}

// Translation helpers
async function translateUnofficial(text, target='or'){
  try{
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${target}&dt=t&q=` + encodeURIComponent(text);
    const r = await fetch(url);
    if(!r.ok) return null;
    const j = await r.json();
    return j[0].map(p=>p[0]).join('');
  }catch(e){
    console.warn('translate unofficial err', e); return null;
  }
}

async function translateOfficial(text, target='or'){
  if(!GOOGLE_TRANSLATE_KEY) return null;
  try{
    const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_KEY}`;
    const r = await fetch(url, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q:text,target:target,format:'text'})});
    if(!r.ok) return null;
    const j = await r.json();
    return j.data && j.data.translations && j.data.translations[0] && j.data.translations[0].translatedText || null;
  }catch(e){console.warn('translate official err',e); return null;}
}

async function translateSmart(text, target){
  if(target==='en') return text;
  if(GOOGLE_TRANSLATE_KEY){
    const t = await translateOfficial(text,target);
    if(t) return t;
  }
  const t2 = await translateUnofficial(text,target);
  if(t2) return t2;
  return text; // fallback show English
}

// Thumbnail fetch
async function fetchThumbnail(title){
  if(!title) return null;
  try{
    const q = encodeURIComponent(title);
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${q}&pithumbsize=600&origin=*`;
    const r = await fetch(url); if(!r.ok) return null;
    const j = await r.json();
    const pages = j.query && j.query.pages; if(!pages) return null;
    const page = Object.values(pages)[0]; return page && page.thumbnail && page.thumbnail.source || null;
  }catch(e){console.warn('thumb err',e);return null;}
}

// Render
async function render(){
  const state = qs('#stateSelect').value;
  const date = qs('#dateInput').value;
  const lang = qs('#langSelect').value;
  setStatus('Preparing events...');
  const items = getEventsFor(state,date);
  const container = qs('#events'); container.innerHTML = '';
  if(items.length===0){ setStatus('No events for ' + state + ' on this date.'); return; }
  setStatus(`Found ${items.length} event(s). Translating & fetching images...`);
  // parallel translate & thumbs
  const transPromises = items.map(it => translateSmart(it.summary || it.title, lang));
  const thumbPromises = items.map(it => {
    const t = it.pages && it.pages[0] && it.pages[0].title ? it.pages[0].title : null;
    return fetchThumbnail(t);
  });
  const translations = await Promise.all(transPromises);
  const thumbs = await Promise.all(thumbPromises);
  for(let i=0;i<items.length;i++){
    const it = items[i];
    const card = document.createElement('article'); card.className='event';
    if(thumbs[i]){ const img = document.createElement('img'); img.src = thumbs[i]; img.className='thumb'; card.appendChild(img); }
    const h = document.createElement('h3'); h.innerText = (it.year ? it.year + ' — ' : '') + it.title; card.appendChild(h);
    const pEng = document.createElement('p'); pEng.innerText = it.summary; pEng.style.color = '#374151'; if(lang !== 'en' && translations[i] && translations[i] !== it.summary){ pEng.style.display='block'; } card.appendChild(pEng);
    const pLocal = document.createElement('p'); pLocal.innerText = translations[i] || it.summary; pLocal.style.fontFamily = (lang==='or' ? 'Noto Sans Oriya, serif' : 'inherit'); if(lang==='en') pLocal.style.display='none'; card.appendChild(pLocal);
    const meta = document.createElement('div'); meta.className='meta'; const link = it.pages && it.pages[0] && it.pages[0].title ? 'https://en.wikipedia.org/wiki/' + encodeURIComponent(it.pages[0].title) : 'https://en.wikipedia.org'; meta.innerHTML = 'Source: <a href=\"'+link+'\" target=\"_blank\">Wikipedia</a>'; card.appendChild(meta);
    container.appendChild(card);
  }
  setStatus('Rendered ' + items.length + ' event(s).');
}

// Wiring
document.addEventListener('DOMContentLoaded', ()=>{
  loadEvents();
  qs('#goBtn').addEventListener('click', render);
  qs('#refreshBtn').addEventListener('click', async ()=>{ setStatus('Refreshing thumbnails...'); await render(); });
});