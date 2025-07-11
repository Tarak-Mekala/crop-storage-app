let currentLanguage = "en";

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
}

function goToPage3() {
  const cropInput = document.getElementById("cropInput").value.trim().toLowerCase();
  const region = document.getElementById("regionSelect").value;
  const errorDiv = document.getElementById("error");

  const match = cropData.find(item =>
    item.crop.toLowerCase() === cropInput ||
    item.telugu.toLowerCase() === cropInput
  );

  if (!match) {
    errorDiv.innerText = currentLanguage === "te" ? "పంట కనపడలేదు. దయచేసి స్పెల్లింగ్ తనిఖీ చేయండి." : "Crop not found. Please check spelling.";
    return;
  }

  errorDiv.innerText = "";
  document.getElementById("cropTitle").innerText =
    currentLanguage === "te" ? match.telugu : match.crop;

  const detailsHTML = `
    <p><strong>${currentLanguage === "te" ? "సరి అయిన ఉష్ణోగ్రత" : "Ideal Temperature"}:</strong> ${match.temperature}</p>
    <p><strong>${currentLanguage === "te" ? "సరి అయిన ఆర్ద్రత" : "Ideal Humidity"}:</strong> ${match.humidity}</p>
    <p><strong>${currentLanguage === "te" ? "గరిష్ట నిల్వ కాలం" : "Max Storage Period"}:</strong> ${match.storage}</p>
    <p><strong>${currentLanguage === "te" ? "అందుబాటులో ధర (రూ/కిలో)" : "Market Price (Rs/kg)"}:</strong> ₹${match.price}</p>
  `;
  document.getElementById("result").innerHTML = detailsHTML;

  displayStorageCenters(region);
  fetchWeather(region);
  showOnlyPage("page3");
}

function showOnlyPage(pageId) {
  ["page1", "page2", "page3"].forEach(id => {
    document.getElementById(id).style.display = "none";
  });
  document.getElementById(pageId).style.display = "block";
}

function showSuggestions() {
  const input = document.getElementById("cropInput").value.toLowerCase();
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";

  if (!input) return;

  const matches = cropData.filter(item =>
    item.crop.toLowerCase().startsWith(input) ||
    item.telugu.toLowerCase().startsWith(input)
  );

  matches.forEach(item => {
    const li = document.createElement("li");
    li.textContent = currentLanguage === "te" ? item.telugu : item.crop;
    li.onclick = () => {
      document.getElementById("cropInput").value = li.textContent;
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
    const centerItems = matched.centers.map(center =>
      `<li>${currentLanguage === "te" ? transliterate(center) : center}</li>`
    ).join("");
    centerDiv.style.display = "block";
    storageList.innerHTML = centerItems;
  } else {
    centerDiv.style.display = "block";
    storageList.innerHTML = `<li>${currentLanguage === "te" ? "ఈ జిల్లా కోసం నిల్వ కేంద్రాలు లభించలేదు." : "No storage centers found for this district."}</li>`;
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
        <h3>${currentLanguage === "te" ? "3 రోజుల వాతావరణ సూచిక" : "3-Day Weather Forecast"}</h3>
        <div class="forecast">
          ${forecast.map(day => `
            <div class="forecast-day">
              <p><strong>${new Date(day.dt_txt).toDateString()}</strong></p>
              <p>🌡️ ${day.main.temp}°C</p>
              <p>💧 ${day.main.humidity}%</p>
              <p>🌥️ ${day.weather[0].main}</p>
            </div>`).join("")}
        </div>`;
      weatherCard.style.display = "block";
    })
    .catch(err => {
      weatherCard.innerHTML = `<p>${currentLanguage === "te" ? "వాతావరణ సమాచారం అందుబాటులో లేదు." : "Weather data not available."}</p>`;
      weatherCard.style.display = "block";
    });
}

function toggleLanguage() {
  currentLanguage = currentLanguage === "en" ? "te" : "en";
  document.getElementById("languageToggle").innerText = currentLanguage === "te" ? "English" : "తెలుగు";
  document.getElementById("cropInput").placeholder = currentLanguage === "te" ? "పంట పేరును నమోదు చేయండి" : "Enter crop name";
  populateDistrictDropdown();
  showSuggestions();
}

function populateDistrictDropdown() {
  const select = document.getElementById("regionSelect");
  select.innerHTML = `<option value="">${currentLanguage === "te" ? "-- జిల్లా ఎంచుకోండి --" : "-- Select District --"}</option>`;
  storageData.forEach(item => {
    const option = document.createElement("option");
    option.value = item.district;
    option.textContent = item.district;
    select.appendChild(option);
  });
}

function transliterate(text) {
  // You can replace this with a better library if needed
  return text; // For now, just return unchanged as transliteration already applied manually
}

// Voice recognition
function startVoiceRecognition() {
  const note = document.getElementById("voiceNote");
  note.style.display = "block";

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = currentLanguage === "te" ? "te-IN" : "en-US";

  recognition.onresult = function (event) {
    const result = event.results[0][0].transcript;
    document.getElementById("cropInput").value = result;
    showSuggestions();
    note.style.display = "none";
  };

  recognition.onerror = function () {
    note.innerText = currentLanguage === "te" ? "గొంతు గుర్తింపు విఫలమైంది" : "Voice recognition failed.";
    setTimeout(() => (note.style.display = "none"), 2000);
  };

  recognition.start();
}

// Full crop data
const cropData = [
  { crop: "wheat", telugu: "గోధుమలు", temperature: "10–15°C", humidity: "65–70%", storage: "6–12 months", price: 23 },
  { crop: "rice", telugu: "బియ్యం", temperature: "10–15°C", humidity: "65–70%", storage: "6–12 months", price: 27 },
  { crop: "maize", telugu: "మక్క జొన్న", temperature: "0–4°C", humidity: "80–85%", storage: "6–12 months", price: 19 },
  { crop: "potato", telugu: "బంగాళదుంప", temperature: "4–7°C", humidity: "90–95%", storage: "90 days", price: 18 },
  { crop: "onion", telugu: "ఉల్లిపాయ", temperature: "0–2°C", humidity: "65–70%", storage: "150 days", price: 15 },
  { crop: "tomato", telugu: "టమోటా", temperature: "12–15°C", humidity: "85–90%", storage: "14 days", price: 20 },
  { crop: "chillies", telugu: "మిరపకాయలు", temperature: "8–10°C", humidity: "70–75%", storage: "20 days", price: 48 },
  { crop: "mango", telugu: "మామిడి", temperature: "10–13°C", humidity: "85–90%", storage: "28 days", price: 35 },
  { crop: "banana", telugu: "అరటి", temperature: "13–14°C", humidity: "85–95%", storage: "18–22 days", price: 22 },
  { crop: "sugarcane", telugu: "చెరుకు", temperature: "12–14°C", humidity: "70–75%", storage: "3–5 months", price: 14 },
  { crop: "groundnut", telugu: "వేరుసెనగ", temperature: "6–10°C", humidity: "70–80%", storage: "3–6 months", price: 55 },
  { crop: "cotton", telugu: "పత్తి", temperature: "10–15°C", humidity: "65–75%", storage: "6–8 months", price: 65 },
  { crop: "pulses", telugu: "పప్పులు", temperature: "5–10°C", humidity: "65–75%", storage: "6–12 months", price: 52 },
  { crop: "cabbage", telugu: "కోసు కూర", temperature: "0–1°C", humidity: "90–95%", storage: "2–3 months", price: 18 },
  { crop: "cauliflower", telugu: "కాలీఫ్లవర్", temperature: "0–1°C", humidity: "90–95%", storage: "2–3 months", price: 25 }
];

// All 10 districts with full storage center data (transliterated if Telugu mode is active)
const storageData = [
  {
    district: "Adilabad",
    centers: ["GMR Warehouse, Ashok Kumar Gadewar", "Ladda Agro Godowns, Jainad", "Paharia Warehouse", "YSR Godown"]
  },
  {
    district: "Karimnagar",
    centers: ["Srinivasa Cold Storage", "Godavari Agro Warehousing", "SVS Cold Chain", "Sri Gaddam Veeresham Rural Godown"]
  },
  {
    district: "Nizamabad",
    centers: ["Nizam Agro Storage", "Green Leaf Cold Storage", "SLNS Cold Storage, Munipally", "Hi-Tech Cold Storage, Armoor"]
  },
  {
    district: "Warangal",
    centers: ["Bhavani Cold Storage", "Sree Lakshmi Warehouse", "TSWC Facility", "Moksha Cold Storage", "Saptagiri Cold Storage", "Sri Karthik Cold Storage", "Venkatagiri Cold Storage", "Vennela Storage Unit"]
  },
  {
    district: "Mahbubnagar",
    centers: ["Sri Sai Warehouse", "Mahindra Cold Chain", "Nandini Cold Storages", "Sunyang Cold Storage", "Greenhouse Farms Cold Storages"]
  },
  {
    district: "Khammam",
    centers: ["Khammam Agro Cold Storage", "Red Chilies Storage, Wyra", "Gayathri Cold Storage", "Swarnabharati Cold Storage", "Krishna Sai Storage Unit"]
  },
  {
    district: "Nalgonda",
    centers: ["Pavan Warehouse", "Sunrise Cold Storage", "TSWC Nalgonda", "Sri Satyadeva Cold Storage, Dondapadu"]
  },
  {
    district: "Medak",
    centers: ["Medak Agro Storage", "Greenfield Warehousing", "Afsari Begum Ripening Chamber", "S.S. Agro Fresh Cold Storage"]
  },
  {
    district: "Rangareddy",
    centers: ["Hyderabad Cold Storage, Shamshabad", "Sri Venkateshwara Agro", "Aditya Enterprises", "Venkateshwara Cold Storage"]
  },
  {
    district: "Hyderabad",
    centers: ["City Agro Godowns", "Urban Cold Chain", "Coldrush Logistics", "Akshaya Cold Storage Pvt Ltd"]
  }
];

// Initialize on load
window.onload = function () {
  showOnlyPage("page1");
  populateDistrictDropdown();
};
