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
    errorDiv.innerText = currentLanguage === "te" ? "పంట కనపడలేదు. ఖచ్చితంగా టైప్ చేయండి." : "Crop not found. Please check spelling.";
    return;
  }

  errorDiv.innerText = "";
  const cropName = currentLanguage === "te" ? match.telugu : match.crop;
  document.getElementById("cropTitle").innerText = cropName;

  document.getElementById("result").innerHTML = `
    <p><strong>${label("Ideal Temperature")}</strong>: ${match.temperature}</p>
    <p><strong>${label("Ideal Humidity")}</strong>: ${match.humidity}</p>
    <p><strong>${label("Max Storage Period")}</strong>: ${match.storage}</p>
    <p><strong>${label("Market Price per Kg")}</strong>: ₹${match.price}</p>
  `;

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
    const name = currentLanguage === "te" ? item.telugu : item.crop;
    const li = document.createElement("li");
    li.textContent = name;
    li.onclick = () => {
      document.getElementById("cropInput").value = name;
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
    const centers = currentLanguage === "te" ? matched.centersTelugu : matched.centers;
    storageList.innerHTML = centers.map(center => `<li>${center}</li>`).join('');
  } else {
    centerDiv.style.display = "block";
    storageList.innerHTML = `<li>${label("No storage centers found for")} ${region}.</li>`;
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
        <h3>${label("3-Day Weather Forecast")}</h3>
        <div class="forecast">
          ${forecast.map(day => `
            <div class="forecast-day">
              <p><strong>${new Date(day.dt_txt).toDateString()}</strong></p>
              <p>🌡️ ${label("Temp")}: ${day.main.temp}°C</p>
              <p>💧 ${label("Humidity")}: ${day.main.humidity}%</p>
              <p>🌥️ ${day.weather[0].main}</p>
            </div>
          `).join('')}
        </div>
      `;
      weatherCard.style.display = "block";
    })
    .catch(err => {
      weatherCard.innerHTML = `<p>${label("Weather data not available.")}</p>`;
      weatherCard.style.display = "block";
    });
}

function populateDistrictDropdown() {
  const select = document.getElementById("regionSelect");
  select.innerHTML = `<option value="">-- ${label("Select District")} --</option>`;
  storageData.forEach(item => {
    const option = document.createElement("option");
    option.value = item.district;
    option.textContent = item.district;
    select.appendChild(option);
  });
}

function toggleLanguage() {
  currentLanguage = currentLanguage === "en" ? "te" : "en";
  document.getElementById("langToggle").innerText = currentLanguage === "en" ? "తెలుగు" : "English";
  populateDistrictDropdown();
  showSuggestions();
}

function label(text) {
  const labels = {
    "Ideal Temperature": "ఆదర్శ ఉష్ణోగ్రత",
    "Ideal Humidity": "ఆదర్శ తేమ",
    "Max Storage Period": "గరిష్ట నిల్వ కాలం",
    "Market Price per Kg": "సగటు ధర (₹/kg)",
    "Select District": "జిల్లాను ఎంచుకోండి",
    "3-Day Weather Forecast": "3 రోజుల వాతావరణ సూచిక",
    "Temp": "ఉష్ణోగ్రత",
    "Humidity": "తేమ",
    "Weather data not available.": "వాతావరణ సమాచారం అందుబాటులో లేదు.",
    "No storage centers found for": "ఈ జిల్లాకు గోదాములు లభ్యం కావు"
  };
  return currentLanguage === "te" ? labels[text] || text : text;
}

function startVoiceSearch() {
  const note = document.getElementById("listeningNote");
  note.innerText = currentLanguage === "te" ? "వాయిస్ వినబడుతుంది..." : "Listening for crop name...";
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = currentLanguage === "te" ? "te-IN" : "en-IN";
  recognition.start();

  recognition.onresult = function (event) {
    const result = event.results[0][0].transcript.toLowerCase();
    document.getElementById("cropInput").value = result;
    showSuggestions();
    note.innerText = "";
  };

  recognition.onerror = function () {
    note.innerText = currentLanguage === "te" ? "వాయిస్ గుర్తింపు విఫలమైంది." : "Voice recognition failed.";
    setTimeout(() => (note.innerText = ""), 2000);
  };
}

// Crop Data
const cropData = [
  { crop: "wheat", telugu: "గోధుమలు", temperature: "10–15°C", humidity: "65–70%", storage: "6–12 months", price: 22 },
  { crop: "rice", telugu: "బియ్యం", temperature: "10–15°C", humidity: "65–70%", storage: "6–12 months", price: 28 },
  { crop: "maize", telugu: "మక్క జొన్న", temperature: "0–4°C", humidity: "80–85%", storage: "6–12 months", price: 18 },
  { crop: "potato", telugu: "బంగాళదుంప", temperature: "4–7°C", humidity: "90–95%", storage: "90 days", price: 20 },
  { crop: "onion", telugu: "ఉల్లిపాయ", temperature: "0–2°C", humidity: "65–70%", storage: "150 days", price: 25 },
  { crop: "tomato", telugu: "టమోటా", temperature: "12–15°C", humidity: "85–90%", storage: "14 days", price: 18 },
  { crop: "chillies", telugu: "మిరపకాయలు", temperature: "8–10°C", humidity: "70–75%", storage: "20 days", price: 60 },
  { crop: "mango", telugu: "మామిడి", temperature: "10–13°C", humidity: "85–90%", storage: "28 days", price: 45 },
  { crop: "banana", telugu: "అరటి", temperature: "13–14°C", humidity: "85–95%", storage: "18–22 days", price: 32 },
  { crop: "sugarcane", telugu: "చెరుకు", temperature: "12–14°C", humidity: "70–75%", storage: "3–5 months", price: 24 },
  { crop: "groundnut", telugu: "వేరుసెనగ", temperature: "6–10°C", humidity: "70–80%", storage: "3–6 months", price: 35 },
  { crop: "cotton", telugu: "పత్తి", temperature: "10–15°C", humidity: "65–75%", storage: "6–8 months", price: 55 },
  { crop: "pulses", telugu: "పప్పులు", temperature: "5–10°C", humidity: "65–75%", storage: "6–12 months", price: 50 },
  { crop: "cabbage", telugu: "కోసు కూర", temperature: "0–1°C", humidity: "90–95%", storage: "2–3 months", price: 20 },
  { crop: "cauliflower", telugu: "కాలీఫ్లవర్", temperature: "0–1°C", humidity: "90–95%", storage: "2–3 months", price: 22 }
];

// Storage Data (All 10 Districts with Telugu Transliteration)
const storageData = [
  {
    district: "Adilabad",
    centers: ["GMR Warehouse", "Ladda Agro Godowns", "Paharia Warehouse", "Y S R Godown"],
    centersTelugu: ["జిఎంఆర్ వేర్‌హౌస్", "లడ్డా అగ్రో గోడౌన్", "పహారియా వేర్‌హౌస్", "వైఎస్‌ఆర్ గోదౌన్"]
  },
  {
    district: "Karimnagar",
    centers: ["Srinivasa Cold Storage", "Godavari Agro Warehousing", "SVS Cold Chain", "Sri Gaddam Veeresham Rural Godown"],
    centersTelugu: ["శ్రీనివాస కోల్డ్ స్టోరేజ్", "గోదావరి అగ్రో వేర్‌హౌసింగ్", "ఎస్‌విఎస్ కోల్డ్ చైన్", "శ్రీ గడ్డం వీరేశం రూరల్ గోదౌన్"]
  },
  {
    district: "Nizamabad",
    centers: ["Nizam Agro Storage", "Green Leaf Cold Storage", "SLNS Cold Storage", "Hi-Tech Cold Storage"],
    centersTelugu: ["నిజాం అగ్రో స్టోరేజ్", "గ్రీన్ లీఫ్ కోల్డ్ స్టోరేజ్", "ఎస్‌ఎల్‌ఎన్‌ఎస్ కోల్డ్ స్టోరేజ్", "హైటెక్ కోల్డ్ స్టోరేజ్"]
  },
  {
    district: "Warangal",
    centers: ["Bhavani Cold Storage", "Sree Lakshmi Warehouse", "TSWC Facility", "Moksha cold storage", "Saptagiri cold storage", "Sri karthik cold storage", "Venkatagiri cold storage", "Vennela storage unit"],
    centersTelugu: ["భవాని కోల్డ్ స్టోరేజ్", "శ్రీ లక్ష్మి వేర్‌హౌస్", "టీఎస్‌డబ్ల్యూసీ ఫెసిలిటీ", "మోక్ష కోల్డ్ స్టోరేజ్", "సప్తగిరి కోల్డ్ స్టోరేజ్", "శ్రీ కార్తీక్ కోల్డ్ స్టోరేజ్", "వెంకటగిరి కోల్డ్ స్టోరేజ్", "వెన్నెల స్టోరేజ్ యూనిట్"]
  },
  {
    district: "Mahbubnagar",
    centers: ["Sri Sai Warehouse", "Mahindra Cold Chain", "Nandini Cold storages", "Sunyang Cold Storage", "Green House Cold storages"],
    centersTelugu: ["శ్రీ సాయి వేర్‌హౌస్", "మహీంద్ర కోల్డ్ చైన్", "నందిని కోల్డ్ స్టోరేజెస్", "సున్యాంగ్ కోల్డ్ స్టోరేజ్", "గ్రీన్ హౌస్ కోల్డ్ స్టోరేజెస్"]
  },
  {
    district: "Khammam",
    centers: ["Khammam Agro Cold Storage", "Red Chilies Storage", "Gayathri cold storage", "Swarnabharati cold storage", "Krishna sai storage unit"],
    centersTelugu: ["ఖమ్మం అగ్రో కోల్డ్ స్టోరేజ్", "రెడ్ చిల్లీస్ స్టోరేజ్", "గాయత్రి కోల్డ్ స్టోరేజ్", "స్వర్ణభారతి కోల్డ్ స్టోరేజ్", "కృష్ణ సాయి స్టోరేజ్ యూనిట్"]
  },
  {
    district: "Nalgonda",
    centers: ["Pavan Warehouse", "Sunrise Cold Storage", "TSWC Nalgonda", "Sri Satyadeva Cold Storage"],
    centersTelugu: ["పవన్ వేర్‌హౌస్", "సన్‌రైజ్ కోల్డ్ స్టోరేజ్", "టీఎస్‌డబ్ల్యూసీ నల్గొండ", "శ్రీ సత్యదేవ కోల్డ్ స్టోరేజ్"]
  },
  {
    district: "Medak",
    centers: ["Medak Agro Storage", "Greenfield Warehousing", "Afsari Begum Ripening Chamber", "S.S. Agro Fresh Cold Storage"],
    centersTelugu: ["మెదక్ అగ్రో స్టోరేజ్", "గ్రీన్‌ఫీల్డ్ వేర్‌హౌసింగ్", "అఫ్సారి బేగం రైపనింగ్ చాంబర్", "ఎస్.ఎస్. అగ్రో ఫ్రెష్ కోల్డ్ స్టోరేజ్"]
  },
  {
    district: "Rangareddy",
    centers: ["Hyderabad Cold Storage", "Sri Venkateshwara Agro", "Aditya Enterprises", "Venkateshwara cold storage"],
    centersTelugu: ["హైదరాబాద్ కోల్డ్ స్టోరేజ్", "శ్రీ వెంకటేశ్వర అగ్రో", "ఆదిత్య ఎంటర్‌ప్రైజెస్", "వెంకటేశ్వర కోల్డ్ స్టోరేజ్"]
  },
  {
    district: "Hyderabad",
    centers: ["City Agro Godowns", "Urban Cold Chain", "Coldrush logistics", "Akshaya cold storage"],
    centersTelugu: ["సిటీ అగ్రో గోడౌన్స్", "అర్బన్ కోల్డ్ చైన్", "కోల్డ్రష్ లాజిస్టిక్స్", "అక్షయ కోల్డ్ స్టోరేజ్"]
  }
];

// On Load
window.onload = function () {
  showOnlyPage("page1");
  populateDistrictDropdown();
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
