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

  errorDiv.innerText = "";
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

  const matches = cropData.filter(item => item.crop.startsWith(input)).map(item => item.crop);

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

function startVoiceSearch() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-IN';
  recognition.start();

  recognition.onresult = function (event) {
    const result = event.results[0][0].transcript.toLowerCase();
    document.getElementById("cropInput").value = result;
    showSuggestions();
  };

  recognition.onerror = function () {
    alert("Voice input failed. Try again.");
  };
}

function displayStorageCenters(region) {
  const centerDiv = document.getElementById("centerSection");
  const storageList = document.getElementById("storageResults");
  const matched = storageData.find(item => item.district.toLowerCase() === region.toLowerCase());

  if (matched && matched.centers.length > 0) {
    centerDiv.style.display = "block";
    storageList.innerHTML = matched.centers.map(center => `<li>${center}</li>`).join('');
  } else {
    centerDiv.style.display = "block";
    storageList.innerHTML = `<li>No storage centers found for ${region}.</li>`;
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

// Crop + Storage data
const cropData = [...]; // Keep your original crop list here
const storageData = [...]; // Keep all your district-center data here

window.onload = function () {
  showOnlyPage("page1");
  populateDistrictDropdown();
};

function populateDistrictDropdown() {
  const select = document.getElementById("regionSelect");
  select.innerHTML = '<option value="">-- Select District --</option>';
  storageData.forEach(item => {
    const option = document.createElement("option");
    option.value = item.district;
    option.textContent = item.district;
    select.appendChild(option);
  });
}
