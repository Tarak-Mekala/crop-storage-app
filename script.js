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
}

function goToPage3() {
  const cropInput = document.getElementById("cropInput").value.trim().toLowerCase();
  const region = document.getElementById("regionSelect").value;
  const errorDiv = document.getElementById("error");

  const match = cropData.find(item =>
    cropInput === item.crop.toLowerCase() ||
    cropInput === item.telugu.toLowerCase()
  );

  if (!match) {
    errorDiv.innerText = isTelugu
      ? "పంట కనబడలేదు. దయచేసి స్పెల్లింగ్ తనిఖీ చేయండి."
      : "Crop not found. Please check spelling.";
    return;
  }

  errorDiv.innerText = "";
  const name = isTelugu ? match.telugu : match.crop;

  document.getElementById("cropTitle").innerText = name.toUpperCase();
  document.getElementById("result").innerHTML = `
    <p><strong>${isTelugu ? "ఆదర్శ ఉష్ణోగ్రత" : "Ideal Temperature"}:</strong> ${match.temperature}</p>
    <p><strong>${isTelugu ? "ఆదర్శ ఆర్ద్రత" : "Ideal Humidity"}:</strong> ${match.humidity}</p>
    <p><strong>${isTelugu ? "గరిష్ట నిల్వ కాలం" : "Max Storage Period"}:</strong> ${match.storage}</p>
    <p><strong>${isTelugu ? "సగటు ధర" : "Approx Market Price"}:</strong> ₹${match.price}/kg</p>
  `;

  displayStorageCenters(region);
  fetchWeather(region);
  showOnlyPage("page3");
}

function showOnlyPage(pageId) {
  ["page1", "page2", "page3"].forEach(id => {
    document.getElementById(id).style.display = (id === pageId ? "block" : "none");
  });
}

function showSuggestions() {
  const input = document.getElementById("cropInput").value.toLowerCase();
  const suggestionsBox = document.getElementById("suggestions");
  suggestionsBox.innerHTML = "";

  if (!input) return;

  cropData.forEach(item => {
    const value = isTelugu ? item.telugu : item.crop;
    if (value.toLowerCase().startsWith(input)) {
      const li = document.createElement("li");
      li.textContent = value;
      li.onclick = () => {
        document.getElementById("cropInput").value = value;
        suggestionsBox.innerHTML = "";
      };
      suggestionsBox.appendChild(li);
    }
  });
}

function startVoiceSearch() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = isTelugu ? 'te-IN' : 'en-US';

  document.getElementById("listeningNote").style.display = "block";
  recognition.start();

  recognition.onresult = event => {
    const text = event.results[0][0].transcript;
    document.getElementById("cropInput").value = text;
    showSuggestions();
    document.getElementById("listeningNote").style.display = "none";
  };
  recognition.onerror = () => {
    document.getElementById("listeningNote").style.display = "none";
    alert(isTelugu ? "వాయిస్ শনাক্ত失败!試再一次." : "Voice recognition failed.");
  };
}

function toggleLanguage() {
  isTelugu = !isTelugu;
  populateDistrictDropdown();
  document.getElementById("cropInput").placeholder = isTelugu
    ? "పంట పేరును నమోదు చేయండి"
    : "Enter crop name";
}

function displayStorageCenters(region) {
  const match = storageData.find(d => d.district === region);
  const list = document.getElementById("storageResults");
  document.getElementById("centerSection").style.display = "block";

  if (!match) {
    list.innerHTML = `<li>${isTelugu ? "కేంద్రాలు లేవు." : "No storage centers."}</li>`;
    return;
  }
  list.innerHTML = match.centers.map(name =>
    `<li>${isTelugu ? transliterate(name) : name}</li>`).join("");
}

function transliterate(text) {
  return text; // Placeholder: transliteration already provided manually in data
}

function fetchWeather(region) {
  const apiKey = "9d615f5f1e48d9502a77a12229e0e639";
  const card = document.getElementById("weatherCard");
  card.style.display = "none";

  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${region}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
      const forecast = data.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 3);
      card.innerHTML = `
        <h3>${isTelugu ? "3-రోజుల వాతావరణ సూచిక" : "3-Day Weather Forecast"}</h3>
        <div class="forecast">
          ${forecast.map(day => `
            <div class="forecast-day">
              <p><strong>${new Date(day.dt_txt).toLocaleDateString()}</strong></p>
              <p>🌡️ ${day.main.temp}°C</p>
              <p>💧 ${day.main.humidity}%</p>
              <p>🌥️ ${day.weather[0].main}</p>
            </div>`).join("")}
        </div>`;
      card.style.display = "block";
    })
    .catch(() => {
      card.innerHTML = `<p>${isTelugu ? "వాతావరణ సమాచారం లేదు." : "Weather data not available."}</p>`;
      card.style.display = "block";
    });
}

function populateDistrictDropdown() {
  const sel = document.getElementById("regionSelect");
  sel.innerHTML = `<option value="">-- ${isTelugu ? "జిల్లాను ఎంచుకోండి" : "Select District"} --</option>`;
  storageData.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.district;
    opt.textContent = d.district;
    sel.appendChild(opt);
  });
}

window.onload = () => {
  showOnlyPage("page1");
  populateDistrictDropdown();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
};

// Full Data
const cropData = [
  { crop: "wheat", telugu: "గోధుమలు", temperature: "10–15°C", humidity: "65–70%", storage: "6–12 months", price: 24 },
  { crop: "rice", telugu: "బియ్యం", temperature: "10–15°C", humidity: "65–70%", storage: "6–12 months", price: 30 },
  { crop: "maize", telugu: "మక్క జొన్న", temperature: "0–4°C", humidity: "80–85%", storage: "6–12 months", price: 20 },
  { crop: "potato", telugu: "బంగాళదుంప", temperature: "4–7°C", humidity: "90–95%", storage: "90 days", price: 18 },
  { crop: "onion", telugu: "ఉల్లిపాయ", temperature: "0–2°C", humidity: "65–70%", storage: "150 days", price: 22 },
  { crop: "tomato", telugu: "టమోటా", temperature: "12–15°C", humidity: "85–90%", storage: "14 days", price: 16 },
  { crop: "chillies", telugu: "మిరపకాయలు", temperature: "8–10°C", humidity: "70–75%", storage: "20 days", price: 60 },
  { crop: "mango", telugu: "మామిడి", temperature: "10–13°C", humidity: "85–90%", storage: "28 days", price: 45 },
  { crop: "banana", telugu: "అరటి", temperature: "13–14°C", humidity: "85–95%", storage: "18–22 days", price: 32 },
  { crop: "sugarcane", telugu: "చెరుకు", temperature: "12–14°C", humidity: "70–75%", storage: "3–5 months", price: 25 },
  { crop: "groundnut", telugu: "వేరుసెనగ", temperature: "6–10°C", humidity: "70–80%", storage: "3–6 months", price: 55 },
  { crop: "cotton", telugu: "పత్తి", temperature: "10–15°C", humidity: "65–75%", storage: "6–8 months", price: 58 },
  { crop: "pulses", telugu: "పప్పులు", temperature: "5–10°C", humidity: "65–75%", storage: "6–12 months", price: 50 },
  { crop: "cabbage", telugu: "కోసు కూర", temperature: "0–1°C", humidity: "90–95%", storage: "2–3 months", price: 14 },
  { crop: "cauliflower", telugu: "కాలీఫ్లవర్", temperature: "0–1°C", humidity: "90–95%", storage: "2–3 months", price: 17 }
];

const storageData = [
  { district: "Adilabad", centers: ["GMR Warehouse", "Ladda Agro Godowns", "Paharia Warehouse", "Y S R Godown"] },
  { district: "Karimnagar", centers: ["Srinivasa Cold Storage", "Godavari Agro Warehousing", "SVS Cold Chain", "Sri Gaddam Veeresham Rural Godown"] },
  { district: "Nizamabad", centers: ["Nizam Agro Storage", "Green Leaf Cold Storage", "SLNS Cold Storage", "Hi-Tech Cold Storage"] },
  { district: "Warangal", centers: ["Bhavani Cold Storage", "Sree Lakshmi Warehouse", "TSWC Facility", "Moksha Cold Storage", "Saptagiri Cold Storage", "Sri Karthik Cold Storage", "Venkatagiri Cold Storage", "Vennela Storage Unit"] },
  { district: "Mahbubnagar", centers: ["Sri Sai Warehouse", "Mahindra Cold Chain", "Nandini Greenhouse Cold Storage", "Sunyang Cold Storage"] },
  { district: "Khammam", centers: ["Khammam Agro Cold Storage", "Red Chillies Storage", "Gayathri Cold Storage", "Swarnabharati Cold Storage", "Krishna Sai Storage Unit"] },
  { district: "Nalgonda", centers: ["Pavan Warehouse", "Sunrise Cold Storage", "TSWC Nalgonda", "Sri Satyadeva Cold Storage"] },
  { district: "Medak", centers: ["Medak Agro Storage", "Greenfield Warehousing", "Afsari Begum Ripening Chamber", "SS Agro Fresh Cold Storage"] },
  { district: "Rangareddy", centers: ["Hyderabad Cold Storage", "Sri Venkateshwara Agro", "Aditya Enterprises", "Venkateshwara Cold Storage"] },
  { district: "Hyderabad", centers: ["City Agro Godowns", "Urban Cold Chain", "Coldrush Logistics", "Akshaya Cold Storage Pvt Ltd"] }
];
