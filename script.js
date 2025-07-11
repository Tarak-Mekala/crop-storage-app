// Language toggle
let lang = 'en';

function toggleLanguage() {
  lang = lang === 'en' ? 'te' : 'en';
  document.getElementById('teluguToggle').checked = lang === 'te';
  document.getElementById('teluguToggle2').checked = lang === 'te';
  updateLabels();
}

function updateLabels() {
  document.getElementById('labelCrop').textContent = lang==='te' ? 'పంట పేరు నమోదు చేయండి' : 'Enter Crop Name';
  document.getElementById('labelRegion').textContent = lang==='te' ? 'మీ జిల్లా ఎంచుకోండి' : 'Select Your District';
}

// Navigation
function goToPage1() { showPage('page1'); }
function goToPage2() { clearInputs(); showPage('page2'); }
function goToPage3() {
  const crop = document.getElementById('cropInput').value.trim().toLowerCase();
  const region = document.getElementById('regionSelect').value;
  const error = document.getElementById('error');
  const match = cropData.find(c => c.crop === crop);
  if (!match) return error.textContent = lang==='te' ? 'పంట కనబడలేదు.' : 'Crop not found.';
  error.textContent = '';
  // Display crop
  const name = lang==='te' ? translations[crop] : match.crop.toUpperCase();
  document.getElementById('cropTitle').textContent = name;
  document.getElementById('result').innerHTML = `
    <p><strong>${lang==='te'?'Ideal ఉష్ణోగ్రత':'Ideal Temperature'}:</strong> ${match.temperature}</p>
    <p><strong>${lang==='te'?'Ideal తేమ':'Ideal Humidity'}:</strong> ${match.humidity}</p>
    <p><strong>${lang==='te'?'Max నిల్వ కాలం':'Max Storage Period'}:</strong> ${match.storage}</p>
  `;
  displayStorageCenters(region);
  fetchWeather(region);
  showPage('page3');
}

// UI helpers
function showPage(id) {
  ['page1','page2','page3'].forEach(p => document.getElementById(p).style.display = p === id ? 'block' : 'none');
}

// Clear
function clearInputs() {
  document.getElementById('cropInput').value = '';
  document.getElementById('suggestions').innerHTML = '';
  document.getElementById('regionSelect').value = '';
  document.getElementById('error').textContent = '';
  document.getElementById('weatherCard').style.display = 'none';
}

// Suggestions
function showSuggestions() {
  const input = document.getElementById('cropInput').value.toLowerCase();
  const list = document.getElementById('suggestions');
  list.innerHTML = '';
  if (!input) return;
  cropData
    .filter(c => (lang==='te' ? translations[c.crop] : c.crop).toLowerCase().startsWith(input))
    .forEach(c=> {
      const name = lang==='te' ? translations[c.crop] : c.crop;
      const li = document.createElement('li');
      li.textContent = name;
      li.onclick = () => { document.getElementById('cropInput').value = name; list.innerHTML = ''; };
      list.appendChild(li);
    });
}

// Voice search
let recognition;
function startVoiceSearch() {
  if (!('webkitSpeechRecognition' in window)) return alert('Voice not supported');
  recognition = new webkitSpeechRecognition();
  recognition.lang = lang==='te' ? 'te-IN' : 'en-IN';
  recognition.onstart = () => document.getElementById('cropInput').placeholder = lang==='te' ? 'శ్రవణం...' : 'Listening...';
  recognition.onresult = e => document.getElementById('cropInput').value = e.results[0][0].transcript, showSuggestions();
  recognition.start();
}

// Districts
function populateDistricts() {
  const sel = document.getElementById('regionSelect');
  sel.innerHTML = '<option value="">--</option>';
  storageData.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.district;
    opt.textContent = lang==='te' && districtTrans[s.district] ? districtTrans[s.district] : s.district;
    sel.appendChild(opt);
  });
}

// Storage centers
function displayStorageCenters(region) {
  const el = document.getElementById('storageResults');
  const sec = document.getElementById('centerSection');
  const item = storageData.find(s => s.district === region);
  sec.style.display = 'block';
  if (item) {
    el.innerHTML = item.centers.map(c => `<li>${lang==='te'?c:' '+c}</li>`).join('');
  } else el.innerHTML = `<li>${lang==='te'?'కేంద్రం లేదు':'No centers found'}</li>`;
}

// Weather
function fetchWeather(region) {
  const wc = document.getElementById('weatherCard');
  wc.style.display = 'block';
  wc.innerHTML = `<p>${lang==='te'?'హवా సమాచారం లోడ్ అవుతోంది...':'Loading weather...'}</p>`;
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${region}&appid=9d615f5f1e48d9502a77a12229e0e639&units=metric`)
    .then(r=>r.json()).then(data=>{
      const days = data.list.filter(i=>i.dt_txt.includes("12:00:00")).slice(0,3);
      wc.innerHTML = `<h3>${lang==='te'?'3-రోజుల వాతావరణ సూచన':'3‑Day Weather Forecast'}</h3>
        <div class="forecast">${days.map(d=>`
          <div class="forecast-day">
            <p><strong>${new Date(d.dt_txt).toLocaleDateString(lang==='te'?'te-IN':'en-IN',{weekday:'short',day:'numeric'})}</strong></p>
            <p>🌡️ ${d.main.temp}°C</p>
            <p>💧 ${d.main.humidity}%</p>
            <p>${d.weather[0].main}</p>
          </div>`).join('')}</div>`;
    }).catch(()=>wc.innerHTML = `<p>${lang==='te'?'వాతావరణము అందుబాటులో లేదు':''}Weather unavailable</p>`);
}

// Data & translations
const cropData = [
  { crop:"wheat",temperature:"10–15°C",humidity:"65–70%",storage:"6–12 months" },
  { crop:"rice",temperature:"10–15°C",humidity:"65–70%",storage:"6–12 months" },
  { crop:"maize",temperature:"0–4°C",humidity:"80–85%",storage:"6–12 months" },
  { crop:"potato",temperature:"4–7°C",humidity:"90–95%",storage:"90 days" },
  { crop:"onion",temperature:"0–2°C",humidity:"65–70%",storage:"150 days" },
  { crop:"tomato",temperature:"12–15°C",humidity:"85–90%",storage:"14 days" },
  { crop:"chillies",temperature:"8–10°C",humidity:"70–75%",storage:"20 days" },
  { crop:"mango",temperature:"10–13°C",humidity:"85–90%",storage:"28 days" },
  { crop:"banana",temperature:"13–14°C",humidity:"85–95%",storage:"18–22 days" },
  { crop:"sugarcane",temperature:"12–14°C",humidity:"70–75%",storage:"3–5 months" },
  { crop:"groundnut",temperature:"6–10°C",humidity:"70–80%",storage:"3–6 months" },
  { crop:"cotton",temperature:"10–15°C",humidity:"65–75%",storage:"6–8 months" },
  { crop:"pulses",temperature:"5–10°C",humidity:"65–75%",storage:"6–12 months" },
  { crop:"cabbage",temperature:"0–1°C",humidity:"90–95%",storage:"2–3 months" },
  { crop:"cauliflower",temperature:"0–1°C",humidity:"90–95%",storage:"2–3 months" }
];

// Telugu translations
const translations = {
  wheat:"గోధుమలు",rice:"బియ్యం",maize:"మక్క జొన్న",potato:"బంగాళదుంప",
  onion:"ఉల్లిపాయ", tomato:"టమోటా", chillies:"మిరపకాయలు", mango:"మామిడి",
  banana:"అరటి", sugarcane:"చెరుకు", groundnut:"వేరుసెనగ", cotton:"పత్తి",
  pulses:"పప్పులు", cabbage:"కోసు కూర", cauliflower:"కాలీఫ్లవర్"
};

const districtTrans = {
  Adilabad:"ఆదిలాబాద్",Karimnagar:"కరీంనగర్",Nizamabad:"నిజామాబాద్",
  Warangal:"వారంగల్",Mahbubnagar:"మహబూబ్నగర్",Khammam:"ఖమ్మం",
  Nalgonda:"నాల్గొండ",Medak:"మెదక్",Rangareddy:"రంగారెడ్డి",
  Hyderabad:"హైదరాబాదు"
};

const storageData = [
  {district:"Adilabad",centers:["GMR Warehouse","Ladda Agro Godowns","Paharia Warehouse","Y S R Godown"]},
  {district:"Karimnagar",centers:["Srinivasa Cold Storage","Godavari Agro Warehousing","SVS Cold Chain","Sri Gaddam Veeresham Rural Godown"]},
  {district:"Nizamabad",centers:["Nizam Agro Storage","Green Leaf Cold Storage","SLNS Cold Storage","Hi‑Tech Cold Storage"]},
  {district:"Warangal",centers:["Bhavani Cold Storage","Sree Lakshmi Warehouse","TSWC Facility","Moksha cold storage","Saptagiri cold storage","Sri karthik cold storage","Venkatagiri cold storage","Vennela storage unit"]},
  {district:"Mahbubnagar",centers:["Sri Sai Warehouse","Mahindra Cold Chain","Nandini Cold storages","Sunyang Cold Storage","Green House Cold storages"]},
  {district:"Khammam",centers:["Khammam Agro Cold Storage","Red Chilies Storage","Gayathri cold storage","Swarnabharati cold storage","Krishna sai storage unit"]},
  {district:"Nalgonda",centers:["Pavan Warehouse","Sunrise Cold Storage","TSWC Nalgonda","Sri Satyadeva Cold Storage"]},
  {district:"Medak",centers:["Medak Agro Storage","Greenfield Warehousing","Afsari Begum Ripening Chamber","S.S. Agro Fresh Cold Storage"]},
  {district:"Rangareddy",centers:["Hyderabad Cold Storage","Sri Venkateshwara Agro","Aditya Enterprises","Venkateshwara cold storage"]},
  {district:"Hyderabad",centers:["City Agro Godowns","Urban Cold Chain","Coldrush logistics","Akshaya cold storage"]}
];

// Init
document.addEventListener('DOMContentLoaded',()=>{
  updateLabels();
  populateDistricts();
});
