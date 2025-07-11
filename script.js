// ====== DATA ======
const crops = [
  { name: "Wheat", telugu: "గోధుమలు", temp: "15-25°C", humidity: "60-70%", price: "₹22/kg" },
  { name: "Rice", telugu: "బియ్యం / వరి", temp: "20-35°C", humidity: "70-80%", price: "₹28/kg" },
  { name: "Maize", telugu: "మక్క జొన్న", temp: "18-27°C", humidity: "60-70%", price: "₹20/kg" },
  { name: "Potato", telugu: "బంగాళదుంప", temp: "4°C", humidity: "90-95%", price: "₹18/kg" },
  { name: "Onion", telugu: "ఉల్లిపాయ", temp: "0-2°C", humidity: "65-70%", price: "₹24/kg" },
  { name: "Tomato", telugu: "టమోటా", temp: "12-16°C", humidity: "85-90%", price: "₹22/kg" },
  { name: "Chillies", telugu: "మిరపకాయలు", temp: "14-18°C", humidity: "60-70%", price: "₹30/kg" },
  { name: "Mango", telugu: "మామిడి", temp: "10-13°C", humidity: "85-90%", price: "₹35/kg" },
  { name: "Banana", telugu: "అరటి", temp: "13-15°C", humidity: "90-95%", price: "₹26/kg" },
  { name: "Sugarcane", telugu: "చెరుకు", temp: "20-30°C", humidity: "75-85%", price: "₹16/kg" },
  { name: "Groundnut", telugu: "వేరుసెనగ", temp: "18-22°C", humidity: "60-70%", price: "₹25/kg" },
  { name: "Cotton", telugu: "పత్తి", temp: "20-30°C", humidity: "50-60%", price: "₹45/kg" },
  { name: "Pulses", telugu: "పప్పులు", temp: "15-20°C", humidity: "50-60%", price: "₹32/kg" },
  { name: "Cabbage", telugu: "కోసు కూర", temp: "0°C", humidity: "90-95%", price: "₹15/kg" },
  { name: "Cauliflower", telugu: "కాలీఫ్లవర్", temp: "0°C", humidity: "90-95%", price: "₹17/kg" },
];

const districts = {
  Hyderabad: ["Agro Storage Hyderabad", "Grain Safe Depot Hyderabad"],
  Warangal: ["Warangal Cold Storage", "Safe Crop Warangal"],
  Karimnagar: ["Karimnagar Agro Depot", "Farm Fresh Storage"],
  Nizamabad: ["Nizamabad Grain Depot", "FreshCrop Storage Center"],
  Khammam: ["Khammam AgriStore", "CropSecure Warehouse"],
  Nalgonda: ["Nalgonda Storage Hub", "Grain Guard Nalgonda"],
  Mahbubnagar: ["Mahbub Agro Center", "Harvest Depot MBnagar"],
  Medak: ["Medak Crop Care", "AgriSafe Storage Medak"],
  Adilabad: ["Adilabad Farm Depot", "SecureGrain Storage"],
  Rangareddy: ["Rangareddy Storage Co", "GreenGold Agro Center"],
};

// ====== UI ELEMENTS ======
const cropInput = document.getElementById("cropInput");
const districtSelect = document.getElementById("districtSelect");
const cropConditionsBox = document.getElementById("cropConditions");
const storageCentersBox = document.getElementById("storageCenters");
const weatherForecastBox = document.getElementById("weatherForecast");
const suggestionBox = document.getElementById("suggestions");
const teluguToggle = document.getElementById("languageToggle");
const micButton = document.getElementById("micButton");
const listeningNote = document.getElementById("listeningNote");

let isTelugu = false;

// ====== LANGUAGE TOGGLE ======
teluguToggle.addEventListener("click", () => {
  isTelugu = !isTelugu;
  teluguToggle.innerText = isTelugu ? "Switch to English" : "తెలుగు";
  updateSuggestions();
  populateDistricts(); // refresh district names if needed
});

// ====== DISTRICTS LOADING ======
function populateDistricts() {
  districtSelect.innerHTML = `<option value="" disabled selected>${isTelugu ? "జిల్లా ఎంచుకోండి" : "Select District"}</option>`;
  Object.keys(districts).forEach(district => {
    const opt = document.createElement("option");
    opt.value = district;
    opt.text = isTelugu ? toTeluguPhonetic(district) : district;
    districtSelect.appendChild(opt);
  });
}
populateDistricts();

// ====== AUTOCOMPLETE ======
cropInput.addEventListener("input", updateSuggestions);
function updateSuggestions() {
  const value = cropInput.value.toLowerCase();
  suggestionBox.innerHTML = "";
  const filtered = crops.filter(crop => {
    const compareName = isTelugu ? crop.telugu : crop.name;
    return compareName.toLowerCase().startsWith(value);
  });
  filtered.forEach(crop => {
    const div = document.createElement("div");
    div.className = "suggestion";
    div.innerText = isTelugu ? crop.telugu : crop.name;
    div.onclick = () => {
      cropInput.value = div.innerText;
      suggestionBox.innerHTML = "";
    };
    suggestionBox.appendChild(div);
  });
}

// ====== GET DETAILS ======
function getDetails() {
  const selectedCropName = cropInput.value.trim();
  const crop = crops.find(c =>
    c.name.toLowerCase() === selectedCropName.toLowerCase() ||
    c.telugu === selectedCropName
  );

  if (!crop) {
    alert(isTelugu ? "పంట కనిపించలేదు" : "Crop not found");
    return;
  }

  const district = districtSelect.value;
  if (!district) {
    alert(isTelugu ? "జిల్లాను ఎంచుకోండి" : "Please select a district");
    return;
  }

  // Crop Conditions
  cropConditionsBox.innerHTML = `
    <h3>${isTelugu ? "పంట నిల్వ పరిస్థితులు" : "Crop Storage Conditions"}</h3>
    <p><b>${isTelugu ? "తెంపర" : "Ideal Temperature"}:</b> ${crop.temp}</p>
    <p><b>${isTelugu ? "ఆర్ద్రత" : "Humidity"}:</b> ${crop.humidity}</p>
    <p><b>${isTelugu ? "ధర" : "Approx Price"}:</b> ${crop.price}</p>
  `;

  // Storage Centers
  const centers = districts[district];
  storageCentersBox.innerHTML = `
    <h3>${isTelugu ? "నిల్వ కేంద్రాలు" : "Storage Centers"}</h3>
    <ul>${centers.map(name => `<li>${isTelugu ? toTeluguPhonetic(name) : name}</li>`).join("")}</ul>
  `;

  // Weather
  getWeather(district);
}

// ====== VOICE SEARCH ======
micButton.addEventListener("click", () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = isTelugu ? "te-IN" : "en-US";
  recognition.start();
  listeningNote.style.display = "block";
  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;
    cropInput.value = transcript;
    updateSuggestions();
    listeningNote.style.display = "none";
  };
  recognition.onerror = () => {
    alert(isTelugu ? "వాయిస్ గుర్తింపు విఫలమైంది" : "Voice recognition failed");
    listeningNote.style.display = "none";
  };
});

// ====== WEATHER FETCH ======
async function getWeather(city) {
  const apiKey = "9d615f5f1e48d9502a77a12229e0e639";
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const daily = data.list.filter(item => item.dt_txt.includes("12:00:00"));
    weatherForecastBox.innerHTML = `
      <h3>${isTelugu ? "వాతావరణ సూచన" : "Weather Forecast"}</h3>
      <div class="forecast-cards">
        ${daily.slice(0, 3).map(day => `
          <div class="weather-card">
            <p>${new Date(day.dt_txt).toDateString()}</p>
            <p><b>${day.main.temp}°C</b></p>
            <p>${day.weather[0].description}</p>
          </div>
        `).join("")}
      </div>
    `;
  } catch (err) {
    weatherForecastBox.innerHTML = `<p>${isTelugu ? "వాతావరణ సమాచారం అందుబాటులో లేదు" : "Weather info unavailable"}</p>`;
  }
}

// ====== HELPER: Transliteration (Phonetic only for company names) ======
function toTeluguPhonetic(text) {
  const map = {
    a: "అ", b: "బ", c: "క", d: "డ", e: "ఎ", f: "ఫ", g: "గ", h: "హ",
    i: "ఇ", j: "జ", k: "క", l: "ల", m: "మ", n: "న", o: "ఒ", p: "ప",
    q: "క్వ", r: "ర", s: "స", t: "ట", u: "ఉ", v: "వ", w: "వ", x: "క్ష",
    y: "య", z: "జ"
  };
  return text.split("").map(ch => map[ch.toLowerCase()] || ch).join("");
}
