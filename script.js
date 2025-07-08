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
    .map(item => item.crop);

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
    .catch(err => {
      weatherCard.innerHTML = "<p>Weather data not available.</p>";
      weatherCard.style.display = "block";
    });
}

const cropData = [
  { crop: "wheat", temperature: "10–15°C", humidity: "65–70%", storage: "6–12 months" },
  { crop: "rice", temperature: "10–15°C", humidity: "65–70%", storage: "6–12 months" },
  { crop: "maize", temperature: "0–4°C", humidity: "80–85%", storage: "6–12 months" },
  { crop: "potato", temperature: "4–7°C", humidity: "90–95%", storage: "90 days" },
  { crop: "onion", temperature: "0–2°C", humidity: "65–70%", storage: "150 days" },
  { crop: "tomato", temperature: "12–15°C", humidity: "85–90%", storage: "14 days" },
  { crop: "chillies", temperature: "8–10°C", humidity: "70–75%", storage: "20 days" },
  { crop: "mango", temperature: "10–13°C", humidity: "85–90%", storage: "28 days" },
  { crop: "banana", temperature: "13–14°C", humidity: "85–95%", storage: "18–22 days" },
  { crop: "sugarcane", temperature: "12–14°C", humidity: "70–75%", storage: "3–5 months" },
  { crop: "groundnut", temperature: "6–10°C", humidity: "70–80%", storage: "3–6 months" },
  { crop: "cotton", temperature: "10–15°C", humidity: "65–75%", storage: "6–8 months" },
  { crop: "pulses", temperature: "5–10°C", humidity: "65–75%", storage: "6–12 months" },
  { crop: "cabbage", temperature: "0–1°C", humidity: "90–95%", storage: "2–3 months" },
  { crop: "cauliflower", temperature: "0–1°C", humidity: "90–95%", storage: "2–3 months" }
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

window.onload = function () {
  showOnlyPage("page1");
  populateDistrictDropdown();
};

function populateDistrictDropdown() {
  const select = document.getElementById("regionSelect");
  storageData.forEach(item => {
    const option = document.createElement("option");
    option.value = item.district;
    option.textContent = item.district;
    select.appendChild(option);
  });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
