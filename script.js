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
  document.getElementById("listeningNote").style.display = "none";
}

function goToPage3() {
  const input = document.getElementById("cropInput").value.trim().toLowerCase();
  const region = document.getElementById("regionSelect").value;
  const errorDiv = document.getElementById("error");

  const match = cropData.find(item =>
    isTelugu ? item.telugu.toLowerCase() === input : item.crop.toLowerCase() === input
  );

  if (!match) {
    errorDiv.innerText = isTelugu
      ? "పంట కనిపించలేదు. దయచేసి స్పెల్లింగ్ తనిఖీ చేయండి."
      : "Crop not found. Please check spelling.";
    return;
  }

  errorDiv.innerText = "";
  document.getElementById("cropTitle").innerText = isTelugu ? match.telugu : match.crop.toUpperCase();

  const priceText = isTelugu
    ? `<p><strong>సగటు ధర:</strong> ₹${match.price}/kg</p>`
    : `<p><strong>Approx. Market Price:</strong> ₹${match.price}/kg</p>`;

  document.getElementById("result").innerHTML = `
    <p><strong>${isTelugu ? "ఆదర్శ ఉష్ణోగ్రత" : "Ideal Temperature"}:</strong> ${match.temperature}</p>
    <p><strong>${isTelugu ? "ఆదర్శ ఆర్ద్రత" : "Ideal Humidity"}:</strong> ${match.humidity}</p>
    <p><strong>${isTelugu ? "పరిమిత నిల్వ కాలం" : "Max Storage Period"}:</strong> ${match.storage}</p>
    ${priceText}
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

function toggleLanguage() {
  isTelugu = document.getElementById("languageSwitch").checked;
  populateDistrictDropdown();
  showSuggestions();
}

function showSuggestions() {
  const input = document.getElementById("cropInput").value.toLowerCase();
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";

  if (!input) return;

  const matches = cropData
    .filter(item =>
      isTelugu
        ? item.telugu.toLowerCase().startsWith(input)
        : item.crop.toLowerCase().startsWith(input)
    )
    .map(item => (isTelugu ? item.telugu : item.crop));

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
    storageList.innerHTML = matched.centers
      .map(center => `<li>${isTelugu ? center.telugu : center.name}</li>`)
      .join("");
  } else {
    centerDiv.style.display = "block";
    storageList.innerHTML = `<li>${isTelugu ? "ఈ జిల్లాలో కేంద్రాలు లేవు" : "No storage centers found."}</li>`;
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
        <h3>${isTelugu ? "3-రోజుల వాతావరణ సూచిక" : "3-Day Weather Forecast"}</h3>
        <div class="forecast">
          ${forecast.map(day => `
            <div class="forecast-day">
              <p><strong>${new Date(day.dt_txt).toDateString()}</strong></p>
              <p>🌡️ ${day.main.temp}°C</p>
              <p>💧 ${day.main.humidity}%</p>
              <p>🌥️ ${day.weather[0].main}</p>
            </div>
          `).join("")}
        </div>
      `;
      weatherCard.style.display = "block";
    })
    .catch(err => {
      weatherCard.innerHTML = `<p>${isTelugu ? "వాతావరణ డేటా అందుబాటులో లేదు" : "Weather data not available."}</p>`;
      weatherCard.style.display = "block";
    });
}

function populateDistrictDropdown() {
  const select = document.getElementById("regionSelect");
  select.innerHTML = `<option value="">-- ${isTelugu ? "జిల్లా ఎంచుకోండి" : "Select District"} --</option>`;
  storageData.forEach(item => {
    const option = document.createElement("option");
    option.value = item.district;
    option.textContent = isTelugu ? item.telugu : item.district;
    select.appendChild(option);
  });
}

// Voice Input
function startVoiceInput() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = isTelugu ? "te-IN" : "en-US";
  recognition.start();
  document.getElementById("listeningNote").style.display = "block";

  recognition.onresult = function (event) {
    const speechResult = event.results[0][0].transcript.toLowerCase();
    document.getElementById("cropInput").value = speechResult;
    document.getElementById("listeningNote").style.display = "none";
    showSuggestions();
  };

  recognition.onerror = function () {
    document.getElementById("listeningNote").style.display = "none";
  };
}

window.onload = function () {
  showOnlyPage("page1");
  populateDistrictDropdown();
};

// ------------------ DATA --------------------

const cropData = [
  { crop: "wheat", telugu: "గోధుమలు", temperature: "10–15°C", humidity: "65–70%", storage: "6–12 months", price: 22 },
  { crop: "rice", telugu: "బియ్యం", temperature: "10–15°C", humidity: "65–70%", storage: "6–12 months", price: 28 },
  { crop: "maize", telugu: "మక్క జొన్న", temperature: "0–4°C", humidity: "80–85%", storage: "6–12 months", price: 18 },
  { crop: "potato", telugu: "బంగాళదుంప", temperature: "4–7°C", humidity: "90–95%", storage: "90 days", price: 15 },
  { crop: "onion", telugu: "ఉల్లిపాయ", temperature: "0–2°C", humidity: "65–70%", storage: "150 days", price: 20 },
  { crop: "tomato", telugu: "టమోటా", temperature: "12–15°C", humidity: "85–90%", storage: "14 days", price: 25 },
  { crop: "chillies", telugu: "మిరపకాయలు", temperature: "8–10°C", humidity: "70–75%", storage: "20 days", price: 70 },
  { crop: "mango", telugu: "మామిడి", temperature: "10–13°C", humidity: "85–90%", storage: "28 days", price: 60 },
  { crop: "banana", telugu: "అరటి", temperature: "13–14°C", humidity: "85–95%", storage: "18–22 days", price: 32 },
  { crop: "sugarcane", telugu: "చెరుకు", temperature: "12–14°C", humidity: "70–75%", storage: "3–5 months", price: 20 },
  { crop: "groundnut", telugu: "వేరుసెనగ", temperature: "6–10°C", humidity: "70–80%", storage: "3–6 months", price: 40 },
  { crop: "cotton", telugu: "పత్తి", temperature: "10–15°C", humidity: "65–75%", storage: "6–8 months", price: 65 },
  { crop: "pulses", telugu: "పప్పులు", temperature: "5–10°C", humidity: "65–75%", storage: "6–12 months", price: 55 },
  { crop: "cabbage", telugu: "కోసు కూర", temperature: "0–1°C", humidity: "90–95%", storage: "2–3 months", price: 12 },
  { crop: "cauliflower", telugu: "కాలీఫ్లవర్", temperature: "0–1°C", humidity: "90–95%", storage: "2–3 months", price: 14 }
];

const storageData = [
  {
    district: "Adilabad", telugu: "అదిలాబాద్",
    centers: [
      { name: "GMR Warehouse", telugu: "జిఎంఆర్ వేర్‌హౌస్" },
      { name: "Ladda Agro Godowns", telugu: "లడ్డా అగ్రో గోడౌన్లు" },
      { name: "Paharia Warehouse", telugu: "పహారియా వేర్‌హౌస్" },
      { name: "Y S R Godown", telugu: "వై ఎస్ ఆర్ గోడౌన్" }
    ]
  },
  {
    district: "Karimnagar", telugu: "కరీంనగర్",
    centers: [
      { name: "Srinivasa Cold Storage", telugu: "శ్రీనివాస కోల్డ్ స్టోరేజ్" },
      { name: "Godavari Agro Warehousing", telugu: "గోదావరి అగ్రో వేర్‌హౌసింగ్" },
      { name: "SVS Cold Chain", telugu: "ఎస్ వి ఎస్ కోల్డ్ చైన్" },
      { name: "Sri Gaddam Veeresham Rural Godown", telugu: "శ్రీ గడ్డం వీరేశం రూరల్ గోడౌన్" }
    ]
  },
  {
    district: "Nizamabad", telugu: "నిజామాబాద్",
    centers: [
      { name: "Nizam Agro Storage", telugu: "నిజాం అగ్రో స్టోరేజ్" },
      { name: "Green Leaf Cold Storage", telugu: "గ్రీన్ లీఫ్ కోల్డ్ స్టోరేజ్" },
      { name: "SLNS Cold Storage", telugu: "ఎస్ ఎల్ ఎన్ ఎస్ కోల్డ్ స్టోరేజ్" },
      { name: "Hi-Tech Cold Storage", telugu: "హైటెక్ కోల్డ్ స్టోరేజ్" }
    ]
  },
  {
    district: "Warangal", telugu: "వరంగల్",
    centers: [
      { name: "Bhavani Cold Storage", telugu: "భవానీ కోల్డ్ స్టోరేజ్" },
      { name: "Sree Lakshmi Warehouse", telugu: "శ్రీ లక్ష్మీ వేర్‌హౌస్" },
      { name: "TSWC Facility", telugu: "టిఎస్‌డబ్ల్యూసి ఫెసిలిటీ" },
      { name: "Moksha cold storage", telugu: "మోక్ష కోల్డ్ స్టోరేజ్" },
      { name: "Saptagiri cold storage", telugu: "సప్తగిరి కోల్డ్ స్టోరేజ్" },
      { name: "Sri karthik cold storage", telugu: "శ్రీ కార్తిక్ కోల్డ్ స్టోరేజ్" },
      { name: "Venkatagiri cold storage", telugu: "వెంకటగిరి కోల్డ్ స్టోరేజ్" },
      { name: "Vennela storage unit", telugu: "వెన్నెల స్టోరేజ్ యూనిట్" }
    ]
  },
  {
    district: "Mahbubnagar", telugu: "మహబూబ్‌నగర్",
    centers: [
      { name: "Sri Sai Warehouse", telugu: "శ్రీ సాయి వేర్‌హౌస్" },
      { name: "Mahindra Cold Chain", telugu: "మహీంద్ర కోల్డ్ చైన్" },
      { name: "Nandini Cold storages", telugu: "నందిని కోల్డ్ స్టోరేజ్" },
      { name: "Sunyang Cold Storage", telugu: "సున్యాంగ్ కోల్డ్ స్టోరేజ్" },
      { name: "Green House Cold storages", telugu: "గ్రీన్ హౌస్ కోల్డ్ స్టోరేజ్" }
    ]
  },
  {
    district: "Khammam", telugu: "ఖమ్మం",
    centers: [
      { name: "Khammam Agro Cold Storage", telugu: "ఖమ్మం అగ్రో కోల్డ్ స్టోరేజ్" },
      { name: "Red Chilies Storage", telugu: "రెడ్ చిలీస్ స్టోరేజ్" },
      { name: "Gayathri cold storage", telugu: "గాయత్రి కోల్డ్ స్టోరేజ్" },
      { name: "Swarnabharati cold storage", telugu: "స్వర్ణభారతి కోల్డ్ స్టోరేజ్" },
      { name: "Krishna sai storage unit", telugu: "కృష్ణ సాయి స్టోరేజ్ యూనిట్" }
    ]
  },
  {
    district: "Nalgonda", telugu: "నల్గొండ",
    centers: [
      { name: "Pavan Warehouse", telugu: "పవన్ వేర్‌హౌస్" },
      { name: "Sunrise Cold Storage", telugu: "సన్‌రైజ్ కోల్డ్ స్టోరేజ్" },
      { name: "TSWC Nalgonda", telugu: "టిఎస్‌డబ్ల్యూసి నల్గొండ" },
      { name: "Sri Satyadeva Cold Storage", telugu: "శ్రీ సత్యదేవ కోల్డ్ స్టోరేజ్" }
    ]
  },
  {
    district: "Medak", telugu: "మెదక్",
    centers: [
      { name: "Medak Agro Storage", telugu: "మెదక్ అగ్రో స్టోరేజ్" },
      { name: "Greenfield Warehousing", telugu: "గ్రీన్‌ఫీల్డ్ వేర్‌హౌసింగ్" },
      { name: "Afsari Begum Ripening Chamber", telugu: "అఫ్సరి బేగం రైపెనింగ్ చాంబర్" },
      { name: "S.S. Agro Fresh Cold Storage", telugu: "ఎస్.ఎస్. అగ్రో ఫ్రెష్ కోల్డ్ స్టోరేజ్" }
    ]
  },
  {
    district: "Rangareddy", telugu: "రంగారెడ్డి",
    centers: [
      { name: "Hyderabad Cold Storage", telugu: "హైదరాబాద్ కోల్డ్ స్టోరేజ్" },
      { name: "Sri Venkateshwara Agro", telugu: "శ్రీ వెంకటేశ్వర అగ్రో" },
      { name: "Aditya Enterprises", telugu: "ఆదిత్య ఎంటర్‌ప్రైజెస్" },
      { name: "Venkateshwara cold storage", telugu: "వెంకటేశ్వర కోల్డ్ స్టోరేజ్" }
    ]
  },
  {
    district: "Hyderabad", telugu: "హైదరాబాద్",
    centers: [
      { name: "City Agro Godowns", telugu: "సిటీ అగ్రో గోడౌన్లు" },
      { name: "Urban Cold Chain", telugu: "అర్బన్ కోల్డ్ చైన్" },
      { name: "Coldrush logistics", telugu: "కోల్డ్రష్ లోజిస్టిక్స్" },
      { name: "Akshaya cold storage", telugu: "అక్షయ కోల్డ్ స్టోరేజ్" }
    ]
  }
];
