// Agri Sathi - Full script.js (Final Version)

// ---- Crop Data ----
const crops = [
  { name: "Paddy", telugu: "వరి", price: "₹25/kg" },
  { name: "Wheat", telugu: "గోధుమలు", price: "₹28/kg" },
  { name: "Maize", telugu: "మొక్కజొన్న", price: "₹20/kg" },
  { name: "Cotton", telugu: "పత్తి", price: "₹55/kg" },
  { name: "Groundnut", telugu: "వేరుశెనగ", price: "₹45/kg" },
  { name: "Chillies", telugu: "మిర్చి", price: "₹60/kg" },
  { name: "Turmeric", telugu: "పసుపు", price: "₹90/kg" },
  { name: "Onion", telugu: "ఉల్లిపాయ", price: "₹18/kg" },
  { name: "Tomato", telugu: "టమాటా", price: "₹12/kg" },
  { name: "Sugarcane", telugu: "చెరకుళ్లు", price: "₹5/kg" },
  { name: "Bajra", telugu: "సజ్జ", price: "₹22/kg" },
  { name: "Jowar", telugu: "జొన్న", price: "₹23/kg" },
  { name: "Ragi", telugu: "రాగి", price: "₹24/kg" },
  { name: "Soybean", telugu: "సోయాబీన్", price: "₹42/kg" },
  { name: "Sunflower", telugu: "సూర్యకాంతి", price: "₹48/kg" }
];

// ---- Districts and Storage Centers ----
const districts = {
  "Adilabad": ["Adilabad Agro Center", "Khanapur Godown", "Utnoor Storage Hub", "Jainad Cold Store", "Boath Farmers Depot"],
  "Nizamabad": ["Nizamabad Storage", "Armoor Warehouse", "Bodhan Agri Depot", "Yedapally Cold Store", "Varni Center"],
  "Karimnagar": ["Karimnagar Depot", "Jammikunta Storage", "Huzurabad Godown", "Manakondur Facility", "Choppadandi Agro Hub"],
  "Warangal": ["Warangal Agro Center", "Hanamkonda Godown", "Parkal Warehouse", "Narsampet Cold Store", "Wardhannapet Depot"],
  "Khammam": ["Khammam Storage", "Kothagudem Warehouse", "Palwancha Depot", "Sathupalli Agri Center", "Wyra Godown"],
  "Mahbubnagar": ["Mahbubnagar Depot", "Gadwal Warehouse", "Narayanpet Storage", "Makthal Cold Storage", "Achampet Facility"],
  "Medak": ["Medak Storage", "Siddipet Agri Center", "Zaheerabad Godown", "Gajwel Depot", "Ramayampet Facility"],
  "Rangareddy": ["Rangareddy Cold Store", "Ibrahimpatnam Depot", "Chevella Warehouse", "Shamshabad Facility", "Moinabad Storage"],
  "Nalgonda": ["Nalgonda Godown", "Miryalaguda Storage", "Suryapet Depot", "Chityal Cold Store", "Kodad Agro Center"],
  "Hyderabad": ["Hyd Main Agri Store", "Secunderabad Warehouse", "Shamirpet Depot", "LB Nagar Facility", "Malkajgiri Cold Store"]
};

// ---- Transliterate Storage Centers for Telugu ----
function transliterateStorageCenter(name) {
  const translits = {
    "Depot": "డిపో", "Storage": "స్టోరేజ్", "Center": "సెంటర్",
    "Warehouse": "వేర్‌హౌస్", "Cold Store": "కోల్డ్ స్టోర్",
    "Godown": "గోడౌన్", "Facility": "ఫెసిలిటీ", "Hub": "హబ్"
  };
  let result = name;
  for (const [eng, tel] of Object.entries(translits)) {
    result = result.replace(eng, tel);
  }
  return result;
}

// ---- Voice Recognition ----
function startVoiceRecognition() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = isTelugu ? 'te-IN' : 'en-IN';
  document.getElementById("listening-note").style.display = "block";
  recognition.start();

  recognition.onresult = (event) => {
    document.getElementById("crop-input").value = event.results[0][0].transcript;
    document.getElementById("listening-note").style.display = "none";
  };

  recognition.onerror = () => {
    document.getElementById("listening-note").style.display = "none";
    alert("Voice input failed.");
  };
}

// ---- Populate District Dropdown ----
function populateDistricts() {
  const select = document.getElementById("district-select");
  select.innerHTML = `<option disabled selected>-- SELECT DISTRICT --</option>`;
  Object.keys(districts).forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    select.appendChild(opt);
  });
}

// ---- Get Crop Info ----
function getCropInfo() {
  const cropInput = document.getElementById("crop-input").value.trim().toLowerCase();
  const district = document.getElementById("district-select").value;
  const crop = crops.find(c => c.name.toLowerCase() === cropInput || c.telugu === cropInput);

  if (!crop) {
    document.getElementById("crop-name-box").textContent = isTelugu ? "పంట కనపడలేదు" : "Crop not found";
    document.getElementById("crop-price-box").textContent = "";
    document.getElementById("condition-box").textContent = "";
    document.getElementById("center-box").textContent = "";
    return;
  }

  document.getElementById("crop-name-box").textContent = isTelugu ? crop.telugu : crop.name;
  document.getElementById("crop-price-box").textContent = isTelugu ? `సగటు ధర: ${crop.price}` : `Approx. Market Price: ${crop.price}`;
  document.getElementById("condition-box").textContent = isTelugu
    ? "భద్రపరిచే సరైన ఉష్ణోగ్రత: 10°C - 25°C | ఆర్ద్రత: 60% - 70%"
    : "Ideal Storage Temp: 10°C - 25°C | Humidity: 60% - 70%";

  const centers = districts[district];
  document.getElementById("center-box").innerHTML = (isTelugu ? "సేకరణ కేంద్రాలు:\n" : "Nearby Storage Centers:\n") +
    centers.map(c => `• ${isTelugu ? transliterateStorageCenter(c) : c}`).join("<br>");
}

// ---- Weather Forecast ----
async function loadWeather() {
  const district = document.getElementById("district-select").value;
  const apiKey = "9d615f5f1e48d9502a77a12229e0e639";
  const box = document.getElementById("weather-box");

  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${district},IN&appid=${apiKey}&units=metric`);
    const data = await res.json();
    const daily = {};

    data.list.forEach(entry => {
      const date = entry.dt_txt.split(" ")[0];
      if (!daily[date]) {
        daily[date] = {
          temp: entry.main.temp,
          weather: entry.weather[0].description
        };
      }
    });

    box.innerHTML = Object.entries(daily).slice(0, 3).map(([d, val]) => `
      <div class="weather-card">
        <strong>${d}</strong><br>🌡 ${val.temp}°C<br>🌥 ${val.weather}
      </div>
    `).join("");
  } catch {
    box.innerHTML = isTelugu ? "వాతావరణ సమాచారం అందుబాటులో లేదు" : "Weather info unavailable";
  }
}

// ---- Crop Suggestions ----
function setupSuggestions() {
  const input = document.getElementById("crop-input");
  const list = document.getElementById("suggestion-list");

  input.addEventListener("input", () => {
    const query = input.value.toLowerCase();
    list.innerHTML = "";
    if (!query) return;
    crops.filter(c => c.name.toLowerCase().startsWith(query) || c.telugu.startsWith(query))
      .forEach(s => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.textContent = isTelugu ? s.telugu : s.name;
        item.onclick = () => {
          input.value = item.textContent;
          list.innerHTML = "";
        };
        list.appendChild(item);
      });
  });
}

// ---- Page Navigation and Language Toggle ----
let isTelugu = false;

document.addEventListener("DOMContentLoaded", () => {
  populateDistricts();
  setupSuggestions();

  document.getElementById("start-btn").onclick = () => showPage("page2");
  document.getElementById("get-details").onclick = () => {
    getCropInfo();
    loadWeather();
    showPage("page3");
  };
  document.getElementById("back-btn").onclick = () => showPage("page2");
  document.getElementById("voice-btn").onclick = startVoiceRecognition;

  document.getElementById("lang-toggle").addEventListener("change", function () {
    isTelugu = this.checked;
    document.getElementById("title").textContent = isTelugu ? "అగ్రి సాథి కు స్వాగతం" : "Welcome to Agri Sathi";
    document.getElementById("sub-title").textContent = isTelugu
      ? "ఈ యాప్ పంటల నిల్వ పరిస్థితులు మరియు సమీప కేంద్రాల సమాచారాన్ని అందిస్తుంది"
      : "Find ideal storage conditions and nearby storage centers";
    document.getElementById("start-btn").textContent = isTelugu ? "ప్రారంభించు" : "Start";
    document.getElementById("get-details").textContent = isTelugu ? "వివరాలు చూపించు" : "Get Details";
    document.getElementById("back-btn").textContent = isTelugu ? "వెనుకకు" : "Back";
    document.getElementById("crop-label").textContent = isTelugu ? "పంట పేరు" : "ENTER CROP NAME";
    document.getElementById("district-label").textContent = isTelugu ? "జిల్లా ఎంపిక" : "SELECT DISTRICT";
    document.getElementById("crop-input").placeholder = isTelugu ? "పంట పేరు టైప్ చేయండి..." : "Type crop name...";
    getCropInfo();
  });
});

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.getElementById(pageId).style.display = "block";
}
