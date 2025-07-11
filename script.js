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
  document.getElementById("listeningNote").style.display = "none";
}

function goToPage3() {
  const inputVal = document.getElementById("cropInput").value.trim().toLowerCase();
  const region = document.getElementById("regionSelect").value;
  const errorDiv = document.getElementById("error");

  const match = cropData.find(item =>
    inputVal === item.crop.toLowerCase() || inputVal === item.telugu.toLowerCase()
  );

  if (!match) {
    errorDiv.innerText = isTelugu ? "పంట కనబడలేదు. దయచేసి పరీక్షించండి." : "Crop not found. Please check spelling.";
    return;
  }

  errorDiv.innerText = "";
  document.getElementById("cropTitle").innerText = isTelugu ? match.telugu : match.crop;

  const storage = `
    <p><strong>${isTelugu ? "ఆదర్శ ఉష్ణోగ్రత" : "Ideal Temperature"}:</strong> ${match.temperature}</p>
    <p><strong>${isTelugu ? "ఆదర్శ ఆర్ద్రత" : "Ideal Humidity"}:</strong> ${match.humidity}</p>
    <p><strong>${isTelugu ? "నిల్వ కాలం" : "Max Storage Period"}:</strong> ${match.storage}</p>
    <p><strong>${isTelugu ? "అందుబాటులో ధర" : "Approx. Price"}:</strong> ₹${match.price} / kg</p>
  `;
  document.getElementById("result").innerHTML = storage;

  displayStorageCenters(region);
  fetchWeather(region);
  showOnlyPage("page3");
}

function showOnlyPage(id) {
  ["page1", "page2", "page3"].forEach(pg => {
    document.getElementById(pg).style.display = pg === id ? "block" : "none";
  });
}

function showSuggestions() {
  const input = document.getElementById("cropInput").value.toLowerCase();
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";

  if (!input) return;

  const matches = cropData
    .filter(item =>
      (isTelugu ? item.telugu : item.crop).toLowerCase().startsWith(input)
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
  const div = document.getElementById("centerSection");
  const list = document.getElementById("storageResults");
  const matched = storageData.find(item => item.district === region);

  div.style.display = "block";
  if (matched && matched.centers.length > 0) {
    list.innerHTML = matched.centers.map(center =>
      `<li>${isTelugu ? centerTelugu[center] || center : center}</li>`
    ).join('');
  } else {
    list.innerHTML = `<li>${isTelugu ? "ఎలాంటి నిల్వ కేంద్రాలు లేవు." : "No storage centers found."}</li>`;
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
        <h3>${isTelugu ? "వాతావరణ అంచనా" : "3-Day Weather Forecast"}</h3>
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
    .catch(() => {
      weatherCard.innerHTML = "<p>Weather unavailable</p>";
      weatherCard.style.display = "block";
    });
}

function startVoiceRecognition() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = isTelugu ? 'te-IN' : 'en-US';
  recognition.start();

  document.getElementById("listeningNote").style.display = "block";
  recognition.onresult = function (event) {
    document.getElementById("cropInput").value = event.results[0][0].transcript;
    showSuggestions();
    document.getElementById("listeningNote").style.display = "none";
  };
  recognition.onerror = function () {
    document.getElementById("listeningNote").style.display = "none";
  };
}

function toggleLanguage() {
  isTelugu = document.getElementById("langToggle").checked;
  showSuggestions();
}

function populateDistrictDropdown() {
  const select = document.getElementById("regionSelect");
  select.innerHTML = `<option value="">-- Select District --</option>`;
  storageData.forEach(d => {
    const option = document.createElement("option");
    option.value = d.district;
    option.textContent = d.district;
    select.appendChild(option);
  });
}

// Crop + Storage data next
const cropData = [
  { crop: "Wheat", telugu: "గోధుమలు", temperature: "10–15°C", humidity: "65–70%", storage: "6–12 months", price: 22 },
  { crop: "Rice", telugu: "బియ్యం", temperature: "10–15°C", humidity: "65–70%", storage: "6–12 months", price: 25 },
  { crop: "Maize", telugu: "మక్క జొన్న", temperature: "0–4°C", humidity: "80–85%", storage: "6–12 months", price: 18 },
  { crop: "Potato", telugu: "బంగాళదుంప", temperature: "4–7°C", humidity: "90–95%", storage: "90 days", price: 20 },
  { crop: "Onion", telugu: "ఉల్లిపాయ", temperature: "0–2°C", humidity: "65–70%", storage: "150 days", price: 22 },
  { crop: "Tomato", telugu: "టమోటా", temperature: "12–15°C", humidity: "85–90%", storage: "14 days", price: 15 },
  { crop: "Chillies", telugu: "మిరపకాయలు", temperature: "8–10°C", humidity: "70–75%", storage: "20 days", price: 80 },
  { crop: "Mango", telugu: "మామిడి", temperature: "10–13°C", humidity: "85–90%", storage: "28 days", price: 50 },
  { crop: "Banana", telugu: "అరటి", temperature: "13–14°C", humidity: "85–95%", storage: "18–22 days", price: 35 },
  { crop: "Sugarcane", telugu: "చెరుకు", temperature: "12–14°C", humidity: "70–75%", storage: "3–5 months", price: 10 },
  { crop: "Groundnut", telugu: "వేరుసెనగ", temperature: "6–10°C", humidity: "70–80%", storage: "3–6 months", price: 40 },
  { crop: "Cotton", telugu: "పత్తి", temperature: "10–15°C", humidity: "65–75%", storage: "6–8 months", price: 60 },
  { crop: "Pulses", telugu: "పప్పులు", temperature: "5–10°C", humidity: "65–75%", storage: "6–12 months", price: 55 },
  { crop: "Cabbage", telugu: "కోసు కూర", temperature: "0–1°C", humidity: "90–95%", storage: "2–3 months", price: 12 },
  { crop: "Cauliflower", telugu: "కాలీఫ్లవర్", temperature: "0–1°C", humidity: "90–95%", storage: "2–3 months", price: 18 }
];

const storageData = [
  {
    district: "Adilabad",
    centers: ["GMR Warehouse", "Ladda Agro Godowns", "Paharia Warehouse", "Y S R Godown"]
  },
  {
    district: "Karimnagar",
    centers: ["Srinivasa Cold Storage", "Godavari Agro Warehousing", "SVS Cold Chain", "Sri Gaddam Veeresham Rural Godown"]
  },
  {
    district: "Nizamabad",
    centers: ["Nizam Agro Storage", "Green Leaf Cold Storage", "SLNS Cold Storage", "Hi-Tech Cold Storage"]
  },
  {
    district: "Warangal",
    centers: ["Bhavani Cold Storage", "Sree Lakshmi Warehouse", "TSWC Facility", "Moksha cold storage", "Saptagiri cold storage", "Sri karthik cold storage", "Venkatagiri cold storage", "Vennela storage unit"]
  },
  {
    district: "Mahbubnagar",
    centers: ["Sri Sai Warehouse", "Mahindra Cold Chain", "Nandini Cold storages", "Sunyang Cold Storage", "Green House Cold storages"]
  },
  {
    district: "Khammam",
    centers: ["Khammam Agro Cold Storage", "Red Chilies Storage", "Gayathri cold storage", "Swarnabharati cold storage", "Krishna sai storage unit"]
  },
  {
    district: "Nalgonda",
    centers: ["Pavan Warehouse", "Sunrise Cold Storage", "TSWC Nalgonda", "Sri Satyadeva Cold Storage"]
  },
  {
    district: "Medak",
    centers: ["Medak Agro Storage", "Greenfield Warehousing", "Afsari Begum Ripening Chamber", "S.S. Agro Fresh Cold Storage"]
  },
  {
    district: "Rangareddy",
    centers: ["Hyderabad Cold Storage", "Sri Venkateshwara Agro", "Aditya Enterprises", "Venkateshwara cold storage"]
  },
  {
    district: "Hyderabad",
    centers: ["City Agro Godowns", "Urban Cold Chain", "Coldrush logistics", "Akshaya cold storage"]
  }
];

// Telugu transliterations for storage center names
const centerTelugu = {
  "GMR Warehouse": "జిఎంఆర్ వేర్‌హౌస్",
  "Ladda Agro Godowns": "లడ్డా అగ్రో గోడౌన్స్",
  "Paharia Warehouse": "పహారియా వేర్‌హౌస్",
  "Y S R Godown": "వైఎస్ఆర్ గోడౌన్",
  "Srinivasa Cold Storage": "శ్రీనివాస కోల్డ్ స్టోరేజ్",
  "Godavari Agro Warehousing": "గోదావరి అగ్రో వేర్‌హౌసింగ్",
  "SVS Cold Chain": "ఎస్‌విఎస్ కోల్డ్ చైన్",
  "Sri Gaddam Veeresham Rural Godown": "శ్రీ గడ్డం వీరేశం రూరల్ గోడౌన్",
  "Nizam Agro Storage": "నిజాం అగ్రో స్టోరేజ్",
  "Green Leaf Cold Storage": "గ్రీన్ లీఫ్ కోల్డ్ స్టోరేజ్",
  "SLNS Cold Storage": "ఎస్‌ఎల్‌ఎన్‌ఎస్ కోల్డ్ స్టోరేజ్",
  "Hi-Tech Cold Storage": "హైటెక్ కోల్డ్ స్టోరేజ్",
  "Bhavani Cold Storage": "భవాని కోల్డ్ స్టోరేజ్",
  "Sree Lakshmi Warehouse": "శ్రీ లక్ష్మి వేర్‌హౌస్",
  "TSWC Facility": "టీఎస్డబ్ల్యూసీ ఫెసిలిటీ",
  "Moksha cold storage": "మోక్ష కోల్డ్ స్టోరేజ్",
  "Saptagiri cold storage": "సప్తగిరి కోల్డ్ స్టోరేజ్",
  "Sri karthik cold storage": "శ్రీ కార్తిక్ కోల్డ్ స్టోరేజ్",
  "Venkatagiri cold storage": "వెంకటగిరి కోల్డ్ స్టోరేజ్",
  "Vennela storage unit": "వెన్నెల స్టోరేజ్ యూనిట్",
  "Sri Sai Warehouse": "శ్రీ సాయి వేర్‌హౌస్",
  "Mahindra Cold Chain": "మహీంద్ర కోల్డ్ చైన్",
  "Nandini Cold storages": "నందిని కోల్డ్ స్టోరేజెస్",
  "Sunyang Cold Storage": "సున్యాంగ్ కోల్డ్ స్టోరేజ్",
  "Green House Cold storages": "గ్రీన్ హౌస్ కోల్డ్ స్టోరేజెస్",
  "Khammam Agro Cold Storage": "ఖమ్మం అగ్రో కోల్డ్ స్టోరేజ్",
  "Red Chilies Storage": "రెడ్ చిలీస్ స్టోరేజ్",
  "Gayathri cold storage": "గాయత్రి కోల్డ్ స్టోరేజ్",
  "Swarnabharati cold storage": "స్వర్ణభారతి కోల్డ్ స్టోరేజ్",
  "Krishna sai storage unit": "కృష్ణ సాయి స్టోరేజ్ యూనిట్",
  "Pavan Warehouse": "పవన్ వేర్‌హౌస్",
  "Sunrise Cold Storage": "సన్‌రైజ్ కోల్డ్ స్టోరేజ్",
  "TSWC Nalgonda": "టీఎస్డబ్ల్యూసీ నల్గొండ",
  "Sri Satyadeva Cold Storage": "శ్రీ సత్యదేవ కోల్డ్ స్టోరేజ్",
  "Medak Agro Storage": "మెదక్ అగ్రో స్టోరేజ్",
  "Greenfield Warehousing": "గ్రీన్‌ఫీల్డ్ వేర్‌హౌసింగ్",
  "Afsari Begum Ripening Chamber": "అఫ్సరి బేగం రైపెనింగ్ చాంబర్",
  "S.S. Agro Fresh Cold Storage": "ఎస్‌ఎస్ అగ్రో ఫ్రెష్ కోల్డ్ స్టోరేజ్",
  "Hyderabad Cold Storage": "హైదరాబాద్ కోల్డ్ స్టోరేజ్",
  "Sri Venkateshwara Agro": "శ్రీ వెంకటేశ్వర అగ్రో",
  "Aditya Enterprises": "ఆదిత్య ఎంటర్‌ప్రైజెస్",
  "Venkateshwara cold storage": "వెంకటేశ్వర కోల్డ్ స్టోరేజ్",
  "City Agro Godowns": "సిటీ అగ్రో గోడౌన్స్",
  "Urban Cold Chain": "అర్బన్ కోల్డ్ చైన్",
  "Coldrush logistics": "కోల్డ్‌రష్ లాజిస్టిక్స్",
  "Akshaya cold storage": "అక్షయ కోల్డ్ స్టోరేజ్"
};

window.onload = () => {
  showOnlyPage("page1");
  populateDistrictDropdown();
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
