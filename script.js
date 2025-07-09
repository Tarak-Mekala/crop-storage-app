let isTelugu = false;

function goToPage1() {
  showOnlyPage("page1");
}

function goToPage2() {
  showOnlyPage("page2");
  document.getElementById("error").innerText = "";
  document.getElementById("cropInput").value = "";
  document.getElementById("suggestions").innerHTML = "";
  document.getElementById("regionSelect").value = "";
  document.getElementById("result").innerHTML = "";
  document.getElementById("storageResults").innerHTML = "";
  document.getElementById("weatherCard").style.display = "none";
  document.getElementById("centerSection").style.display = "none";
}

function goToPage3() {
  const cropInput = document.getElementById("cropInput").value.trim().toLowerCase();
  const region = document.getElementById("regionSelect").value;
  const errorDiv = document.getElementById("error");
  const match = cropData.find(item => item.crop === cropInput);

  if (!match) {
    errorDiv.innerText = isTelugu ? "పంట కనుగొనబడలేదు. దయచేసి పదాన్ని తనిఖీ చేయండి." : "Crop not found. Please check spelling.";
    return;
  }

  errorDiv.innerText = "";
  document.getElementById("cropTitle").innerText = isTelugu ? match.crop_te : match.crop;

  document.getElementById("result").innerHTML = `
    <p><strong>${isTelugu ? "ఉత్తమ ఉష్ణోగ్రత" : "Ideal Temperature"}:</strong> ${match.temperature}</p>
    <p><strong>${isTelugu ? "ఆర్ద్రత శాతం" : "Ideal Humidity"}:</strong> ${match.humidity}</p>
    <p><strong>${isTelugu ? "భద్రత గల కాలం" : "Max Storage Period"}:</strong> ${match.storage}</p>
    <p><strong>${isTelugu ? "అందుబాటులో ధర" : "Approx Price"}:</strong> ₹${match.price}/kg</p>
  `;

  displayStorageCenters(region);
  fetchWeather(region);
  showOnlyPage("page3");
}

function showOnlyPage(pageId) {
  document.getElementById("page1").style.display = "none";
  document.getElementById("page2").style.display = "none";
  document.getElementById("page3").style.display = "none";
  document.getElementById(pageId).style.display = "block";
}

function showSuggestions() {
  const input = document.getElementById("cropInput").value.toLowerCase();
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";

  if (!input) return;

  const matches = cropData
    .filter(item => item.crop.startsWith(input))
    .map(item => isTelugu ? item.crop_te : item.crop);

  matches.forEach(crop => {
    const li = document.createElement("li");
    li.textContent = crop;
    li.onclick = () => {
      document.getElementById("cropInput").value = crop;
      suggestions.innerHTML = "";
    };
    suggestions.appendChild(li);
  });
}

function displayStorageCenters(region) {
  const centerDiv = document.getElementById("centerSection");
  const storageList = document.getElementById("storageResults");
  const matched = storageData.find(item => item.district.toLowerCase() === region.toLowerCase());

  if (matched && matched.centers.length > 0) {
    centerDiv.style.display = "block";
    storageList.innerHTML = matched.centers.map(center => `<li>${isTelugu ? center.te : center.en}</li>`).join('');
  } else {
    centerDiv.style.display = "block";
    storageList.innerHTML = `<li>${isTelugu ? "జిల్లాకు స్టోరేజ్ సెంటర్లు లభించలేదు." : `No storage centers found for ${region}.`}</li>`;
  }
}

function fetchWeather(region) {
  const apiKey = "9d615f5f1e48d9502a77a12229e0e639";
  const weatherCard = document.getElementById("weatherCard");
  weatherCard.style.display = "none";

  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${region}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
      const forecast = data.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 3);
      weatherCard.innerHTML = `
        <h3>${isTelugu ? "మూడురోజుల వాతావరణ సమాచారం" : "3-Day Weather Forecast"}</h3>
        <div class="forecast">
          ${forecast.map(day => `
            <div class="forecast-day">
              <p><strong>${new Date(day.dt_txt).toDateString()}</strong></p>
              <p>🌡️ ${isTelugu ? "ఉష్ణోగ్రత" : "Temp"}: ${day.main.temp}°C</p>
              <p>💧 ${isTelugu ? "ఆర్ద్రత" : "Humidity"}: ${day.main.humidity}%</p>
              <p>🌥️ ${day.weather[0].main}</p>
            </div>
          `).join('')}
        </div>
      `;
      weatherCard.style.display = "block";
    })
    .catch(err => {
      weatherCard.innerHTML = `<p>${isTelugu ? "వాతావరణ డేటా అందుబాటులో లేదు." : "Weather data not available."}</p>`;
      weatherCard.style.display = "block";
    });
}

// Voice input
function startVoiceInput() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = isTelugu ? "te-IN" : "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  document.getElementById("listeningNote").style.display = "block";

  recognition.start();

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript.toLowerCase();
    document.getElementById("cropInput").value = transcript;
    document.getElementById("listeningNote").style.display = "none";
    showSuggestions();
  };

  recognition.onerror = function () {
    document.getElementById("listeningNote").style.display = "none";
  };
}

// Language toggle
function toggleLanguage() {
  isTelugu = document.getElementById("languageToggle").checked;

  document.getElementById("cropPrompt").innerText = isTelugu ? "పంట పేరును నమోదు చేయండి" : "Enter Crop Name";
  document.getElementById("districtPrompt").innerText = isTelugu ? "మీ జిల్లా ఎంచుకోండి" : "Select Your District";
  document.getElementById("storageHeading").innerText = isTelugu ? "దగ్గరలోని నిల్వ కేంద్రాలు" : "Nearby Storage Centers";
}

// Crop Dataset
const cropData = [
  { crop: "wheat", crop_te: "గోధుమలు", temperature: "10–15°C", humidity: "65–70%", storage: "6–12 months", price: 26 },
  { crop: "rice", crop_te: "బియ్యం", temperature: "10–15°C", humidity: "65–70%", storage: "6–12 months", price: 32 },
  { crop: "maize", crop_te: "మక్క జొన్న", temperature: "0–4°C", humidity: "80–85%", storage: "6–12 months", price: 18 },
  { crop: "potato", crop_te: "బంగాళదుంప", temperature: "4–7°C", humidity: "90–95%", storage: "90 days", price: 22 },
  { crop: "onion", crop_te: "ఉల్లిపాయ", temperature: "0–2°C", humidity: "65–70%", storage: "150 days", price: 25 },
  { crop: "tomato", crop_te: "టమోటా", temperature: "12–15°C", humidity: "85–90%", storage: "14 days", price: 20 },
  { crop: "chillies", crop_te: "మిరపకాయలు", temperature: "8–10°C", humidity: "70–75%", storage: "20 days", price: 90 },
  { crop: "mango", crop_te: "మామిడి", temperature: "10–13°C", humidity: "85–90%", storage: "28 days", price: 50 },
  { crop: "banana", crop_te: "అరటి", temperature: "13–14°C", humidity: "85–95%", storage: "18–22 days", price: 18 },
  { crop: "sugarcane", crop_te: "చెరుకు", temperature: "12–14°C", humidity: "70–75%", storage: "3–5 months", price: 34 },
  { crop: "groundnut", crop_te: "వేరుసెనగ", temperature: "6–10°C", humidity: "70–80%", storage: "3–6 months", price: 60 },
  { crop: "cotton", crop_te: "పత్తి", temperature: "10–15°C", humidity: "65–75%", storage: "6–8 months", price: 70 },
  { crop: "pulses", crop_te: "పప్పులు", temperature: "5–10°C", humidity: "65–75%", storage: "6–12 months", price: 80 },
  { crop: "cabbage", crop_te: "కోసు కూర", temperature: "0–1°C", humidity: "90–95%", storage: "2–3 months", price: 24 },
  { crop: "cauliflower", crop_te: "కాలీఫ్లవర్", temperature: "0–1°C", humidity: "90–95%", storage: "2–3 months", price: 26 }
];

// Storage Data
const storageData = [
  {
    district: "Adilabad",
    centers: [
      { en: "GMR Warehouse", te: "జి ఎం ఆర్ వేర్‌హౌస్" },
      { en: "Ladda Agro Godowns", te: "లడ్డా అగ్రో గోడౌన్లు" },
      { en: "Paharia Warehouse", te: "పహారియా వేర్‌హౌస్" },
      { en: "Y S R Godown", te: "వై ఎస్ ఆర్ గోడౌన్" }
    ]
  },
  {
    district: "Karimnagar",
    centers: [
      { en: "Srinivasa Cold Storage", te: "శ్రీనివాస కోల్డ్ స్టోరేజ్" },
      { en: "Godavari Agro Warehousing", te: "గోదావరి అగ్రో వేర్‌హౌసింగ్" },
      { en: "SVS Cold Chain", te: "ఎస్ వి ఎస్ కోల్డ్ చైన్" },
      { en: "Sri Gaddam Veeresham Rural Godown", te: "శ్రీ గడ్డం వీరేశం గ్రామీణ గోడౌన్" }
    ]
  },
  // Add all other 8 districts here like above...
];

// Populate Districts
function populateDistrictDropdown() {
  const select = document.getElementById("regionSelect");
  storageData.forEach(item => {
    const option = document.createElement("option");
    option.value = item.district;
    option.textContent = item.district;
    select.appendChild(option);
  });
}

// On Load
window.onload = function () {
  showOnlyPage("page1");
  populateDistrictDropdown();
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
