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
  document.getElementById("listeningNote").style.display = "none";
}

function goToPage3() {
  const input = document.getElementById("cropInput").value.trim().toLowerCase();
  const region = document.getElementById("regionSelect").value;
  const errorDiv = document.getElementById("error");

  let match = cropData.find(item => 
    item.crop.toLowerCase() === input ||
    item.telugu.toLowerCase() === input
  );

  if (!match) {
    errorDiv.innerText = isTelugu ? "పంట కనుగొనబడలేదు. పేరు తనిఖీ చేయండి." : "Crop not found. Please check spelling.";
    return;
  }

  errorDiv.innerText = "";
  const name = isTelugu ? match.telugu : match.crop;
  document.getElementById("cropTitle").innerText = name.toUpperCase();

  document.getElementById("result").innerHTML = `
    <p>🌡️ ${isTelugu ? 'సరైన ఉష్ణోగ్రత' : 'Ideal Temperature'}: ${match.temperature}</p>
    <p>💧 ${isTelugu ? 'సరైన ఆర్ద్రత' : 'Ideal Humidity'}: ${match.humidity}</p>
    <p>🗓️ ${isTelugu ? 'గరిష్ట నిల్వ వ్యవధి' : 'Max Storage Period'}: ${match.storage}</p>
    <p>💰 ${isTelugu ? 'ఒక్క కిలో ధర' : 'Price per Kg'}: ₹${match.price}</p>
  `;

  displayStorageCenters(region);
  fetchWeather(region);
  showOnlyPage("page3");
}

function showOnlyPage(id) {
  ["page1", "page2", "page3"].forEach(p => {
    document.getElementById(p).style.display = "none";
  });
  document.getElementById(id).style.display = "block";
}

function showSuggestions() {
  const input = document.getElementById("cropInput").value.trim().toLowerCase();
  const suggestionBox = document.getElementById("suggestions");
  suggestionBox.innerHTML = "";

  if (!input) return;

  const matches = cropData.filter(item => {
    return (isTelugu ? item.telugu : item.crop).toLowerCase().startsWith(input);
  });

  matches.forEach(match => {
    const li = document.createElement("li");
    li.textContent = isTelugu ? match.telugu : match.crop;
    li.onclick = () => {
      document.getElementById("cropInput").value = li.textContent;
      suggestionBox.innerHTML = "";
    };
    suggestionBox.appendChild(li);
  });
}

function displayStorageCenters(region) {
  const match = storageData.find(d => d.district === region);
  const output = document.getElementById("storageResults");
  const centerDiv = document.getElementById("centerSection");
  centerDiv.style.display = "block";

  if (!match) {
    output.innerHTML = `<li>${isTelugu ? "స్టోరేజ్ సెంటర్లు లేవు" : "No storage centers found."}</li>`;
    return;
  }

  output.innerHTML = match.centers.map(center => {
    return `<li>${isTelugu ? transliterateToTelugu(center) : center}</li>`;
  }).join('');
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
        <h3>🌦️ ${isTelugu ? "వాతావరణ సూచన" : "3-Day Weather Forecast"}</h3>
        <div class="forecast">
          ${forecast.map(day => `
            <div class="forecast-day">
              <p><strong>${new Date(day.dt_txt).toDateString()}</strong></p>
              <p>🌡️ ${day.main.temp}°C</p>
              <p>💧 ${day.main.humidity}%</p>
              <p>${day.weather[0].main}</p>
            </div>
          `).join('')}
        </div>
      `;
      weatherCard.style.display = "block";
    })
    .catch(err => {
      weatherCard.innerHTML = "<p>Weather unavailable.</p>";
      weatherCard.style.display = "block";
    });
}

function toggleLanguage() {
  isTelugu = document.getElementById("langToggle").checked;
  goToPage2();
}

// Telugu transliteration fallback (basic)
function transliterateToTelugu(text) {
  return text.split('').map(c => c).join('');
}

// Voice search
function startVoiceInput() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = isTelugu ? 'te-IN' : 'en-IN';
  recognition.interimResults = false;
  document.getElementById("listeningNote").style.display = "block";

  recognition.onresult = function (e) {
    const transcript = e.results[0][0].transcript.toLowerCase().trim();
    document.getElementById("cropInput").value = transcript;
    document.getElementById("listeningNote").style.display = "none";
    showSuggestions();
  };

  recognition.onerror = function () {
    document.getElementById("listeningNote").style.display = "none";
  };

  recognition.start();
}

// Full crop data (15 crops)
const cropData = [
  { crop: "wheat", telugu: "గోధుమలు", temperature: "10–15°C", humidity: "65–70%", storage: "6–12 months", price: 25 },
  { crop: "rice", telugu: "బియ్యం", temperature: "10–15°C", humidity: "65–70%", storage: "6–12 months", price: 28 },
  { crop: "maize", telugu: "మక్క జొన్న", temperature: "0–4°C", humidity: "80–85%", storage: "6–12 months", price: 20 },
  { crop: "potato", telugu: "బంగాళదుంప", temperature: "4–7°C", humidity: "90–95%", storage: "90 days", price: 18 },
  { crop: "onion", telugu: "ఉల్లిపాయ", temperature: "0–2°C", humidity: "65–70%", storage: "150 days", price: 22 },
  { crop: "tomato", telugu: "టమోటా", temperature: "12–15°C", humidity: "85–90%", storage: "14 days", price: 16 },
  { crop: "chillies", telugu: "మిరపకాయలు", temperature: "8–10°C", humidity: "70–75%", storage: "20 days", price: 35 },
  { crop: "mango", telugu: "మామిడి", temperature: "10–13°C", humidity: "85–90%", storage: "28 days", price: 40 },
  { crop: "banana", telugu: "అరటి", temperature: "13–14°C", humidity: "85–95%", storage: "18–22 days", price: 24 },
  { crop: "sugarcane", telugu: "చెరుకు", temperature: "12–14°C", humidity: "70–75%", storage: "3–5 months", price: 12 },
  { crop: "groundnut", telugu: "వేరుసెనగ", temperature: "6–10°C", humidity: "70–80%", storage: "3–6 months", price: 30 },
  { crop: "cotton", telugu: "పత్తి", temperature: "10–15°C", humidity: "65–75%", storage: "6–8 months", price: 55 },
  { crop: "pulses", telugu: "పప్పులు", temperature: "5–10°C", humidity: "65–75%", storage: "6–12 months", price: 32 },
  { crop: "cabbage", telugu: "కోసు కూర", temperature: "0–1°C", humidity: "90–95%", storage: "2–3 months", price: 14 },
  { crop: "cauliflower", telugu: "కాలీఫ్లవర్", temperature: "0–1°C", humidity: "90–95%", storage: "2–3 months", price: 17 }
];

// Full storage data (10 districts)
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
    centers: ["Bhavani Cold Storage", "Sree Lakshmi Warehouse", "TSWC Facility", "Moksha Cold Storage", "Saptagiri Cold Storage", "Sri Karthik Cold Storage", "Venkatagiri Cold Storage", "Vennela Storage Unit"]
  },
  {
    district: "Mahbubnagar",
    centers: ["Sri Sai Warehouse", "Mahindra Cold Chain", "Nandini Cold Storages", "Sunyang Cold Storage", "Green House Farms Storage"]
  },
  {
    district: "Khammam",
    centers: ["Khammam Agro Cold Storage", "Red Chillies Storage", "Gayathri Cold Storage", "Swarnabharati Cold Storage", "Krishna Sai Storage Unit"]
  },
  {
    district: "Nalgonda",
    centers: ["Pavan Warehouse", "Sunrise Cold Storage", "TSWC Nalgonda", "Sri Satyadeva Cold Storage"]
  },
  {
    district: "Medak",
    centers: ["Medak Agro Storage", "Greenfield Warehousing", "Afsari Begum Ripening Chamber", "SS Agro Fresh Storage"]
  },
  {
    district: "Rangareddy",
    centers: ["Hyderabad Cold Storage", "Sri Venkateshwara Agro", "Aditya Enterprises", "Venkateshwara Cold Storage"]
  },
  {
    district: "Hyderabad",
    centers: ["City Agro Godowns", "Urban Cold Chain", "Coldrush Logistics", "Akshaya Cold Storage"]
  }
];

window.onload = () => {
  showOnlyPage("page1");
  populateDistrictDropdown();
};

function populateDistrictDropdown() {
  const select = document.getElementById("regionSelect");
  select.innerHTML = `<option value="">-- ${isTelugu ? "జిల్లాను ఎంచుకోండి" : "Select District"} --</option>`;
  storageData.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.district;
    opt.textContent = item.district;
    select.appendChild(opt);
  });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
