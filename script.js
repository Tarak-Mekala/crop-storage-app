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
  const match = cropData.find(item => item.crop === cropInput);

  if (!match) {
    errorDiv.innerText = "Crop not found. Please check spelling.";
    return;
  }

  document.getElementById("cropTitle").innerText = match.crop.toUpperCase();
  document.getElementById("result").innerHTML = `
    <p><strong>Ideal Temperature:</strong> ${match.temperature}</p>
    <p><strong>Ideal Humidity:</strong> ${match.humidity}</p>
    <p><strong>Max Storage Period:</strong> ${match.storage}</p>
  `;

  displayStorageCenters(region);
  fetchWeather(region);
  showOnlyPage("page3");
}

function showOnlyPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.getElementById(pageId).style.display = "block";
}

function showSuggestions() {
  const input = document.getElementById("cropInput").value.toLowerCase();
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";
  if (!input) return;
  cropData
    .filter(item => item.crop.startsWith(input))
    .map(item => item.crop)
    .forEach(crop => {
      const li = document.createElement("li");
      li.textContent = crop;
      li.onclick = () => {
        document.getElementById("cropInput").value = crop;
        suggestions.innerHTML = "";
      };
      suggestions.appendChild(li);
    });
}

function startVoiceSearch() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-IN';
  recognition.start();
  recognition.onresult = event => {
    const result = event.results[0][0].transcript.toLowerCase();
    document.getElementById("cropInput").value = result;
    showSuggestions();
  };
  recognition.onerror = () => alert("Voice input failed. Try again.");
}

function displayStorageCenters(region) {
  const centerDiv = document.getElementById("centerSection");
  const storageList = document.getElementById("storageResults");
  const matched = storageData.find(item => item.district.toLowerCase() === region.toLowerCase());
  storageList.innerHTML = matched && matched.centers.length
    ? matched.centers.map(c => `<li>${c}</li>`).join('')
    : `<li>No storage centers found for ${region}.</li>`;
  centerDiv.style.display = 'block';
}

function fetchWeather(region) {
  const apiKey = "9d615f5f1e48d9502a77a12229e0e639";
  const weatherCard = document.getElementById("weatherCard");
  weatherCard.style.display = "none";
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${region}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
      const forecast = data.list.filter(i => i.dt_txt.includes("12:00:00")).slice(0,3);
      weatherCard.innerHTML = `
        <h3>3-Day Weather Forecast</h3>
        <div class="forecast">
          ${forecast.map(day => `
            <div class="forecast-day">
              <p><strong>${new Date(day.dt_txt).toDateString()}</strong></p>
              <p>🌡️ Temp: ${day.main.temp}°C</p>
              <p>💧 Humidity: ${day.main.humidity}%</p>
              <p>🌥️ ${day.weather[0].main}</p>
            </div>
          `).join('')}
        </div>
      `;
      weatherCard.style.display = "block";
    })
    .catch(() => {
      weatherCard.innerHTML = "<p>Weather data not available.</p>";
      weatherCard.style.display = "block";
    });
}

// 💾 Paste your full cropData and storageData arrays here (include commas and no [...])
const cropData = [ /* your crop objects here */ ];
const storageData = [ /* your district objects here */ ];

window.onload = () => {
  showOnlyPage("page1");
  populateDistrictDropdown();
};

function populateDistrictDropdown() {
  const sel = document.getElementById("regionSelect");
  sel.innerHTML = '<option value="">-- Select District --</option>';
  storageData.forEach(item => {
    const o = document.createElement("option");
    o.value = item.district;
    o.textContent = item.district;
    sel.appendChild(o);
  });
}
