
// Load states array (should match data keys in events.json)
const STATES = [
"India","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh",
"Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
"Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands",
"Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"
];

let EVENTS = null;

// Populate dropdowns and attach map listeners
document.addEventListener('DOMContentLoaded', async ()=>{
  const sel = document.getElementById('stateSelect');
  STATES.forEach(s => { const o = document.createElement('option'); o.value=s; o.textContent=s; sel.appendChild(o); });

  // Try to load events.json
  try{
    const res = await fetch('events.json');
    if(res.ok){ EVENTS = await res.json(); console.log('Loaded events.json'); }
  }catch(e){ console.warn('Could not load events.json', e); }

  // Map click handlers
  document.querySelectorAll('g.state').forEach(g => {
    g.addEventListener('click', () => {
      const state = g.getAttribute('data-state');
      document.getElementById('stateSelect').value = state;
      loadHistoryFor(state);
      highlightState(g);
    });
  });

  document.getElementById('loadBtn').addEventListener('click', ()=>{
    const state = document.getElementById('stateSelect').value;
    if(!state) return alert('Select a state first');
    loadHistoryFor(state);
    // highlight matching map element if available
    const mapEl = Array.from(document.querySelectorAll('g.state')).find(x=>x.getAttribute('data-state')===state);
    if(mapEl) highlightState(mapEl);
  });
});

function highlightState(g){
  // remove existing highlights
  document.querySelectorAll('g.state rect').forEach(r=>r.style.stroke='#1e3a8a');
  const rect = g.querySelector('rect');
  if(rect) rect.style.stroke = '#ff5a5f';
}

async function loadHistoryFor(state){
  const area = document.getElementById('historyArea');
  area.innerHTML = '<p>Loading history for '+state+'...</p>';
  // Try events.json first
  if(EVENTS && EVENTS[state]){
    const value = EVENTS[state];
    if(typeof value === 'string'){
      area.innerHTML = '<h3>'+state+'</h3><p>'+escapeHtml(value)+'</p>';
      return;
    }
    // if array of bullets
    if(Array.isArray(value)){
      area.innerHTML = '<h3>'+state+'</h3>' + value.map(ev=>'<div style="margin-bottom:10px"><strong>'+escapeHtml(ev.year)+'</strong> — '+escapeHtml(ev.text)+'</div>').join('');
      return;
    }
  }

  // Fallback: fetch from Wikipedia in selected language (use en if not available)
  const lang = document.getElementById('langSelect').value || 'en';
  try{
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(state)}`;
    const r = await fetch(url);
    if(r.ok){
      const j = await r.json();
      area.innerHTML = '<h3>'+escapeHtml(j.title)+'</h3><p>'+escapeHtml(j.extract)+'</p>' + (j.thumbnail?'<img src="'+j.thumbnail.source+'" style="max-width:100%;border-radius:8px;margin-top:8px">':'') + '<p><a href="'+(j.content_urls?j.content_urls.desktop.page:'https://'+lang+'.wikipedia.org/wiki/'+encodeURIComponent(state))+'" target="_blank">Read more on Wikipedia</a></p>';
      return;
    }
  }catch(e){ console.warn('wiki fetch failed', e); }

  area.innerHTML = '<p>No history available for '+escapeHtml(state)+'.</p>';
}

function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
