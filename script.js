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

// Crop database
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

// District storage centers
const storageData = [
  {
    district: "Adilabad",
    centers: [
      "GMR Warehouse, Ashok Kumar Gadewar, Adilabad",
      "Ladda Agro Godowns, Jainad",
      "Paharia Warehouse",
      "Y S R Godown"
    ]
  },
  {
    district: "Karimnagar",
    centers: [
      "Srinivasa Cold Storage, Karimnagar",
      "Godavari Agro Warehousing, Huzurabad",
      "SVS Cold Chain, Jammikunta",
      "Sri Gaddam Veeresham Rural Godown"
    ]
  },
  {
    district: "Nizamabad",
    centers: [
      "Nizam Agro Storage, Nizamabad",
      "Green Leaf Cold Storage, Bodhan",
      "SLNS Cold Storage, Munipally (V)",
      "Hi-Tech Cold Storage, Armoor"
    ]
  },
  {
    district: "Warangal",
    centers: [
      "Bhavani Cold Storage, Warangal",
      "Sree Lakshmi Warehouse, Parkal",
      "TSWC Facility, Hanamkonda",
      "Moksha Cold Storage, Enumamula",
      "Saptagiri Cold Storage, Enumamula",
      "Sri Karthik Cold Storage, Hanamkonda",
      "Venkatagiri Cold Storage, Hanamkonda",
      "Vennela Storage Unit, Gorrekunta"
    ]
  },
  {
    district: "Mahbubnagar",
    centers: [
      "Sri Sai Warehouse, Mahbubnagar",
      "Mahindra Cold Chain, Bhootpur",
      "Nandini Green House Farms Cold Storage Pvt Ltd",
      "Sunyang Cold Storage & Warehousing, Kethireddypally"
    ]
  },
  {
    district: "Khammam",
    centers: [
      "Khammam Agro Cold Storage",
      "Red Chilies Storage, Wyra",
      "Gayathri Cold Storage",
      "Swarnabharati Cold Storage",
      "Krishna Sai Storage Unit"
    ]
  },
  {
    district: "Nalgonda",
    centers: [
      "Pavan Warehouse, Nalgonda",
      "Sunrise Cold Storage, Miryalaguda",
      "TSWC Nalgonda",
      "Sri Satyadeva Cold Storage, Dondapadu"
    ]
  },
  {
    district: "Medak",
    centers: [
      "Medak Agro Storage",
      "Greenfield Warehousing, Narsapur",
      "Afsari Begum Ripening Chamber",
      "S.S. Agro Fresh Cold Storage, Manoharabad"
    ]
  },
  {
    district: "Rangareddy",
    centers: [
      "Hyderabad Cold Storage, Shamshabad",
      "Sri Venkateshwara Agro, Chevella",
      "Aditya Enterprises, Batasingaram",
      "Venkateshwara Cold Storage, Thurkayamjal"
    ]
  },
  {
    district: "Hyderabad",
    centers: [
      "City Agro Godowns, Hyderabad",
      "Urban Cold Chain, Secunderabad",
      "Coldrush Logistics",
      "Akshaya Cold Storage Pvt Ltd"
    ]
  }
];

// On load
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
