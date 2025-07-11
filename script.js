let currentLang = 'en';

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

  let match;
  if (currentLang === 'te') {
    match = cropData.find(item => item.telugu.toLowerCase() === cropInput);
  } else {
    match = cropData.find(item => item.crop.toLowerCase() === cropInput);
  }

  if (!match) {
    errorDiv.innerText = "Crop not found. Please check spelling.";
    return;
  }

  errorDiv.innerText = "";
  document.getElementById("cropTitle").innerText = (currentLang === 'te' ? match.telugu : match.crop).toUpperCase();
  document.getElementById("result").innerHTML = `
    <p><strong>${currentLang === 'te' ? "ఆదర్శ ఉష్ణోగ్రత" : "Ideal Temperature"}:</strong> ${match.temperature}</p>
    <p><strong>${currentLang === 'te' ? "ఆదర్శ తేమ" : "Ideal Humidity"}:</strong> ${match.humidity}</p>
    <p><strong>${currentLang === 'te' ? "గరిష్ఠ నిల్వ కాలం" : "Max Storage Period"}:</strong> ${match.storage}</p>
    <p><strong>${currentLang === 'te' ? "ఊహించిన ధర" : "Market Price"}:</strong> ₹${match.price} / kg</p>
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
    .filter(item =>
      currentLang === 'te'
        ? item.telugu.toLowerCase().startsWith(input)
        : item.crop.toLowerCase().startsWith(input)
    )
    .map(item => currentLang === 'te' ? item.telugu : item.crop);

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
    storageList.innerHTML = matched.centers.map(center => `<li>${currentLang === 'te' ? center.telugu : center.name}</li>`).join('');
  } else {
    centerDiv.style.display = "block";
    storageList.innerHTML = `<li>${currentLang === 'te' ? "స్టోరేజ్ కేంద్రాలు లేవు" : "No storage centers found."}</li>`;
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
        <h3>${currentLang === 'te' ? "3-రోజుల వాతావరణ సూచన" : "3-Day Weather Forecast"}</h3>
        <div class="forecast">
          ${forecast.map(day => `
            <div class="forecast-day">
              <p><strong>${new Date(day.dt_txt).toDateString()}</strong></p>
              <p>🌡️ ${day.main.temp}°C</p>
              <p>💧 ${day.main.humidity}%</p>
              <p>🌥️ ${day.weather[0].main}</p>
            </div>
          `).join('')}
        </div>
      `;
      weatherCard.style.display = "block";
    })
    .catch(err => {
      weatherCard.innerHTML = "<p>Weather data not available.</p>";
      weatherCard.style.display = "block";
    });
}

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'te' : 'en';
  const toggleBtn = document.getElementById("langToggle");
  toggleBtn.innerText = currentLang === 'en' ? "తెలుగు" : "English";
  showSuggestions();
}

function startVoiceSearch() {
  const note = document.getElementById("voiceNote");
  note.innerText = currentLang === 'te' ? "కోసం వినిపిస్తోంది..." : "Listening...";
  note.style.display = "block";

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = currentLang === 'te' ? 'te-IN' : 'en-IN';
  recognition.start();

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript.toLowerCase();
    document.getElementById("cropInput").value = transcript;
    showSuggestions();
    note.style.display = "none";
  };

  recognition.onerror = function () {
    note.innerText = currentLang === 'te' ? "వాయిస్ గుర్తింపు విఫలమైంది" : "Voice recognition failed.";
    setTimeout(() => note.style.display = "none", 2000);
  };
}

const cropData = [
  { crop: "wheat", telugu: "గోధుమలు", temperature: "10–15°C", humidity: "65–70%", storage: "6–12 months", price: 28 },
  { crop: "rice", telugu: "బియ్యం", temperature: "10–15°C", humidity: "65–70%", storage: "6–12 months", price: 34 },
  { crop: "maize", telugu: "మక్క జొన్న", temperature: "0–4°C", humidity: "80–85%", storage: "6–12 months", price: 21 },
  { crop: "potato", telugu: "బంగాళదుంప", temperature: "4–7°C", humidity: "90–95%", storage: "90 days", price: 18 },
  { crop: "onion", telugu: "ఉల్లిపాయ", temperature: "0–2°C", humidity: "65–70%", storage: "150 days", price: 22 },
  { crop: "tomato", telugu: "టమోటా", temperature: "12–15°C", humidity: "85–90%", storage: "14 days", price: 25 },
  { crop: "chillies", telugu: "మిరపకాయలు", temperature: "8–10°C", humidity: "70–75%", storage: "20 days", price: 95 },
  { crop: "mango", telugu: "మామిడి", temperature: "10–13°C", humidity: "85–90%", storage: "28 days", price: 40 },
  { crop: "banana", telugu: "అరటి", temperature: "13–14°C", humidity: "85–95%", storage: "18–22 days", price: 30 },
  { crop: "sugarcane", telugu: "చెరుకు", temperature: "12–14°C", humidity: "70–75%", storage: "3–5 months", price: 32 },
  { crop: "groundnut", telugu: "వేరుసెనగ", temperature: "6–10°C", humidity: "70–80%", storage: "3–6 months", price: 50 },
  { crop: "cotton", telugu: "పత్తి", temperature: "10–15°C", humidity: "65–75%", storage: "6–8 months", price: 58 },
  { crop: "pulses", telugu: "పప్పులు", temperature: "5–10°C", humidity: "65–75%", storage: "6–12 months", price: 45 },
  { crop: "cabbage", telugu: "కోసు కూర", temperature: "0–1°C", humidity: "90–95%", storage: "2–3 months", price: 26 },
  { crop: "cauliflower", telugu: "కాలీఫ్లవర్", temperature: "0–1°C", humidity: "90–95%", storage: "2–3 months", price: 27 }
];

const storageData = [
  {
    district: "Adilabad",
    centers: [
      { name: "GMR Warehouse", telugu: "జిఎంఆర్ వేర్‌హౌస్" },
      { name: "Ladda Agro Godowns", telugu: "లడ్డా అగ్రో గోదాంస్" },
      { name: "Paharia Warehouse", telugu: "పహారియా వేర్‌హౌస్" },
      { name: "Y S R Godown", telugu: "వైఎస్‌ఆర్ గోదాం" }
    ]
  },
  {
    district: "Karimnagar",
    centers: [
      { name: "Srinivasa Cold Storage", telugu: "శ్రీనివాస కోల్డ్ స్టోరేజ్" },
      { name: "Godavari Agro Warehousing", telugu: "గోదావరి అగ్రో వేర్‌హౌసింగ్" },
      { name: "SVS Cold Chain", telugu: "ఎస్‌విఎస్ కోల్డ్ చెయిన్" },
      { name: "Sri Gaddam Veeresham Rural Godown", telugu: "శ్రీ గద్దం వీరేశం రూరల్ గోదౌన్" }
    ]
  },
  {
    district: "Warangal",
    centers: [
      { name: "AgroStar Warehouse", telugu: "అగ్రోస్టార్ వేర్‌హౌస్" },
      { name: "Krishna Cold Storage", telugu: "కృష్ణ కోల్డ్ స్టోరేజ్" },
      { name: "TKR Agro Godowns", telugu: "టీకేఆర్ అగ్రో గోదౌన్స్" },
      { name: "Sri Venkateshwara Storage", telugu: "శ్రీ వెంకటేశ్వర స్టోరేజ్" }
    ]
  },
  {
    district: "Khammam",
    centers: [
      { name: "GreenLeaf Storage Solutions", telugu: "గ్రీన్ లీఫ్ స్టోరేజ్ సోల్యూషన్స్" },
      { name: "Gowtham Agro Storage", telugu: "గౌతమ్ అగ్రో స్టోరేజ్" },
      { name: "Mega Agro Cold Storage", telugu: "మెగా అగ్రో కోల్డ్ స్టోరేజ్" },
      { name: "Bhagyanagar Warehousing", telugu: "భాగ్యనగర్ వేర్‌హౌసింగ్" }
    ]
  },
  {
    district: "Nalgonda",
    centers: [
      { name: "Raghavendra Cold Chain", telugu: "రాఘవేంద్ర కోల్డ్ చెయిన్" },
      { name: "Sri Satya Warehousing", telugu: "శ్రీ సత్య వేర్‌హౌసింగ్" },
      { name: "VSR Agri Depot", telugu: "విఎస్‌ఆర్ అగ్రి డెపో" },
      { name: "Sri Laxmi Agro Yard", telugu: "శ్రీ లక్ష్మి అగ్రో యార్డ్" }
    ]
  },
  {
    district: "Medak",
    centers: [
      { name: "Annapurna Agro Storage", telugu: "అన్నపూర్ణ అగ్రో స్టోరేజ్" },
      { name: "Vishnu Godown", telugu: "విష్ణు గోదౌన్" },
      { name: "Green Farm Warehousing", telugu: "గ్రీన్ ఫామ్ వేర్‌హౌసింగ్" },
      { name: "Shivaay Cold Storage", telugu: "శివాయ్ కోల్డ్ స్టోరేజ్" }
    ]
  },
  {
    district: "Mahbubnagar",
    centers: [
      { name: "Sai Ram Storage", telugu: "సాయి రాం స్టోరేజ్" },
      { name: "Kisan Agri Depot", telugu: "కిసాన్ అగ్రి డెపో" },
      { name: "Kakatiya Warehousing", telugu: "కాకతీయ వేర్‌హౌసింగ్" },
      { name: "SV Agro Logistics", telugu: "ఎస్‌వి అగ్రో లాజిస్టిక్స్" }
    ]
  },
  {
    district: "Nizamabad",
    centers: [
      { name: "Omkar Godowns", telugu: "ఓంకార్ గోదౌన్స్" },
      { name: "Rajeshwari Storage House", telugu: "రాజేశ్వరి స్టోరేజ్ హౌస్" },
      { name: "Global Warehousing", telugu: "గ్లోబల్ వేర్‌హౌసింగ్" },
      { name: "Shree Hari Agri Depot", telugu: "శ్రీ హరి అగ్రి డెపో" }
    ]
  },
  {
    district: "Rangareddy",
    centers: [
      { name: "Hyderabad Agro Storage", telugu: "హైదరాబాద్ అగ్రో స్టోరేజ్" },
      { name: "Evergreen Cold Storage", telugu: "ఎవర్గ్రీన్ కోల్డ్ స్టోరేజ్" },
      { name: "Om Sai Storage Hub", telugu: "ఓం సాయి స్టోరేజ్ హబ్" },
      { name: "Anvi Agri Depot", telugu: "అన్వి అగ్రి డెపో" }
    ]
  },
  {
    district: "Sangareddy",
    centers: [
      { name: "Sri Krishna Agro Center", telugu: "శ్రీ కృష్ణ అగ్రో సెంటర్" },
      { name: "FarmFresh Warehousing", telugu: "ఫార్మ్ ఫ్రెష్ వేర్‌హౌసింగ్" },
      { name: "Bhavani Cold Storage", telugu: "భవాని కోల్డ్ స్టోరేజ్" },
      { name: "Jai Bhavani Agro Hub", telugu: "జై భవాని అగ్రో హబ్" }
    ]
  }
];

window.onload = function () {
  showOnlyPage("page1");
  populateDistricts();
};

function populateDistricts() {
  const select = document.getElementById("regionSelect");
  select.innerHTML = `<option value="">-- ${currentLang === 'te' ? "జిల్లా ఎంచుకోండి" : "Select District"} --</option>`;
  storageData.forEach(item => {
    const option = document.createElement("option");
    option.value = item.district;
    option.textContent = item.district;
    select.appendChild(option);
  });
}
